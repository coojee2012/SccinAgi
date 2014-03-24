var AGI = require('./lib/index');
var nami = require(__dirname + '/asterisk/asmanager').nami;
var conf = require('node-conf');
var logconf = conf.load('log4js');
var agiconf = conf.load('fastagi');
var moment = require('moment');
var routing = require('./smartAgi/src/Routings');
var Schemas = require('./database/schema').Schemas;
var log4js = require('log4js');
log4js.configure(logconf, agiconf);
var logger = log4js.getLogger('agi');
logger.setLevel('DEBUG');
var Schemas = require('./database/schema').Schemas;

var server = AGI.createServer(function(context) {
  logger.debug("当前上下文状态：" + context.state + '，上下文流是否可读：' + context.stream.readable);
  
  var route = new routing({
    context: context,
    Schemas: Schemas,
    agiconf: agiconf,
    nami: nami,
    args: null,
    logger: logger,
    vars: null
  });

  server.getConnections(function(err, count) {
    logger.info('当前服务器连接数：' + count);
  });

  //捕获获取变量事件
  //vars 捕获到的变量
  //访问开始的地方 


  context.on('variables', function(vars) {
    var script = vars.agi_network_script.split("?");
    var router = script[0];
    var args = {};
    if (script[1] && script[1] !== "") {
      var tmp = script[1].split('&');
      for (var i in tmp) {
        var kv = tmp[i].split('=');
        args[kv[0]] = kv[1];
      }
    }
    logger.debug(vars);
    route.args = args;
    route.vars = vars;
    if (typeof(route[router]) === 'function') {
      route[router]();
    }
    //找不到AGI路由处理函数，将调用默认路由处理
    else {
      route.dodefault();
    }

    logger.info('捕获到来自' + vars.agi_callerid + '的新呼叫， 呼叫编号为: ' + vars.agi_uniqueid);
  });
  //监听事件返回结果
  context.on('response', function(response) {
    logger.info("捕获到监听事件返回的结果：", response);
  });

  //捕获挂机
  context.on('hangup', function(vars) {
    logger.info("发生挂机事件.");
    if (route.args.routerline) {
      logger.info("正常呼叫中心流程，记录挂机时间.");
      Schemas.pbxCdr.update({
        where: {
          id: route.sessionnum
        },
        update: {
          alive:'no',
          endtime: moment().format("YYYY-MM-DD HH:mm:ss")
        }
      }, function(err, inst) {
        if (err)
          logger.error(err);

        context.end();
      });
    }
    else {
      context.end();
    }

  });

  //捕获异常
  context.on('error', function(err) {
    logger.info("agi error", err);
    context.end();
  });
  //AGI访问关闭
  context.on('close', function(o) {
    logger.info("AGI通道已关闭", o);
    route = null;
  });
});

if (!module.parent) {
  server.listen(agiconf.port);
}

module.exports = server;
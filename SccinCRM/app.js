/**
 * 模块依赖.
 */
var _ = require('lodash');
var fs = require("fs");
var path = require("path");
var cluster = require('cluster');
var express = require('express');
var partials = require('express-partials');
var http = require('http');
var path = require('path');
var conf = require('node-conf');
var nami = require(__dirname + '/asterisk/asmanager').nami;
var domainMiddleware = require('domain-middleware');

var JugglingStore = require('connect-jugglingdb')(express);
var schema = require('./database/jdmysql').schema;
var Schemas = require(__dirname + '/modules/DBModules').Dbs;


var appconf = conf.load('app');
var SRCFILE = appconf.debug ? 'src' : 'build';

var logger = require('./lib/logger').logger('web');
var log4js = require('./lib/logger').log4js;


var server = http.createServer();
var app = express();
// 所有环境设置
app.set('port', process.env.PORT || appconf.hostport);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.set('env', appconf.env);


app.engine('html', require('ejs').renderFile);


app.use(partials());
app.use(express.favicon());
//app.use(express.logger('web'));
app.use(log4js.connectLogger(logger, {
  level: log4js.levels.DEBUG,
  format: ':method :url'
}));
app.use(express.bodyParser({
  uploadDir: './public/uploads'
}));
app.use(require('stylus').middleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

app.use(domainMiddleware({
  server: server,
  killTimeout: 30000,
}));

app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.cookieParser());
app.use(express.session({
  secret: '11366846@qq.com'
}));

//注释部分为数据库session
/*app.use(express.session({
  secret: '11366846@qq.com',
  store: new JugglingStore(schema, {
    table: 'sessions', // 存session的表名
    maxAge: 1000 * 60 * 60 * 24 * 7 // 默认持续时间：毫秒
  })
}));*/

/*schema.autoupdate(function(err) {
  if (err) console.error(err);
});*/


//记录长时间没有返回结果的访问
app.use(function(req, res, next) {
  setTimeout(function() {
    if (!res.finished) {
      res.end();
      logger.error('访问%s超时，访问方式：%s。', req.url, req.method);
    }
  }, 60000);
  next();
});

// 开发环境配置
if ('development' == app.get('env')) {
  logger.info("当前运行于开发环境！");
  app.use(express.errorHandler({
    showStack: true,
    dumpExceptions: true
  }));

}

// 生产环境配置
if ('production' == app.get('env')) {

}

//app.use(authentication);
app.use(safeClient);
//路由处理
app.use(app.router);
app.get('/', function(req, res, next) {
  res.redirect('/index');
});

readroutes(__dirname + '/routes/' + SRCFILE + '/');


app.use(function(req, res, next) {
  res.render('404.html', {
    status: 404,
    title: '',
  });
});

//错误及异常处理
app.use(logErrors);
app.use(clientErrorHandler);
app.use(errorHandler);


app.locals({
  title: appconf.appname,
  phone: appconf.phone,
  email: appconf.email
});



server.maxHeadersCount = 0;
server.on('request', app);

server.on('error', function(error) {
  logger.error('发生错误: ', error);
});


if (!module.parent) {
  server.listen(app.get('port'), function() {
    logger.info('成功启动四川建设网语音拨打服务: ' + app.get('port'));
  })
}

module.exports = server;


process.on('uncaughtException', function(err) {
  logger.error('uncaughtException:', err);
});



//通常logErrors用来纪录诸如stderr, loggly, 或者类似服务的错误信息：

function logErrors(err, req, res, next) {
  // logger.error('logErrors:',err.stack);
  next(err);
}

//clientErrorHandler 定义如下，注意错误非常明确的向后传递了。

function clientErrorHandler(err, req, res, next) {
  if (req.xhr) {
    logger.error(err);
    res.send(500, {
      error: '服务器发生异常!'
    });
  } else {
    next(err);
  }
}

//下面的errorHandler "捕获所有" 的异常， 定义为:

function errorHandler(err, req, res, next) {
  logger.error('errorHandler:', err);
  var util = require('util');
  res.status(500);
  res.render('error.html', {
    error: util.inspect(err)
  });
}

function authentication(req, res, next) {
  logger.debug(req.url);
  if (!req.session.user && req.url !== '/login') {
    logger.error('session验证失败！')
    req.session.error = '请先登陆';
    return res.redirect('/login');
  }
  next();
}

function notAuthentication(req, res, next) {
  if (req.session.user) {
    req.session.error = '已登陆';
    return res.redirect('/');
  }
  next();
}

function safeClient(req, res, next) {
  var ip = req.ip;
  var reg = /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/;
  if (reg.test(ip)) {
    var safeip = appconf.allowips;
    var iparray = ip.split(".");
    var safe = false;
    _.forEach(safeip, function(item) {
      if (reg.test(item)) {
        var itemarray = item.split(".");
        if (itemarray[3] > 0) {
          if(ip === item)
          safe = true;
        } else if (itemarray[2] > 0 ) {
          if(iparray[0] === itemarray[0] && iparray[1] === itemarray[1] && iparray[2] === itemarray[2] && iparray[3] > 0)
          safe = true;
        } else if (itemarray[1] > 0 ) {
          if(iparray[0] === itemarray[0] && iparray[1] === itemarray[1] && iparray[2] >= 0 && iparray[3] > 0)
          safe = true;
        } else if (itemarray[0] > 0 ) {
          if(iparray[0] === itemarray[0] && iparray[1] >= 0 && iparray[2] >= 0 && iparray[3] > 0)
          safe = true;
        }
      }
    });
    if (safe)
      next();
    else
      next("IP地址不被允许访问！");
  } else {
    next("IP地址不合法！");
  }
}


function readroutes(dir, routeflag) {
  var files = fs.readdirSync(dir);
  var len = files.length;
  var file = null;
  if (!routeflag || routeflag === '')
    routeflag = '/';

  for (var i = 0; i < len; i++) {
    file = files[i];

    setroute(dir + "/" + file, routeflag);
  }

}

function setroute(filepath, routeflag) {
  fs.stat(filepath, function(err, stats) {
    if (err)
      logger.error(err);
    else {
      if (stats.isFile()) {
        var filename = path.basename(filepath, '.js');
        var parentDir = path.dirname(filepath);
        var parentDirname = path.basename(path.dirname(filepath));
        var thisFilename = path.basename(__filename, '.js');
        if (filename != thisFilename && filename.indexOf(parentDirname) < 0) {
          app.all(routeflag + filename, function(req, res, next) {
            var ooo = 'index';
            var routemod = require(filepath);
            if (routemod && routemod[req.route.method] && typeof(routemod[req.route.method][ooo]) === 'function') {
              routemod[req.route.method][ooo](req, res, next, routeflag + filename);
            } else {
              res.render('404.html');;
            }
          });
          app.all(routeflag + filename + '/:ooo', function(req, res, next) {
            var ooo = 'index';
            if (req.param('ooo') && req.param('ooo') !== '')
              ooo = req.param('ooo');
            logger.debug(filepath);
            var routemod = require(filepath);
            if (routemod && routemod[req.route.method] && typeof(routemod[req.route.method][ooo]) === 'function') {
              routemod[req.route.method][ooo](req, res, next, routeflag + filename);
            } else {
              res.render('404.html');
            }

          });
          //logger.info(app.routes);
        }

      } else if (stats.isDirectory()) {
        var dirname = path.basename(filepath);
        //var parentDir = path.dirname(filepath);
        //var parentDirname = path.basename(path.dirname(filepath));
        readroutes(filepath, routeflag + dirname + '/');
      } else {
        logger.error("unknow type of file");
      }
    }
  });
}
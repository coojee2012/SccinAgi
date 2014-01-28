var AGI=require('./lib/index');
var nami=require(__dirname+'/asterisk/asmanager').nami;
var conf = require('node-conf');
var agiconf=conf.load('fastagi');
var routing=require('./routing');
var Schemas=require('./database/schema').Schemas;
var logger=require('./lib/logger').logger('Server');

var server=AGI.createServer(function(context) {
  //捕获获取变量事件
  //vars 捕获到的变量
  //访问开始的地方 
server.getConnections(function(err,count){
  logger.info('当前服务器连接数：'+count);
});

  context.on('variables', function(vars) {
    var script=vars.agi_network_script.split("?");
    var router=script[0];
    var args={};
    if(script[1] && script[1]!=""){
      var tmp=script[1].split('&');
      for(var i in tmp){
        var kv=tmp[i].split('=');
        args[kv[0]]=kv[1];
      }
    }
    vars.schemas=Schemas;
    vars.agiconf=agiconf;
    vars.args=args;
    vars.nami=nami;
    if(typeof(routing[router])==='function'){
        routing[router](context,vars);
        }
    //找不到AGI路由处理函数，将调用默认路由处理
    else{
        routing.default(context,vars);
        }

   console.log('捕获到来自' + vars.agi_callerid + '的新呼叫， 呼叫编号为: ' + vars.agi_uniqueid);
  });
//监听事件返回结果
  context.on('response',function(response){
      console.log(response);  
      });

//捕获挂机
  context.on('hangup',function(vars){
       console.log("AGI通道已断开.");
       context.end();
      });

  //捕获异常
  context.on('error',function(err){
       console.log("agi error",err);
       context.end();
      });
  //AGI访问关闭
  context.on('close',function(o){
      console.log("关闭AGI通道",o);
      });
}).listen(agiconf.port);




var AGI=require('./lib/index');
var conf = require('node-conf');
var agiconf=conf.load('fastagi');
var routing=require('./routing');
var log4js = require('log4js');
var Schemas=require('./database/schema').Schemas;

log4js.configure({
  appenders: [{
      type: 'console'
    }, //控制台输出
    {
      type: 'file', //文件输出
      filename: 'agi.log',
      maxLogSize: 10240000,
      backups: 3,
      category: 'normal'
    }
  ],
  replaceConsole: true
});

var server=AGI.createServer(function(context) {
  //context is a new instance of agi.Context for each new agi session
  //immedately after asterisk connects to the node process

  //捕获获取变量事件
  //vars 捕获到的变量
  //访问开始的地方 
server.getConnections(function(err,count){
  console.log('当前服务器连接数：'+count);
});

  context.on('variables', function(vars) {
    //console.log(vars);
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
       console.log("AGI通道已断开：");
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




var AGI=require('agi');
var ServerPort=4573;
var routing=require('./routing');

AGI.createServer(function(context) {
  //context is a new instance of agi.Context for each new agi session
  //immedately after asterisk connects to the node process

  //捕获获取变量事件
  //vars 捕获到的变量
  //访问开始的地方 
  context.on('variables', function(vars) {
    //console.log(vars);
    var script=vars.agi_network_script.split("?");
    var router=script[0];
    var args=script[1];
    if(typeof(routing[router])==='function'){
        routing[router](context,args,vars);
        }
    //找不到AGI路由处理函数，将调用默认路由处理
    else{
        routing.default(context,args,vars);
        }

   console.log('捕获到来自' + vars.agi_callerid + '的新呼叫， 呼叫编号为: ' + vars.agi_uniqueid);
  });
//监听事件返回结果
  context.on('response',function(response){
      console.log(response);  
      });

//捕获挂机
  context.on('hangup',function(o){
       console.log("AGI通道已断开：",o);
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
}).listen(ServerPort);
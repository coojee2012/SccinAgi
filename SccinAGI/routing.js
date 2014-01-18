var routing={};

//呼叫路由处理
routing.router=function(context,args,variables){
    //console.log(this);

  context.hangup(function(err,rep){
      console.log("Hangup success:",rep);
      });
     context.end();
    }
//自动语音应答处理
routing.ivr=function(context,args,variables){

};
//内部拨打
routing.diallocal=function(context,args,variables){


};
//拨打队列
routing.queue=function(context,args,variables){


};
//拨打外部电话
routing.dialout=function(context,args,variables){

    };
//默认触发处理
routing.default=function(context,args,variables){
    context.hangup(function(err,rep){
      console.log("Hangup success:",rep);
       context.end();
      });
    
    }
    
//北京专家库自动外呼处理
routing.sccincallout=function(context,args,variables){
context.answer(function(){
context.Playback('vm-message','skip');	
});

//context.hangup();
};

module.exports = routing;
/*! 路由处理程序 2014-07-28 */
function GetDndInfo(a,b){var c=new AsAction.QueueStatus;c.Member=a,nami.send(c,function(a){if("Success"==a.response)if(a.events.length>0){var c=!1;for(var d in a.events)console.log(a.events[d]),"QueueMember"==a.events[d].event&&"1"===a.events[d].paused&&(c=!0);b(null,c)}else b("获取成员信息发生错误！",!1);else b("获取示忙信息发生错误！",!1)})}function parkCalls(a){var b=new AsAction.ParkedCalls;nami.send(b,function(b){a(b)})}function getconnectchannel(a,b,c){var d="",e="",f="^"+a+"\\/"+b,g=new RegExp(f,"gi");console.log(g);var h=new AsAction.CoreShowChannels;nami.send(h,function(a){if("Success"==a.response)for(var f in a.events)if(g.exec(a.events[f].channel)||a.events[f].accountcode==b){d=a.events[f].channel,e=a.events[f].bridgedchannel;break}c({src:d,dst:e})})}function safekey(){require("crypto"),require("fs")}var conf=require("node-conf"),basedir=conf.load("app").appbase,nami=require(basedir+"/asterisk/asmanager").nami,util=require("util"),async=require("async"),AsAction=require("nami").Actions,Schemas=require(basedir+"/database/schema").Schemas,guid=require("guid"),logger=require(basedir+"/lib/logger").logger("web"),gets={},posts={};module.exports={get:gets,post:posts},posts.sippeers=function(a,b){nami.send(new AsAction.SipPeers,function(a){console.log(a),b.send(a)})},posts.ping=function(a,b){nami.send(new AsAction.Ping,function(a){console.log(a),b.send(a)})},posts.hangup=function(a,b){var c=new AsAction.Hangup;c.Channel="sip/abcd",nami.send(c,function(a){console.log(a),b.send(a)})},posts.status=function(a,b){var c=new AsAction.Status;nami.send(c,function(a){console.log(a),b.send(a)})},posts.command=function(a,b){var c=a.body.cmd||a.query.cmd,d=new AsAction.Command;d.Command=c,nami.send(d,function(a){console.log(a),b.send(a)})},posts.extensionstate=function(a,b){var c=a.body.exten||a.query.exten,d=a.body.context||a.query.context,e=new AsAction.ExtensionState;e.Exten=c,e.Context=d,nami.send(e,function(a){console.log(a),b.send(a)})},posts.getconfig=function(a,b){var c=a.body.filename||a.query.filename,d=a.body.category||a.query.category,e=new AsAction.GetConfig;e.Filename=c,e.Category=d,nami.send(e,function(a){console.log(a),b.send(a)})},posts.createconfig=function(a,b){var c=a.body.filename||a.query.filename,d=new AsAction.CreateConfig;d.Filename=c,nami.send(d,function(a){console.log(a),b.send(a)})},posts.getconfigjson=function(a,b){var c=a.body.filename||a.query.filename,d=new AsAction.GetConfigJson;d.Filename=c,nami.send(d,function(a){console.log(a),b.send(a)})},posts.DAHDIShowChannels=function(a,b){var c=new AsAction.DahdiShowChannels;nami.send(c,function(a){console.log(a),b.send(a)})},posts.coreshowchannels=function(a,b){var c=new AsAction.CoreShowChannels;nami.send(c,function(a){console.log(a),b.send(a)})},posts.hangupexten=function(a,b){var c=a.body.exten||a.query.exten,d=a.body.type||a.query.type;d||(d="SIP"),getconnectchannel(d,c,function(a){console.log(a);var c=new AsAction.Hangup;c.Channel=a.src,nami.send(c,function(a){b.send(a)})})},posts.transfer=function(a,b){var c=a.body.extenfrom||a.query.extenfrom,d=a.body.extento||a.query.extento,e=a.body.fromtype||a.query.fromtype;e||(e="SIP"),getconnectchannel(e,c,function(a){var c=new AsAction.Redirect;c.Channel=a.src,c.Exten=d,c.Context="from-exten-sip",nami.send(c,function(a){b.send(a)})})},posts.dialout=function(a,b){var c=(a.body.variable||a.query.variable,a.body.outnumber||a.query.outnumber),d=a.body.exten||a.query.exten,e="LOCAL/"+c+"@sub-outgoing",f="sub-outgoing-callback",g=new AsAction.Originate;g.Channel=e,g.Async=!0,g.Account=d,g.CallerID=d,g.Context=f,g.Exten=d,console.log(g),nami.connected?nami.send(g,function(a){b.send(a)}):b.send({Response:"NotConnected"})},posts.autodial=function(a,b){var c=require(basedir+"/lib/tts").tts,d=a.get("User-key"),e=a.get("User-Agent");logger.debug("拨打服务获取到的头信息：",d,e),b.setHeader("Content-type","application/json");var f=a.body.CallInfoID,g=a.body.ProjMoveID,h=a.body.NoticeContent||"";h=h.replace(/\s+/g,"");var i=a.body.SureContent||"";i=i.replace(/\s+/g,"");var j=a.body.QueryContent||"";j=j.replace(/\s+/g,"");var k=a.body.HardContent||"";k=k.replace(/\s+/g,"");var l=a.body.Phones;l=l.replace(/\s+/g,"");var m=a.body.KeyNum;f&&""!=f?g&&""!=g?h&&""!=h?i&&""!=i?j&&""!=j?k&&""!=k?l&&""!=l?async.auto({addCallRecords:function(a){logger.debug("执行：addCallRecords");try{Schemas.crmCallRecords.create({id:guid.create(),CallInfoID:f,ProjMoveID:g},function(b,c){a(b,c)})}catch(b){a(b,null)}},getSythState:function(a){logger.debug("执行：getSythState");try{Schemas.crmVoiceContent.find(g,function(b,c){a(b,c)})}catch(b){a(b,null)}},addVoiceContent:["addCallRecords","getSythState",function(a,b){logger.debug("执行：addVoiceContent");try{null===b.getSythState?Schemas.crmVoiceContent.create({id:g},function(b,c){a(b,c)}):a(null,b.getSythState)}catch(c){a(c,null)}}],addCallPhone:["addCallRecords",function(a,b){logger.debug("执行：addCallPhone");var c=l.split(","),d=0;async.whilst(function(){return d<c.length},function(a){d++,Schemas.crmCallPhone.create({id:guid.create(),Phone:c[d-1],callrecord:b.addCallRecords},function(b,c){a(b,c)})},function(b,c){a(b,c)})}],addDialResult:["addCallRecords",function(a,b){logger.debug("执行：addDialResult"),Schemas.crmDialResult.create({CallInfoID:f,callrecord:b.addCallRecords},function(b,c){a(b,c)})}],setVoiceContent:["addVoiceContent",function(a,b){logger.debug("执行：setVoiceContent");try{if(0===b.addVoiceContent.State){var c=new Schemas.crmVoiceContent(b.addVoiceContent);c.State=1,c.save(function(b,c){a(b,c)})}else 1===b.addVoiceContent.State?a("有相同项目编号的语音正在合成中！",null):a(null,b.addVoiceContent)}catch(d){a("更新合成中状态时发生错误！",null)}}],voiceMixNotice:["setVoiceContent",function(a,b){logger.debug("执行：voiceMixNotice"),1===b.setVoiceContent.State?c.synth("/home/share/"+g+"-notice.wav",h,function(b,c){logger.debug("执行：voiceMixNotice成功？",b),"true"===b?a(null,1):(logger.error("合成通知语音失败:",c),a({Error:"合成通知语音失败！"},null))}):a(null,2)}],voiceMixSure:["voiceMixNotice",function(a,b){logger.debug("执行：voiceMixSure,",b.voiceMixNotice),null===b.voiceMixNotice&&a("合成确认语音失败!",null),1===b.setVoiceContent.State?c.synth("/home/share/"+g+"-sure.wav",i,function(b,c){"true"===b?(logger.debug("执行：voiceMixSure成功？:",b),a(null,1)):(logger.error("合成确认语音失败:",c),a("合成确认语音失败!",null))}):a(null,2)}],voiceMixQuery:["voiceMixSure",function(a,b){logger.debug("执行：voiceMixQuery,",b.voiceMixSure),null===b.voiceMixSure&&a("合成查询语音失败!",null),1===b.setVoiceContent.State?c.synth("/home/share/"+g+"-query.wav",j,function(b,c){"true"===b?(logger.debug("执行：voiceMixQuery成功？"),a(null,1)):(logger.error("合成查询语音失败:",c),a("合成查询语音失败!",null))}):a(null,2)}],voiceMixHardContent:["voiceMixQuery",function(a,b){logger.debug("执行：HardContent",b.voiceMixQuery),null===b.voiceMixQuery&&a("合成查询语音失败!",null),1===b.setVoiceContent.State?c.synth("/home/share/"+g+"-hard.wav",k,function(b,c){"true"===b?(logger.debug("执行：voiceMixHardContent成功？"),a(null,1)):(logger.error("合成重复收听语音失败:",c),a("合成重复收听语音失败!",null))}):a(null,2)}],updateVoiceContent:["voiceMixHardContent",function(a,b){logger.debug("执行：updateVoiceContent，",b.voiceMixHardContent);var c=2;null===b.voiceMixHardContent&&(c=0);try{var d=new Schemas.crmVoiceContent(b.addVoiceContent);d.State=c,d.save(function(b,c){a(b,c)})}catch(e){a("更新合成完成状态时发生错误！",null)}}],checkChans:["updateVoiceContent",function(a){logger.debug("执行：checkChans"),Schemas.pbxCdr.count({alive:"yes"},function(b,c){b?a(b,null):c&&c>conf.load("app").maxchans?a("当前可用线路不足，已用:"+c,c):a(null,c)})}],callDial:["checkChans",function(a,b){(null===b.voiceMixNotice||null===b.voiceMixSure||null===b.voiceMixQuery)&&a("由于语音文件合成失败，不能拨打！",null),logger.debug("执行：callDial");var c="LOCAL/200@sub-outgoing",d="sub-outgoing-callback",e=new AsAction.Originate;e.Channel=c,e.Async=!0,e.Account=b.addCallRecords.id,e.CallerID=200,e.Context=d,e.Variable="callrecordid="+b.addCallRecords.id+",keynum="+m,e.Exten=200,nami.connected?nami.send(e,function(b){a(null,b)}):a("无法连接到语音服务器！",null)}]},function(a){if(logger.debug("执行：callback!"),a){logger.error("调用拨打服务发生异常：",a);var c="";"object"==typeof a?c+=a.TypeError||a.Error||"":c=a,b.send({success:!1,result:"服务器发生内部异常:"+c+",请联系系统管理员！"})}else b.send({success:!0,result:"调用成功！"})}):b.send({success:!1,result:"拨打电话不能为空"}):b.send({success:!1,result:"合成重听参评信息语音类容不能为空"}):b.send({success:!1,result:"合成自动查询语音类容不能为空"}):b.send({success:!1,result:"合成确认参加评标提示语音类容不能为空"}):b.send({success:!1,result:"合成通知评标专家语音类容不能为空"}):b.send({success:!1,result:"项目编号不能为空"}):b.send({success:!1,result:"抽取编号不能为空"})},posts.getresult=function(a,b){var c=a.get("User-key"),d=a.get("User-Agent");logger.debug("获取结果服务获取到的头信息：",c,d),b.setHeader("Content-type","application/json"),b.setHeader("Access-Control-Allow-Origin",a.headers.origin);var e=a.body.CallInfoID;if(logger.debug("开始获取："+e+"的呼叫结果！"),e&&""!=e)try{Schemas.crmDialResult.findOne({where:{CallInfoID:e}},function(a,c){b.send(a?{success:!1,result:"获取拨打结果时服务器发生异常"}:null==c?{success:!1,result:"在服务器上没有找到该数据"}:{success:!0,result:c.Result.toString()})})}catch(f){logger.error("获取拨打结果发生异常：",f),b.send({success:!1,result:"获取拨打结果时服务器发生异常"})}else b.send({success:!1,result:"抽取编号不能为空"})},gets.getresult=function(a,b){var c=a.get("User-key"),d=a.get("User-Agent");logger.debug("获取结果服务获取到的头信息：",c,d),b.setHeader("Content-type","application/json"),b.setHeader("Access-Control-Allow-Origin",a.headers.origin);var e=a.query.CallInfoID;if(logger.debug("开始获取："+e+"的呼叫结果！"),e&&""!=e)try{Schemas.crmDialResult.findOne({where:{CallInfoID:e}},function(a,c){b.send(a?{success:!1,result:"获取拨打结果时服务器发生异常"}:null==c?{success:!1,result:"在服务器上没有找到该数据"}:{success:!0,result:c.Result.toString()})})}catch(f){logger.error("获取拨打结果发生异常：",f),b.send({success:!1,result:"获取拨打结果时服务器发生异常"})}else b.send({success:!1,result:"抽取编号不能为空"})},posts.packCall=function(a,b){var c=a.body.exten||a.query.exten,d=a.body.type||a.query.type;d||(d="SIP");a.body.timeout||a.query.timeout;getconnectchannel(d,c,function(a){logger.debug(a);var c=new AsAction.Park;c.Channel2=a.src,c.Channel=a.dst,c.Timeout=12e4,nami.send(c,function(a){b.send(a)})})},posts.packsinfo=function(a,b){var c=a.body.exten||a.query.exten,d=a.body.type||a.query.type;d||(d="SIP"),parkCalls(function(a){if("Success"===a.Response||"Success"===a.response)if(null!=a.events&&a.events.length>0){for(var e=!1,f=0;f<a.events.length;f++)if(a.events[f].from){var g=a.events[f].from,h=new RegExp(d+"/"+c,"g");if(g.match(h)){e=!0;break}}b.send({response:"Success",parked:e})}else b.send({response:"Success",parked:!1});else b.send(a)})},posts.unPark=function(a,b){var c=a.body.exten||a.query.exten,d=a.body.type||a.query.type;d||(d="SIP"),parkCalls(function(a){if("Success"===a.Response||"Success"===a.response)if(logger.debug("准备取回保持：",a),null!=a.events&&a.events.length>0){for(var e=!1,f=0;f<a.events.length;f++)if(a.events[f].from){var g=a.events[f].from,h=new RegExp(d+"/"+c,"g");if(g.match(h)){e=!0;var i=a.events[f].channel,j=new AsAction.Redirect;j.Channel=i,j.Exten=c,j.Context="app-exten",j.Priority=1,nami.send(j,function(a){b.send(a)});break}}e||b.send({response:"Error",message:"没有找到取回!"})}else b.send({response:"Error",message:"当前没有被保持的通话！"});else b.send(a)})},posts.checkService=function(a,b){var c=a.body.exten||a.query.exten,d=a.body.type||a.query.type;d||(d="SIP"),getconnectchannel(d,c,function(a){var d=new AsAction.Redirect;d.Channel=a.src,d.Exten=c,d.Context="checkservice",nami.send(d,function(a){b.send(a)})})},posts.GetCallInfo=function(a,b){var c=a.body.exten||a.query.exten;logger.debug("正在获取分机："+c+"的来去电信息！"),null==c||""==c?b.send({success:"0"}):Schemas.pbxScreenPop.findOne({where:{id:c}},function(a,c){if(a||null==c)b.send({success:"0"});else{var d={};"waite"==c.status?(d.success=1,"dialqueue"==c.routerdype||"diallocal"==c.routerdype?(d.caller=c.callednumber,d.called=c.callernumber):(d.caller=c.callernumber,d.called=c.callednumber),d.unid=c.uid||"",d.poptype=c.poptype,d.callid=c.sessionnumber,c.status="over",c.poptype="",Schemas.pbxScreenPop.updateOrCreate(c,function(a){a?b.send({success:"0"}):(logger.debug("获取到来电信息：",d),b.send(d))})):b.send({success:"0"})}})},gets.GetCallInfo=function(a,b){var c=a.body.fromexten||a.query.fromexten;null==c||""==c?b.send('callback({"success": "0","msg":"没有获取到分机号！"})'):Schemas.pbxScreenPop.findOne({where:{extensionnumber:c}},function(a,c){if(a||null==c)b.send('callback({"success": "0","msg":"获取弹屏信息发生错误。"})');else{var d={};"waite"==c.status?(d.success=1,"2"==c.routerdype?(d.caller=c.callednumber,d.called=c.callernumber):(d.caller=c.callernumber,d.called=c.callednumber),d.unid=c.uid,d.poptype=c.poptype,d.callid=c.callid,c.status="over",c.poptype="",Schemas.pbxScreenPop.updateOrCreate(c,function(a){b.send(a?'callback({"success": "0","msg":"更新弹屏状态发生异常！"})':"callback("+JSON.stringify(d)+")")})):b.send('callback({"success": "0","msg":"当前无响铃。"})')}})},posts.DadOn=function(a,b){var c=a.body.exten||a.query.exten,d=(a.body.type||a.query.type,require("../modules/ippbx/extension.js"));try{d.all({where:{accountcode:c}},function(a,e){if(a)return void b.send({Response:"Error",Msg:"获取分机号失败!"});if(console.log(e),null!=e){var f=e[0];f.dndinfo="on"===f.dndinfo?"off":"on",d.updateOrCreate(f,function(a){b.send(a?{Response:"Error",Msg:"更新状态失败!"}:{Response:"Success",Msg:"操作成功!"})})}else b.send({Response:"Error",Msg:"没有找到分机号,"+c})})}catch(e){b.send({Response:"Error",Msg:e})}},posts.GetDnd=function(a,b){var c=a.body.exten||"";GetDndInfo(c,function(a,c){b.send(a?{success:!1,pased:c,msg:a}:{success:!0,pased:c,msg:"成功！"})})},posts.DndQueueMember=function(a,b){var c=a.body.exten||"",d=new AsAction.QueueStatus;d.Member=c,nami.send(d,function(a){if("Success"==a.response)if(a.events.length>0){var d=!1;for(var e in a.events)"QueueMember"==a.events[e].event&&"1"===a.events[e].paused&&(d=!0);var f=null,g="";d?(f=new AsAction.QueueUnpause,g="示闲"):(f=new AsAction.QueuePause,g="示忙"),f.Interface="LOCAL/"+c+"@sub-queuefindnumber/n",f.Reason="",nami.send(f,function(a){logger.debug(a),b.send("Success"==a.response?{success:!0,pased:!d,msg:g+"成功！"}:{success:!1,pased:!d,msg:g+"失败！"})})}else b.send({success:!1,msg:"获取成员状态事件发生异常！"});else b.send({success:!1,msg:"获取成员状态发生异常！"})})},posts.QueuePause=function(a,b){var c=(a.body.exten||"",new AsAction.QueuePause);c.Interface="",c.Reason="",nami.send(c,function(a){b.send(a)})},posts.QueueUnPause=function(a,b){var c=a.body.exten||"",d=new AsAction.QueueUnPause;d.Interface=c,d.Reason="",nami.send(d,function(a){b.send(a)})};
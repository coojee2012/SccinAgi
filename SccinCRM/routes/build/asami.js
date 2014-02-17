/*! 路由处理程序 2014-02-17 */
function parkCalls(a){var b=new AsAction.ParkedCalls;nami.send(b,function(b){a(b)})}function getconnectchannel(a,b,c){var d="",e="",f="^"+a+"\\/"+b,g=new RegExp(f,"gi");console.log(g);var h=new AsAction.CoreShowChannels;nami.send(h,function(a){if("Success"==a.response)for(var f in a.events)if(g.exec(a.events[f].channel)||a.events[f].accountcode==b){d=a.events[f].channel,e=a.events[f].bridgedchannel;break}c({src:d,dst:e})})}var nami=require("../../asterisk/asmanager").nami,util=require("util"),async=require("async"),AsAction=require("nami").Actions,Schemas=require("../../database/schema").Schemas,guid=require("guid");exports.sippeers=function(a,b){nami.send(new AsAction.SipPeers,function(a){console.log(a),b.send(a)})},exports.ping=function(a,b){nami.send(new AsAction.Ping,function(a){console.log(a),b.send(a)})},exports.hangup=function(a,b){var c=new AsAction.Hangup;c.Channel="sip/abcd",nami.send(c,function(a){console.log(a),b.send(a)})},exports.status=function(a,b){var c=new AsAction.Status;nami.send(c,function(a){console.log(a),b.send(a)})},exports.command=function(a,b){var c=a.body.cmd||a.query.cmd,d=new AsAction.Command;d.Command=c,nami.send(d,function(a){console.log(a),b.send(a)})},exports.extensionstate=function(a,b){var c=a.body.exten||a.query.exten,d=a.body.context||a.query.context,e=new AsAction.ExtensionState;e.Exten=c,e.Context=d,nami.send(e,function(a){console.log(a),b.send(a)})},exports.getconfig=function(a,b){var c=a.body.filename||a.query.filename,d=a.body.category||a.query.category,e=new AsAction.GetConfig;e.Filename=c,e.Category=d,nami.send(e,function(a){console.log(a),b.send(a)})},exports.createconfig=function(a,b){var c=a.body.filename||a.query.filename,d=new AsAction.CreateConfig;d.Filename=c,nami.send(d,function(a){console.log(a),b.send(a)})},exports.getconfigjson=function(a,b){var c=a.body.filename||a.query.filename,d=new AsAction.GetConfigJson;d.Filename=c,nami.send(d,function(a){console.log(a),b.send(a)})},exports.DAHDIShowChannels=function(a,b){var c=new AsAction.DahdiShowChannels;nami.send(c,function(a){console.log(a),b.send(a)})},exports.coreshowchannels=function(a,b){var c=new AsAction.CoreShowChannels;nami.send(c,function(a){console.log(a),b.send(a)})},exports.hangupexten=function(a,b){var c=a.body.exten||a.query.exten,d=a.body.type||a.query.type;d||(d="SIP"),getconnectchannel(d,c,function(a){console.log(a);var c=new AsAction.Hangup;c.Channel=a.src,nami.send(c,function(a){b.send(a)})})},exports.transfer=function(a,b){var c=a.body.extenfrom||a.query.extenfrom,d=a.body.extento||a.query.extento,e=a.body.fromtype||a.query.fromtype;e||(e="SIP"),getconnectchannel(e,c,function(a){var c=new AsAction.Redirect;c.Channel=a.src,c.Exten=d,c.Context="from-exten-sip",nami.send(c,function(a){b.send(a)})})},exports.dialout=function(a,b){var c=(a.body.variable||a.query.variable,a.body.outnumber||a.query.outnumber),d=a.body.exten||a.query.exten,e="LOCAL/"+c+"@sub-outgoing",f="sub-outgoing-callback",g=new AsAction.Originate;g.Channel=e,g.Async=!0,g.Account=d,g.CallerID=d,g.Context=f,g.Exten=d,console.log(g),nami.connected?nami.send(g,function(a){b.send(a)}):b.send({Response:"NotConnected"})},exports.autodial=function(a,b){var c=a.body.ProjExpertID||a.query.ProjExpertID,d=a.body.NoticeContent||a.query.NoticeContent,e=a.body.SureContent||a.query.SureContent,f=a.body.QueryContent||a.query.QueryContent,g=a.body.Phones||a.query.Phones,h=a.body.KeyNum||a.query.KeyNum||1;return c&&""!=c?d&&""!=d?e&&""!=e?f&&""!=f?g&&""!=g?void async.auto({addCallRecords:function(a){Schemas.CallRecords.create({id:guid.create(),ProjExpertID:c},function(b,c){a(b,c)})},addVoiceContent:["addCallRecords",function(a,b){Schemas.VoiceContent.create({Contents:d,callrecord:b.addCallRecords},function(b,c){a(b,c)})}],addCallPhone:["addCallRecords",function(a,b){var c=g.split(","),d=0;async.whilst(function(){return d<c.length},function(a){d++,Schemas.CallPhone.create({id:guid.create(),Phone:c[d-1],PhoneSequ:d-1,callrecord:b.addCallRecords},function(b,c){a(b,c)})},function(b,c){a(b,c)})}],addDialResult:["addCallRecords",function(a,b){Schemas.DialResult.create({ProjExpertID:c,callrecord:b.addCallRecords},function(b,c){a(b,c)})}],voiceMixNotice:["addCallRecords",function(a){{var b=require("child_process").exec;b("dir",function(b,c){a(b,c)})}}],voiceMixSure:["addCallRecords",function(a){{var b=require("child_process").exec;b("dir",function(b,c){a(b,c)})}}],voiceMixQuery:["addCallRecords",function(a){{var b=require("child_process").exec;b("dir",function(b,c){a(b,c)})}}],updateVoiceContent:["voiceMixNotice","voiceMixSure","voiceMixQuery","addVoiceContent",function(a,b){var c=new Schemas.VoiceContent(b.addVoiceContent);c.State=1,c.save(function(b,c){a(b,c)})}],callDial:["updateVoiceContent",function(a,b){var c="LOCAL/200@sub-outgoing",d="sub-outgoing-callback",e=new AsAction.Originate;e.Channel=c,e.Async=!0,e.Account=b.addCallRecords.id,e.CallerID=200,e.Context=d,e.Variable="callrecordid="+b.addCallRecords.id+",keynum="+h,e.Exten=200,nami.connected?nami.send(e,function(b){a(null,b)}):a("无法连接到语音服务器！",null)}]},function(a){b.send(a?{success:!1,result:"服务器发生内部异常"}:{success:!0,result:""})}):void b.send({success:!1,result:"拨打电话不能为空"}):void b.send({success:!1,result:"合成自动查询语音类容不能为空"}):void b.send({success:!1,result:"合成确认参加评标提示语音类容不能为空"}):void b.send({success:!1,result:"合成通知评标专家语音类容不能为空"}):void b.send({success:!1,result:"抽取编号不能为空"})},exports.getresult=function(a,b){var c=a.body.ProjExpertID||a.query.ProjExpertID;return c&&""!=c?void Schemas.DialResult.findOne({where:{ProjExpertID:c}},function(a,c){b.send(a?{success:!1,result:"获取拨打结果时服务器发生异常"}:null==c?{success:!1,result:"在服务器上没有找到该数据"}:{success:!0,result:""+c.Result})}):void b.send({success:!1,result:"抽取编号不能为空"})},exports.packCall=function(a,b){var c=a.body.exten||a.query.exten,d=a.body.type||a.query.type;d||(d="SIP");a.body.timeout||a.query.timeout;getconnectchannel(d,c,function(a){console.log(a);var c=new AsAction.Park;c.Channel2=a.src,c.Channel=a.dst,c.Timeout=12e4,nami.send(c,function(a){b.send(a)})})},exports.unPark=function(a,b){var c=a.body.exten||a.query.exten,d=a.body.type||a.query.type;d||(d="SIP"),parkCalls(function(a){if("Success"===a.Response||"Success"===a.response)if(null!=a.events&&a.events.length>0)for(var e=0;e<a.events.length;e++){var f=a.events[e].from,g=new RegExp(d+"/"+c,"g");if(f.match(g)){var h=a.events[e].channel,i=new AsAction.Redirect;i.Channel=h,i.Exten=c,i.Context="app-exten",nami.send(i,function(a){b.send(a)});break}}else b.send({response:"Error",Msg:"当前没有被保持的通话！"});else b.send(a)})},exports.checkService=function(a,b){var c=a.body.exten||a.query.exten,d=a.body.type||a.query.type;d||(d="SIP"),getconnectchannel(d,c,function(a){var d=new AsAction.Redirect;d.Channel=a.src,d.Exten=c,d.Context="checkservice",nami.send(d,function(a){b.send(a)})})},exports.GetCallInfo=function(a,b){var c=a.body.fromexten||a.query.fromexten;if(null==c||""==c)b.send({success:"0"});else{var d=require("../modules/ippbx/callevent.js");d.findOne({where:{extensionnumber:c}},function(a,c){if(a||null==c)b.send({success:"0"});else{var e={};"waite"==c.status?(e.success=1,"2"==c.routerdype?(e.caller=c.callednumber,e.called=c.callernumber):(e.caller=c.callernumber,e.called=c.callednumber),e.unid=c.uid,e.poptype=c.poptype,e.callid=c.callid,c.status="over",c.poptype="",d.updateOrCreate(c,function(a){b.send(a?{success:"0"}:e)})):b.send({success:"0"})}})}},exports.DadOn=function(a,b){var c=a.body.exten||a.query.exten,d=(a.body.type||a.query.type,require("../modules/ippbx/extension.js"));try{d.all({where:{accountcode:c}},function(a,e){if(a)return void b.send({Response:"Error",Msg:"获取分机号失败!"});if(console.log(e),null!=e){var f=e[0];f.dndinfo="on"===f.dndinfo?"off":"on",d.updateOrCreate(f,function(a){b.send(a?{Response:"Error",Msg:"更新状态失败!"}:{Response:"Success",Msg:"操作成功!"})})}else b.send({Response:"Error",Msg:"没有找到分机号,"+c})})}catch(e){b.send({Response:"Error",Msg:e})}};
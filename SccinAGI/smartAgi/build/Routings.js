/*! AGI 2014-03-20 */
function str2obj(a){var b={};if(a&&""!==a){var c=a.split("&");for(var d in c){var e=c[d].split("=");b[e[0]]=e[1]}}return b}var async=require("async"),AsAction=require("nami").Actions,moment=require("moment"),guid=require("guid"),conf=require("node-conf").load("fastagi"),routing=function(a){this.context=a.context,this.schemas=a.Schemas,this.agiconf=a.agiconf,this.nami=a.nami,this.args=a.args,this.logger=a.logger,this.vars=a.vars,this.sessionnum=guid.create(),this.ivrlevel=0,this.transferlevel=0,this.lastinputkey="",this.routerline="",this.activevar={}};module.exports=routing,routing.prototype.NextDial=function(a,b,c){var d=this,e=(d.context,d.schemas),f=(d.logger,d.nami);async.auto({getPhones:function(b){e.crmCallPhone.all({where:{callRecordsID:a,State:0},order:["PhoneSequ asc"]},function(a,c){b(a,c)})},startnewdial:["getPhones",function(c,d){if(d.getPhones&&d.getPhones.length>0){var e="LOCAL/200@sub-outgoing",g="sub-outgoing-callback",h=new AsAction.Originate;h.Channel=e,h.Async=!0,h.Account=a,h.CallerID=200,h.Context=g,h.Variable="callrecordid="+a+",keynum="+b,h.Exten=200,f.connected?f.send(h,function(a){c(null,a)}):(f.open(),f.send(h,function(a){c(null,a)}))}else c()}]},function(a,b){c(a,b)})},routing.prototype.NoCome=function(a,b){var c=this,d=c.context,e=c.schemas,f=c.logger;async.auto({saveDialResult:function(b){try{e.crmDialResult.update({where:{id:a},update:{Result:3,State:1}},function(a,c){b(a,c)})}catch(c){f.error("记录确认不参加评标发生异常:",c),b("记录确认不参加评标发生异常！",null)}},voiceNotice:["saveDialResult",function(a){d.Playback("nosure",function(){d.hangup(function(b,c){d.end(),a(b,c)})})}]},function(a,c){b(a,c)})},routing.prototype.SureCome=function(a,b,c,d){var e=this,f=e.context,g=e.schemas,h=e.logger;async.auto({saveDialResult:function(b){try{g.crmDialResult.update({where:{id:a},update:{Result:1,State:1}},function(a,c){b(a,c)})}catch(c){h.error("保存拨打结果发生异常:",c),b("保存拨打结果发生异常！",null)}},voiceNotice:["saveDialResult",function(a){var d=function(e){async.auto({playvoice:function(a){try{f.GetData("/home/share/sure",5e3,1,function(b,c){a(b,c)})}catch(b){h.error("语音通知确认评标发生异常:",b),a("语音通知确认评标发生异常！",null)}},checkInput:["playvoice",function(a,d){try{var i=d.playvoice.result;i.replace(/\s+/,""),g.crmUserKeysRecord.create({id:guid.create(),Key:i,keyTypeID:"111111",callLogID:b.id},function(b){switch(i){case c[2]:e++,a(b,{count:e,key:i});break;case"timeout":f.Playback("timeout",function(b){e++,a(b,{count:e,key:i})});break;default:f.Playback("inputerror",function(b){e++,a(b,{count:e,key:i})})}})}catch(j){h.error("语音通知确认评标记录按键发生异常:",j),a("语音通知确认评标记录按键发生异常！",null)}}]},function(b,c){"-1"===c.checkInput.key?a(null,-1):c.checkInput.count<3?d(c.checkInput.count):f.Playback("waiteout",function(){f.hangup(function(){f.end()})})})},e=0;d(e)}]},function(a,b){d(a,b)})},routing.prototype.addQueueMember=function(){{var a=this,b=a.context,c=(a.schemas,a.nami,a.logger,a.args);a.vars}async.auto({addAgent:function(a){b.AddQueueMember(c.queuenum,c.agent,function(b,c){a(b,c)})}},function(){})},routing.prototype.agi=function(){},routing.prototype.calloutback=function(){var a=this,b=a.context,c=a.schemas,d=null,e=null,f=a.logger;a.args.routerline="扩展应用";var g=a.args,h=a.vars;async.auto({AddCDR:function(b){c.pbxCdr.create({id:a.sessionnum,caller:h.agi_callerid,called:g.called,accountcode:h.agi_accountcode,routerline:g.routerline,srcchannel:h.agi_channel,uniqueid:h.agi_uniqueid,threadid:h.agi_threadid,context:h.agi_context,agitype:h.agi_type,lastapptime:moment().format("YYYY-MM-DD HH:mm:ss"),lastapp:"calloutback",answerstatus:"CALLBACK"},function(a,c){b(a,c)})},getCallrcordsId:function(a){b.getVariable("callrecordid",function(b,c){var e=/(\d+)\s+\((.*)\)/,f=null;e.test(c.result)&&(f=RegExp.$1,d=RegExp.$2),a(b,d)})},getKeyNum:["getCallrcordsId",function(a){b.getVariable("keynum",function(b,c){var d=/(\d+)\s+\((.*)\)/,g=null;d.test(c.result)&&(g=RegExp.$1,e=RegExp.$2.split("|"),f.debug("keyNum:",e)),a(b,e)})}],getPhones:["getKeyNum",function(a){c.crmCallPhone.all({where:{callRecordsID:d,State:1},order:["PhoneSequ desc"]},function(b,c){a(b,c)})}],updateCallRecords:["getKeyNum",function(a){c.crmCallRecords.update({where:{id:d},update:{CallState:2}},function(b,c){a(b,c)})}],getKey:["getPhones","updateCallRecords",function(g,h){var i=h.getPhones[0],j=function(h){async.auto({playinfo:function(a){b.GetData("/home/share/notice",5e3,1,function(b,c){console.log("撒也不按，挂机了",c),a(b,c)})},checkinput:["playinfo",function(a,d){var f=d.playinfo.result;f.replace(/\s+/,""),c.crmUserKeysRecord.create({id:guid.create(),Key:f,keyTypeID:"111111",callLogID:i.id},function(c){f===e[0]?(h=100,a(c,{count:h,key:f})):f===e[1]?(h=100,a(c,{count:h,key:f})):f===e[2]?(h++,a(c,{count:h,key:f})):"timeout"===f?b.Playback("timeout",function(b){h++,a(b,{count:h,key:f})}):b.Playback("inputerror",function(b){h++,a(b,{count:h,key:f})})})}]},function(h,k){f.debug("当前循环次数：",k.checkinput),"-1"===k.checkinput.key?c.crmDialResult.update({where:{id:d},update:{Result:3,State:1}},function(a,b){g(a,b)}):k.checkinput.count<3?j(k.checkinput.count):100==k.checkinput.count&&k.checkinput.key===e[0]?a.SureCome(d,i,e,function(a,b){g(a,b)}):100==k.checkinput.count&&k.checkinput.key===e[1]?a.NoCome(d,function(a,b){g(a,b)}):c.crmDialResult.update({where:{id:d},update:{Result:3,State:1}},function(a,c){b.Playback("waiteout",function(){b.hangup(function(a){b.end(),g(a,c)})})})})},k=0;j(k)}]},function(a,c){a&&(console.log(c.getKey),b.hangup(function(){b.end()}))})},routing.prototype.channelMax=function(a){async.auto({},function(b,c){a(b,c)})},routing.prototype.conference=function(){},routing.prototype.dialExtenFail=function(a,b,c){{var d=this,e=(d.context,d.schemas),f=(d.nami,d.logger);d.args,d.vars}async.auto({getFailOptions:function(b){e.pbxExtension.find(a,function(a,c){a||null==c?b("呼叫失败处理获取分机信息发生异常！",-1):b(null,c)})},doFail:["getFailOptions",function(a,b){var c=str2obj(b.getFailOptions.failed);f.debug("呼叫失败处理:",b.getFailOptions.failed),c.deailway&&""!==c.deailway&&"function"==typeof c.deailway?d[c.deailway](c.number,function(b,c){a(b,c)}):d.hangup("",function(b,c){a(b,c)})}]},function(a,b){c(a,-b)})},routing.prototype.diallocal=function(a,b){{var c=this,d=(c.context,c.schemas),e=(c.nami,c.logger);c.args,c.vars}async.auto({updateCDR:function(a){d.pbxCdr.update({where:{id:c.sessionnum},update:{lastapptime:moment().format("YYYY-MM-DD HH:mm:ss"),lastapp:"本地呼叫"}},function(b,c){a(b,c)})},findLocal:["updateCDR",function(b){d.pbxLocalNumber.findOne({where:{id:a}},function(d,f){d&&b(d,f),e.debug(f),null!=f?c[f.localtype](a,f.assign,function(a,c){b(a,c)}):(e.debug("本地默认处理拨打IVR200"),c.ivr(200,0,function(a,c){b(a,c)}))})}]},function(a,c){b(a,c)})},routing.prototype.dialout=function(a,b){var c=this,d=c.context,e=c.schemas,f=(c.nami,c.logger),g=c.args,h=c.vars;async.auto({updateCDR:function(a){e.pbxCdr.update({where:{id:c.sessionnum},update:{called:g.called,lastapptime:moment().format("YYYY-MM-DD HH:mm:ss"),lastapp:"呼叫外部"}},function(b,c){a(b,c)})},findLine:["updateCDR",function(b){e.pbxTrunk.find(a,function(a,c){a||null==c?b("没有找到可以呼出的外线",-1):b(null,c)})}],updatePopScreen:["updateCDR",function(a){e.pbxScreenPop.update({where:{id:h.agi_callerid},update:{callernumber:h.agi_callerid,callednumber:g.called,sessionnumber:c.sessionnum,status:"waite",routerdype:2,poptype:"dialout",updatetime:moment().format("YYYY-MM-DD HH:mm:ss")}},function(b,c){a(b,c)})}],dial:["findLine",function(a,b){var i=b.findLine.trunkproto,j=b.findLine.trunkdevice,k=g.called;e.pbxCallProcees.create({callsession:c.sessionnum,caller:h.agi_callerid,called:g.called,routerline:g.routerline,passargs:"trunkproto="+i+"&called="+k+"&trunkdevice="+j,processname:"呼叫外线",doneresults:""},function(a){a&&f.error("记录呼叫处理过程发生异常：",a)});var l=i+"/"+j;d.Dial(l+"/"+k,conf.timeout,conf.dialoptions,function(b,c){b?a(b,c):d.getVariable("DIALSTATUS",function(b,c){a(null,c)})})}],afterdial:["dial",function(a,b){var d=/(\d+)\s+\((\w+)\)/,i=null;d.test(b.dial.result)&&(i=RegExp.$2),f.debug("应答状态：",i),e.pbxCallProcees.create({callsession:c.sessionnum,caller:h.agi_callerid,called:g.called,routerline:g.routerline,passargs:"",processname:"呼叫外线结束",doneresults:"anwserstatus="+i},function(a){a&&f.error("记录呼叫处理过程发生异常：",a)}),e.pbxCdr.update({where:{id:c.sessionnum},update:{lastapptime:moment().format("YYYY-MM-DD HH:mm:ss"),answerstatus:i}},function(a){a&&f.error("通话结束后更新通话状态发生异常！",a)}),a(null,1)}]},function(a,c){b(a,c)})},routing.prototype.dodefault=function(a){a.hangup(function(b,c){console.log("Hangup success:",c),a.end()})},routing.prototype.extension=function(a,b,c){var d=this,e=d.context,f=d.schemas,g=(d.nami,d.logger),h=(d.args,d.vars);async.auto({updateCDR:function(b){f.pbxCdr.update({where:{id:d.sessionnum},update:{lastapptime:moment().format("YYYY-MM-DD HH:mm:ss"),called:a,lastapp:"拨打分机"}},function(a,c){b(a,c)})},updateScreenPop:function(b){f.pbxScreenPop.update({where:{id:a},update:{callernumber:h.agi_callerid,callednumber:a,sessionnumber:d.sessionnum,status:"waite",routerdype:1,poptype:"diallocal",updatetime:moment().format("YYYY-MM-DD HH:mm:ss")}},function(a,c){b(a,c)})},dial:["updateCDR",function(c){var f=str2obj(b),h=f.extenproto||"SIP",i=f.timeout||"60";i=parseInt(i),f.transnum&&/\d+/.test(f.transnum)?(g.debug("当前呼叫转移参数：",f.transway,f.transnum),f.transway&&"function"==typeof d[f.transway]&&d.transferlevel<10?(g.debug("当前呼叫转移层数：",d.transferlevel),d.transferlevel++,d[f.transway](f.transnum,function(a){a&&g.error("呼叫转移过程中发生异常",a),c(null,{result:"1 (TRANSFER)"})})):c("呼叫转移方式指定错误或呼叫转移循环层级达到10",-1)):e.Dial(h+"/"+a,i,"tr",function(a,b){g.debug("拨打分机返回结果：",b),a?c(a,b):e.getVariable("DIALSTATUS",function(a,b){c(null,b)})})}],afterdial:["dial",function(b,c){var e=/(\d+)\s+\((\w+)\)/,h=null;e.test(c.dial.result)&&(h=RegExp.$2),g.debug("应答状态：",h),f.pbxCdr.update({where:{id:d.sessionnum},update:{lastapptime:moment().format("YYYY-MM-DD HH:mm:ss"),answerstatus:h}},function(a){a&&g.error("通话结束后更新通话状态发生异常！",a)}),"CANCEL"===h?(g.debug("主叫叫直接挂机！"),b("主叫直接挂机！",-1)):"TRANSFER"===h?(g.debug("被叫开启了呼叫转移！"),b("被叫开启了呼叫转移！",-1)):"ANSWER"!==h?d.dialExtenFail(a,h,function(a,c){b(a,c)}):(g.debug("应答成功。"),b(null,1))}]},function(a,b){c(a,b)})},routing.prototype.hangup=function(a,b){{var c=this,d=c.context;c.schemas,c.nami,c.logger,c.args,c.vars}d.hangup(function(a,c){b(a,c)})},routing.prototype.ivr=function(a,b,c){var d=this,e=d.context,f=d.schemas,g=(d.nami,d.logger),h=d.args,i=d.vars;d.ivrlevel>50?c("IVR嵌套过深",-1):(g.debug("当前IVR嵌套层数:",d.ivrlevel),d.ivrlevel++,async.auto({updateCDR:function(a){f.pbxCdr.update({where:{id:d.sessionnum},update:{lastapptime:moment().format("YYYY-MM-DD HH:mm:ss"),lastapp:"自动语音应答处理"}},function(b,c){a(b,c)})},getIVR:["updateCDR",function(b){f.pbxIvrMenmu.find(a,function(a,c){b(a,c)})}],getIVRActions:["getIVR",function(a,b){b.getIVR.actions({where:{},include:"Actmode",order:["ordinal asc"]},function(b,c){a(b,c)})}],getIVRInputs:["getIVR",function(a,b){b.getIVR.inputs({where:{}},function(b,c){a(b,c)})}],Answer:["getIVRActions","getIVRInputs",function(a){e.answer(function(b,c){a(b,c)})}],action:["Answer",function(c,e){g.debug("开始执行IVR动作"),b||(b=0),f.pbxCallProcees.create({callsession:d.sessionnum,caller:i.agi_callerid,called:h.called,routerline:h.routerline,passargs:"ivrnum="+a+"&action="+b,processname:"呼叫自动语音应答处理",doneresults:""},function(a){a&&g.error("记录呼叫处理过程发生异常：",a)}),d.ivraction(b,e.getIVRActions,e.getIVRInputs,function(a,b){c(a,b)})}]},function(a,b){c(a,b)}))},routing.prototype.ivraction=function(a,b,c,d){var e=this,f=e.context,g=e.schemas,h=e.nami,i=e.logger,j=e.args,k=e.vars;if(i.debug("进入IVR动作执行流程编号:",a),a<b.length){i.debug(b[a].__cachedRelations.Actmode);var l=b[a].__cachedRelations.Actmode,m=str2obj(b[a].args);g.pbxCallProcees.create({callsession:e.sessionnum,caller:k.agi_callerid,called:j.called,routerline:j.routerline,passargs:"actionid="+a+"&"+b[a].args,processname:l.modename,doneresults:""},function(a){a&&i.error("记录呼叫处理过程发生异常：",a)}),i.debug("Action 参数:",m),async.auto({Action:function(a){if("播放语音"===l.modename)if(i.debug("IVR播放语音"),"true"!==m.interruptible)i.debug("准备播放语音。"),f.Playback(m.folder+"/"+m.filename,function(b,c){i.debug("Playback:",c),a(b,c)});else{var b=3;m.retrytime&&/\d+/.test(m.retrytime)&&(b=parseInt(m.retrytime));var d=5e3;m.timeout&&/\d+/.test(m.timeout)&&(d=1e3*parseInt(m.timeout));var g=(m.failivrnum,0);m.failactid&&/\d+/.test(m.failactid)&&(g=parseInt(m.failactid));var j=function(g){async.auto({playinfo:function(a){f.GetData(m.folder+"/"+m.filename,d,1,function(b,c){a(b,c)})},checkinput:["playinfo",function(a,b){var d=b.playinfo.result;d=d.replace(/\s+|\(|\)/g,""),e.ivrinput(d,c,function(b,c){0==c?(g++,a(b,{count:g,key:d})):a(b,{count:100,key:d})})}]},function(c,d){i.debug("当前循环次数：",d.checkinput),c?a(c,-1):"-1"===d.checkinput.key?a("对方主动挂机。",-1):d.checkinput.count<b?j(d.checkinput.count):f.Playback("b_bye",function(){a("超过允许最大的按键等待次数或错误次数",-1)})})},k=0;j(k)}else if("检查号码归属地"===l.modename);else if("发起录音"===l.modename);else if("播放录音"===l.modename);else if("录制数字字符"===l.modename){i.debug("准备开始录制数字字符。");var n=20,o="";m.maxdigits&&/\d+/.test(m.maxdigits)&&(n=parseInt(m.maxdigits)),0>=n?a(null,1):async.auto({GetKey:function(a){var b=m.beep,c=function(){f.waitForDigit(6e3,function(b,d){if(i.debug(d),b)a(b,d);else{var f=String.fromCharCode(d.result);if("#"!==f&&(o+=f),i.debug("录制到数字字符:"+o),o.length<n&&"#"!==f)c();else{m.addbefore&&"true"===m.addbefore&&(o=e.lastinputkey+o);var g="lastwaitfordigit";m.varname&&""!==m.varname&&(g=m.varname),e.activevar[g]=o,i.debug("保存到变量"+g+"的数字字符:"+e.activevar[g]),a(null,o)}}})};"true"===b?f.Playback("beep",function(){c()}):c()}},function(b,c){a(b,c)})}else if("读出数字字符"===l.modename){i.debug("准备读出数字字符。");var p="lastwaitfordigit";m.varname&&""!==m.varname&&(p=m.varname);var q=e.activevar[p];i.debug("准备从变量"+p+"读出数字字符:"+q),m.digits&&/\d+/.test(m.digits)&&(q=m.digits),q&&""!==q?async.auto({saydigits:function(a){i.debug("需要读出数字字符:",q),f.saydigits(q,function(b,c){i.debug("读出数字字符返回结果：",c),a(b,c)})}},function(b,c){a(b,c)}):a("没有需要读取的数字",-1)}else if("数字方式读出"===l.modename);else if("读出日期时间"===l.modename);else if("检测日期"===l.modename);else if("主叫变换"===l.modename);else if("拨打号码"===l.modename){var r=e.activevar.lastwaitfordigit;m.varname&&""!==m.varname&&(r=e.activevar[m.varname]),m.digits&&""!==m.digits&&(r=m.digits),/\d+/.test(r)?m.dialway&&""!==m.dialway?async.auto({dial:function(a){i.debug("拨打号码："+m.dialway+"/"+r),e[m.dialway](r,function(b,c){a(b,c)})}},function(b,c){a(b,c)}):(i.debug("非法拨打方式"),a("非法拨打方式",-1)):(i.debug("需要拨打的号码有误。"),a("需要拨打的号码有误。",-1))}else"跳转到语音信箱"===l.modename||"跳转到IVR菜单"===l.modename||"WEB交互接口"===l.modename||"AGI扩展接口"===l.modename||"等待几秒"===l.modename||"播放音调"===l.modename||("通道阀"===l.modename?async.auto({getActiveChannels:function(a){var b=m.trunkProto;if(i.debug("准备获取通道类型为:"+b+"的通道信息"),b&&""!==b){b=b.toLowerCase();var c=new AsAction.Command;c.Command=b+" show channels",h.connected?h.send(c,function(b){var c=b.lines.pop();a(null,c)}):(h.open(),h.send(c,function(b){a(null,b)}))}else a("无效通道协议。",-1)},dosth:["getActiveChannels",function(a,b){var c=b.getActiveChannels;c&&""!==c&&(c=c.split("\n")),i.debug("当前获取到"+m.trunkProto+"的通道信息:",c),30>=m.max?e.channelMax(function(b,c){a(b,c)}):a(null,1)}]},function(b,c){a(b,c)}):a("默认处理",-1))}},function(f){f?d(f,-1):(a++,e.ivraction(a,b,c,d))})}else d("所有的动作执行完毕",-1)},routing.prototype.ivrinput=function(a,b,c){{var d=this,e=d.context,f=(d.schemas,d.nami,d.logger);d.args,d.vars}"-1"===a&&c("获取按键时一方挂机",-1);var g=null;d.lastinputkey=a;for(var h in b)if(b[h].inputnum===a){g=b[h];break}null!==g?(f.debug("找到对应的按键流程：",g),d.ivr(g.gotoivrnumber,g.gotoivractid,function(a,b){a&&f.debug("上层IVR返回了异常：",a),c(a,b)})):(f.debug("没有找到按键:",a),"timeout"===a?e.Playback("b_timeout",function(){c(null,0)}):e.Playback("b_error",function(){c(null,0)}))},routing.prototype.monitor=function(a,b){{var c=this,d=c.context,e=(c.schemas,c.nami,c.logger);c.args,c.vars}"function"==typeof a&&(b=a,a=c.sessionnum+".wav"),d.MixMonitor(a,"","",function(a,c){a?(e.error("自动录音，发生错误：",a),b("自动录音发生异常.",a)):b(null,c)})},routing.prototype.pauseQueueMember=function(a,b,c){var d=this,e=d.context,f=(d.schemas,d.nami,d.logger,d.args),g=d.vars;async.auto({removeAgent:function(a){var b=f.queuenum||"",c=f.agent||g.agi_callerid;e.PauseQueueMember(b,"SIP/"+c+",0,"+c,function(b,c){a(b,c)})}},function(a,b){c(a,b)})},routing.prototype.queue=function(a,b,c){{var d=this,e=d.context,f=d.schemas,g=(d.nami,d.logger);d.args,d.vars}async.auto({updateCDR:function(b){f.pbxCdr.update({where:{id:d.sessionnum},update:{lastapptime:moment().format("YYYY-MM-DD HH:mm:ss"),lastapp:"拨打队列"+a}},function(a,c){b(a,c)})},queue:["updateCDR",function(b){e.Queue(a,"tc","","",30,"agi://192.168.0.114/queueAnswered?queuenum="+a+"&sessionnum="+d.sessionnum,function(a,c){g.debug("队列拨打返回结果:",c),b(a,c)})}],getQueueStatus:["queue",function(a){e.getVariable("QUEUESTATUS",function(b,c){var d="",e=/(\d+)\s+\((.*)\)/,f=null;e.test(c.result)&&(f=RegExp.$1,d=RegExp.$2),g.debug("获取呼叫队列状态：",d),a(b,d)})}]},function(a,b){c(a,b)})},routing.prototype.queueAnswered=function(){{var a=this,b=a.context,c=a.schemas,d=(a.nami,a.logger),e=a.args,f=a.vars,g=e.sessionnum;e.queuenum}d.debug("队列被接听:",f),async.auto({getAnswerMem:function(a){b.getVariable("MEMBERINTERFACE",function(b,c){var e="",f=/(\d+)\s+\((.*)\)/,g=null;f.test(c.result)&&(g=RegExp.$1,e=RegExp.$2),/\/(\d+)/.test(e)&&(e=RegExp.$1),d.debug("当前应答坐席：",e),a(b,e)})},updateCDR:["getAnswerMem",function(a,b){c.PBXCdr.update({where:{id:g},update:{answerstatus:"ANSWERED",called:b.getAnswerMem,lastapptime:moment().format("YYYY-MM-DD HH:mm:ss")}},function(b,c){a(b,c)})}],updatePop:["getAnswerMem",function(a,b){c.PBXScreenPop.update({where:{id:b.getAnswerMem},update:{callernumber:f.agi_callerid,callednumber:b.getAnswerMem,sessionnumber:g,status:"waite",routerdype:1,poptype:"diallocal",updatetime:moment().format("YYYY-MM-DD HH:mm:ss")}},function(b,c){a(b,c)})}]},function(){b.end()})},routing.prototype.removeQueueMember=function(){{var a=this,b=a.context,c=(a.schemas,a.nami,a.logger,a.args);a.vars}async.auto({removeAgent:function(a){b.RemoveQueueMember(c.queuenum,c.agent,function(b,c){a(b,c)})}},function(){})},routing.prototype.router=function(){var a=this,b=a.context,c=a.schemas,d=(a.nami,a.logger),e=a.args,f=a.vars;a.routerline=e.routerline,async.auto({AddCDR:function(b){c.pbxCdr.create({id:a.sessionnum,caller:f.agi_callerid,called:e.called,accountcode:f.agi_accountcode,routerline:e.routerline,srcchannel:f.agi_channel,uniqueid:f.agi_uniqueid,threadid:f.agi_threadid,context:f.agi_context,agitype:f.agi_type,lastapptime:moment().format("YYYY-MM-DD HH:mm:ss"),lastapp:"呼叫路由处理",answerstatus:"NOANSWER"},function(a,c){b(a,c)})},MixMonitor:["AddCDR",function(b){a.sysmonitor(b)}],GetRouters:["AddCDR",function(a){c.pbxRouter.all({where:{routerline:e.routerline},order:["proirety asc"]},function(b,c){a(b,c)})}],Route:["GetRouters",function(b,g){d.debug(g.GetRouters);for(var h=null,i=null,j=!1,k=0;k<g.GetRouters.length;k++)if(f.agi_accountcode!==g.GetRouters[k].callergroup&&"all"!==g.GetRouters[k].callergroup);else{d.debug("呼叫线路组匹配成功"),j=!0;var l=new RegExp("^"+g.GetRouters[k].callerid),m=new RegExp("^"+g.GetRouters[k].callednum);if("呼入"===g.GetRouters[k].routerline?(""===g.GetRouters[k].callerid||l.test(f.agi_callerid)||(j=!1),-1!==g.GetRouters[k].callerlen&&f.agi_callerid.length!==g.GetRouters[k].callerlen&&(j=!1)):"呼出"===g.GetRouters[k].routerline&&(""===g.GetRouters[k].callednum||m.test(e.called)||(j=!1),-1!==g.GetRouters[k].calledlen&&e.called.length!==g.GetRouters[k].calledlen&&(j=!1)),j){d.debug("路由匹配成功，开始进行替换操作"),""!==g.GetRouters[k].replacecallerid&&(f.agi_callerid=g.GetRouters[k].replacecallerid),-1!==g.GetRouters[k].replacecalledtrim&&(e.called=e.called.substr(g.GetRouters[k].replacecalledtrim)),""!==g.GetRouters[k].replacecalledappend&&(e.called=g.GetRouters[k].replacecalledappend+e.called),h=g.GetRouters[k].processmode,i=g.GetRouters[k].processdefined||e.called;break}}j?(c.pbxCallProcees.create({callsession:a.sessionnum,caller:f.agi_callerid,called:e.called,routerline:e.routerline,passargs:"processmode="+h+"&processdefined="+i,processname:"呼叫路由处理",doneresults:"匹配到呼叫路由"},function(a){a&&d.error("记录呼叫处理过程发生异常：",a)}),a[h](i,function(a,c){b(a,c)})):(c.pbxCallProcees.create({callsession:a.sessionnum,caller:f.agi_callerid,called:e.called,routerline:e.routerline,passargs:"",processname:"呼叫路由处理",doneresults:"未找到匹配的路由！"},function(a){a&&d.error("记录呼叫处理过程发生异常：",a)}),b("未找到匹配的路由！",1))}]},function(a){a?(d.error(a),d.debug("当前上下文状态："+b.state+"，上下文流是否可读："+b.stream.readable),b.stream&&b.stream.readable&&b.hangup(function(){})):(d.debug("当前上下文状态："+b.state+"，上下文流是否可读："+b.stream.readable),b.stream&&b.stream.readable&&b.hangup(function(){d.debug("来自自动挂机")}))})},routing.prototype.sccincallout=function(){var a=this,b=a.context,c=a.schemas,d=a.args.callRecordsID,e=(a.nami,null),f=a.logger;a.args.routerline="扩展应用";var g=a.args,h=a.vars;async.auto({AddCDR:function(b){c.pbxCdr.create({id:a.sessionnum,caller:h.agi_callerid,called:g.called,accountcode:h.agi_accountcode,routerline:g.routerline,srcchannel:h.agi_channel,uniqueid:h.agi_uniqueid,threadid:h.agi_threadid,context:h.agi_context,agitype:h.agi_type,lastapptime:moment().format("YYYY-MM-DD HH:mm:ss"),lastapp:"sccincallout",answerstatus:"NOANSWER"},function(a,c){b(a,c)})},getCallrcordsId:function(a){try{b.getVariable("callrecordid",function(b,c){f.debug("获取呼叫记录编号：",c);var e=/(\d+)\s+\((.*)\)/,g=null;e.test(c.result)&&(g=RegExp.$1,d=RegExp.$2),a(b,d)})}catch(c){f.error(c),a("获取呼叫记录编号发生异常！",null)}},getKeyNum:["getCallrcordsId",function(a){try{b.getVariable("keynum",function(b,c){f.debug("获取有效按键：",c);var d=/(\d+)\s+\((.*)\)/,g=null;d.test(c.result)&&(g=RegExp.$1,e=RegExp.$2),a(b,e)})}catch(c){f.error(c),a("通道变量获取有效按键发生异常！",null)}}],getPhones:["getKeyNum",function(a){try{c.crmCallPhone.all({where:{callRecordsID:d,State:0},order:["PhoneSequ asc"]},function(b,c){a(b,c)})}catch(b){f.error(b),a("获取需要拨打的电话号码发生异常！",null)}}],updateCallRecords:["getPhones",function(a,b){try{b.getPhones&&b.getPhones.length>0?c.crmCallRecords.update({where:{id:d},update:{CallState:1}},function(b,c){a(b,c)}):a("未有找到电话号码",b)}catch(e){f.error("更新呼叫记录表发生异常:",e),a("更新呼叫记录表发生异常！",null)}}],updateDialResult:["getPhones",function(a,b){try{b.getPhones&&b.getPhones.length>0?c.crmDialResult.update({where:{id:d},update:{State:1}},function(b,c){a(b,c)}):a("未有找到电话号码",b)}catch(e){f.error("更新呼叫结果表发生异常:",e),a("更新呼叫结果表发生异常！",null)}}],Dial:["getPhones","updateDialResult","updateCallRecords",function(a,d){d.getPhones&&d.getPhones.length>0?async.auto({updateCallPhone:function(a){try{c.crmCallPhone.update({where:{id:d.getPhones[0].id},update:{State:1}},function(b,c){a(b,c)})}catch(b){f.error("更新电话记录表发生异常:",b),a("更新电话记录表发生异常！",null)}},addCallLog:function(a){try{c.crmCallLog.create({Phone:d.getPhones[0].Phone,PhoneSequ:d.getPhones[0].PhoneSequ,callphone:d.getPhones[0]},function(b,c){a(b,c)})}catch(b){f.error("添加呼叫日志发生异常:",b),a("添加呼叫日志发生异常！",null)}},dial:["addCallLog","updateCallPhone",function(a){try{b.Dial(conf.line+d.getPhones[0].Phone,conf.timeout,conf.dialoptions,function(c,d){c?a(c,d):(console.log(b),b.getVariable("DIALSTATUS",function(b,c){a(null,c)}))})}catch(c){f.error("产生拨打发生异常:",c),a("产生拨打发生异常！",null)}}],dialStatus:["dial",function(a,b){try{var d=/(\d+)\s+\((\w+)\)/,e=null;d.test(b.dial.result)&&(e=RegExp.$2),c.crmUserKeysRecord.create({id:guid.create(),Key:e,keyTypeID:"111111",calllog:b.addCallLog},function(b,c){a(b,c)})}catch(g){f.error("获取拨打状态发生异常:",g),a("获取拨打状态发生异常！",null)}}]},function(b,c){a(b,c)}):a("未有找到电话号码",d)}]},function(g,h){if(g)f.error("外呼程序发生异常：",g),b.hangup(function(){f.error("没有找到需要拨打的号码，挂机！")});else{var i=h.Dial.dialStatus.Key;c.pbxCdr.update({where:{id:a.sessionnum},update:{lastapptime:moment().format("YYYY-MM-DD HH:mm:ss"),answerstatus:i}},function(a){a&&f.error("通话结束后更新通话状态发生异常！",a)}),"CONGESTION"===i?b.hangup(function(){f.debug("被叫直接挂机！")}):"ANSWER"!==i?a.NextDial(d,e,function(){f.debug("继续拨打成功！")}):f.debug("准备开始播放语音文件。")}})},routing.prototype.sysmonitor=function(a,b){var c=this,d=c.context,e=c.schemas,f=(c.nami,c.logger),g=c.args,h=c.vars;"function"==typeof a&&(b=a,a=""),async.auto({checkMonitorWay:function(b){var c={id:{neq:""}};"呼入"===a?(c.recordin="是",c.members={like:"%"+g.called+"%"}):"呼出"===a?(c.recordout="是",c.members={like:"%"+h.agi_callerid+"%"}):"队列"===a?(c.recordqueue="是",c.members={like:"%"+g.called+"%"}):b(null,{wayName:"系统自动",keepfortype:"按时间",keepforargs:90}),c&&null!==c.members&&e.pbxAutoMonitorWays.findOne({where:c},function(a,c){b(a,c)})},buildForder:["checkMonitorWay",function(a,b){if(null!==b.checkMonitorWay){var c=require("fs"),d=b.checkMonitorWay.wayName,e="/var/spool/asterisk/monitor/"+d+"/";c.exists("/etc/passwd",function(b){b?a(null,e):c.mkdir(e,function(b){b?a("无法创建录音需要的目录："+e,null):a(null,e)})})}else a("不需要录音！",null)}],findHasRecords:["checkMonitorWay",function(a,b){if(null!==b.checkMonitorWay)if("按时间"===b.checkMonitorWay.keepfortype){var c={},d=moment().subtract("days",b.checkMonitorWay.keepforargs).format("YYYY-MM-DD");c.cretime={lte:d},e.pbxRcordFile.all({where:c},function(b,c){a(b,c)})}else"按条数"===b.checkMonitorWay.keepfortype?e.pbxRcordFile.count({},function(c,d){c?a(c,[]):d>b.checkMonitorWay.keepforargs?e.pbxRcordFile.all({skip:0,limit:d-b.checkMonitorWay.keepforargs},function(b,c){a(b,c)}):a(null,[])}):a(null,[]);else a("不需要录音！",[])}],handleHasRecords:["findHasRecords",function(a){a(null,null)}],monitor:["buildForder",function(a,b){var e=c.sessionnum+".wav";d.MixMonitor(b.buildForder+e,"","",function(b,c){b?a("自动录音发生异常.",b):a(null,c)})}],addRecords:["buildForder",function(a,b){var d=c.sessionnum+".wav",f="呼入"===c.routerline?g.called:h.agi_callerid,i="呼出"===c.routerline?g.called:h.agi_callerid;e.pbxRcordFile.create({id:c.sessionnum,filename:d,extname:"wav",calltype:c.routerline,extennum:f,folder:b.buildForder,callnumber:i},function(b,c){a(b,c)})}]},function(a){a?(f.error("自动录音，发生错误：",a),b(null,a)):b(null,response)})},routing.prototype.unPauseQueueMember=function(a,b,c){var d=this,e=d.context,f=(d.schemas,d.nami,d.logger,d.args),g=d.vars;async.auto({removeAgent:function(a){var b=f.queuenum||"",c=f.agent||g.agi_callerid;e.UnpauseQueueMember(b,"SIP/"+c+",0,"+c,function(b,c){a(b,c)})}},function(a,b){c(a,b)})};
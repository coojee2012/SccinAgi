/*! 路由处理程序 2014-09-03 */
function spansarray(a,b){var c=[];async.eachSeries(a,function(a,b){var d=a.replace(/PRI\s+span\s+/,"").replace(/\/\d+/,"").split(/\:/),e={};e.span=d[0],e.status=d[1],spanarray(e.span,function(a){e.total=30,e.used=a,c.push(e),b()})},function(a){b(a,c)})}function spanarray(a,b){var c="pri show span "+a,d=new AsAction.Command;d.Command=c,nami.send(d,function(a){var c=[],d=[];"FOLLOWS"==a.response.toUpperCase()&&(c=a.lines),c.length>0&&(d=c[c.length-1]);var e=0;/active-calls:(\d+)/.test(d)&&(e=RegExp.$1),b(e)})}function priarray(a,b){var c=[],d={};d.Idle="空闲",d.Proceeding="拨号中",d.Alerting="响铃中",d.Connect="通话中",async.eachSeries(a,function(a,b){var e=a.replace(/^\s+/,"").split(/\s+/),f={};f.trunkname="Span-"+e[0],f.chan=e[1],f.bchan="Yes"==e[2]?"是":"否",f.idle="Yes"==e[3]?"可用":"忙碌",f.level=d[e[4]]?d[e[4]]:e[4],f.busy="Yes"==e[5]?"是":"否",f.channame=e[6],c.push(f),b()},function(a){b(a,c)})}var path=require("path"),guid=require("guid"),conf=require("node-conf").load("app"),basedir=conf.appbase,Schemas=require(basedir+"/database/schema").Schemas,moment=require("moment"),async=require("async"),logger=require(basedir+"/lib/logger").logger("web"),fs=require("fs"),nami=require(basedir+"/asterisk/asmanager").nami,util=require("util"),AsAction=require("nami").Actions,gets={},posts={};module.exports={get:gets,post:posts};var checkFun={};gets.index=function(a,b,c,d){b.render("pbx/linemonitor/list.html",{baseurl:d,modename:"pbxTrunk"})},posts.getspaninfo=function(a,b){async.auto({getspans:function(a){var b="pri show spans",c=new AsAction.Command;c.Command=b,nami.send(c,function(b){var c=[],d=[];"FOLLOWS"==b.response.toUpperCase()&&(c=b.lines),c.length>0&&(d=c[c.length-1].split("\n")),d.pop(),spansarray(d,a)})},getspan:["getspans",function(a){a(null,null)}]},function(a,c){b.send(a?{success:"ERROR",msg:"获取语音卡信息失败！"}:{success:"OK",data:c.getspans})})},posts.reloadpri=function(a,b){var c="dahdi  restart",d=new AsAction.Command;d.Command=c,nami.send(d,function(a){b.send("FOLLOWS"==a.response.toUpperCase()?{success:"OK",msg:"重启语音卡成功！"}:{success:"ERROR",msg:"重启语音卡失败！"})})},posts.bytable=function(a,b,c){async.auto({gettrunks:function(a){Schemas.pbxTrunk.all({},function(b,c){a(b,c)})},getpris:function(a){var b="pri show channels",c=new AsAction.Command;c.Command=b,nami.send(c,function(b){var c=[],d=[];"FOLLOWS"==b.response.toUpperCase()&&(c=b.lines),c.length>0&&(d=c[c.length-1].split("\n")),d.shift(),d.shift(),d.pop(),priarray(d,a)})}},function(a,d){if(a)c(a);else{var e={};e.aaData=d.getpris,b.send(e)}})};
/*! 路由处理程序 2014-05-10 */
function priarray(a,b){async.eachSeries(a,function(a,b){var c=a.replace(/^\s+/,"").replace(/\s+$/,"").split(/\s+/);logger.debug(c),b()},function(){b(null,a)})}var path=require("path"),guid=require("guid"),conf=require("node-conf").load("app"),basedir=conf.appbase,Schemas=require(basedir+"/database/schema").Schemas,moment=require("moment"),async=require("async"),logger=require(basedir+"/lib/logger").logger("web"),fs=require("fs"),nami=require(basedir+"/asterisk/asmanager").nami,util=require("util"),AsAction=require("nami").Actions,gets={},posts={};module.exports={get:gets,post:posts};var checkFun={};gets.index=function(a,b,c,d){b.render("pbx/linemonitor/list.html",{baseurl:d,modename:"pbxTrunk"})},posts.bytable=function(a,b){async.auto({gettrunks:function(a){a(null,null)},getpris:function(a){var b="pri show channels",c=new AsAction.Command;c.Command=b,nami.send(c,function(b){var c=[],d=[];"Follows"==b.response&&(c=b.lines),c.length>0&&(d=c[c.length-1].split("\n")),d.shift(),d.shift(),d.pop(),logger.debug(d),priarray(d,a)})}},function(a,c){b.send(c.getpris)})};
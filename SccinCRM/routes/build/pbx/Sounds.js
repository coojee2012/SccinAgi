/*! 路由处理程序 2014-04-23 */
var path=require("path"),guid=require("guid"),conf=require("node-conf"),basedir=conf.load("app").appbase,Schemas=require(basedir+"/database/schema").Schemas,moment=require("moment"),async=require("async"),logger=require(basedir+"/lib/logger").logger("web"),gets={},posts={};module.exports={get:gets,post:posts},gets.index=function(a,b,c,d){var e=require("os"),f=e.type(),g=e.release();if(/Windows_\w+/.test(f))b.render("pbx/Sounds/list.html",{osinfo:f+" "+g,used:"-.-",unused:"-.-",baifenbi:"1%",baseurl:d,modename:"pbxSounds"});else{var h,i,j,k="1%",l=require("child_process").exec;h=l("df -h",function(a,e,h){console.log("stdout: "+e),console.log("stderr: "+h);var l=e.split("\n");if(l.length>0){var m=l[2].split(/\s+/);console.log(m),i=m[1],j=m[2],k=m[4]}else i="-.-",j="-.-";null!==a?c(a):b.render("pbx/Sounds/list.html",{osinfo:f+" "+g,used:i,unused:j,baifenbi:k,baseurl:d,modename:"pbxSounds"})})}};
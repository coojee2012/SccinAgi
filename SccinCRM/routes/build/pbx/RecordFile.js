/*! 路由处理程序 2014-10-16 */
var path=require("path"),guid=require("guid"),conf=require("node-conf").load("app"),basedir=conf.appbase,Schemas=require(basedir+"/database/schema").Schemas,moment=require("moment"),async=require("async"),logger=require(basedir+"/lib/logger").logger("web"),fs=require("fs"),nami=require(basedir+"/asterisk/asmanager").nami,util=require("util"),AsAction=require("nami").Actions,gets={},posts={};module.exports={get:gets,post:posts};var checkFun={};checkFun.wayName=function(a,b){a&&""!=a?Schemas.pbxAutoMonitorWays.findOne({where:{wayName:a}},function(a,c){b.send(a?{info:"后台验证发生错误！",status:"n"}:null!=c?{info:"已经存在！",status:"n"}:{info:"验证通过！",status:"y"})}):b.send({info:"输入不能为空！",status:"n"})},posts.checkAjax=function(a,b){var c=a.body.param,d=a.body.name;checkFun[d](c,b)},gets.index=function(a,b,c,d){Schemas.pbxAutoMonitorWays.all({},function(a,c){c||(c=[]),a&&logger.error(a),b.render("pbx/RecordFile/list.html",{baseurl:d,ways:c,modename:"pbxRcordFile"})})},gets.create=function(a,b,c,d){Schemas.pbxExtension.all({},function(a,e){if(a)c(a);else{for(var f="",g=0;g<e.length;g++)f+='<option value="'+e[g].id+'">'+e[g].id+' "'+e[g].accountcode+'" </option>';b.render("pbx/RecordFile/create.html",{hasExtens:f,baseurl:d})}})},gets.edit=function(a,b,c,d){var e=a.query.id;async.auto({find:function(a){Schemas.pbxAutoMonitorWays.find(e,function(b,c){b||null==c?a("编辑查找记录不存在！",c):a(b,c)})},findMembers:["find",function(a,b){var c=b.find.members?b.find.members.toString().split(","):[];console.log(c),Schemas.pbxExtension.all({},function(b,d){if(b)a("编辑查询分机发生错误！",-1);else{for(var e=[],f=0;f<d.length;f++){for(var g=!1,h=0;h<c.length;h++)if(d[f].id===c[h]){g=!0;break}g||e.push(d[f].id)}for(var i="",j="",k=0;k<e.length;k++)i+='<option value="'+e[k]+'">'+e[k]+' "'+e[k]+'" </option>';for(var l=0;l<c.length;l++)j+='<option value="'+c[l]+'">'+c[l]+' "'+c[l]+'" </option>';a(null,{hasExtens:i,yyExtens:j})}})}]},function(a,c){b.render("pbx/RecordFile/edit.html",{baseurl:d,hasExtens:c.findMembers.hasExtens,yyExtens:c.findMembers.yyExtens,inst:c.find})})},posts.save=function(a,b){var c={};for(var d in a.body)c[d]=a.body[d];console.log(c),async.auto({isHaveCheck:function(a){c.wayName&&""!==c.wayName?Schemas.pbxAutoMonitorWays.find(c.id,function(b,c){console.log("找到了：",c),a(b,c)}):a("名称不能为空",-1)},createNew:["isHaveCheck",function(a,b){null!==b.isHaveCheck?a(null,-1):(delete c.id,Schemas.pbxAutoMonitorWays.create(c,function(b,c){a(b,c)}))}],updateOld:["isHaveCheck",function(a,b){null===b.isHaveCheck?a(null,-1):Schemas.pbxAutoMonitorWays.update({where:{id:c.id},update:c},function(c){a(c,b.isHaveCheck)})}]},function(a,c){var d={success:"",id:"",msg:""};-1!==c.createNew?c.createNew.isValid(function(a){a?(d.success="OK",d.msg="新增成功!",d.id=c.createNew.id):(d.success="ERROR",d.msg="服务器感知到你提交的数据非法，不予受理！")}):-1!==c.updateOld?(d.success="OK",d.msg="修改成功!",d.id=c.updateOld.id):a&&(console.log(a),d.success="ERROR",d.msg="保存数据发生异常,请联系管理员！"),b.send(d)})},posts.delete=function(a,b){var c=a.body.id;Schemas.pbxAutoMonitorWays.find(c,function(a,c){var d={};a?(d.success="ERROR",d.msg="查询数据发生异常,请联系管理员！"):(c||(d.success="ERROR",d.msg="没有找到需要删除的数据！"),c.destroy(function(a){a?(d.success="ERROR",d.msg="删除数据发生异常,请联系管理员！！"):(d.success="OK",d.msg="删除成功！"),b.send(d)}))})};
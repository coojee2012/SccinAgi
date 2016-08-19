/*! 路由处理程序 2015-04-09 */
var path=require("path"),guid=require("guid"),conf=require("node-conf"),basedir=Venus.baseDir,async=require("async"),Schemas=require(basedir+"/database/schema").Schemas,commfun=require(basedir+"/lib/comfun"),_=require("lodash"),logger=require(basedir+"/lib/logger").logger("web"),util=require("util"),gets={},posts={};module.exports={get:gets,post:posts};var checkFun={};checkFun.id=function(a,b){a&&""!=a?Schemas.pbxQueue.find(a,function(a,c){b.send(a?{info:"后台验证发生错误！",status:"n"}:null!=c?{info:"已经存在！",status:"n"}:{info:"验证通过！",status:"y"})}):b.send({info:"输入不能为空！",status:"n"})},posts.checkAjax=function(a,b,c,d){var e=a.body.param,f=a.body.name;checkFun[f](e,b)},gets.index=function(a,b,c,d){b.render("pbx/Queue/list.html",{pageIndex:a.query.displayStart||0,where:util.inspect(commfun.searchContions(a.query.where)),baseurl:d,modename:"pbxQueue"})},gets.create=function(a,b,c,d){Schemas.pbxExtension.all({},function(a,e){if(a)c(a);else{for(var f="",g=0;g<e.length;g++)f+='<option value="'+e[g].id+'">'+e[g].id+' "'+e[g].accountcode+'" </option>';b.render("pbx/Queue/create.html",{baseurl:d,hasExtens:f})}})},gets.edit=function(a,b,c,d){var e=a.query.id;async.auto({findQueue:function(a){Schemas.pbxQueue.find(e,function(b,c){b||null==c?a("编辑查找队列发生错误或队列不存在！",c):a(b,c)})},findMembers:["findQueue",function(a,b){var c=b.findQueue.members?b.findQueue.members.toString().split(","):[];console.log(c),Schemas.pbxExtension.all({},function(b,d){if(b)a("编辑队列查询分机发生错误！",-1);else{for(var e=[],f=0;f<d.length;f++){for(var g=!1,h=0;h<c.length;h++)if(d[f].id===c[h]){g=!0;break}g||e.push(d[f].id)}for(var i="",j="",k=0;k<e.length;k++)i+='<option value="'+e[k]+'">'+e[k]+' "'+e[k]+'" </option>';for(var l=0;l<c.length;l++)j+='<option value="'+c[l]+'">'+c[l]+' "'+c[l]+'" </option>';a(null,{hasExtens:i,yyExtens:j})}})}]},function(c,e){b.render("pbx/Queue/edit.html",{baseurl:d,hasExtens:e.findMembers.hasExtens,yyExtens:e.findMembers.yyExtens,displayStart:a.query.displayStart||0,where:a.query.where||"",inst:e.findQueue})})},posts.save=function(a,b,c,d){var e={};for(var f in a.body)e[f]="members"==f&&_.isArray(a.body[f])?a.body[f].join(","):a.body[f];logger.debug(e),async.auto({isHaveCheck:function(a){e.id&&""!==e.id?Schemas.pbxQueue.find(e.id,function(b,c){a(b,c)}):a("队列号不能为空",-1)},createNew:["isHaveCheck",function(a,b){null!==b.isHaveCheck?a(null,-1):Schemas.pbxQueue.create(e,function(b,c){a(b,c)})}],updateOld:["isHaveCheck",function(a,b){null===b.isHaveCheck?a(null,-1):Schemas.pbxQueue.update({where:{id:e.id},update:e},function(b,c){a(b,c)})}],addlocalnum:["createNew",function(a,b){commfun.addlocalnum(b.createNew.id,"queue","",a)}]},function(a,c){var d={success:"",id:"",msg:""};-1!==c.createNew?c.createNew.isValid(function(a){a?(d.success="OK",d.msg="新增成功!",d.id=c.createNew.id):(d.success="ERROR",d.msg="服务器感知到你提交的数据非法，不予受理！")}):-1!==c.updateOld?(d.success="OK",d.msg="修改成功!",d.id=c.isHaveCheck.id):a&&(logger.error("添加或修改队列发生异常：",a),d.success="ERROR",d.msg="保存数据发生异常,请联系管理员！"),b.send(d)})},posts["delete"]=function(a,b,c,d){var e=a.body.id;Schemas.pbxQueue.find(e,function(a,c){var d={};a?(d.success="ERROR",d.msg="查询数据发生异常,请联系管理员！",b.send(d)):c?c.destroy(function(a){a?(d.success="ERROR",d.msg="删除数据发生异常,请联系管理员！！",b.send(d)):commfun.dellocalnum(e,function(a,c){a?(d.success="ERROR",d.msg="删除分机本地号码发生异常,请联系管理员！！",b.send(d)):(d.success="OK",d.msg="删除成功！",b.send(d))})}):(d.success="ERROR",d.msg="没有找到需要删除的数据！",b.send(d))})};
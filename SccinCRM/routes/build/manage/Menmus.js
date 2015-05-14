/*! 路由处理程序 2015-05-13 */
var path=require("path"),guid=require("guid"),conf=require("node-conf"),basedir=conf.load("app").appbase,async=require("async"),Schemas=require(basedir+"/database/schema").Schemas,moment=require("moment"),util=require("util"),commfun=require(basedir+"/lib/comfun"),logger=require(basedir+"/lib/logger").logger("web"),gets={},posts={};module.exports={get:gets,post:posts};var checkFun={};checkFun.menName=function(a,b){a&&""!=a?Schemas.manageMenmus.findOne({where:{menName:a}},function(a,c){b.send(a?{info:"后台验证发生错误！",status:"n"}:null!=c?{info:"菜单名称已经存在！",status:"n"}:{info:"验证通过！",status:"y"})}):b.send({info:"输入的菜单名称不能为空！",status:"n"})},posts.checkAjax=function(a,b,c,d){var e=a.body.param,f=a.body.name;checkFun[f](e,b)},gets.index=function(a,b,c,d){b.render("manage/Menmus/list.html",{baseurl:d,pageIndex:a.query.displayStart||0,where:util.inspect(commfun.searchContions(a.query.where)),modename:"manageMenmus"})},gets.create=function(a,b,c,d){b.render("manage/Menmus/create.html",{baseurl:d})},gets.edit=function(a,b,c,d){var e=a.query.id;async.auto({findUser:function(a){Schemas.manageMenmus.find(e,function(b,c){b||null==c?a("编辑查找菜单发生错误或菜单不存在！",c):a(b,c)})}},function(c,e){b.render("manage/Menmus/edit.html",{baseurl:d,displayStart:a.query.displayStart||0,where:a.query.where||"",inst:e.findUser})})},posts.save=function(a,b,c,d){var e={};for(var f in a.body)e[f]=a.body[f];async.auto({isHaveCheck:function(a){e.menName&&""!==e.menName?Schemas.manageMenmus.find(e.id,function(b,c){a(b,c)}):a("菜单名称不能为空",-1)},createNew:["isHaveCheck",function(a,b){null!==b.isHaveCheck?a(null,-1):(e.id=guid.create(),Schemas.manageMenmus.create(e,function(b,c){a(b,c)}))}],updateOld:["isHaveCheck",function(a,b){null===b.isHaveCheck?a(null,-1):Schemas.manageMenmus.update({where:{id:e.id},update:e},function(b,c){a(b,c)})}]},function(a,c){var d={success:"",id:"",msg:""};-1!==c.createNew?c.createNew.isValid(function(a){a?(d.success="OK",d.msg="新增成功!",d.id=c.createNew.id):(d.success="ERROR",d.msg="服务器感知到你提交的数据非法，不予受理！")}):-1!==c.updateOld?(d.success="OK",d.msg="修改成功!",d.id=c.updateOld.id):a&&(console.log(a),d.success="ERROR",d.msg="保存数据发生异常,请联系管理员！"),b.send(d)})},posts["delete"]=function(a,b,c,d){var e=a.body.id;Schemas.manageDepartments.find(e,function(a,c){var d={};a?(d.success="ERROR",d.msg="查询数据发生异常,请联系管理员！"):(c||(d.success="ERROR",d.msg="没有找到需要删除的数据！"),c.destroy(function(a){a?(d.success="ERROR",d.msg="删除数据发生异常,请联系管理员！！"):(d.success="OK",d.msg="删除成功！"),b.send(d)}))})},posts.getIcons=function(a,b,c,d){var e=require("fs"),f=basedir+"/public/themes/default/icon";e.readdir(f,function(a,c){b.send(a?{success:"ERROR",msg:"读取文件目录失败！"}:{success:"OK",msg:"读取文件目录OK！",files:c})})};
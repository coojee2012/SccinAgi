/*! 路由处理程序 2014-04-29 */
var path=require("path"),guid=require("guid"),conf=require("node-conf"),basedir=conf.load("app").appbase,async=require("async"),Schemas=require(basedir+"/database/schema").Schemas,moment=require("moment"),logger=require(basedir+"/lib/logger").logger("web"),gets={},posts={};module.exports={get:gets,post:posts};var checkFun={};checkFun.roleName=function(a,b){a&&""!=a?Schemas.manageUserRole.findOne({where:{roleName:a}},function(a,c){b.send(a?{info:"后台验证发生错误！",status:"n"}:null!=c?{info:"已经存在！",status:"n"}:{info:"验证通过！",status:"y"})}):b.send({info:"输入不能为空！",status:"n"})},posts.checkAjax=function(a,b){var c=a.body.param,d=a.body.name;checkFun[d](c,b)},gets.index=function(a,b,c,d){b.render("manage/UserRole/list.html",{baseurl:d,modename:"manageUserRole"})},gets.create=function(a,b,c,d){b.render("manage/UserRole/create.html",{baseurl:d})},gets.edit=function(a,b,c,d){var e=a.query.id;async.auto({findUser:function(a){Schemas.manageUserRole.find(e,function(b,c){b||null==c?a("编辑查找角色发生错误或角色不存在！",c):a(b,c)})}},function(a,c){b.render("manage/UserRole/edit.html",{baseurl:d,inst:c.findUser})})},posts.save=function(a,b){var c={};for(var d in a.body)c[d]=a.body[d];async.auto({isHaveCheck:function(a){c.roleName&&""!==c.roleName?Schemas.manageUserRole.find(c.id,function(b,c){a(b,c)}):a("角色不能为空",-1)},createNew:["isHaveCheck",function(a,b){null!==b.isHaveCheck?a(null,-1):Schemas.manageUserRole.create(c,function(b,c){a(b,c)})}],updateOld:["isHaveCheck",function(a,b){null===b.isHaveCheck?a(null,-1):(c.lastModify=moment().format("YYYY-MM-DD HH:mm:ss"),Schemas.manageUserRole.update({where:{id:c.id},update:c},function(b,c){a(b,c)}))}]},function(a,c){var d={success:"",id:"",msg:""};-1!==c.createNew?c.createNew.isValid(function(a){a?(d.success="OK",d.msg="新增成功!",d.id=c.createNew.id):(d.success="ERROR",d.msg="服务器感知到你提交的数据非法，不予受理！")}):-1!==c.updateOld?(d.success="OK",d.msg="修改成功!",d.id=c.updateOld.id):a&&(console.log(a),d.success="ERROR",d.msg="保存数据发生异常,请联系管理员！"),b.send(d)})},posts.delete=function(a,b){var c=a.body.id;Schemas.manageUserRole.find(c,function(a,c){var d={};a?(d.success="ERROR",d.msg="查询数据发生异常,请联系管理员！"):(c||(d.success="ERROR",d.msg="没有找到需要删除的数据！"),c.destroy(function(a){a?(d.success="ERROR",d.msg="删除数据发生异常,请联系管理员！！"):(d.success="OK",d.msg="删除成功！"),b.send(d)}))})};
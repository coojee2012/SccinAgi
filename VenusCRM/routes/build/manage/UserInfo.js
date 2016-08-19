/*! 路由处理程序 2015-04-09 */
var path=require("path"),guid=require("guid"),conf=require("node-conf"),basedir=Venus.baseDir,async=require("async"),Schemas=require(basedir+"/database/schema").Schemas,crypto=require("crypto"),moment=require("moment"),util=require("util"),commfun=require(basedir+"/lib/comfun"),logger=require(basedir+"/lib/logger").logger("web"),gets={},posts={};module.exports={get:gets,post:posts};var checkFun={};checkFun.uLogin=function(a,b){a&&""!=a?Schemas.manageUserInfo.findOne({where:{uLogin:a}},function(a,c){b.send(a?{info:"后台验证发生错误！",status:"n"}:null!=c?{info:"已经存在！",status:"n"}:{info:"验证通过！",status:"y"})}):b.send({info:"输入不能为空！",status:"n"})},posts.checkAjax=function(a,b,c,d){var e=a.body.param,f=a.body.name;checkFun[f](e,b)},gets.index=function(a,b,c,d){b.render("manage/UserInfo/list.html",{baseurl:d,pageIndex:a.query.displayStart||0,where:util.inspect(commfun.searchContions(a.query.where)),modename:"manageUserInfo"})},gets.create=function(a,b,c,d){Schemas.manageDepartments.all({},function(e,f){if(e)c(e);else{for(var g="",h=0;h<f.length;h++)g+='<option value="'+f[h].id+'"> '+f[h].depName+" </option>";Schemas.manageUserRole.all({},function(e,f){if(e)c(e);else{for(var h="",i=0;i<f.length;i++)h+='<option value="'+f[i].id+'"> '+f[i].roleName+" </option>";b.render("manage/UserInfo/create.html",{baseurl:d,where:util.inspect(commfun.searchContions(a.query.where)),departments:g,roles:h})}})}})},gets.edit=function(a,b,c,d){var e=a.query.id;async.auto({findUser:function(a){Schemas.manageUserInfo.find(e,function(b,c){b||null==c?a("编辑查找用户发生错误或用户不存在！",c):a(b,c)})},findDepartment:["findUser",function(a,b){Schemas.manageDepartments.all({},function(c,d){if(c)a("编辑用户查找部门发生错误",-1);else{for(var e="",f=0;f<d.length;f++)e+=d[f].id===b.findUser.depId?'<option selected="selected" value="'+d[f].id+'"> '+d[f].depName+" </option>":'<option value="'+d[f].id+'"> '+d[f].depName+" </option>";Schemas.manageUserRole.all({},function(c,d){if(c)a("编辑用户查找角色发生错误",-1);else{for(var f="",g=0;g<d.length;g++)f+=d[g].id===b.findUser.roleId?'<option selected="selected" value="'+d[g].id+'"> '+d[g].roleName+" </option>":'<option value="'+d[g].id+'"> '+d[g].roleName+" </option>";a(null,{departments:e,roles:f})}})}})}]},function(c,e){b.render("manage/UserInfo/edit.html",{baseurl:d,inst:e.findUser,departments:e.findDepartment.departments,displayStart:a.query.displayStart||0,where:a.query.where||"",roles:e.findDepartment.roles})})},posts.save=function(a,b,c,d){var e={};for(var f in a.body)e[f]=a.body[f];async.auto({isHaveCheck:function(a){e.uLogin&&""!==e.uLogin?Schemas.manageUserInfo.find(e.id,function(b,c){a(b,c)}):a("登陆用户不能为空",-1)},createNew:["isHaveCheck",function(a,b){if(null!==b.isHaveCheck)a(null,-1);else{e.id=guid.create();var c=crypto.createHash("md5");e.uPass=c.update(e.uPass).digest("hex").toUpperCase(),Schemas.manageUserInfo.create(e,function(b,c){a(b,c)})}}],updateOld:["isHaveCheck",function(a,b){null===b.isHaveCheck?a(null,-1):(e.lastChangeTime=moment().format("YYYY-MM-DD HH:mm:ss"),Schemas.manageUserInfo.update({where:{id:e.id},update:e},function(b,c){a(b,c)}))}]},function(a,c){var d={success:"",id:"",msg:""};-1!==c.createNew?c.createNew.isValid(function(a){a?(d.success="OK",d.msg="新增成功!",d.id=c.createNew.id):(d.success="ERROR",d.msg="服务器感知到你提交的数据非法，不予受理！")}):-1!==c.updateOld?(d.success="OK",d.msg="修改成功!",d.id=c.updateOld.id):a&&(console.log(a),d.success="ERROR",d.msg="保存数据发生异常,请联系管理员！"),b.send(d)})},posts["delete"]=function(a,b,c,d){var e=a.body.id;Schemas.manageUserInfo.find(e,function(a,c){var d={};a?(d.success="ERROR",d.msg="查询数据发生异常,请联系管理员！"):(c||(d.success="ERROR",d.msg="没有找到需要删除的数据！"),c.destroy(function(a){a?(d.success="ERROR",d.msg="删除数据发生异常,请联系管理员！！"):(d.success="OK",d.msg="删除成功！"),b.send(d)}))})};
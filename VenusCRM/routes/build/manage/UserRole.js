/*! 路由处理程序 2015-04-09 */
var path=require("path"),guid=require("guid"),conf=require("node-conf"),basedir=Venus.baseDir,async=require("async"),Schemas=require(basedir+"/database/schema").Schemas,moment=require("moment"),util=require("util"),commfun=require(basedir+"/lib/comfun"),logger=require(basedir+"/lib/logger").logger("web"),gets={},posts={};module.exports={get:gets,post:posts};var checkFun={};checkFun.roleName=function(a,b){a&&""!=a?Schemas.manageUserRole.findOne({where:{roleName:a}},function(a,c){b.send(a?{info:"后台验证发生错误！",status:"n"}:null!=c?{info:"已经存在！",status:"n"}:{info:"验证通过！",status:"y"})}):b.send({info:"输入不能为空！",status:"n"})},posts.checkAjax=function(a,b,c,d){var e=a.body.param,f=a.body.name;checkFun[f](e,b)},gets.index=function(a,b,c,d){b.render("manage/UserRole/list.html",{baseurl:d,pageIndex:a.query.displayStart||0,where:util.inspect(commfun.searchContions(a.query.where)),modename:"manageUserRole"})},gets.create=function(a,b,c,d){b.render("manage/UserRole/create.html",{baseurl:d})},gets.edit=function(a,b,c,d){var e=a.query.id;async.auto({findUser:function(a){Schemas.manageUserRole.find(e,function(b,c){b||null==c?a("编辑查找角色发生错误或角色不存在！",c):a(b,c)})}},function(c,e){b.render("manage/UserRole/edit.html",{baseurl:d,displayStart:a.query.displayStart||0,where:a.query.where||"",inst:e.findUser})})},posts.save=function(a,b,c,d){var e={};for(var f in a.body)e[f]=a.body[f];async.auto({isHaveCheck:function(a){e.roleName&&""!==e.roleName?Schemas.manageUserRole.find(e.id,function(b,c){a(b,c)}):a("角色不能为空",-1)},createNew:["isHaveCheck",function(a,b){null!==b.isHaveCheck?a(null,-1):(e.id=guid.create(),Schemas.manageUserRole.create(e,function(b,c){a(b,c)}))}],updateOld:["isHaveCheck",function(a,b){null===b.isHaveCheck?a(null,-1):(e.lastModify=moment().format("YYYY-MM-DD HH:mm:ss"),Schemas.manageUserRole.update({where:{id:e.id},update:e},function(b,c){a(b,c)}))}]},function(a,c){var d={success:"",id:"",msg:""};-1!==c.createNew?c.createNew.isValid(function(a){a?(d.success="OK",d.msg="新增成功!",d.id=c.createNew.id):(d.success="ERROR",d.msg="服务器感知到你提交的数据非法，不予受理！")}):-1!==c.updateOld?(d.success="OK",d.msg="修改成功!",d.id=c.updateOld.id):a&&(console.log(a),d.success="ERROR",d.msg="保存数据发生异常,请联系管理员！"),b.send(d)})},posts.getMenmus=function(a,b,c,d){var e=a.body.roleid;async.auto({allmenmus:function(a){var b=new Array;for(var c in Schemas.manageMenmuGroup.relations)b.push(c);logger.debug("具有的关系：",b),Schemas.manageMenmuGroup.all({include:b,order:"id ASC"},function(b,c){logger.debug(c[0].__cachedRelations);for(var d={},e=0;e<c.length;e++)d[c[e].groupName]=c[e].__cachedRelations.menmus;a(b,d)})},rolemenmus:function(a){Schemas.manageMenmuRoleRelations.all({where:{roleId:e}},function(b,c){for(var d=new Array,e=0;e<c.length;e++)d.push(c[e].menmuID);a(b,d)})}},function(a,c){b.send(a?{success:"ERROR",msg:"获取角色菜单错误！"}:{success:"OK",msg:"",allmenmus:c.allmenmus,rolemenmus:c.rolemenmus})})},posts.saveRoleMenmus=function(a,b,c,d){var e=a.body.menmuIds||"";e=e.replace(/\,$/,"");var f=a.body.roleId;if(f&&""!=f&&""!=e){var g=e.split(",");async.auto({allRoleMenmus:function(a){Schemas.manageMenmuRoleRelations.all({where:{roleId:f}},function(b,c){a(b,c)})},delAllRoleMenmus:["allRoleMenmus",function(a,b){async.each(b.allRoleMenmus,function(a,b){a.destroy(function(a){b(a)})},function(b){a(b)})}],addRoleMenmus:["delAllRoleMenmus",function(a,b){async.each(g,function(a,b){var c={};c.roleId=f,c.menmuID=a,Schemas.manageMenmuRoleRelations.create(c,function(a,c){b(a,c)})},function(b){a(b)})}]},function(a,c){b.send(a?{success:"ERROR",msg:"保存角色菜单错误！"}:{success:"OK",msg:"保存成功！"})})}else b.send({success:"ERROR",msg:"角色编号或分配菜单不能为空！"})},posts["delete"]=function(a,b,c,d){var e=a.body.id;Schemas.manageUserRole.find(e,function(a,c){var d={};a?(d.success="ERROR",d.msg="查询数据发生异常,请联系管理员！"):(c||(d.success="ERROR",d.msg="没有找到需要删除的数据！"),c.destroy(function(a){a?(d.success="ERROR",d.msg="删除数据发生异常,请联系管理员！！"):(d.success="OK",d.msg="删除成功！"),b.send(d)}))})};
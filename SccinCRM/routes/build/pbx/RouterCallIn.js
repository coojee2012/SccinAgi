/*! 路由处理程序 2014-03-24 */
var path=require("path"),guid=require("guid"),conf=require("node-conf"),basedir=conf.load("app").appbase,Schemas=require(basedir+"/database/schema").Schemas,moment=require("moment"),async=require("async"),logger=require(basedir+"/lib/logger").logger("web"),gets={},posts={};module.exports={get:gets,post:posts},gets.index=function(a,b,c,d){b.render("pbx/RouterCallIn/list.html",{baseurl:d,modename:"pbxRouter"})},gets.create=function(a,b,c,d){b.render("pbx/RouterCallIn/create.html",{baseurl:d})},gets.edit=function(a,b,c,d){var e=a.query.id;async.auto({findUser:function(a){Schemas.pbxRouter.find(e,function(b,c){b||null==c?a("编辑查找呼入规则发生错误或呼入规则不存在！",c):a(b,c)})}},function(a,c){b.render("pbx/RouterCallIn/edit.html",{baseurl:d,inst:c.findUser})})},posts.save=function(a,b){var c={};for(var d in a.body)c[d]=a.body[d];async.auto({isHaveCheck:function(a){c.routername&&""!==c.routername?Schemas.pbxRouter.find(c.id,function(b,c){a(b,c)}):a("呼入规则不能为空",-1)},createNew:["isHaveCheck",function(a,b){null!==b.isHaveCheck?a(null,-1):(c.proirety=0,c.routerline="呼入",Schemas.pbxRouter.create(c,function(b,c){a(b,c)}))}],updateOld:["isHaveCheck",function(a,b){null===b.isHaveCheck?a(null,-1):Schemas.pbxRouter.update({where:{id:c.id},update:c},function(b,c){a(b,c)})}]},function(a,c){var d={success:"",id:"",msg:""};-1!==c.createNew?c.createNew.isValid(function(a){a?(d.success="OK",d.msg="新增成功!",d.id=c.createNew.id):(d.success="ERROR",d.msg="服务器感知到你提交的数据非法，不予受理！")}):-1!==c.updateOld?(d.success="OK",d.msg="修改成功!",d.id=c.updateOld.id):a&&(console.log(a),d.success="ERROR",d.msg="保存数据发生异常,请联系管理员！"),b.send(d)})},posts.delete=function(a,b){var c=a.body.id;Schemas.pbxRouter.find(c,function(a,c){var d={};a?(d.success="ERROR",d.msg="查询数据发生异常,请联系管理员！"):(c||(d.success="ERROR",d.msg="没有找到需要删除的数据！"),c.destroy(function(a){a?(d.success="ERROR",d.msg="删除数据发生异常,请联系管理员！！"):(d.success="OK",d.msg="删除成功！"),b.send(d)}))})},posts.sortRouter=function(a,b){var c=1,d={};d.success="OK",d.msg="排序成功！";for(var e=a.body.ids.split("|"),f=0;f<e.length;f++)null!=e[f]&&""!=e[f]&&Schemas.pbxRouter.update({where:{id:e[f]},update:{proirety:c++}},function(a){a&&(d.success="ERROR",d.msg="更新数据发生异常,请联系管理员！！")});b.send(d)};
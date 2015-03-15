/*! 路由处理程序 2015-03-15 */
var path=require("path"),guid=require("guid"),conf=require("node-conf"),basedir=conf.load("app").appbase,Schemas=require(basedir+"/database/schema").Schemas,moment=require("moment"),async=require("async"),commfun=require(basedir+"/lib/comfun"),logger=require(basedir+"/lib/logger").logger("web"),util=require("util"),gets={},posts={};module.exports={get:gets,post:posts},gets.index=function(a,b,c,d){b.render("pbx/RouterCallIn/list.html",{pageIndex:a.query.displayStart||0,where:util.inspect(commfun.searchContions(a.query.where)),baseurl:d,modename:"pbxRouter"})},gets.create=function(a,b,c,d){b.render("pbx/RouterCallIn/create.html",{baseurl:d})},gets.edit=function(a,b,c,d){var e=a.query.id;async.auto({findUser:function(a){Schemas.pbxRouter.find(e,function(b,c){b||null==c?a("编辑查找呼入规则发生错误或呼入规则不存在！",c):a(b,c)})}},function(c,e){b.render("pbx/RouterCallIn/edit.html",{baseurl:d,displayStart:a.query.displayStart||0,where:a.query.where||"",inst:e.findUser})})},posts.save=function(a,b){var c={};for(var d in a.body)c[d]=a.body[d];async.auto({isHaveCheck:function(a){c.routername&&""!==c.routername?c.id&&""!==c.id?Schemas.pbxRouter.find(c.id,function(b,c){a(b,c)}):(delete c.id,a(null,null)):a("呼入规则名称不能为空",-1)},maxProirety:function(a){Schemas.pbxRouter.findOne({where:{routerline:"呼入"},order:"proirety DESC"},function(b,c){if(b)a(b,c);else{var d=null===c?1:c.proirety+1;a(null,d)}})},createNew:["isHaveCheck","maxProirety",function(a,b){null!==b.isHaveCheck?a(null,-1):(c.proirety=b.maxProirety,c.routerline="呼入",Schemas.pbxRouter.create(c,function(b,c){a(b,c)}))}],updateOld:["isHaveCheck",function(a,b){null===b.isHaveCheck?a(null,-1):Schemas.pbxRouter.update({where:{id:c.id},update:c},function(b,c){a(b,c)})}]},function(a,c){var d={success:"",id:"",msg:""};-1!==c.createNew?c.createNew.isValid(function(a){a?(d.success="OK",d.msg="新增成功!",d.id=c.createNew.id):(d.success="ERROR",d.msg="服务器感知到你提交的数据非法，不予受理！")}):-1!==c.updateOld?(d.success="OK",d.msg="修改成功!",d.id=c.updateOld.id):a&&(console.log(a),d.success="ERROR",d.msg="保存数据发生异常,请联系管理员！"),b.send(d)})},posts["delete"]=function(a,b,c,d){var e=a.body.id;Schemas.pbxRouter.find(e,function(e,f){var g={};if(e)g.success="ERROR",g.msg="查询数据发生异常,请联系管理员！",b.send(g);else if(f){{f.proirety}f.destroy(function(e){e?(g.success="ERROR",g.msg="删除数据发生异常,请联系管理员！！",b.send(g)):Schemas.pbxRouter.all({where:{routerline:"呼入"},order:"proirety ASC"},function(e,f){for(var g="",h=0;h<f.length;h++)g+=f[h].id+"|";a.body.ids=g,posts.sortRouter(a,b,c,d)})})}else g.success="ERROR",g.msg="没有找到需要删除的数据！",b.send(g)})},posts.sortRouter=function(a,b){var c=1,d={};d.success="OK",d.msg="排序成功！";for(var e=a.body.ids.split("|"),f=0;f<e.length;f++)null!=e[f]&&""!=e[f]&&Schemas.pbxRouter.update({where:{id:e[f]},update:{proirety:c++}},function(a){a&&(d.success="ERROR",d.msg="更新数据发生异常,请联系管理员！！")});b.send(d)};
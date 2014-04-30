/*! 路由处理程序 2014-04-30 */
var conf=require("node-conf"),basedir=conf.load("app").appbase,Schemas=require(basedir+"/database/schema").Schemas,guid=require("guid"),async=require("async"),logger=require(basedir+"/lib/logger").logger("web"),gets={},posts={};module.exports={get:gets,post:posts},gets.index=function(a,b,c,d){b.render("pbx/ExtenGroup/list.html",{baseurl:d})},posts.save=function(a,b){var c={};for(var d in a.body)c[d]=a.body[d];async.auto({isHaveCheck:function(a){Schemas.pbxExtenGroup.find(c.id,function(b,c){a(b,c)})},createNew:["isHaveCheck",function(a,b){null!==b.isHaveCheck?a(null,-1):(c.id=guid.create(),Schemas.pbxExtenGroup.create(c,function(b,c){a(b,c)}))}],updateOld:["isHaveCheck",function(a,b){null===b.isHaveCheck?a(null,-1):Schemas.pbxExtenGroup.update({where:{id:c.id},update:c},function(b,c){a(b,c)})}]},function(a,c){var d={success:"",id:"",msg:""};-1!==c.createNew?c.createNew.isValid(function(a){a?(d.success="OK",d.msg="新增成功!",d.id=c.createNew.id):(d.success="ERROR",d.msg="服务器感知到你提交的数据非法，不予受理！")}):-1!==c.updateOld?(d.success="OK",d.msg="修改成功!",d.id=c.updateOld.id):a&&(logger.error(a),d.success="ERROR",d.msg="保存数据发生异常,请联系管理员！"),b.send(d)})},posts.delete=function(a,b){var c=a.body.id;Schemas.pbxExtenGroup.find(c,function(a,c){var d={};a?(logger.error(a),d.success="ERROR",d.msg="查询数据发生异常,请联系管理员！"):(c||(d.success="ERROR",d.msg="没有找到需要删除的数据！"),c.destroy(function(a){a?(logger.error(a),d.success="ERROR",d.msg="删除数据发生异常,请联系管理员！！"):(d.success="OK",d.msg="删除成功！"),b.send(d)}))})};
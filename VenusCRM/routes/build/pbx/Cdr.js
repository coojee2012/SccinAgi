/*! 路由处理程序 2015-03-15 */
var guid=require("guid"),async=require("async"),_=require("lodash"),conf=require("node-conf"),basedir=conf.load("app").appbase,Schemas=require(basedir+"/database/schema").Schemas,logger=require(basedir+"/lib/logger").logger("web"),commfun=require(basedir+"/lib/comfun"),util=require("util"),gets={},posts={};module.exports={get:gets,post:posts};var checkFun={};posts.checkAjax=function(a,b){var c=a.body.param,d=a.body.name;checkFun[d](c,b)},gets.index=function(a,b,c,d){b.render("."+d+"/list.html",{baseurl:d,pageIndex:a.query.displayStart||0,where:util.inspect(commfun.searchContions(a.query.where)),modename:"pbxCdr"})},posts.calldetail=function(a,b){var c=a.body.id;c&&""!=c?Schemas.pbxCallProcees.all({where:{callsession:c},order:"cretime ASC"},function(a,c){b.send(a?{success:"ERROR",msg:a}:{success:"OK",msg:"查询成功！",dbs:c})}):b.send({success:"ERROR",msg:"编号不能为空！"})};
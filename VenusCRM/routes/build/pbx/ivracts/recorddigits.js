/*! 路由处理程序 2014-05-22 */
var conf=require("node-conf"),basedir=conf.load("app").appbase,Schemas=require(basedir+"/database/schema").Schemas,logger=require(basedir+"/lib/logger").logger("web"),guid=require("guid"),async=require("async"),gets={},posts={};module.exports={get:gets,post:posts},gets.index=function(a,b){b.send({test:"test"})};
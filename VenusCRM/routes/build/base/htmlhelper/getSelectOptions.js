/*! 路由处理程序 2015-04-09 */
var conf=require("node-conf"),basedir=Venus.baseDir,nami=require(basedir+"/../VenusLib/ami/asmanager").nami,util=require("util"),async=require("async"),AsAction=require("nami").Actions,Schemas=require(basedir+"/database/schema").Schemas,guid=require("guid"),logger=require(basedir+"/lib/logger").logger("web"),gets={},posts={};module.exports={get:gets,post:posts},posts.departments=function(a,b,c){Schemas.manageDepartments.all({},function(a,c){async.map(c,function(a,b){var c={};c.v=a.id,c.t=a.depName,b(null,c)},function(a,c){b.send(c)})})},posts.menmuGroups=function(a,b,c){Schemas.manageMenmuGroup.all({},function(a,c){async.map(c,function(a,b){var c={};c.v=a.id,c.t=a.groupName,b(null,c)},function(a,c){b.send(c)})})};
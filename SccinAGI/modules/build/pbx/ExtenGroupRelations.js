/*! 数据库表结构 2014-03-19 */
var Schema=require("jugglingdb").Schema,moment=require("moment"),guid=require("guid"),conf=require("node-conf"),basedir=conf.load("app").appbase,schema=require(basedir+"/database/jdmysql").schema,pbxExtenGroupRelations=schema.define("pbxExtenGroupRelations",{id:{type:String,length:100,"default":function(){return guid.create()}},groupid:{type:Number},extenid:{type:String,length:50}});pbxExtenGroupRelations.Name="pbxExtenGroupRelations",schema.models.pbxExtenGroupRelations,module.exports=pbxExtenGroupRelations;
/*! 数据库表结构 2014-03-17 */
var Schema=require("jugglingdb").Schema,moment=require("moment"),guid=require("guid"),conf=require("node-conf"),basedir=conf.load("app").appbase,schema=require(basedir+"/database/jdmysql").schema,pbxRouter=schema.define("pbxRouter",{id:{type:String,length:100,"default":function(){return guid.create()}},proirety:{type:Number},createmode:{type:String,length:10,"default":function(){return"否"}},routerline:{type:String,length:10,"default":function(){return"呼入"}},routername:{type:String,length:100},optextra:{type:String,length:50},lastwhendone:{type:String,length:10,"default":function(){return"否"}},callergroup:{type:String,length:50},callerid:{type:String,length:200},callerlen:{type:Number,"default":function(){return-1}},callednum:{type:String,length:50},calledlen:{type:Number,"default":function(){return-1}},replacecallerid:{type:String,length:50},replacecalledtrim:{type:Number,"default":function(){return-1}},replacecalledappend:{type:String,length:50},processmode:{type:String,length:50},processdefined:{type:String,length:100}});pbxRouter.Name="pbxRouter",schema.models.pbxRouter,module.exports=pbxRouter;
/*! 数据库表结构 2014-03-21 */
var Schema=require("jugglingdb").Schema,moment=require("moment"),guid=require("guid"),conf=require("node-conf"),basedir=conf.load("app").appbase,schema=require(basedir+"/database/jdmysql").schema,pbxIvrInputs=schema.define("pbxIvrInputs",{id:{type:String,length:100,"default":function(){return guid.create()}},ivrnumber:{type:String,length:50},general:{type:Number,"default":function(){return 0}},generaltype:{type:String,length:50},generalargs:{type:String,length:150},inputnum:{type:String,length:10},gotoivrnumber:{type:String,length:50},gotoivractid:{type:Number,"default":function(){return 0}}});pbxIvrInputs.Name="pbxIvrInputs",schema.models.pbxIvrInputs,module.exports=pbxIvrInputs;
/*! 数据库表结构 2014-03-17 */
var Schema=require("jugglingdb").Schema,moment=require("moment"),conf=require("node-conf"),basedir=conf.load("app").appbase,schema=require(basedir+"/database/jdmysql").schema,pbxIvrActMode=schema.define("pbxIvrActMode",{modename:{type:String,length:50},url:{type:String,length:100},iconame:{type:String,length:50},memo:{type:String,length:200}});pbxIvrActMode.Name="pbxIvrActMode",schema.models.pbxIvrActMode,module.exports=pbxIvrActMode;
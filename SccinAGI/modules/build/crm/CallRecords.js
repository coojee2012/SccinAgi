/*! 数据库表结构 2014-03-21 */
var Schema=require("jugglingdb").Schema,conf=require("node-conf"),basedir=conf.load("app").appbase,schema=require(basedir+"/database/jdmysql").schema,moment=require("moment"),crmCallRecords=schema.define("crmCallRecords",{CallInfoID:{type:String,length:50},CallState:{type:Number,"default":0},WorkTime:{type:String,length:50,"default":function(){return moment().format("YYYY-MM-DD HH:mm:ss")}}});crmCallRecords.Name="crmCallRecords",schema.models.crmCallRecords,module.exports=crmCallRecords;
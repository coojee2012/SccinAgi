/*! 数据库表结构 2014-03-17 */
var Schema=require("jugglingdb").Schema,conf=require("node-conf"),basedir=conf.load("app").appbase,schema=require(basedir+"/database/jdmysql").schema,moment=require("moment"),crmCallRecords=require("./CallRecords"),crmDialResult=schema.define("crmDialResult",{ProjExpertID:{type:String,length:50},Result:{type:Number,"default":-1},State:{type:Number,"default":0},WorkTime:{type:String,length:50,"default":function(){return moment().format("YYYY-MM-DD HH:mm:ss")}}});crmDialResult.Name="crmDialResult",crmDialResult.belongsTo(crmCallRecords,{as:"callrecord",foreignKey:"id"}),schema.models.crmDialResult,module.exports=crmDialResult;
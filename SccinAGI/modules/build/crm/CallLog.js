/*! 数据库表结构 2014-03-19 */
var Schema=require("jugglingdb").Schema,conf=require("node-conf"),basedir=conf.load("app").appbase,schema=require(basedir+"/database/jdmysql").schema,moment=require("moment"),crmCallPhone=require("./CallPhone"),crmCallLog={},crmCallLog=schema.define("crmCallLog",{Phone:{type:String,length:50},PhoneSequ:{type:Number,"default":0},WorkTime:{type:String,length:50,"default":function(){return moment().format("YYYY-MM-DD HH:mm:ss")}}});crmCallLog.Name="crmCallLog",crmCallLog.belongsTo(crmCallPhone,{as:"callphone",foreignKey:"id"}),schema.models.crmCallLog,module.exports=crmCallLog;
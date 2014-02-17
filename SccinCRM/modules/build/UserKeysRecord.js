/*! 数据库表结构 2014-02-17 */
var Schema=require("jugglingdb").Schema,moment=require("moment"),schema=require("../../database/jdmysql").schema,CallLog=require("./CallLog"),CallPhone=require("./CallPhone"),UserKeysRecord=schema.define("UserKeysRecord",{callLogID:{type:String,length:50},keyTypeID:{type:String,length:50},Key:{type:String,length:50},WorkTime:{type:String,length:50,"default":function(){return moment().format("YYYY-MM-DD HH:mm:ss")}}});UserKeysRecord.Name="UserKeysRecord",UserKeysRecord.belongsTo(CallLog,{as:"calllog",foreignKey:"callLogID"}),UserKeysRecord.belongsTo(CallPhone,{as:"keytype",foreignKey:"keyTypeID"}),schema.models.UserKeysRecord,module.exports=UserKeysRecord;
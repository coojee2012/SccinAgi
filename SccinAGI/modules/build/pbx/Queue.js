/*! 数据库表结构 2014-03-21 */
var Schema=require("jugglingdb").Schema,moment=require("moment"),guid=require("guid"),conf=require("node-conf"),basedir=conf.load("app").appbase,schema=require(basedir+"/database/jdmysql").schema,pbxQueue=schema.define("pbxQueue",{queuename:{type:String,length:50},announce:{type:String,length:50,"default":function(){return""}},playring:{type:Number,"default":function(){return 0}},saymember:{type:Number,"default":function(){return 0}},queuetimeout:{type:Number,"default":function(){return 0}},failedon:{type:String,length:50,"default":function(){return""}},members:{type:String,length:200},strategy:{type:String,length:50,"default":function(){return"random"}},wrapuptime:{type:Number,"default":function(){return 0}},timeout:{type:Number,"default":function(){return 0}},musicclass:{type:String,length:50,"default":function(){return"default"}},retry:{type:Number,"default":function(){return 0}},joinempty:{type:String,length:50,"default":function(){return"no"}},frequency:{type:Number,"default":function(){return 0}},cretime:{type:String,length:50,"default":function(){return moment().format("YYYY-MM-DD HH:mm:ss")}}});pbxQueue.Name="pbxQueue",schema.models.pbxQueue,module.exports=pbxQueue;
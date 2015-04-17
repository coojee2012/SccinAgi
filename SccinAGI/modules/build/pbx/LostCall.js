/*! 数据库表结构 2014-03-21 */
var Schema=require("jugglingdb").Schema,moment=require("moment"),guid=require("guid"),conf=require("node-conf"),basedir=conf.load("app").appbase,schema=require(basedir+"/database/jdmysql").schema,pbxLostCall=schema.define("pbxLostCall",{id:{type:String,length:100,"default":function(){return guid.create()}},extension:{type:String,length:50},lostnumber:{type:String,length:50},lostType:{type:String,length:50,"default":function(){return""}},reback:{type:String,length:50,"default":function(){return"否"}},certime:{type:String,length:50,"default":function(){return moment().format("YYYY-MM-DD HH:mm:ss")}},backtime:{type:String,length:50},whoback:{type:String,length:50}});pbxLostCall.Name="pbxLostCall",schema.models.pbxLostCall,module.exports=pbxLostCall;
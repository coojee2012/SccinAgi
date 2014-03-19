/*! 数据库表结构 2014-03-19 */
var Schema=require("jugglingdb").Schema,moment=require("moment"),conf=require("node-conf"),basedir=conf.load("app").appbase,schema=require(basedir+"/database/jdmysql").schema,pbxTrunk=schema.define("pbxTrunk",{trunkname:{type:String,length:50},trunkproto:{type:String,length:50},trunkprototype:{type:String,length:50,"default":function(){return""}},trunkdevice:{type:String,length:50,"default":function(){return""}},memo:{type:String,length:100,"default":function(){return""}},cretime:{type:String,length:50,"default":function(){return moment().format("YYYY-MM-DD HH:mm:ss")}},args:{type:String,length:300,"default":function(){return""}}});pbxTrunk.validatesPresenceOf("trunkname","trunkproto"),pbxTrunk.Name="pbxTrunk",schema.models.pbxTrunk,module.exports=pbxTrunk;
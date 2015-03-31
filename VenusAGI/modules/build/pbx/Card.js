/*! 数据库表结构 2014-03-21 */
var Schema=require("jugglingdb").Schema,moment=require("moment"),guid=require("guid"),conf=require("node-conf"),basedir=conf.load("app").appbase,schema=require(basedir+"/database/jdmysql").schema,pbxCard=schema.define("pbxCard",{id:{type:String,length:100,"default":function(){return guid.create()}},cardname:{type:String,length:50},driver:{type:String,length:50,"default":function(){return"DAHDI"}},line:{type:Number},group:{type:String,length:10,"default":function(){return"-1"}},dataline:{type:String,length:10,"default":function(){return""}},trunkproto:{type:String,length:50}});pbxCard.Name="pbxCard",schema.models.pbxCard,module.exports=pbxCard;
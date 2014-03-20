/*! 数据库表结构 2014-03-20 */
var Schema=require("jugglingdb").Schema,moment=require("moment"),guid=require("guid"),conf=require("node-conf"),basedir=conf.load("app").appbase,schema=require(basedir+"/database/jdmysql").schema,pbxRcordFile=schema.define("pbxRcordFile",{id:{type:String,length:100,"default":function(){return guid.create()}},filename:{type:String,length:50},extname:{type:String,length:50},filesize:{type:Number,"default":function(){return 0}},calltype:{type:String,length:50},cretime:{type:Date,"default":function(){return moment().format("YYYY-MM-DD HH:mm:ss")}},extennum:{type:String,length:50},folder:{type:String,length:50},callnumber:{type:String,length:50},doymicac:{type:String,length:50}});pbxRcordFile.Name="pbxRcordFile",schema.models.pbxRcordFile,module.exports=pbxRcordFile;
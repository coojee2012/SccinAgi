/*! 数据库表结构 2014-03-19 */
var Schema=require("jugglingdb").Schema,moment=require("moment"),guid=require("guid"),conf=require("node-conf"),basedir=conf.load("app").appbase,schema=require(basedir+"/database/jdmysql").schema,pbxExtenGroupRelations=require("./ExtenGroupRelations"),pbxExtenGroup=schema.define("pbxExtenGroup",{id:{type:String,length:100,"default":function(){return guid.create()}},groupname:{type:String,length:50},memo:{type:String,length:100},cretime:{type:String,length:50,"default":function(){return moment().format("YYYY-MM-DD HH:mm:ss")}}});pbxExtenGroup.hasMany(pbxExtenGroupRelations,{as:"extensions",foreignKey:"groupid"}),pbxExtenGroup.Name="pbxExtenGroup",schema.models.pbxExtenGroup,module.exports=pbxExtenGroup;
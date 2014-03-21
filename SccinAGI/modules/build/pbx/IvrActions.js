/*! 数据库表结构 2014-03-21 */
var Schema=require("jugglingdb").Schema,moment=require("moment"),guid=require("guid"),conf=require("node-conf"),basedir=conf.load("app").appbase,schema=require(basedir+"/database/jdmysql").schema,Actmode=require("./IvrActMode"),pbxIvrActions=schema.define("pbxIvrActions",{id:{type:String,length:100,"default":function(){return guid.create()}},ivrnumber:{type:String,length:50},ordinal:{type:Number,"default":function(){return 0}},actmode:{type:String,length:50,"default":function(){return"1"}},args:{type:String,length:256}});pbxIvrActions.belongsTo(Actmode,{as:"Actmode",foreignKey:"actmode"}),pbxIvrActions.Name="pbxIvrActions",schema.models.pbxIvrActions,module.exports=pbxIvrActions;
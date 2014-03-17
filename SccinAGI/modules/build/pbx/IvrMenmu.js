/*! 数据库表结构 2014-03-17 */
var Schema=require("jugglingdb").Schema,moment=require("moment"),conf=require("node-conf"),basedir=conf.load("app").appbase,schema=require(basedir+"/database/jdmysql").schema,Actions=require("./IvrActions"),Inputs=require("./IvrInputs"),pbxIvrMenmu=schema.define("pbxIvrMenmu",{ivrname:{type:String,length:50},description:{type:String,length:150},cretime:{type:String,length:50,"default":function(){return moment().format("YYYY-MM-DD HH:mm:ss")}},isreadonly:{type:String,length:10,"default":function(){return"否"}}});pbxIvrMenmu.hasMany(Actions,{as:"actions",foreignKey:"ivrnumber"}),pbxIvrMenmu.hasMany(Inputs,{as:"inputs",foreignKey:"ivrnumber"}),pbxIvrMenmu.Name="pbxIvrMenmu",schema.models.pbxIvrMenmu,module.exports=pbxIvrMenmu;
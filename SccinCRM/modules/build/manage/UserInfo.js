/*! 数据库表结构 2014-03-22 */
var manageUserInfo=schema.define("manageUserInfo",{id:{type:String,length:100,"default":function(){return guid.create()}},uName:{type:String,length:50},uCard:{type:String,length:100},uSex:{type:String,length:10,"default":function(){return"男"}},uLogin:{type:String,length:50},uPass:{type:String,length:100},uPhone:{type:String,length:50},uWorkNum:{type:String,length:50},uExten:{type:String,length:10},uAddr:{type:String,length:200},readOnly:{type:String,length:10,"default":function(){return"否"}},roleId:{type:String,length:100},depId:{type:String,length:100},uMemo:{type:String,limit:50},crtTime:{type:Date,"default":function(){return moment().format("YYYY-MM-DD HH:mm:ss")}},lastChangeTime:{type:Date,"default":function(){return moment().format("YYYY-MM-DD HH:mm:ss")}},lastLoginTime:{type:Date,"default":function(){return moment().format("YYYY-MM-DD HH:mm:ss")}}});manageUserInfo.belongsTo(manageUserRole,{as:"role",foreignKey:"roleId"}),manageUserInfo.belongsTo(manageDepartments,{as:"department",foreignKey:"depId"}),manageUserInfo.validatesPresenceOf("uLogin","uName","uPass","uExten"),manageUserInfo.validatesLengthOf("uPass",{min:4,message:{min:"注册密码必须4位以上"}}),manageUserInfo.Name="manageUserInfo",schema.models.manageUserInfo,exports.manageUserInfo=manageUserInfo,Dbs.manageUserInfo=manageUserInfo;
/*! 数据库表结构 2014-03-22 */
var manageDepartments=schema.define("manageDepartments",{id:{type:String,length:100,"default":function(){return guid.create()}},depName:{type:String,length:50},crtTime:{type:Date,"default":function(){return moment().format("YYYY-MM-DD HH:mm:ss")}},lastModify:{type:Date,"default":function(){return moment().format("YYYY-MM-DD HH:mm:ss")}},memo:{type:String,length:200}});manageDepartments.validatesPresenceOf("depName"),manageDepartments.Name="manageDepartments",schema.models.manageDepartments,exports.manageDepartments=manageDepartments,Dbs.manageDepartments=manageDepartments;
/*! 数据库表结构 2014-03-22 */
var crmKeyType=schema.define("KeyType",{keyTypeID:{type:String,length:50},KeyTypeName:{type:String,length:50},State:{type:Number,"default":0}});crmKeyType.Name="crmKeyType",schema.models.crmKeyType,exports.crmKeyType=crmKeyType,Dbs.crmKeyType=crmKeyType;
var Schema = require('jugglingdb').Schema;
var moment = require('moment');
var guid = require('guid');
var schema = require('../../database/jdmysql').schema;
var PBXExtension=require('./PBXExtension');

var PBXExtenGroup=schema.define('PBXExtenGroup',{
	id:   {type:Number},//分机分组ID		
	groupname:   {type:String,length:50},//注册密码
	memo:   {type:String,length:50},//设备协议
	cretime:   {type: String,length:50, default: function () { return moment().format("YYYY-MM-DD HH:mm:ss"); }}
});


PBXExtenGroup.hasMany(PBXExtension,{as:'extensions',foreignKey:'group'});
PBXExtenGroup.Name='PBXExtenGroup';
schema.models.PBXExtenGroup;
module.exports = PBXExtenGroup;
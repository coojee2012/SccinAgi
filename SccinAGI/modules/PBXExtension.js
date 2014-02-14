var Schema = require('jugglingdb').Schema;
var moment = require('moment');
var guid = require('guid');
var schema = require('../database/jdmysql').schema;
var PBXExtension=schema.define('PBXExtension',{
	accountcode:   {type:String,length:50},		
	password:   {type:String,length:50},//注册密码
	deviceproto:   {type:String,length:50},//设备协议
	devicenumber:{type:String,length:50},//设备号
	devicestring:  {type:String,length:50},//设备字符串
	fristchecked:   {type:Number,default: function () { return 0 }},//是否检查过
	transfernumber:    {type:String,length:50,default: function () { return 'deailway=&number='; }},//deailway-互转方式，diallocal,dialout ; number-呼叫转移号码,非空将强制互转号码到指定号码
	dndinfo:    {type:String,length:10,default: function () { return 'off'; }},//示忙状态 off/on
	failed:    {type:String,length:50,default: function () { return 'deailway=hangup&number=' }},//deailway-呼叫失败处理方式:hangup,ivr,voicemail,fllowme,transfer
	cretime:   {type: String,length:50, default: function () { return moment().format("YYYY-MM-DD HH:mm:ss"); }}
});
PBXExtension.Name='PBXExtension';
schema.models.PBXExtension;
module.exports = PBXExtension;
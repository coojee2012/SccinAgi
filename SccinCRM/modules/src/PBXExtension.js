var Schema = require('jugglingdb').Schema;
var moment = require('moment');
var guid = require('guid');
var schema = require('../../database/jdmysql').schema;

var PBXExtenGroup=require('./PBXExtenGroup');
var PBXExtension=schema.define('PBXExtension',{
	accountcode:   {type:String,length:50},		
	password:   {type:String,length:50},//注册密码
	deviceproto:   {type:String,length:50},//设备协议
	devicenumber:{type:String,length:50},//设备号
	devicestring:  {type:String,length:100},//设备字符串
	group:   {type:Number,default: function () { return 1; }},//分机分组
	fristchecked:   {type:Number,default: function () { return 0 }},//是否检查过
	transfernumber:    {type:String,length:50,default: function () { return 'deailway=&number='; }},//deailway-互转方式，diallocal,dialout ; number-呼叫转移号码,非空将强制互转号码到指定号码
	dndinfo:    {type:String,length:10,default: function () { return 'off'; }},//示忙状态 off/on
	failed:    {type:String,length:50,default: function () { return 'deailway=hangup&number=' }},//deailway-呼叫失败处理方式:hangup,ivr,voicemail,fllowme,transfer
	cretime:   {type: String,length:50, default: function () { return moment().format("YYYY-MM-DD HH:mm:ss"); }}
});

PBXExtension.belongsTo(PBXExtenGroup, {as: 'extengroup', foreignKey: 'group'});
PBXExtension.validatesPresenceOf('accountcode', 'deviceproto');//验证非空
PBXExtension.validatesLengthOf('password', {min: 4, message: {min: '注册密码必须4位以上'}});//验证长度
PBXExtension.validatesInclusionOf('deviceproto', {in: ['SIP', 'IAX2','VIRTUAL']});//验证是否在给定几个值
PBXExtension.validatesNumericalityOf('fristchecked', {int: true});//验证未数字
//PBXExtension.validatesUniquenessOf('email', {message: 'email is not unique'});//唯一性验证

PBXExtension.Name='PBXExtension';
schema.models.PBXExtension;
module.exports = PBXExtension;
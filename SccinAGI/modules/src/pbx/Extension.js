/*var Schema = require('jugglingdb').Schema;
var moment = require('moment');
var guid = require('guid');
var conf = require('node-conf');
var basedir = conf.load('app').appbase;
var schema = require(basedir+'/database/jdmysql').schema;

var pbxExtenGroupRelations=require('./ExtenGroupRelations');*/

var pbxExtension=schema.define('pbxExtension',{
	accountcode:   {type:String,length:50},	//账号	
	password:   {type:String,length:50},//注册密码
	deviceproto:   {type:String,length:50},//设备协议
	devicenumber:{type:String,length:50},//设备号
	devicestring:  {type:String,length:100},//设备字符串
	fristchecked:   {type:Number,default: function () { return 0 }},//是否检查过
	transfernumber:    {type:String,length:50,default: function () { return 'deailway=&number='; }},//deailway-互转方式，diallocal,dialout ; number-呼叫转移号码,非空将强制互转号码到指定号码
	dndinfo:    {type:String,length:10,default: function () { return 'off'; }},//示忙状态 off/on
	failed:    {type:String,length:50,default: function () { return 'deailway=hangup&number=' }},//deailway-呼叫失败处理方式:hangup,ivr,voicemail,fllowme,transfer
	cretime:   {type: String,length:50, default: function () { return moment().format("YYYY-MM-DD HH:mm:ss"); }}
});

pbxExtension.hasMany(pbxExtenGroupRelations, {as: 'groups', foreignKey: 'extenid'});
pbxExtension.validatesPresenceOf('accountcode', 'deviceproto');//验证非空
pbxExtension.validatesLengthOf('password', {min: 4, message: {min: '注册密码必须4位以上'}});//验证长度
pbxExtension.validatesInclusionOf('deviceproto', {in: ['SIP', 'IAX2','VIRTUAL']});//验证是否在给定几个值
pbxExtension.validatesNumericalityOf('fristchecked', {int: true});//验证未数字
//pbxExtension.validatesUniquenessOf('email', {message: 'email is not unique'});//唯一性验证

pbxExtension.Name='pbxExtension';
schema.models.pbxExtension;
exports.pbxExtension = pbxExtension;
Dbs.pbxExtension = pbxExtension;
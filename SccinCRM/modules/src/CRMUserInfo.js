var Schema = require('jugglingdb').Schema;
var moment = require('moment');
var guid = require('guid');
var schema = require('../../database/jdmysql').schema;
var CRMUserRole=require('./CRMUserRole');
var CRMDepartments=require('./CRMDepartments');

var CRMUserInfo=schema.define('CRMUserInfo',{
	id:{type:String,length:100,default:function(){return guid.create();}},
	uName:   {type:String,length:50},
	uCard:    {type:String,length:100},
	uSex:  {type:Number,default:function () { return 0 }},
	uLogin:   {type:String,length:50},
	uPass:	{type:String,length:100},
	uPhone:{type:String,length:50},
	uWorkNum:{type:String,length:50},
	uExten:	{type:String,length:10},
	uAddr:{type:String,length:200},
	readOnly:{type:Number,default:function () { return 0 }},
    roleId:{type:String,length:100},
    depId:{type:String,length:100},
	uMemo:{type:String,limit:50},
	crtTime:{type: Date, default: function () { return moment().format("YYYY-MM-DD HH:mm:ss"); }},
	lastChangeTime:{type: Date, default: function () { return moment().format("YYYY-MM-DD HH:mm:ss"); }},
	lastLoginTime:{type: Date, default: function () { return moment().format("YYYY-MM-DD HH:mm:ss"); }}
});

CRMUserInfo.belongsTo(CRMUserRole, {as: 'role', foreignKey: 'roleId'});
CRMUserInfo.belongsTo(CRMDepartments, {as: 'department', foreignKey: 'depId'});

CRMUserInfo.validatesPresenceOf('uName', 'uPass','uExten');//验证非空
CRMUserInfo.validatesLengthOf('uPass', {min: 4, message: {min: '注册密码必须4位以上'}});//验证长度
//CRMUserInfo.validatesInclusionOf('deviceproto', {in: ['SIP', 'IAX2','VIRTUAL']});//验证是否在给定几个值
//CRMUserInfo.validatesNumericalityOf('uPhone','uExten', {int: true});//验证未数字

CRMUserInfo.Name='CRMUserInfo';
schema.models.CRMUserInfo;
module.exports = CRMUserInfo;
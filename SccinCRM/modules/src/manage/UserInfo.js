var Schema = require('jugglingdb').Schema;
var moment = require('moment');
var guid = require('guid');
var conf = require('node-conf');
var basedir = conf.load('app').appbase;
var schema = require(basedir+'/database/jdmysql').schema;
var manageUserRole=require('./UserRole');
var manageDepartments=require('./Departments');

var manageUserInfo=schema.define('manageUserInfo',{
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

manageUserInfo.belongsTo(manageUserRole, {as: 'role', foreignKey: 'roleId'});
manageUserInfo.belongsTo(manageDepartments, {as: 'department', foreignKey: 'depId'});

manageUserInfo.validatesPresenceOf('uName', 'uPass','uExten');//验证非空
manageUserInfo.validatesLengthOf('uPass', {min: 4, message: {min: '注册密码必须4位以上'}});//验证长度
//manageUserInfo.validatesInclusionOf('deviceproto', {in: ['SIP', 'IAX2','VIRTUAL']});//验证是否在给定几个值
//manageUserInfo.validatesNumericalityOf('uPhone','uExten', {int: true});//验证未数字

manageUserInfo.Name='manageUserInfo';
schema.models.manageUserInfo;
module.exports = manageUserInfo;
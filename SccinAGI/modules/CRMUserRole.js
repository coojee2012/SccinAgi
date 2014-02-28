var Schema = require('jugglingdb').Schema;
var moment = require('moment');
var guid = require('guid');
var schema = require('../../database/jdmysql').schema;
var CRMUserInfo=require('./CRMUserInfo');

var CRMUserRole=schema.define('CRMUserRole',{
	id:{type:String,length:100,default:function(){return guid.create();}},
	roleName:   {type:String,length:50},
	isAgent:{type: Number, default: function () { return 0 }},
	hasPtions:   {type: Number, default: function () { return 0 }},
	crtTime:   {type: Date, default: function () { return moment().format("YYYY-MM-DD HH:mm:ss"); }},
	lastModify:  {type: Date, default: function () { return moment().format("YYYY-MM-DD HH:mm:ss"); }},
	memo:    {type:String,length:200}
});

CRMUserRole.hasMany(CRMUserInfo, {as: 'users', foreignKey: 'id'});


CRMUserRole.validatesPresenceOf('roleName');//验证非空
//CRMUserRole.validatesLengthOf('uPass', {min: 4, message: {min: '注册密码必须4位以上'}});//验证长度
//CRMUserRole.validatesInclusionOf('deviceproto', {in: ['SIP', 'IAX2','VIRTUAL']});//验证是否在给定几个值
//CRMUserRole.validatesNumericalityOf('uPhone','uExten', {int: true});//验证未数字

CRMUserRole.Name='CRMUserRole';
schema.models.CRMUserRole;
module.exports = CRMUserRole;
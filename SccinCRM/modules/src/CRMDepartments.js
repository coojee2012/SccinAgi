var Schema = require('jugglingdb').Schema;
var moment = require('moment');
var guid = require('guid');
var schema = require('../../database/jdmysql').schema;
//var CRMUserInfo=require('./CRMUserInfo');

var CRMDepartments=schema.define('CRMDepartments',{
	id:{type:String,length:100,default:function(){return guid.create();}},
	depName:   {type:String,length:50},
	crtTime:   {type: Date, default: function () { return moment().format("YYYY-MM-DD HH:mm:ss"); }},
	lastModify:  {type: Date, default: function () { return moment().format("YYYY-MM-DD HH:mm:ss"); }},
	memo:    {type:String,length:200}
});

//CRMDepartments.hasMany(CRMUserInfo, {as: 'users',foreignKey:'depId'});


CRMDepartments.validatesPresenceOf('depName');//验证非空
//CRMDepartments.validatesLengthOf('uPass', {min: 4, message: {min: '注册密码必须4位以上'}});//验证长度
//CRMDepartments.validatesInclusionOf('deviceproto', {in: ['SIP', 'IAX2','VIRTUAL']});//验证是否在给定几个值
//CRMDepartments.validatesNumericalityOf('uPhone','uExten', {int: true});//验证未数字

CRMDepartments.Name='CRMDepartments';
schema.models.CRMDepartments;
module.exports = CRMDepartments;
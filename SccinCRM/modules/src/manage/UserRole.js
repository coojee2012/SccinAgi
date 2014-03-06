var Schema = require('jugglingdb').Schema;
var moment = require('moment');
var guid = require('guid');
var conf = require('node-conf');
var basedir = conf.load('app').appbase;
var schema = require(basedir+'/database/jdmysql').schema;
var manageMenmuRoleRelations=require('./MenmuRoleRelations');

var manageUserRole=schema.define('manageUserRole',{
	id:{type:String,length:100,default:function(){return guid.create();}},
	roleName:   {type:String,length:50},
	isAgent:{type: Number, default: function () { return 0 }},
	hasPtions:   {type: Number, default: function () { return 0 }},
	crtTime:   {type: Date, default: function () { return moment().format("YYYY-MM-DD HH:mm:ss"); }},
	lastModify:  {type: Date, default: function () { return moment().format("YYYY-MM-DD HH:mm:ss"); }},
	memo:    {type:String,length:200}
});

manageUserRole.hasMany(manageMenmuRoleRelations, {as: 'users',foreignKey:'roleId'});


manageUserRole.validatesPresenceOf('roleName');//验证非空
//manageUserRole.validatesLengthOf('uPass', {min: 4, message: {min: '注册密码必须4位以上'}});//验证长度
//manageUserRole.validatesInclusionOf('deviceproto', {in: ['SIP', 'IAX2','VIRTUAL']});//验证是否在给定几个值
//manageUserRole.validatesNumericalityOf('uPhone','uExten', {int: true});//验证未数字

manageUserRole.Name='manageUserRole';
schema.models.manageUserRole;
module.exports = manageUserRole;
/*var Schema = require('jugglingdb').Schema;
var moment = require('moment');
var guid = require('guid');
var conf = require('node-conf');
var basedir = conf.load('app').appbase;
var schema = require(basedir+'/database/jdmysql').schema;*/
//var manageUserInfo=require('./UserInfo');

var manageDepartments=schema.define('manageDepartments',{
	id:{type:String,length:100,default:function(){return guid.create();}},
	depName:   {type:String,length:50},
	crtTime:   {type: String,length:50, default: function () { return moment().format("YYYY-MM-DD HH:mm:ss"); }},
	lastModify:  {type: String,length:50, default: function () { return moment().format("YYYY-MM-DD HH:mm:ss"); }},
	memo:    {type:String,length:200}
});

//manageDepartments.hasMany(manageUserInfo, {as: 'users',foreignKey:'depId'});


manageDepartments.validatesPresenceOf('depName');//验证非空
//manageDepartments.validatesLengthOf('uPass', {min: 4, message: {min: '注册密码必须4位以上'}});//验证长度
//manageDepartments.validatesInclusionOf('deviceproto', {in: ['SIP', 'IAX2','VIRTUAL']});//验证是否在给定几个值
//manageDepartments.validatesNumericalityOf('uPhone','uExten', {int: true});//验证未数字

manageDepartments.Name='manageDepartments';
schema.models.manageDepartments;
exports.manageDepartments = manageDepartments;
Dbs.manageDepartments = manageDepartments;
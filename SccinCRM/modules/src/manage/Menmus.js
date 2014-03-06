var Schema = require('jugglingdb').Schema;
var moment = require('moment');
var guid = require('guid');
var conf = require('node-conf');
var basedir = conf.load('app').appbase;
var schema = require(basedir+'/database/jdmysql').schema;
var manageUserRole=require('./UserRole');
var manageDepartments=require('./Departments');

var manageMenmus=schema.define('manageMenmus',{
	id:{type:String,length:100,default:function(){return guid.create();}},
	menName:   {type:String,length:50},
	menURL:    {type:String,length:150},
	iconName:  {type:String,length:150},
    mgID:      {type: Number, default: function () { return 1 }},
	crtTime:   {type: Date, default: function () { return moment().format("YYYY-MM-DD HH:mm:ss"); }},
	width:	{type:Number,default:function () { return 960 }},
	height:	{type:Number,default:function () { return 540 }},
	ordernum:	{type:Number,default:function () { return 0 }}
});



manageMenmus.validatesPresenceOf('menName', 'menURL','iconName');//验证非空

manageMenmus.Name='manageMenmus';
schema.models.manageMenmus;
module.exports = manageMenmus;
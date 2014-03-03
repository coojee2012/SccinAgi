var Schema = require('jugglingdb').Schema;
var moment = require('moment');
var guid = require('guid');
var schema = require('../../database/jdmysql').schema;
var CRMUserRole=require('./CRMUserRole');
var CRMDepartments=require('./CRMDepartments');

var CRMMenmus=schema.define('CRMMenmus',{
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



CRMMenmus.validatesPresenceOf('menName', 'menURL','iconName');//验证非空

CRMMenmus.Name='CRMMenmus';
schema.models.CRMMenmus;
module.exports = CRMMenmus;
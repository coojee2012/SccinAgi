var Schema = require('jugglingdb').Schema;
var moment = require('moment');
var schema = require('../database/jdmysql').schema;
var PBXRouter=schema.define('PBXRouter',{
    proirety:   {type:Number},
	createmode:   {type:Number,default: function () { return 0 }},
	routerline:   {type:Number,default: function () { return 1 }},
	routername:{type:String},
	optextra:  {type:String},
	lastwhendone:   {type:Number,default: function () { return 0 }},
	callergroup:    {type:String,length:50},
	callerid:    {type:String,length:200},
	callerlen:    {type:String,length:50},
	callednum:     {type:String,length:50},
	calledlen:    {type:String,length:50},
	callerid:   {type:String,length:50},
	calledtrim:   {type:String,length:50},
	calledappend: {type:String,length:50},
	processmode:{type:Number,default: function () { return 0 }},
	processdefined:   {type:String,length:100}
});
PBXRouter.Name='PBXRouter';
schema.models.PBXRouter;
module.exports = PBXRouter;
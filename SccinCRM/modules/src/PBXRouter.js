var Schema = require('jugglingdb').Schema;
var moment = require('moment');
var guid = require('guid');
var schema = require('../../database/jdmysql').schema;
var PBXRouter=schema.define('PBXRouter',{
	id:{type:String,length:100,default:function(){return guid.create();}},
    proirety:   {type:Number},
	createmode:   {type:Number,default: function () { return 0 }},
	routerline:   {type:Number,default: function () { return 1 }},
	routername:{type:String,length:100},
	optextra:  {type:String,length:50},
	lastwhendone:   {type:Number,default: function () { return 0 }},
	callergroup:    {type:String,length:50},
	callerid:    {type:String,length:200},//匹配主叫以什么开头
	callerlen:    {type:Number,default: function () { return -1 ;}},//匹配主叫长度
	callednum:     {type:String,length:50},//匹配被叫以什么开头
	calledlen:    {type:Number,default: function () { return -1 ;}},//匹配被叫长度
	replacecallerid:   {type:String,length:50},//匹配后主叫替换
	replacecalledtrim:   {type:Number,default: function () { return -1 ;}},//匹配后删除被叫前几位
	replacecalledappend: {type:String,length:50},//匹配后补充被叫前几位
	processmode:{type:String,length:50},
	processdefined:   {type:String,length:100}
});
PBXRouter.Name='PBXRouter';
schema.models.PBXRouter;
module.exports = PBXRouter;
/*var Schema = require('jugglingdb').Schema;
var moment = require('moment');
var guid = require('guid');
var conf = require('node-conf');
var basedir = conf.load('app').appbase;
var schema = require(basedir+'/database/jdmysql').schema;*/
var pbxRouter=schema.define('pbxRouter',{
	id:{type:String,length:100,default:function(){return guid.create();}},
    proirety:   {type:Number},//执行顺序（优先级）
	createmode:   {type:String,length:10,default: function () { return '否' }},//系统默认
	routerline:   {type:String,length:10,default: function () { return '呼入' }},//路由方式，呼出，呼入
	routername:{type:String,length:100},//规则名称
	optextra:  {type:String,length:50},//扩展属性
	lastwhendone:   {type:String,length:10,default: function () { return '否' }},//最终匹配规则
	callergroup:    {type:String,length:50},//匹配主叫组（呼出对应分机分组，呼入对应中继分组）
	callerid:    {type:String,length:200},//匹配主叫以什么开头
	callerlen:    {type:Number,default: function () { return -1 ;}},//匹配主叫长度
	callednum:     {type:String,length:50},//匹配被叫以什么开头
	calledlen:    {type:Number,default: function () { return -1 ;}},//匹配被叫长度
	replacecallerid:   {type:String,length:50},//匹配后主叫替换
	replacecalledtrim:   {type:Number,default: function () { return -1 ;}},//匹配后删除被叫前几位
	replacecalledappend: {type:String,length:50},//匹配后补充被叫前几位
	processmode:{type:String,length:50},//处理方式 【黑名单，VIP，本地处理，拨打外线】
	processdefined:   {type:String,length:100}//处理详细参数定义
});
pbxRouter.Name='pbxRouter';
schema.models.pbxRouter;

exports.pbxRouter = pbxRouter;
Dbs.pbxRouter = pbxRouter;
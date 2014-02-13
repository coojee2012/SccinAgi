var Schema = require('jugglingdb').Schema;
var moment = require('moment');
var guid = require('guid');
var schema = require('../database/jdmysql').schema;
var PBXScreenPop=schema.define('PBXScreenPop',{
	callernumber:   {type:String,length:50,default:function () { return ''; }},//主叫
	callednumber:   {type:String,length:50,default:function () { return ''; }},//被叫
	sessionnumber:   {type:String,length:50,default:function () { return ''; }},//本次呼叫会话编号
	creattime:   {type: String, default: function () { return moment().format("YYYY-MM-DD HH:mm:ss"); }},
	status:   {type:String,length:10,default:function () { return 'over'; }},//弹出类型:waite,over
	routerdype:   {type:Number,default:function () { return 1; }},//呼叫路由1内线2外线
	parked:   {type:String,length:50,default:function () { return 'not'; }},//保持状态：yes ,not
	poptype:    {type:String,length:50,default:function () { return ''; }}//弹出类型:diallocal,dialout
});
PBXScreenPop.Name='PBXScreenPop';
schema.models.PBXScreenPop;
module.exports = PBXScreenPop;
var Schema = require('jugglingdb').Schema;
var moment = require('moment');
var guid = require('guid');
var schema = require('../database/jdmysql').schema;
var PBXScreenPop=schema.define('PBXScreenPop',{
	extensionnumber:   {type:String,length:50},
	callernumber:   {type:String,length:50},
	callednumber:   {type:String,length:50},
	sessionnumber:   {type:String,length:50},
	creattime:   {type: String, default: function () { return moment().format("YYYY-MM-DD HH:mm:ss"); }},
	status:   {type:String,length:10},//弹出类型:waite,over
	routerdype:   {type:Number,default:function () { return 1 }},//呼叫路由
	parked:   {type:String,length:50},//保持状态：yes ,no
	poptype:    {type:String,length:50}//弹出类型:diallocal,dialout
});
PBXScreenPop.Name='PBXScreenPop';
schema.models.PBXScreenPop;
module.exports = PBXScreenPop;
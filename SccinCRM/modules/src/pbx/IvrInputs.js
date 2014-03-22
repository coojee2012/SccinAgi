/*var Schema = require('jugglingdb').Schema;
var moment = require('moment');
var guid = require('guid');
var conf = require('node-conf');
var basedir = conf.load('app').appbase;
var schema = require(basedir+'/database/jdmysql').schema;*/

var pbxIvrInputs=schema.define('pbxIvrInputs',{
	id:{type:String,length:100,default:function(){return guid.create();}},
	ivrnumber:  {type:String,length:50},
	general:   {type:Number,default: function () {return 0;}},//错误响应，包括无效按键或等待按键超时标识或重试次数设置
	generaltype:   {type:String,length:50},//按键错误或等待按键超时或重试次数设置
	generalargs:   {type:String,length:150},//错误响应参数
	inputnum:   {type: String,length:10},
	gotoivrnumber:   {type: String,length:50},
	gotoivractid:   {type: Number,default: function () {return 0;}}
});



pbxIvrInputs.Name='pbxIvrInputs';
schema.models.pbxIvrInputs;
exports.pbxIvrInputs = pbxIvrInputs;
Dbs.pbxIvrInputs = pbxIvrInputs;
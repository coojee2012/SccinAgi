var Schema = require('jugglingdb').Schema;
var moment = require('moment');
var guid = require('guid');
var schema = require('../database/jdmysql').schema;
var PBXSounds=schema.define('PBXSounds',{
	id:{type:String,length:100,default:function(){return guid.create();}},	
	filename:   {type:String,length:50},//文件名
	extname:   {type:String,length:50},//扩展名
	folder:  {type:String,length:50},//文件夹
	description:{type:String,length:100},//描述
	label: {type:String,length:50},//标签
	associate: {type:String,length:50},//关联
	isreadonly: {type:Number,default: function () { return 0 }},//系统只读
	cretime:     {type:String,length:50, default: function () {return moment().format("YYYY-MM-DD HH:mm:ss"); }},
	args:    {type:String,length:100}
});
PBXSounds.Name='PBXSounds';
schema.models.PBXSounds;
module.exports = PBXSounds;
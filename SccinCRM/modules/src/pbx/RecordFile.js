/*var Schema = require('jugglingdb').Schema;
var moment = require('moment');
var guid = require('guid');
var conf = require('node-conf');
var basedir = conf.load('app').appbase;
var schema = require(basedir+'/database/jdmysql').schema;*/
var pbxRcordFile=schema.define('pbxRcordFile',{
	id:{type:String,length:100,default:function(){return guid.create();}},//关联CDR
	filename:   {type:String,length:50}, //文件名
	extname:    {type:String,length:50}, //扩展名
	filesize:   {type:Number,default:function () { return 0 }},//文件大小
	calltype:   {type:String,length:50}, //主叫类型
	lable:   {type:String,length:50},//录音类型，queue,exten,ivr,voicemail等
	cretime:    {type: String, default: function () { return moment().unix(); }},//创建时间
	extennum:   {type:String,length:50},//被叫
	folder:     {type:String,length:50}, //目录
	callnumber: {type:String,length:50}, //主叫
	doymicac:   {type:String,length:50}
});
pbxRcordFile.Name='pbxRcordFile';
schema.models.pbxRcordFile;
exports.pbxRcordFile = pbxRcordFile;
Dbs.pbxRcordFile=pbxRcordFile;
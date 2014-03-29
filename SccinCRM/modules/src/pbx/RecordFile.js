/*var Schema = require('jugglingdb').Schema;
var moment = require('moment');
var guid = require('guid');
var conf = require('node-conf');
var basedir = conf.load('app').appbase;
var schema = require(basedir+'/database/jdmysql').schema;*/
var pbxRcordFile=schema.define('pbxRcordFile',{
	id:{type:String,length:100,default:function(){return guid.create();}},//关联CDR
	filename:   {type:String,length:50},
	extname:    {type:String,length:50},
	filesize:   {type:Number,default:function () { return 0 }},
	calltype:   {type:String,length:50},
	lable:   {type:String,length:50},//录音类型，queue,exten,ivr,voicemail等
	cretime:    {type: Date, default: function () { return moment().format("YYYY-MM-DD HH:mm:ss"); }},
	extennum:   {type:String,length:50},
	folder:     {type:String,length:50},
	callnumber: {type:String,length:50},
	doymicac:   {type:String,length:50}
});
pbxRcordFile.Name='pbxRcordFile';
schema.models.pbxRcordFile;
exports.pbxRcordFile = pbxRcordFile;
Dbs.pbxRcordFile=pbxRcordFile;
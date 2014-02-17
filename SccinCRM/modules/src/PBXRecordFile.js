var Schema = require('jugglingdb').Schema;
var moment = require('moment');
var guid = require('guid');
var schema = require('../../database/jdmysql').schema;
var PBXSounds=schema.define('PBXSounds',{
	id:{type:String,length:100,default:function(){return guid.create();}},//关联CDR
	filename:   {type:String,length:50},
	extname:    {type:String,length:50},
	filesize:   {type:Number,default:function () { return 0 }},
	calltype:   {type:String,length:50},
	cretime:    {type: Date, default: function () { return moment().format("YYYY-MM-DD HH:mm:ss"); }},
	extennum:   {type:String,length:50},
	folder:     {type:String,length:50},
	callnumber: {type:String,length:50},
	doymicac:   {type:String,length:50}
});
PBXSounds.Name='PBXSounds';
schema.models.PBXSounds;
module.exports = PBXSounds;
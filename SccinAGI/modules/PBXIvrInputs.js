var Schema = require('jugglingdb').Schema;
var moment = require('moment');
var guid = require('guid');
var schema = require('../database/jdmysql').schema;

var PBXIvrInputs=schema.define('PBXIvrInputs',{
	id:{type:String,length:100,default:function(){return guid.create();}},
	ivrnumber:  {type:String,length:50},
	general:   {type:Number,default: function () {return 0;}},
	generaltype:   {type:String,length:50},
	generalargs:   {type:String,length:150},
	inputnum:   {type: String,length:10},
	gotoivrnumber:   {type: String,length:50},
	gotoivractid:   {type: Number,default: function () {return 0;}}
});



PBXIvrInputs.Name='PBXIvrInputs';
schema.models.PBXIvrInputs;
module.exports = PBXIvrInputs;
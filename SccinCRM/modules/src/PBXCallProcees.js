var Schema = require('jugglingdb').Schema;
var moment = require('moment');
var guid = require('guid');
var schema = require('../../database/jdmysql').schema;
var PBXCallProcees=schema.define('PBXCallProcees',{
	id:{type:String,length:100,default:function(){return guid.create();}},
	callsession:{type:String,length:100},
	callernumber:   {type:String,length:50},
	callednumber:   {type:String,length:50},
	processname:{type:String,length:50},
	passargs:   {type:String,length:50},
	doneresults:   {type:String,length:50},
	routerline:   {type: Number, default: function () { return 1; }},
	cretime:   {type: String,length:50, default: function () {return moment().format("YYYY-MM-DD HH:mm:ss"); }},
	
});
PBXCallProcees.Name='PBXCallProcees';
schema.models.PBXCallProcees;
module.exports = PBXCallProcees;
/*var Schema = require('jugglingdb').Schema;
var moment = require('moment');
var conf = require('node-conf');
var basedir = conf.load('app').appbase;
var schema = require(basedir+'/database/jdmysql').schema;*/
var pbxTrunk=schema.define('pbxTrunk',{
    trunkname:   {type:String,length:50},
	trunkproto:   {type:String,length:50},
	trunkprototype:  {type:String,length:50,default: function () { return ''; }},
	trunkdevice:{type:String,length:50,default: function () { return ''; }},
	memo: {type:String,length:100,default: function () { return ''; }},
	cretime:     {type: String, length: 50, default: function () {return moment().format("YYYY-MM-DD HH:mm:ss"); }},
	args:    {type:String,length:300,default: function () { return ''; }}
});

pbxTrunk.validatesPresenceOf('trunkname', 'trunkproto');//验证非空

pbxTrunk.Name='pbxTrunk';
schema.models.pbxTrunk;
exports.pbxTrunk = pbxTrunk;
Dbs.pbxTrunk = pbxTrunk;
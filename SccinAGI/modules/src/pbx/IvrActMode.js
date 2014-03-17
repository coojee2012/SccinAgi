var Schema = require('jugglingdb').Schema;
var moment = require('moment');
var conf = require('node-conf');
var basedir = conf.load('app').appbase;
var schema = require(basedir+'/database/jdmysql').schema;
var pbxIvrActMode=schema.define('pbxIvrActMode',{
	modename:   {type:String,length:50},
	url:   {type:String,length:100},
	iconame:   {type:String,length:50},
	memo:    {type:String,length:200}
});
pbxIvrActMode.Name='pbxIvrActMode';
schema.models.pbxIvrActMode;
module.exports = pbxIvrActMode;
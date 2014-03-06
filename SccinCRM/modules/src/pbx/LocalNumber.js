var Schema = require('jugglingdb').Schema;
var moment = require('moment');
var conf = require('node-conf');
var basedir = conf.load('app').appbase;
var schema = require(basedir+'/database/jdmysql').schema;
var pbxLocalNumber=schema.define('pbxLocalNumber',{
	localtype:   {type:String,length:50},
	assign:   {type: String,length:100}
});
pbxLocalNumber.Name='pbxLocalNumber';
schema.models.pbxLocalNumber;
module.exports = pbxLocalNumber;
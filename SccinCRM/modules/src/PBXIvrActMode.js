var Schema = require('jugglingdb').Schema;
var moment = require('moment');
var schema = require('../../database/jdmysql').schema;
var PBXIvrActMode=schema.define('PBXIvrActMode',{
	modename:   {type:String,length:50},
	url:   {type:String,length:100},
	iconame:   {type:String,length:50},
	memo:    {type:String,length:200}
});
PBXIvrActMode.Name='PBXIvrActMode';
schema.models.PBXIvrActMode;
module.exports = PBXIvrActMode;
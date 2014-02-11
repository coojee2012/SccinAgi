var Schema = require('jugglingdb').Schema;
var moment = require('moment');
var schema = require('../database/jdmysql').schema;
var PBXLocalNumber=schema.define('PBXLocalNumber',{
	localtype:   {type:String,length:50},
	assign:   {type: String,length:100}
});
PBXLocalNumber.Name='PBXLocalNumber';
schema.models.PBXLocalNumber;
module.exports = PBXLocalNumber;
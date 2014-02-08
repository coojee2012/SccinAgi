var Schema = require('jugglingdb').Schema;
var moment = require('moment');
var schema = require('../database/jdmysql').schema;
var PBXTrunk=schema.define('PBXTrunk',{
    trunkname:   {type:String,length:50},
	trunkproto:   {type:String,length:50},
	trunkprototype:  {type:String,length:50},
	trunkdevice:{type:String,length:50},
	trunkremark: {type:String,length:100},
	cretime:     {type: Date, default: function () {return moment().format("YYYY-MM-DD HH:mm:ss"); }},
	args:    {type:String,length:100}
});
PBXTrunk.Name='PBXTrunk';
schema.models.PBXTrunk;
module.exports = PBXTrunk;
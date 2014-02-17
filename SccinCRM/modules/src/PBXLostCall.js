var Schema = require('jugglingdb').Schema;
var moment = require('moment');
var guid = require('guid');
var schema = require('../../database/jdmysql').schema;
var PBXLostCall=schema.define('PBXLostCall',{
	id:{type:String,length:100,default:function(){return guid.create();}},	
	extension:   {type:String,length:50},
	lostnumber:   {type:String,length:50},
	lostType:   {type:String,length:50, default: function () { return ''; }},//无应答类型 exten,queue,app
	reback:   {type: String,length:50, default: function () { return '否'; }},
	certime:   {type: String,length:50,default: function () { return moment().format("YYYY-MM-DD HH:mm:ss");}},
	backtime:   {type: String,length:50},
	whoback:    {type:String,length:50}
});
PBXLostCall.Name='PBXLostCall';
schema.models.PBXLostCall;
module.exports = PBXLostCall;
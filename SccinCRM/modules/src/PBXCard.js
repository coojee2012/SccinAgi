var Schema = require('jugglingdb').Schema;
var moment = require('moment');
var guid = require('guid');
var schema = require('../../database/jdmysql').schema;
var PBXCard=schema.define('PBXCard',{
	id:{type:String,length:100,default:function(){return guid.create();}},
    cardname:   {type:String,length:50},
	driver:   {type:String,length:50,default: function () { return 'DAHDI'; }},
	line:  {type:Number},
	group:{type:String,length:10,default: function () { return '-1'; }},
	dataline:{type:String,length:10,default: function () { return ''; }},//是否为信令通道
	trunkproto: {type:String,length:50}
});
PBXCard.Name='PBXCard';
schema.models.PBXCard;
module.exports = PBXCard;
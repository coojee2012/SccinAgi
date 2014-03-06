var Schema = require('jugglingdb').Schema;
var moment = require('moment');
var guid = require('guid');
var conf = require('node-conf');
var basedir = conf.load('app').appbase;
var schema = require(basedir+'/database/jdmysql').schema;
var pbxCard=schema.define('pbxCard',{
	id:{type:String,length:100,default:function(){return guid.create();}},
    cardname:   {type:String,length:50},
	driver:   {type:String,length:50,default: function () { return 'DAHDI'; }},
	line:  {type:Number},
	group:{type:String,length:10,default: function () { return '-1'; }},
	dataline:{type:String,length:10,default: function () { return ''; }},//是否为信令通道
	trunkproto: {type:String,length:50}
});
pbxCard.Name='pbxCard';
schema.models.pbxCard;
module.exports = pbxCard;
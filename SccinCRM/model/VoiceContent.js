var Schema = require('jugglingdb').Schema;
var schema = require('../database/jdmysql').schema;
var moment = require('moment');
var guid=require('guid');
var CallRecords=require('./CallRecords');
var VoiceContent = schema.define('VoiceContent', {
    Contents:     { type: Schema.Text},
    State:   { type: Number,default:0 }
});

VoiceContent.belongsTo(CallRecords, {as: 'callrecord', foreignKey: 'voiceContentID'});

schema.automigrate(function(){
	console.log('创建表:VoiceContent及关联表');
	CallRecords.create({id:guid.create(),callRecordsID:"1",ProjExpertID:"ProjExpertID"},function(err,callrecord){
   console.log(callrecord);
VoiceContent.create({
			Contents:'111',
			id:guid.create(),callrecord:callrecord},function(err,v){
	console.log(v);
});

	
 
	});
});
schema.models.VoiceContent;
module.exports = VoiceContent;
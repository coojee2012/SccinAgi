var Schema = require('jugglingdb').Schema;
var moment = require('moment');
var schema = require('../../database/jdmysql').schema;
var CallRecords=require('./CallRecords');
var VoiceContent=schema.define('VoiceContent',{
    Contents:     {type: Schema.Text},
    //voiceContentID:{type: String, length: 50},
    State:   {type: Number,default:0 }
});
VoiceContent.Name='VoiceContent';
VoiceContent.belongsTo(CallRecords, {as: 'callrecord', foreignKey: 'id'});
schema.models.VoiceContent;
module.exports = VoiceContent;
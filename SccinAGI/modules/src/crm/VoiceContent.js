var Schema = require('jugglingdb').Schema;
var moment = require('moment');
var conf = require('node-conf');
var basedir = conf.load('app').appbase;
var schema = require(basedir+'/database/jdmysql').schema;
var crmCallRecords=require('./CallRecords');
var crmVoiceContent=schema.define('crmVoiceContent',{
    Contents:     {type: Schema.Text},
    //crmVoiceContentID:{type: String, length: 50},
    State:   {type: Number,default:0 }
});
crmVoiceContent.Name='crmVoiceContent';
crmVoiceContent.belongsTo(crmCallRecords, {as: 'callrecord', foreignKey: 'id'});
schema.models.crmVoiceContent;
module.exports = crmVoiceContent;
var Schema = require('jugglingdb').Schema;
var schema = require('../database/jdmysql').schema;
var moment = require('moment');
var CallRecords=require('./CallRecords');

var CallPhone = schema.define('CallPhone', {
    callRecordsID:     { type: String, length: 50},
    Phone:   { type: String, length: 50},//是否呼叫标志0：未呼叫，1：已经呼叫
    PhoneSequ:   { type: Number,default:0 }//是否呼叫标志0：未呼叫，1：已经呼叫
});

CallPhone.belongsTo(CallRecords, {as: 'callrecord', foreignKey: 'callRecordsID'});
CallPhone.Name='CallPhone';


schema.models.CallPhone;

module.exports = CallPhone;
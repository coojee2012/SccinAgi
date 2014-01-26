var Schema = require('jugglingdb').Schema;
var schema = require('../database/jdmysql').schema;
var moment = require('moment');
var CallRecords=require('./CallRecords');

var CallPhone = schema.define('CallPhone', {
    callRecordsID:     { type: String, length: 50},
    Phone:   { type: String, length: 50},//电话号码
    State:   { type: Number,default:0 },//0：未呼叫，1：已经呼叫
    PhoneSequ:   { type: Number,default:0 }//电话拨打顺序
});

CallPhone.belongsTo(CallRecords, {as: 'callrecord', foreignKey: 'callRecordsID'});
CallPhone.Name='CallPhone';


schema.models.CallPhone;

module.exports = CallPhone;
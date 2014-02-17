var Schema = require('jugglingdb').Schema;
var schema = require('../../database/jdmysql').schema;
var moment = require('moment');
var CallPhone=require('./CallPhone');
var CallLog={};
var CallLog = schema.define('CallLog', {
    Phone:   { type: String, length: 50},//是否呼叫标志0：未呼叫，1：已经呼叫
    PhoneSequ:   { type: Number,default:0 },//是否呼叫标志0：未呼叫，1：已经呼叫
    WorkTime:   { type: String, length: 50,default: function () { return moment().format("YYYY-MM-DD HH:mm:ss"); } }//操作时间
});


CallLog.Name='CallLog';

CallLog.belongsTo(CallPhone, {as: 'callphone', foreignKey: 'id'});


schema.models.CallLog;

module.exports = CallLog;
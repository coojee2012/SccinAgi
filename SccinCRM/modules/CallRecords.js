var Schema = require('jugglingdb').Schema;
var schema = require('../database/jdmysql').schema;
var moment = require('moment');

var CallRecords = schema.define('CallRecords', {
    ProjExpertID:     { type: String, length: 50},//抽取专家编号
    CallState:   { type: Number,default:0 },//是否呼叫标志0：未呼叫，1：已经呼叫
    WorkTime:   { type: String, length: 50,default: function () { return moment().format("YYYY-MM-DD HH:mm:ss"); } }//操作时间
});

CallRecords.Name='CallRecords';



schema.models.CallRecords;

module.exports = CallRecords;
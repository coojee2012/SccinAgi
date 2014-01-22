var Schema = require('jugglingdb').Schema;
var schema = require('../database/jdmysql').schema;
var moment = require('moment');
var CallRecords = schema.define('CallRecords', {
    callRecordsID:     { type: String, length: 50,index: true},//记录编号
    ProjExpertID:     { type: String, length: 50},//抽取结果编号
    CallState:   { type: Number,default:0 },//是否呼叫标志0：未呼叫，1：已经呼叫
    WorkTime:   { type: String, length: 50,default: function () { return moment().format("YYYY-MM-DD HH:mm:ss"); } }//操作时间
});

//schema.automigrate(function(){});


schema.models.CallRecords;

module.exports = CallRecords;
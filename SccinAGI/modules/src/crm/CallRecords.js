var Schema = require('jugglingdb').Schema;
var conf = require('node-conf');
var basedir = conf.load('app').appbase;
var schema = require(basedir+'/database/jdmysql').schema;
var moment = require('moment');

var crmCallRecords = schema.define('crmCallRecords', {
    CallInfoID:     { type: String, length: 50},//呼叫编号
    CallState:   { type: Number,default:0 },//是否呼叫标志0：未呼叫，1：已经呼叫
    WorkTime:   { type: String, length: 50,default: function () { return moment().format("YYYY-MM-DD HH:mm:ss"); } }//操作时间
});

crmCallRecords.Name='crmCallRecords';



schema.models.crmCallRecords;

module.exports = crmCallRecords;
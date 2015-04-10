/*var Schema = require('jugglingdb').Schema;
var conf = require('node-conf');
var basedir = conf.load('app').appbase;
var schema = require(basedir+'/database/jdmysql').schema;
var moment = require('moment');
var crmCallPhone=require('./CallPhone');*/

var crmCallLog = schema.define('crmCallLog', {
    Phone:   { type: String, length: 50},//是否呼叫标志0：未呼叫，1：已经呼叫
    //PhoneSequ:   { type: Number,default:0 },//是否呼叫标志0：未呼叫，1：已经呼叫
    WorkTime:   { type: String, length: 50,default: function () { return moment().format("YYYY-MM-DD HH:mm:ss"); } }//操作时间
});


crmCallLog.Name='crmCallLog';

crmCallLog.belongsTo(crmCallPhone, {as: 'callphone', foreignKey: 'id'});


schema.models.crmCallLog;

exports.crmCallLog = crmCallLog;

Dbs.crmCallLog = crmCallLog;
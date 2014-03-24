/*var Schema = require('jugglingdb').Schema;
var moment = require('moment');
var conf = require('node-conf');
var basedir = conf.load('app').appbase;
var schema = require(basedir+'/database/jdmysql').schema;
var crmCallLog=require('./CallLog');
var crmCallPhone=require('./CallPhone');*/
var crmUserKeysRecord=schema.define('crmUserKeysRecord',{
    callLogID:     { type: String, length: 50},
    keyTypeID:     { type: String, length: 50},
    Key:   { type: String, length: 50},//用户按键
    WorkTime:   { type: String, length: 50,default: function () { return moment().format("YYYY-MM-DD HH:mm:ss"); } }//操作时间
});


crmUserKeysRecord.Name='crmUserKeysRecord';


crmUserKeysRecord.belongsTo(crmCallLog, {as: 'calllog', foreignKey: 'callLogID'});
crmUserKeysRecord.belongsTo(crmCallPhone, {as: 'keytype', foreignKey: 'keyTypeID'});


schema.models.crmUserKeysRecord;
exports.crmUserKeysRecord = crmUserKeysRecord;
Dbs.crmUserKeysRecord = crmUserKeysRecord;
/*var Schema = require('jugglingdb').Schema;
var conf = require('node-conf');
var basedir = conf.load('app').appbase;
var schema = require(basedir+'/database/jdmysql').schema;
var moment = require('moment');
var crmCallRecords=require('./CallRecords');*/

var crmCallPhone = schema.define('crmCallPhone', {
    callRecordsID:     { type: String, length: 50},
    Phone:   { type: String, length: 50},//电话号码
    State:   { type: Number,default:0 },//0：未呼叫，1：已经呼叫
    PhoneSequ:   { type: Number,default:0 }//电话拨打顺序
});

crmCallPhone.belongsTo(crmCallRecords, {as: 'callrecord', foreignKey: 'callRecordsID'});
crmCallPhone.Name='crmCallPhone';


schema.models.crmCallPhone;

exports.crmCallPhone = crmCallPhone;
Dbs.crmCallPhone = crmCallPhone;
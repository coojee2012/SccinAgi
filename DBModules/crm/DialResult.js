/*
var Schema = require('jugglingdb').Schema;
var conf = require('node-conf');
var basedir = conf.load('app').appbase;
var schema = require(basedir+'/database/jdmysql').schema;
var moment = require('moment');
var crmCallRecords=require('./CallRecords');*/

var crmDialResult = schema.define('crmDialResult', {
	CallInfoID:     { type: String, length: 50},//呼叫编号
    Result:   { type: Number,default:-1 },//-1:未结果，1，参加，2不参加
    State:   { type: Number,default:0 },//状态（0：处理中；1：处理完成）
    WorkTime:   { type: String, length: 50,default: function () { return moment().format("YYYY-MM-DD HH:mm:ss"); } },//操作时间
    UnixTime:{type: Number, length: 50,default: function () { return moment().unix(); }}
});
crmDialResult.Name='crmDialResult';

crmDialResult.belongsTo(crmCallRecords, {as: 'callrecord', foreignKey: 'id'});

schema.models.crmDialResult;

exports.crmDialResult = crmDialResult;
Dbs.crmDialResult = crmDialResult;
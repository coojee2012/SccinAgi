
var Schema = require('jugglingdb').Schema;
var schema = require('../database/jdmysql').schema;
var moment = require('moment');
var CallRecords=require('./CallRecords');

var DialResult = schema.define('DialResult', {
	dialResultID:     { type: String, length: 50},
    Result:   { type: Number,default:-1 },//-1:未结果，1，参加，2不参加
    State:   { type: Number,default:0 },//状态（0：处理中；1：处理完成）
    WorkTime:   { type: String, length: 50,default: function () { return moment().format("YYYY-MM-DD HH:mm:ss"); } }//操作时间
});
DialResult.Name='DialResult';

DialResult.belongsTo(CallRecords, {as: 'callrecord', foreignKey: 'dialResultID'});

schema.models.DialResult;

module.exports = DialResult;
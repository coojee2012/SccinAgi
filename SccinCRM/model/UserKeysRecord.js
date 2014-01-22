
var Schema = require('jugglingdb').Schema;
var schema = require('../database/jdmysql').schema;
var moment = require('moment');
var CallLog=require('./CallLog');
var CallPhone=require('./CallPhone');
var UserKeysRecord = schema.define('UserKeysRecord', {
    userKeysRecordID:     { type: String, length: 50,index: true},//记录编号
    Key:   { type: String, length: 50},//用户按键
    WorkTime:   { type: String, length: 50,default: function () { return moment().format("YYYY-MM-DD HH:mm:ss"); } }//操作时间
});

UserKeysRecord.belongsTo(CallLog, {as: 'calllog', foreignKey: 'callLogID'});
UserKeysRecord.belongsTo(CallPhone, {as: 'keytype', foreignKey: 'keyTypeID'});

schema.automigrate(function(){});

schema.models.UserKeysRecord;

module.exports = UserKeysRecord;
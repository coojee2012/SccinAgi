var Schema = require('jugglingdb').Schema;
var moment = require('moment');
var schema = require('../../database/jdmysql').schema;
var CallLog=require('./CallLog');
var CallPhone=require('./CallPhone');
var UserKeysRecord=schema.define('UserKeysRecord',{
    callLogID:     { type: String, length: 50},
    keyTypeID:     { type: String, length: 50},
    Key:   { type: String, length: 50},//用户按键
    WorkTime:   { type: String, length: 50,default: function () { return moment().format("YYYY-MM-DD HH:mm:ss"); } }//操作时间
});


UserKeysRecord.Name='UserKeysRecord';


UserKeysRecord.belongsTo(CallLog, {as: 'calllog', foreignKey: 'callLogID'});
UserKeysRecord.belongsTo(CallPhone, {as: 'keytype', foreignKey: 'keyTypeID'});


schema.models.UserKeysRecord;
module.exports = UserKeysRecord;
var Schema = require('jugglingdb').Schema;
var moment = require('moment');
var schema = require('../../database/jdmysql').schema;
var KeyType=schema.define('KeyType',{
    keyTypeID:   { type: String, length: 50},//编号
    KeyTypeName:   { type: String, length: 50},//名称
    State:   { type: Number,default:0 }//状态(0：不可用，1：可用)
});
KeyType.Name='KeyType';
schema.models.KeyType;
module.exports = KeyType;
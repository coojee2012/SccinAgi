/*var Schema = require('jugglingdb').Schema;
var moment = require('moment');
var conf = require('node-conf');
var basedir = conf.load('app').appbase;
var schema = require(basedir+'/database/jdmysql').schema;*/
var crmKeyType=schema.define('KeyType',{
    keyTypeID:   { type: String, length: 50},//编号
    KeyTypeName:   { type: String, length: 50},//名称
    State:   { type: Number,default:0 }//状态(0：不可用，1：可用)
});
crmKeyType.Name='crmKeyType';
schema.models.crmKeyType;
exports.crmKeyType = crmKeyType;
Dbs.crmKeyType = crmKeyType;
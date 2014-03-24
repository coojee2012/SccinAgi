/*var Schema = require('jugglingdb').Schema;
var moment = require('moment');
var guid = require('guid');
var conf = require('node-conf');
var basedir = conf.load('app').appbase;
var schema = require(basedir+'/database/jdmysql').schema;*/
var pbxConference=schema.define('pbxConference',{
	pincode:   {type:String,length:50},//进入会议室的密码
	playwhenevent:   {type: Number, default: function () { return 0 }},//播放音乐当离开时
	mohwhenonlyone:   {type: Number, default: function () { return 0 }},//只有一个人是播放等待音乐
	cretime:   {type:String,length:50, default: function () { return moment().format("YYYY-MM-DD HH:mm:ss"); }}
});
pbxConference.Name='pbxConference';
schema.models.pbxConference;
exports.pbxConference = pbxConference;

Dbs.pbxConference=pbxConference;
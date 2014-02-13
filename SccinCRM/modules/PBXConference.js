var Schema = require('jugglingdb').Schema;
var moment = require('moment');
var guid = require('guid');
var schema = require('../database/jdmysql').schema;
var PBXConference=schema.define('PBXConference',{
	pincode:   {type:String,length:50},//进入会议室的密码
	playwhenevent:   {type: Number, default: function () { return 0 }},//播放音乐当离开时
	mohwhenonlyone:   {type: Number, default: function () { return 0 }},//只有一个人是播放等待音乐
	cretime:   {type:String,length:50, default: function () { return moment().format("YYYY-MM-DD HH:mm:ss"); }}
});
PBXConference.Name='PBXConference';
schema.models.PBXConference;
module.exports = PBXConference;
var pbxAutoMonitorWays=schema.define('pbxAutoMonitorWays',{
	id:{type:String,length:100,default:function(){return guid.create();}},
    wayName:   {type:String,length:50},//录音方式名称
	recordout: {type:String,length:10,default: function () { return '是'; }},//呼出录音
	recordin:  {type:String,length:10,default: function () { return '是'; }},//呼入录音
	recordqueue:{type:String,length:10,default: function () { return '是'; }},//作为队列分机接听录音
	keepfortype:{type:String,length:10,default: function () { return '永久保存'; }},//保存方式：永久保存,按时间，按条数
	keepforargs: {type:Number,default: function () { return 100; }},//保存方式参数，永久保存无效
	members: {type:String,length:50},//分机成员，一个分机只能有一个录音方式
	cretime: {type:String,length:100,default: function () { return moment().format("YYYY-MM-DD HH:mm:ss"); }}
});
pbxAutoMonitorWays.Name='pbxAutoMonitorWays';
schema.models.pbxAutoMonitorWays;
exports.pbxAutoMonitorWays = pbxAutoMonitorWays;
Dbs.pbxAutoMonitorWays=pbxAutoMonitorWays;
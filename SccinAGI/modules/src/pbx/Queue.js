/*var Schema = require('jugglingdb').Schema;
var moment = require('moment');
var guid = require('guid');
var conf = require('node-conf');
var basedir = conf.load('app').appbase;
var schema = require(basedir+'/database/jdmysql').schema;*/
var pbxQueue=schema.define('pbxQueue',{
	queuename:   {type:String,length:50},//队列名称
	announce:   {type:String,length:50,default: function () { return ''; }},//将在电话接通的时候播放xxxx,
	playring:{type:Number,default: function () { return 0 }},//等待用户听到振铃声，0听背景音乐
	saymember:  {type:Number,default: function () { return 0 }},//是否启用播放坐席工号
	queuetimeout:   {type:Number,default: function () { return 0 }},//队列等待超时时间
	failedon:    {type:String,length:50,default: function () { return ''; }},//队列呼叫失败的本地处理号码
	members:    {type:String,length:200},//队列成员，如:8001&8002&8003
	strategy:    {type:String,length:50,default: function () { return 'random'; }},//振铃策略 
/**	              ;ringall :ring 所有可用channels 直到应答为止
                  ;roundrobin :轮流ring 每个可用interface,1calls :1-<2-<3,2calls:2-<3-<1;3calls:3-<1-<2
                  ;leastrecent :ring 进来最少在队列中最少被呼叫的interface,有可能一直响某台分机
                  ;fewestcalls :ring one 最少completed calls
                  ;random  :随机ring
                  ;rrmemory :在内存中把最后一个ring pass 放到最左边,即不会一直ring某个分机
                  ;linear    :根据配置文件中的顺序ring（v1.6）
                  ;wrandom   :(V1.6)
                  **/
	wrapuptime:     {type:Number,default: function () { return 0 }},//接到一个call后，需要等待多长时间方置坐席为空闲
	timeout:    {type:Number,default: function () { return 0 }},//呼叫坐席超时
	musicclass:   {type:String,length:50,default: function () { return 'default'; }},//背景音乐
	retry:   {type:Number,default: function () { return 0 }},//表示队列呼叫失败后，给多少秒再重新呼叫分机的振铃时间，一般设置为0 
	joinempty: {type:String,length:50,default: function () { return 'no'; }},//是允许否加入空队列-yes or no
	frequency:{type:Number,default: function () { return 0 }},//每隔多少秒将向队列等待者播放提示录音
	cretime:   {type: String,length:50, default: function () { return moment().format("YYYY-MM-DD HH:mm:ss");}}
});
pbxQueue.Name='pbxQueue';
schema.models.pbxQueue;
exports.pbxQueue = pbxQueue;
Dbs.pbxQueue = pbxQueue;
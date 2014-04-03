var Schema = require('jugglingdb').Schema;
var moment = require('moment');
var guid = require('guid');
var conf = require('node-conf');
var basedir = conf.load('app').appbase;
var schema = require('../database/jdmysql').schema;
var Dbs={};


var pbxCallProcees=schema.define('pbxCallProcees',{
	id:{type:String,length:100,default:function(){return guid.create();}},
	callsession:{type:String,length:100},
	callernumber:   {type:String,length:50},
	callednumber:   {type:String,length:50},
	processname:{type:String,length:50},
	passargs:   {type:String,length:100},
	doneresults:   {type:String,length:50},
	routerline:   {type: String, length:10},
	cretime:   {type: String,length:50, default: function () {return moment().format("YYYY-MM-DD HH:mm:ss"); }},
	
});
pbxCallProcees.Name='pbxCallProcees';
schema.models.pbxCallProcees;
exports.pbxCallProcees = pbxCallProcees;

Dbs.pbxCallProcees=pbxCallProcees;
/*var Schema = require('jugglingdb').Schema;
var moment = require('moment');
var guid = require('guid');
var conf = require('node-conf');
var basedir = conf.load('app').appbase;
var schema = require(basedir+'/database/jdmysql').schema;*/
var pbxCard=schema.define('pbxCard',{
	id:{type:String,length:100,default:function(){return guid.create();}},
    cardname:   {type:String,length:50},
	driver:   {type:String,length:50,default: function () { return 'DAHDI'; }},
	line:  {type:Number},
	group:{type:String,length:10,default: function () { return '-1'; }},
	dataline:{type:String,length:10,default: function () { return ''; }},//是否为信令通道
	trunkproto: {type:String,length:50}
});
pbxCard.Name='pbxCard';
schema.models.pbxCard;
exports.pbxCard = pbxCard;

Dbs.pbxCard=pbxCard;
/*var Schema = require('jugglingdb').Schema;
var moment = require('moment');
var conf = require('node-conf');
var basedir = conf.load('app').appbase;
var schema = require(basedir+'/database/jdmysql').schema;*/
var pbxCdr=schema.define('pbxCdr',{
    caller:   {type:String,length:50},
	called:   {type:String,length:50},
	accountcode:   {type:String,length:50},
	srcchannel:{type:String,length:100},
	deschannel:{type:String,length:100},
	uniqueid:{type:String,length:50},
	threadid:{type:String,length:50},
	context:{type:String,length:50},
	agitype:{type:String,length:20},
	alive:{type:String,length:10,default: function () { return 'yes'; }},
	startime:{type:String,length:100,default: function () { return moment().format("YYYY-MM-DD HH:mm:ss"); }},
	lastapptime:  {type:String,length:100,default: function () { return ''; }},//上次应用模块发生的时间
	endtime:  {type:String,length:100,default: function () { return ''; }},//线路挂断时间
	routerline:   {type:String,length:10},
	lastapp:    {type:String,length:50},
	answerstatus:    {type:String,length:50}
});
pbxCdr.Name='pbxCdr';
schema.models.pbxCdr;
exports.pbxCdr = pbxCdr;
Dbs.pbxCdr=pbxCdr;
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
/*var Schema = require('jugglingdb').Schema;
var moment = require('moment');
var guid = require('guid');
var conf = require('node-conf');
var basedir = conf.load('app').appbase;
var schema = require(basedir+'/database/jdmysql').schema;*/

var pbxExtenGroupRelations=schema.define('pbxExtenGroupRelations',{
	id:{type:String,length:100,default:function(){return guid.create();}},		
	groupid:   {type:Number},
	extenid:   {type:String,length:50}	
});


pbxExtenGroupRelations.Name='pbxExtenGroupRelations';
schema.models.pbxExtenGroupRelations;
exports.pbxExtenGroupRelations = pbxExtenGroupRelations;
Dbs.pbxExtenGroupRelations = pbxExtenGroupRelations;
/*var Schema = require('jugglingdb').Schema;
var moment = require('moment');
var guid = require('guid');
var conf = require('node-conf');
var basedir = conf.load('app').appbase;
var schema = require(basedir+'/database/jdmysql').schema;
var pbxExtenGroupRelations=require('./ExtenGroupRelations');*/

var pbxExtenGroup=schema.define('pbxExtenGroup',{
	id:{type:String,length:100,default:function(){return guid.create();}},	
	groupname:   {type:String,length:50},
	memo:   {type:String,length:100},
	cretime:   {type: String,length:50, default: function () { return moment().format("YYYY-MM-DD HH:mm:ss"); }}
});


pbxExtenGroup.hasMany(pbxExtenGroupRelations,{as:'extensions',foreignKey:'groupid'});
pbxExtenGroup.Name='pbxExtenGroup';
schema.models.pbxExtenGroup;
exports.pbxExtenGroup = pbxExtenGroup;

Dbs.pbxExtenGroup=pbxExtenGroup;
/*var Schema = require('jugglingdb').Schema;
var moment = require('moment');
var guid = require('guid');
var conf = require('node-conf');
var basedir = conf.load('app').appbase;
var schema = require(basedir+'/database/jdmysql').schema;

var pbxExtenGroupRelations=require('./ExtenGroupRelations');*/

var pbxExtension=schema.define('pbxExtension',{
	accountcode:   {type:String,length:50},	//账号	
	password:   {type:String,length:50},//注册密码
	deviceproto:   {type:String,length:50},//设备协议
	devicenumber:{type:String,length:50},//设备号
	devicestring:  {type:String,length:100},//设备字符串
	fristchecked:   {type:Number,default: function () { return 0 }},//是否检查过
	transfernumber:    {type:String,length:50,default: function () { return 'deailway=&number='; }},//deailway-互转方式，diallocal,dialout ; number-呼叫转移号码,非空将强制互转号码到指定号码
	dndinfo:    {type:String,length:10,default: function () { return 'off'; }},//示忙状态 off/on
	failed:    {type:String,length:50,default: function () { return 'deailway=hangup&number=' }},//deailway-呼叫失败处理方式:hangup,ivr,voicemail,fllowme,transfer
	cretime:   {type: String,length:50, default: function () { return moment().format("YYYY-MM-DD HH:mm:ss"); }}
});

pbxExtension.hasMany(pbxExtenGroupRelations, {as: 'groups', foreignKey: 'extenid'});
pbxExtension.validatesPresenceOf('accountcode', 'deviceproto');//验证非空
pbxExtension.validatesLengthOf('password', {min: 4, message: {min: '注册密码必须4位以上'}});//验证长度
pbxExtension.validatesInclusionOf('deviceproto', {in: ['SIP', 'IAX2','VIRTUAL']});//验证是否在给定几个值
pbxExtension.validatesNumericalityOf('fristchecked', {int: true});//验证未数字
//pbxExtension.validatesUniquenessOf('email', {message: 'email is not unique'});//唯一性验证

pbxExtension.Name='pbxExtension';
schema.models.pbxExtension;
exports.pbxExtension = pbxExtension;
Dbs.pbxExtension = pbxExtension;
var pbxIvrActMode=schema.define('pbxIvrActMode',{
	modename:   {type:String,length:50},
	url:   {type:String,length:100},
	iconame:   {type:String,length:50},
	memo:    {type:String,length:200}
});
pbxIvrActMode.Name='pbxIvrActMode';
schema.models.pbxIvrActMode;
exports.pbxIvrActMode = pbxIvrActMode;
Dbs.pbxIvrActMode = pbxIvrActMode;
/**
   执行动作参数说明：
   1、播放语音：interruptible：允许按键中断，【'true'/'false'】,默认为true
				folder:语音目录，相对于：/var/lib/asterisk/sounds/cn/
				filename:语音文件名
				下面参数在interruptible=true时有效
				retrytime：允许重听的次数，默认为3
				timeout：等待按键超时时间，毫秒，默认为10000
				failivrnum：获取按键失败处理IVR号码，默认为挂机IVR
				failactid：获取按键失败处理IVR号码动作编号，默认为0

   2、发起录音：varname：需要播放的录音变量名
             format：播放的录音格式
             maxduration：默认最多可以录制1小时，0表示随便录好久
             options：默认如果没应答就跳过录音
             【	a - 在已有录音文件后面追加录音.
               	n - 即使电话没有应答，也要录音.
			  	q - 安静模式（录音前不播放beep声）.
				s - 如果线路未应答，将跳过录音.
				t - 用*号终止录音，代替默认按#号终止录音
				x - 忽略所有按键，只有挂机才能终止录音.
				k - 保持录音，即使线路已经挂断了.
				y - 任何按键都可以终止录音.】
             silence：如果持续了超过X秒的沉默，将停止录音，默认10秒,0表示不判断


   3、播放录音：varname：需要播放的录音变量名
             format：播放的录音格式
   4、录制数字字符：maxdigits：最大接收字符数，默认为20
   					beep：【true/false】，录制字符前是否播放beep声，默认为false
   					varname：保存的变量名，仅在当前会话有效
   					addbefore：【true/false】,是否保存用户上一次的输入，默认为false
   5、读出数字字符：varname：需读出的变量名，仅在当前会话有效
   					digits：直接读出给定的数字字符
   6、拨打号码：varname：从会话中保存的变量获取号码
   				digits：指定号码
   				dialway：拨打方式【diallocal/dialout】
   7、数字方式读出

   8、读出日期时间

   9、检测日期

   10、主叫变换

   11、检查号码归属地

   12、跳转到语音信箱

   13、跳转到IVR菜单

   14、WEB交互接口

   15、AGI扩展接口

   16、等待几秒

   17、播放音调

   18、挂机


**/
var pbxIvrActions=schema.define('pbxIvrActions',{
	id:{type:String,length:100,default:function(){return guid.create();}},
	ivrnumber:  {type:String,length:50},
	ordinal:   {type:Number,default:function(){return 0;}},
	actmode:   {type:String,length:50,default:function(){return '1';}},
	args:   {type:String,length:256}
});

pbxIvrActions.belongsTo(pbxIvrActMode, {as: 'Actmode', foreignKey: 'actmode'});

pbxIvrActions.Name='pbxIvrActions';
schema.models.pbxIvrActions;

exports.pbxIvrActions = pbxIvrActions;
Dbs.pbxIvrActions = pbxIvrActions;
/*var Schema = require('jugglingdb').Schema;
var moment = require('moment');
var guid = require('guid');
var conf = require('node-conf');
var basedir = conf.load('app').appbase;
var schema = require(basedir+'/database/jdmysql').schema;*/

var pbxIvrInputs=schema.define('pbxIvrInputs',{
	id:{type:String,length:100,default:function(){return guid.create();}},
	ivrnumber:  {type:String,length:50},
	general:   {type:Number,default: function () {return 0;}},//错误响应，包括无效按键或等待按键超时标识或重试次数设置
	generaltype:   {type:String,length:50},//按键错误或等待按键超时或重试次数设置
	generalargs:   {type:String,length:150},//错误响应参数
	inputnum:   {type: String,length:10},
	gotoivrnumber:   {type: String,length:50},
	gotoivractid:   {type: Number,default: function () {return 0;}}
});



pbxIvrInputs.Name='pbxIvrInputs';
schema.models.pbxIvrInputs;
exports.pbxIvrInputs = pbxIvrInputs;
Dbs.pbxIvrInputs = pbxIvrInputs;
/*var Schema = require('jugglingdb').Schema;
var moment = require('moment');
var conf = require('node-conf');
var basedir = conf.load('app').appbase;
var schema = require(basedir+'/database/jdmysql').schema;
var Actions=require('./IvrActions');
var Inputs=require('./IvrInputs');*/

var pbxIvrMenmu=schema.define('pbxIvrMenmu',{
	ivrname:   {type:String,length:50},
	description:   {type:String,length:150},
	cretime:   {type: String, length: 50,default: function () { return moment().format("YYYY-MM-DD HH:mm:ss");}},
	isreadonly:   {type:String,length: 10,default: function () {return '否';}}
});

pbxIvrMenmu.hasMany(pbxIvrActions,{as:'actions',foreignKey:'ivrnumber'});
pbxIvrMenmu.hasMany(pbxIvrInputs,{as:'inputs',foreignKey:'ivrnumber'});

pbxIvrMenmu.Name='pbxIvrMenmu';
schema.models.pbxIvrMenmu;
exports.pbxIvrMenmu = pbxIvrMenmu;
Dbs.pbxIvrMenmu = pbxIvrMenmu;
/*var Schema = require('jugglingdb').Schema;
var moment = require('moment');
var conf = require('node-conf');
var basedir = conf.load('app').appbase;
var schema = require(basedir+'/database/jdmysql').schema;*/
var pbxLocalNumber=schema.define('pbxLocalNumber',{
	localtype:   {type:String,length:50},
	assign:   {type: String,length:100}
});
pbxLocalNumber.Name='pbxLocalNumber';
schema.models.pbxLocalNumber;
exports.pbxLocalNumber = pbxLocalNumber;
Dbs.pbxLocalNumber = pbxLocalNumber;
/*var Schema = require('jugglingdb').Schema;
var moment = require('moment');
var guid = require('guid');
var conf = require('node-conf');
var basedir = conf.load('app').appbase;
var schema = require(basedir+'/database/jdmysql').schema;*/
var pbxLostCall=schema.define('pbxLostCall',{
	id:{type:String,length:100,default:function(){return guid.create();}},	
	extension:   {type:String,length:50},
	lostnumber:   {type:String,length:50},
	lostType:   {type:String,length:50, default: function () { return ''; }},//无应答类型 exten,queue,app
	reback:   {type: String,length:50, default: function () { return '否'; }},
	certime:   {type: String,length:50,default: function () { return moment().format("YYYY-MM-DD HH:mm:ss");}},
	backtime:   {type: String,length:50},
	whoback:    {type:String,length:50}
});
pbxLostCall.Name='pbxLostCall';
schema.models.pbxLostCall;
exports.pbxLostCall = pbxLostCall;
Dbs.pbxLostCall = pbxLostCall;
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
/*var Schema = require('jugglingdb').Schema;
var moment = require('moment');
var guid = require('guid');
var conf = require('node-conf');
var basedir = conf.load('app').appbase;
var schema = require(basedir+'/database/jdmysql').schema;*/
var pbxRcordFile=schema.define('pbxRcordFile',{
	id:{type:String,length:100,default:function(){return guid.create();}},//关联CDR
	filename:   {type:String,length:50},
	extname:    {type:String,length:50},
	filesize:   {type:Number,default:function () { return 0 }},
	calltype:   {type:String,length:50},
	lable:   {type:String,length:50},//录音类型，queue,exten,ivr,voicemail等
	cretime:    {type: Date, default: function () { return moment().format("YYYY-MM-DD HH:mm:ss"); }},
	extennum:   {type:String,length:50},
	folder:     {type:String,length:50},
	callnumber: {type:String,length:50},
	doymicac:   {type:String,length:50}
});
pbxRcordFile.Name='pbxRcordFile';
schema.models.pbxRcordFile;
exports.pbxRcordFile = pbxRcordFile;
Dbs.pbxRcordFile=pbxRcordFile;
/*var Schema = require('jugglingdb').Schema;
var moment = require('moment');
var guid = require('guid');
var conf = require('node-conf');
var basedir = conf.load('app').appbase;
var schema = require(basedir+'/database/jdmysql').schema;*/
var pbxRouter=schema.define('pbxRouter',{
	id:{type:String,length:100,default:function(){return guid.create();}},
    proirety:   {type:Number},//执行顺序（优先级）
	createmode:   {type:String,length:10,default: function () { return '否' }},//系统默认
	routerline:   {type:String,length:10,default: function () { return '呼入' }},//路由方式，呼出，呼入
	routername:{type:String,length:100},//规则名称
	optextra:  {type:String,length:50},//扩展属性
	lastwhendone:   {type:String,length:10,default: function () { return '否' }},//最终匹配规则
	callergroup:    {type:String,length:50},//匹配主叫组（呼出对应分机分组，呼入对应中继分组）
	callerid:    {type:String,length:200},//匹配主叫以什么开头
	callerlen:    {type:Number,default: function () { return -1 ;}},//匹配主叫长度
	callednum:     {type:String,length:50},//匹配被叫以什么开头
	calledlen:    {type:Number,default: function () { return -1 ;}},//匹配被叫长度
	replacecallerid:   {type:String,length:50},//匹配后主叫替换
	replacecalledtrim:   {type:Number,default: function () { return -1 ;}},//匹配后删除被叫前几位
	replacecalledappend: {type:String,length:50},//匹配后补充被叫前几位
	processmode:{type:String,length:50},//处理方式 【黑名单，VIP，本地处理，拨打外线】
	processdefined:   {type:String,length:100}//处理详细参数定义
});
pbxRouter.Name='pbxRouter';
schema.models.pbxRouter;

exports.pbxRouter = pbxRouter;
Dbs.pbxRouter = pbxRouter;
/*var Schema = require('jugglingdb').Schema;
var moment = require('moment');
var guid = require('guid');
var conf = require('node-conf');
var basedir = conf.load('app').appbase;
var schema = require(basedir+'/database/jdmysql').schema;*/
var pbxScreenPop=schema.define('pbxScreenPop',{
	callernumber:   {type:String,length:50,default:function () { return ''; }},//主叫
	callednumber:   {type:String,length:50,default:function () { return ''; }},//被叫
	sessionnumber:   {type:String,length:50,default:function () { return ''; }},//本次呼叫会话编号
	updatetime:   {type: String, default: function () { return moment().format("YYYY-MM-DD HH:mm:ss"); }},
	status:   {type:String,length:10,default:function () { return 'over'; }},//弹出类型:waite,over
	routerdype:   {type:Number,default:function () { return 1; }},//呼叫路由1内线2外线
	parked:   {type:String,length:50,default:function () { return 'not'; }},//保持状态：yes ,not
	poptype:    {type:String,length:50,default:function () { return ''; }}//弹出类型:diallocal,dialout
});
pbxScreenPop.Name='pbxScreenPop';
schema.models.pbxScreenPop;
exports.pbxScreenPop = pbxScreenPop;
Dbs.pbxScreenPop = pbxScreenPop;
/*var Schema = require('jugglingdb').Schema;
var moment = require('moment');
var guid = require('guid');
var conf = require('node-conf');
var basedir = conf.load('app').appbase;
var schema = require(basedir+'/database/jdmysql').schema;*/
var pbxSounds=schema.define('pbxSounds',{
	id:{type:String,length:100,default:function(){return guid.create();}},	
	filename:   {type:String,length:50},//文件名
	extname:   {type:String,length:50},//扩展名
	folder:  {type:String,length:50},//文件夹
	description:{type:String,length:100},//描述
	label: {type:String,length:50},//标签
	associate: {type:String,length:50},//关联
	isreadonly: {type:Number,default: function () { return 0 }},//系统只读
	cretime:     {type:String,length:50, default: function () {return moment().format("YYYY-MM-DD HH:mm:ss"); }},
	args:    {type:String,length:100}
});
pbxSounds.Name='pbxSounds';
schema.models.pbxSounds;
exports.pbxSounds = pbxSounds;
Dbs.pbxSounds = pbxSounds;
/*var Schema = require('jugglingdb').Schema;
var moment = require('moment');
var conf = require('node-conf');
var basedir = conf.load('app').appbase;
var schema = require(basedir+'/database/jdmysql').schema;*/
var pbxTrunk=schema.define('pbxTrunk',{
    trunkname:   {type:String,length:50},
	trunkproto:   {type:String,length:50},
	trunkprototype:  {type:String,length:50,default: function () { return ''; }},
	trunkdevice:{type:String,length:50,default: function () { return ''; }},
	memo: {type:String,length:100,default: function () { return ''; }},
	cretime:     {type: String, length: 50, default: function () {return moment().format("YYYY-MM-DD HH:mm:ss"); }},
	args:    {type:String,length:300,default: function () { return ''; }}
});

pbxTrunk.validatesPresenceOf('trunkname', 'trunkproto');//验证非空

pbxTrunk.Name='pbxTrunk';
schema.models.pbxTrunk;
exports.pbxTrunk = pbxTrunk;
Dbs.pbxTrunk = pbxTrunk;
var pbxMobileCode=schema.define('pbxMobileCode',{
	id:{type:String,length:100,default:function(){return guid.create();}},
	haoduan:{type:String,length:10},
	number7:   {type:String,length:20},
	server:   {type:String,length:50},
	sheng:{type:String,length:50},
	shi:   {type:String,length:50},
	quhao:   {type:String,length:50},
	youbian:   {type: String, length:20}	
});
pbxMobileCode.Name='pbxMobileCode';
schema.models.pbxMobileCode;
exports.pbxMobileCode = pbxMobileCode;

Dbs.pbxMobileCode=pbxMobileCode;
/**
黑名单
**/
var pbxBlackList=schema.define('pbxBlackList',{
	memo:{type:String,length:50,default: function () { return ''; }},//添加成黑名单的原因
	cretime: {type:String,length:100,default: function () { return moment().format("YYYY-MM-DD HH:mm:ss"); }}
});
pbxBlackList.Name='pbxBlackList';
schema.models.pbxBlackList;
exports.pbxBlackList = pbxBlackList;
Dbs.pbxBlackList=pbxBlackList;
var crmCallRecords = schema.define('crmCallRecords', {
    CallInfoID:     { type: String, length: 50},//呼叫编号
    ProjMoveID:{type: String, length: 50},//项目编号
    CallState:   { type: Number,default:0 },//是否呼叫标志0：未呼叫，1：已经呼叫
    WorkTime:   { type: String, length: 50,default: function () { return moment().format("YYYY-MM-DD HH:mm:ss"); } }//操作时间
});

crmCallRecords.Name='crmCallRecords';



schema.models.crmCallRecords;


exports.crmCallRecords = crmCallRecords;
Dbs.crmCallRecords = crmCallRecords;
/*var Schema = require('jugglingdb').Schema;
var conf = require('node-conf');
var basedir = conf.load('app').appbase;
var schema = require(basedir+'/database/jdmysql').schema;
var moment = require('moment');
var crmCallRecords=require('./CallRecords');*/

var crmCallPhone = schema.define('crmCallPhone', {
    callRecordsID:     { type: String, length: 50},
    Phone:   { type: String, length: 50},//电话号码
    State:   { type: Number,default:0 },//0：未呼叫，1：已经呼叫
    PhoneSequ:   { type: Number,default:0 }//电话拨打顺序
});

crmCallPhone.belongsTo(crmCallRecords, {as: 'callrecord', foreignKey: 'callRecordsID'});
crmCallPhone.Name='crmCallPhone';


schema.models.crmCallPhone;

exports.crmCallPhone = crmCallPhone;
Dbs.crmCallPhone = crmCallPhone;
/*var Schema = require('jugglingdb').Schema;
var conf = require('node-conf');
var basedir = conf.load('app').appbase;
var schema = require(basedir+'/database/jdmysql').schema;
var moment = require('moment');
var crmCallPhone=require('./CallPhone');*/

var crmCallLog = schema.define('crmCallLog', {
    Phone:   { type: String, length: 50},//是否呼叫标志0：未呼叫，1：已经呼叫
    PhoneSequ:   { type: Number,default:0 },//是否呼叫标志0：未呼叫，1：已经呼叫
    WorkTime:   { type: String, length: 50,default: function () { return moment().format("YYYY-MM-DD HH:mm:ss"); } }//操作时间
});


crmCallLog.Name='crmCallLog';

crmCallLog.belongsTo(crmCallPhone, {as: 'callphone', foreignKey: 'id'});


schema.models.crmCallLog;

exports.crmCallLog = crmCallLog;

Dbs.crmCallLog = crmCallLog;
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
    WorkTime:   { type: String, length: 50,default: function () { return moment().format("YYYY-MM-DD HH:mm:ss"); } }//操作时间
});
crmDialResult.Name='crmDialResult';

crmDialResult.belongsTo(crmCallRecords, {as: 'callrecord', foreignKey: 'id'});

schema.models.crmDialResult;

exports.crmDialResult = crmDialResult;
Dbs.crmDialResult = crmDialResult;
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
/*var Schema = require('jugglingdb').Schema;
var moment = require('moment');
var conf = require('node-conf');
var basedir = conf.load('app').appbase;
var schema = require(basedir+'/database/jdmysql').schema;
var crmCallLog=require('./CallLog');
var crmCallPhone=require('./CallPhone');*/
var crmUserKeysRecord=schema.define('crmUserKeysRecord',{
    callLogID:     { type: String, length: 50},
    keyTypeID:     { type: String, length: 50},
    Key:   { type: String, length: 50},//用户按键
    WorkTime:   { type: String, length: 50,default: function () { return moment().format("YYYY-MM-DD HH:mm:ss"); } }//操作时间
});


crmUserKeysRecord.Name='crmUserKeysRecord';


crmUserKeysRecord.belongsTo(crmCallLog, {as: 'calllog', foreignKey: 'callLogID'});
crmUserKeysRecord.belongsTo(crmCallPhone, {as: 'keytype', foreignKey: 'keyTypeID'});


schema.models.crmUserKeysRecord;
exports.crmUserKeysRecord = crmUserKeysRecord;
Dbs.crmUserKeysRecord = crmUserKeysRecord;
var crmVoiceContent=schema.define('crmVoiceContent',{
    NoticeContents:     {type: Schema.Text},
    SureContents:     {type: Schema.Text},
    QueryContents:     {type: Schema.Text},
    State:   {type: Number,default:0 } //0:新插入数据，1：合成中,2：合成完成
});
crmVoiceContent.Name='crmVoiceContent';
schema.models.crmVoiceContent;
exports.crmVoiceContent = crmVoiceContent;
Dbs.crmVoiceContent = crmVoiceContent;
exports.Dbs = Dbs;

/*    if (appconf.debug) {
    schema.automigrate(function() {
        console.log('创建表');

    });
}*/

schema.isActual(function(err, actual) {
	if (!actual) {
		schema.autoupdate(function(err) {
			console.log('更新表！');
		});
	}else{
		console.log('所有的表是最新的！');
	}
});

//console.log(Dbs);
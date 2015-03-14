var conf = require('node-conf');
var basedir = conf.load('app').appbase;
var Schemas = require(basedir+'/database/schema').Schemas;
var guid = require('guid');
var async = require('async');
var gets = {};
var posts = {};
module.exports = {
	get: gets,
	post: posts
};

gets.index = function(req, res) {
	async.auto({
		//设置IVR默认列子
		setDefaultIvr: function(cb) {
		var ivr=[
		{id: '200',ivrname: '测试IVR200',description: '一个测试的IVR200'},
		{id: '200100',ivrname: '测试IVR200100',description: '一个测试的IVR200100'},
		{id: '200200',ivrname: '测试IVR200200',description: '一个测试的IVR200200'}
		];
		async.forEach(ivr, function(item, callback) {
					Schemas['pbxIvrMenmu'].create(item, function(err, inst) {
						callback(err, inst);
					});
				}, function(err, results) {
					cb(err, results);
				});
		},
		//设置系统默认IVR处理方式
		setDefaultIvrMode: function(cb) {
			var modes = [
			{id: '1',modename: '播放语音',url: '',iconame: '',memo: ''}, 
			{id: '2',modename: '检查号码归属地',url: '',iconame: '',memo: ''},
			{id: '3',modename: '发起录音',url: '',iconame: '',memo: ''},
			{id: '4',modename: '播放录音',url: '',iconame: '',memo: ''},
			{id: '5',modename: '录制数字字符',url: '',iconame: '',memo: ''},
			{id: '6',modename: '数字方式读出',url: '',iconame: '',memo: ''},
			{id: '7',modename: '读出日期时间',url: '',iconame: '',memo: ''}, 
			{id: '8',modename: '检测日期',url: '',iconame: '',memo: ''}, 
			{id: '9',modename: '主叫变换',url: '',iconame: '',memo: ''}, 
			{id: '10',modename: '拨打号码',url: '',iconame: '',memo: ''},
			{id: '11',modename: '跳转到语音信箱',url: '',iconame: '',memo: ''},
			{id: '12',modename: '跳转到IVR菜单',url: '',iconame: '',memo: ''},
			{id: '13',modename: 'WEB交互接口',url: '',iconame: '',memo: ''},
			{id: '14',modename: 'AGI扩展接口',url: '',iconame: '',memo: ''},
			{id: '15',modename: '等待几秒',url: '',iconame: '',memo: ''},
			{id: '16',modename: '播放音调',url: '',iconame: '',memo: ''},
			{id: '17',modename: '读出数字字符',url: '',iconame: '',memo: ''},
			{id: '18',modename: '通道阀',url: '',iconame: '',memo: ''}
			
			];
			async.forEach(modes, function(item, callback) {
				Schemas['pbxIvrActMode'].create(item, function(err, inst) {
					callback(err, inst);
				});
			}, function(err, result) {
				cb(err, result);
			});
		},
		//设置系统默认路由
		setDefaultRoute: function(cb) {
			var routes = [{
				proirety: 1,
				routerline: 1,
				routername: '测试呼入1',
				optextra: '',
				callergroup: 'all',
				callerid: '', //匹配主叫以什么开头
				callerlen: -1, //匹配主叫长度
				callednum: '', //匹配被叫以什么开头
				calledlen: 3, //匹配被叫长度
				replacecallerid: '', //匹配后主叫替换
				replacecalledtrim: -1, //匹配后删除被叫前几位
				replacecalledappend: '', //匹配后补充被叫前几位
				processmode: 'diallocal',
				processdefined: ''
			},{
				proirety: 2,
				routerline: 1,
				routername: '测试呼入2',
				optextra: '',
				callergroup: 'all',
				callerid: '', //匹配主叫以什么开头
				callerlen: -1, //匹配主叫长度
				callednum: '200', //匹配被叫以什么开头
				calledlen: 6, //匹配被叫长度
				replacecallerid: '', //匹配后主叫替换
				replacecalledtrim: -1, //匹配后删除被叫前几位
				replacecalledappend: '', //匹配后补充被叫前几位
				processmode: 'diallocal',
				processdefined: ''
			},{
				proirety: 1,
				routerline: 2,
				routername: '测试呼出1',
				optextra: '',
				callergroup: 'all',
				callerid: '', //匹配主叫以什么开头
				callerlen: -1, //匹配主叫长度
				callednum: '9', //匹配被叫以什么开头
				calledlen: 12, //匹配被叫长度
				replacecallerid: '', //匹配后主叫替换
				replacecalledtrim: 1, //匹配后删除被叫前几位
				replacecalledappend: '', //匹配后补充被叫前几位
				processmode: 'dialout',
				processdefined: '1'
			},{
				proirety: 2,
				routerline: 2,
				routername: '测试呼出2',
				optextra: '',
				callergroup: 'all',
				callerid: '', //匹配主叫以什么开头
				callerlen: -1, //匹配主叫长度
				callednum: '0', //匹配被叫以什么开头
				calledlen: 12, //匹配被叫长度
				replacecallerid: '', //匹配后主叫替换
				replacecalledtrim: -1, //匹配后删除被叫前几位
				replacecalledappend: '', //匹配后补充被叫前几位
				processmode: 'dialout',
				processdefined: '2'
			},{
				proirety: 3,
				routerline: 2,
				routername: '测试呼出3',
				optextra: '',
				callergroup: 'all',
				callerid: '', //匹配主叫以什么开头
				callerlen: -1, //匹配主叫长度
				callednum: '', //匹配被叫以什么开头
				calledlen: 8, //匹配被叫长度
				replacecallerid: '', //匹配后主叫替换
				replacecalledtrim: -1, //匹配后删除被叫前几位
				replacecalledappend: '', //匹配后补充被叫前几位
				processmode: 'dialout',
				processdefined: '3'
			}];
			async.forEach(routes, function(item, callback) {
				Schemas['pbxRouter'].create(item, function(err, inst) {
					callback(err, inst);
				});
			}, function(err, result) {
				cb(err, result);
			});
		},
		//设置默认IVR动作
		setIvrActions: function(cb) {
				var actions = [
				{
					ivrnumber: '200',
					ordinal: 1,
					actmode: '18',
					args: 'trunkProto=DAHDI&max=3&donesth=channelMax&donenum='
				},
				{
					ivrnumber: '200',
					ordinal: 2,
					actmode: '1',
					args: 'interruptible=true&folder=custom&filename=welcome'
				}, {
					ivrnumber: '200',
					ordinal: 3,
					actmode: '5',
					args: 'maxdigits=3&addbefore=true&varname=testvar&beep=false'
				}, {
					ivrnumber: '200',
					ordinal: 4,
					actmode: '17',
					args: 'varname=testvar&digits='
				}, {
					ivrnumber: '200',
					ordinal: 5,
					actmode: '10',
					args: 'varname=testvar&digits=&dialway=diallocal'
				}, {
					ivrnumber: '200100',
					ordinal: 1,
					actmode: '10',
					args: 'varname=&digits=401&dialway=diallocal'
				}, {
					ivrnumber: '200200',
					ordinal: 1,
					actmode: '10',
					args: 'varname=&digits=402&dialway=diallocal'
				}];
				async.forEach(actions, function(item, callback) {
					Schemas['pbxIvrActions'].create(item, function(err, inst) {
						callback(err, inst);
					});
				}, function(err, result) {
					cb(err, result);
				});
			},
		//设置默认IVR按键输入
		setIvrInputs: function(cb, results) {
				var inputs = [{
					ivrnumber: '200',
					general: 0,
					generaltype: '1',
					generalargs: 'aaa',
					inputnum: '0',
					gotoivrnumber: '200',
					gotoivractid: 0
				}, {
					ivrnumber: '200',
					general: 0,
					generaltype: '1',
					generalargs: 'aaa',
					inputnum: '1',
					gotoivrnumber: '200100',
					gotoivractid: 0
				}, {
					ivrnumber: '200',
					general: 0,
					generaltype: '1',
					generalargs: 'aaa',
					inputnum: '2',
					gotoivrnumber: '200200',
					gotoivractid: 0
				}, {
					ivrnumber: '200',
					general: 0,
					generaltype: '1',
					generalargs: 'aaa',
					inputnum: '8',
					gotoivrnumber: '200',
					gotoivractid: 1
				}];
				async.forEach(inputs, function(item, callback) {
					Schemas['pbxIvrInputs'].create(item, function(err, inst) {
						callback(err, inst);
					});
				}, function(err, result) {
					cb(err, result);
				});
			},
			setDefaultExtensions:function(cb){
				var extensions=[
				{id:'8001',accountcode:'8001',password:'8001',deviceproto:'SIP',devicenumber:'8001',devicestring:'8001'},
				{id:'8002',accountcode:'8002',password:'8002',deviceproto:'SIP',devicenumber:'8002',devicestring:'8002'},
				{id:'8003',accountcode:'8003',password:'8003',deviceproto:'SIP',devicenumber:'8003',devicestring:'8003'},
				{id:'8004',accountcode:'8004',password:'8004',deviceproto:'SIP',devicenumber:'8004',devicestring:'8004'},
				{id:'8005',accountcode:'8005',password:'8005',deviceproto:'SIP',devicenumber:'8005',devicestring:'8005'},
				{id:'8006',accountcode:'8006',password:'8006',deviceproto:'SIP',devicenumber:'8006',devicestring:'8006'},
				{id:'8007',accountcode:'8007',password:'8007',deviceproto:'SIP',devicenumber:'8007',devicestring:'8007'},
				{id:'8008',accountcode:'8008',password:'8008',deviceproto:'SIP',devicenumber:'8008',devicestring:'8008'},
				{id:'8009',accountcode:'8009',password:'8009',deviceproto:'SIP',devicenumber:'8009',devicestring:'8009'},
				{id:'8010',accountcode:'8010',password:'8010',deviceproto:'SIP',devicenumber:'8010',devicestring:'8010'},
				{id:'8011',accountcode:'8011',password:'8011',deviceproto:'SIP',devicenumber:'8011',devicestring:'8011'},
				{id:'8012',accountcode:'8012',password:'8012',deviceproto:'SIP',devicenumber:'8012',devicestring:'8012'},
				{id:'8801',accountcode:'8801',password:'8801',deviceproto:'IAX2',devicenumber:'8801',devicestring:'8801'},
				{id:'8802',accountcode:'8802',password:'8802',deviceproto:'IAX2',devicenumber:'8802',devicestring:'8802'},
				{id:'8803',accountcode:'8803',password:'8803',deviceproto:'IAX2',devicenumber:'8803',devicestring:'8803'},
				{id:'8804',accountcode:'8804',password:'8804',deviceproto:'IAX2',devicenumber:'8804',devicestring:'8804'},
				{id:'8805',accountcode:'8805',password:'8805',deviceproto:'IAX2',devicenumber:'8805',devicestring:'8805'},
				{id:'8806',accountcode:'8806',password:'8806',deviceproto:'IAX2',devicenumber:'8806',devicestring:'8806'},
				{id:'8807',accountcode:'8807',password:'8807',deviceproto:'IAX2',devicenumber:'8807',devicestring:'8807'},
				{id:'8808',accountcode:'8808',password:'8808',deviceproto:'IAX2',devicenumber:'8808',devicestring:'8808'},
				{id:'8809',accountcode:'8809',password:'8809',deviceproto:'IAX2',devicenumber:'8809',devicestring:'8809'},
				{id:'8810',accountcode:'8810',password:'8810',deviceproto:'IAX2',devicenumber:'8810',devicestring:'8810'},
				{id:'8601',accountcode:'8601',password:'8601',deviceproto:'VIRTUAL',devicenumber:'8601',devicestring:'8601'}
				];
				async.forEach(extensions, function(item, callback) {
					Schemas['pbxExtension'].create(item, function(err, inst) {
						callback(err, inst);
					});
				}, function(err, result) {
					cb(err, result);
				});

			},
			setDefaultExtenGroup:function(cb){
				var groups=[{id:0,groupname:'技术支持组',memo:'技术支持组'},{id:1,groupname:'客户服务组',memo:'客户服务组'}];
				async.forEach(groups, function(item, callback) {
					Schemas['pbxExtenGroup'].create(item, function(err, inst) {
						callback(err, inst);
					});
				}, function(err, result) {
					cb(err, result);
				});

			},
			setDefaultExtenGroupRelations:function(cb){
				var groups=[{groupid:0,extenid:'8001'}
				,{groupid:0,extenid:'8002'}
				,{groupid:0,extenid:'8003'}
				,{groupid:0,extenid:'8004'}
				,{groupid:0,extenid:'8005'}
				,{groupid:1,extenid:'8001'}
				,{groupid:1,extenid:'8002'}
				,{groupid:1,extenid:'8003'}
				,{groupid:1,extenid:'8004'}
				,{groupid:1,extenid:'8005'}
				];
				async.forEach(groups, function(item, callback) {
					Schemas['pbxExtenGroupRelations'].create(item, function(err, inst) {
						callback(err, inst);
					});
				}, function(err, result) {
					cb(err, result);
				});

			},
			setDefaultQueues:function(cb){
					var queues=[
				{id:'401',queuename:'测试队列401',members:'8001,8002,8003,8801'},
				{id:'402',queuename:'测试队列402',members:'8001,8002,8003,8801'}
				];
				async.forEach(queues, function(item, callback) {
					Schemas['pbxQueue'].create(item, function(err, inst) {
						callback(err, inst);
					});
				}, function(err, result) {
					cb(err, result);
				});

			},
			setDefaultTrunk:function(cb){
				var trunks=[
				{id:'1',trunkname:'测试外线DAHDI',trunkproto:'DADHI',trunkdevice:'g0'},
				{id:'2',trunkname:'测试外线SIP',trunkproto:'SIP',trunkdevice:'testsip'},
				{id:'3',trunkname:'测试外线IAX2',trunkproto:'IAX2',trunkdevice:'testiax'}
				];
              async.forEach(trunks, function(item, callback) {
					Schemas['pbxTrunk'].create(item, function(err, inst) {
						callback(err, inst);
					});
				}, function(err, result) {
					cb(err, result);
				});
			},
			setDefaultLocalNumber:function(cb){
				var localnumbers=[
				{id:'8001',localtype:'extension',assign:'extenproto=SIP&timeout=60&transnum=&transway='},
				{id:'8002',localtype:'extension',assign:'extenproto=SIP&timeout=60&transnum=&transway='},
				{id:'8003',localtype:'extension',assign:'extenproto=SIP&timeout=60&transnum=200&transway=diallocal'},
				{id:'8004',localtype:'extension',assign:'extenproto=SIP&timeout=60&transnum=8001&transway=diallocal'},
				{id:'8802',localtype:'extension',assign:'extenproto=IAX2&timeout=60&transnum=&transway='},
				{id:'8801',localtype:'extension',assign:'extenproto=IAX2&timeout=60&transnum=&transway='},
				{id:'200',localtype:'ivr',assign:'0'},
				{id:'200100',localtype:'ivr',assign:'0'},
				{id:'200200',localtype:'ivr',assign:'0'},
				{id:'401',localtype:'queue',assign:'timeout=30&'},
				{id:'402',localtype:'queue',assign:'timeout=30&'},
				{id:'301',localtype:'conference',assign:'1'},
				{id:'302',localtype:'conference',assign:'1'},
				{id:'501',localtype:'pauseQueueMember',assign:'1'},
				{id:'502',localtype:'unPauseQueueMember',assign:'1'}
				];
				async.forEach(localnumbers, function(item, callback) {
					Schemas['pbxLocalNumber'].create(item, function(err, inst) {
						callback(err, inst);
					});
				}, function(err, result) {
					cb(err, result);
				});
			},
			setDefaultScreenPop:function(cb){
				var screepops=[
				{id:'8001'},
				{id:'8002'},
				{id:'8003'},
				{id:'8004'},
				{id:'8801'},
				{id:'8802'}
				];
				async.forEach(screepops, function(item, callback) {
					Schemas['pbxScreenPop'].create(item, function(err, inst) {
						callback(err, inst);
					});
				}, function(err, result) {
					cb(err, result);
				});
			},
			setDefaultConference:function(cb){
				var conference=[
				{id:'301',pincode:'301'},
				{id:'302',pincode:'302'}
				];
				async.forEach(conference, function(item, callback) {
					Schemas['pbxConference'].create(item, function(err, inst) {
						callback(err, inst);
					});
				}, function(err, result) {
					cb(err, result);
				});
			},
			setDefaultDepartments:function(cb){
				var depts=[
				{id:'1',depName:'技术部',memo:'负责产品开发及系统维护！'},
				{id:'2',depName:'市场部',memo:'负责市场开拓及销售！'},
				{id:'3',depName:'客服部',memo:'负责客服服务！'}
				];
				async.forEach(depts, function(item, callback) {
					Schemas['manageDepartments'].create(item, function(err, inst) {
						callback(err, inst);
					});
				}, function(err, result) {
					cb(err, result);
				});
			},
			setDefaultUserRole:function(cb){
				var roles=[
				{id:'0',roleName:'系统管理员',isAgent:1,memo:'拥有最大权限！'},
				{id:'1',roleName:'坐席员',isAgent:1,memo:'负责产品开发及系统维护！'},
				{id:'2',roleName:'销售员',isAgent:1,memo:'负责市场开拓及销售！'},
				{id:'3',roleName:'技术员',memo:'负责客服服务！'},
				{id:'4',roleName:'产品经理',memo:'负责客服服务！'},
				{id:'5',roleName:'销售经理',memo:'负责客服服务！'}
				];
				async.forEach(roles, function(item, callback) {
					Schemas['manageUserRole'].create(item, function(err, inst) {
						callback(err, inst);
					});
				}, function(err, result) {
					cb(err, result);
				});
			},
			/*setDefaultUserMenmus:function(cb){
				var umenmus=[{id:'0',roleid:'0',menmuid:''}];

			},*/
			setDefaultMenmus:function(cb){
				var menmus=[
				{id:'80',menName:'分机管理',mgID:8,menURL:'/pbx/Extension',iconName:'pc.png'},
				{id:'81',menName:'分机分组管理',mgID:8,menURL:'/pbx/ExtenGroup',iconName:'pc.png'},
                {id:'82',menName:'队列管理',mgID:8,menURL:'/pbx/Queue',iconName:'pc.png'},
                {id:'83',menName:'设备管理',mgID:8,menURL:'/pbx/Card',iconName:'pc.png'},
                {id:'84',menName:'中继管理',mgID:8,menURL:'/pbx/Trunk',iconName:'pc.png'},
                {id:'70',menName:'菜单管理',mgID:7,menURL:'/manage/Menmus',iconName:'pc.png'},
                {id:'71',menName:'菜单分组管理',mgID:7,menURL:'/manage/MenmuGroup',iconName:'pc.png'},
                {id:'72',menName:'用户管理',mgID:7,menURL:'/manage/UserInfo',iconName:'pc.png'},
                {id:'73',menName:'角色管理',mgID:7,menURL:'/manage/UserRole',iconName:'pc.png'},
                {id:'74',menName:'部门管理',mgID:7,menURL:'/manage/Departments',iconName:'pc.png'}
				];
				async.forEach(menmus, function(item, callback) {
					Schemas['manageMenmus'].create(item, function(err, inst) {
						callback(err, inst);
					});
				}, function(err, result) {
					cb(err, result);
				});

			},
			setDefaultUserInfo:function(cb){
				var crypto =require('crypto');
				var md5 = crypto.createHash('md5');
	            var hexpassword = md5.update('password').digest('hex').toUpperCase();
				var users=[
				{id:'0',uName:'系统管理员',uLogin:'admin',uPass:hexpassword,uExten:'8801',uPhone:'13588668866',readOnly:1,roleId:'0',depId:'1'},
				{id:'1',uName:'坐席员',uLogin:'agent',uPass:hexpassword,uExten:'8001',uPhone:'13588668866',roleId:'1',depId:'3'},
				{id:'2',uName:'销售员',uLogin:'sale',uPass:hexpassword,uExten:'8002',uPhone:'13588668866',roleId:'2',depId:'2'}
				];
				async.forEach(users, function(item, callback) {
					Schemas['manageUserInfo'].create(item, function(err, inst) {
						callback(err, inst);
					});
				}, function(err, result) {
					cb(err, result);
				});
			}

		
	}, function(err, results) {
		if (err) {
			res.send(err);
		} else {
			res.send({
				test: '1111'
			});
		}
	});


}
var Schemas = require('../database/schema').Schemas;
var guid = require('guid');
var async = require('async');

exports.get = function(req, res) {
	async.auto({
		//设置IVR默认列子
		setDefaultIvr: function(cb) {
		var ivr=[
		{id: '200',ivrname: '测试IVR200',description: '一个测试的IVR200'},
		{id: '200100',ivrname: '测试IVR200100',description: '一个测试的IVR200100'},
		{id: '200200',ivrname: '测试IVR200200',description: '一个测试的IVR200200'}
		];
		async.forEach(ivr, function(item, callback) {
					Schemas['PBXIvrMenmu'].create(item, function(err, inst) {
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
				Schemas['PBXIvrActMode'].create(item, function(err, inst) {
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
				Schemas['PBXRouter'].create(item, function(err, inst) {
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
					actmode: '1',
					args: 'interruptible=true&folder=custom&filename=welcome'
				}, {
					ivrnumber: '200',
					ordinal: 2,
					actmode: '5',
					args: 'maxdigits=3&addbefore=true&varname=testvar&beep=false'
				}, {
					ivrnumber: '200',
					ordinal: 3,
					actmode: '17',
					args: 'varname=testvar&digits='
				}, {
					ivrnumber: '200',
					ordinal: 4,
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
					Schemas['PBXIvrActions'].create(item, function(err, inst) {
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
					Schemas['PBXIvrInputs'].create(item, function(err, inst) {
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
				{id:'8801',accountcode:'8801',password:'8801',deviceproto:'IAX2',devicenumber:'8801',devicestring:'8801'}
				];
				async.forEach(extensions, function(item, callback) {
					Schemas['PBXExtension'].create(item, function(err, inst) {
						callback(err, inst);
					});
				}, function(err, result) {
					cb(err, result);
				});

			},
			setDefaultQueues:function(cb){
					var queues=[
				{id:'401',queuename:'测试队列401',members:'8001&8002&8003&8801'},
				{id:'402',queuename:'测试队列402',members:'8001&8002&8003&8801'}
				];
				async.forEach(queues, function(item, callback) {
					Schemas['PBXQueue'].create(item, function(err, inst) {
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
					Schemas['PBXTrunk'].create(item, function(err, inst) {
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
					Schemas['PBXLocalNumber'].create(item, function(err, inst) {
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
					Schemas['PBXScreenPop'].create(item, function(err, inst) {
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
					Schemas['PBXConference'].create(item, function(err, inst) {
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
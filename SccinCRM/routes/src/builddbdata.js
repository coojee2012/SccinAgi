var Schemas = require('../../database/schema').Schemas;
var guid = require('guid');
var async = require('async');

exports.get = function(req, res) {
	async.auto({
		//����IVRĬ������
		setDefaultIvr: function(cb) {
		var ivr=[
		{id: '200',ivrname: '����IVR200',description: 'һ�����Ե�IVR200'},
		{id: '200100',ivrname: '����IVR200100',description: 'һ�����Ե�IVR200100'},
		{id: '200200',ivrname: '����IVR200200',description: 'һ�����Ե�IVR200200'}
		];
		async.forEach(ivr, function(item, callback) {
					Schemas['PBXIvrMenmu'].create(item, function(err, inst) {
						callback(err, inst);
					});
				}, function(err, results) {
					cb(err, results);
				});
		},
		//����ϵͳĬ��IVR����ʽ
		setDefaultIvrMode: function(cb) {
			var modes = [
			{id: '1',modename: '��������',url: '',iconame: '',memo: ''}, 
			{id: '2',modename: '�����������',url: '',iconame: '',memo: ''},
			{id: '3',modename: '����¼��',url: '',iconame: '',memo: ''},
			{id: '4',modename: '����¼��',url: '',iconame: '',memo: ''},
			{id: '5',modename: '¼�������ַ�',url: '',iconame: '',memo: ''},
			{id: '6',modename: '���ַ�ʽ����',url: '',iconame: '',memo: ''},
			{id: '7',modename: '��������ʱ��',url: '',iconame: '',memo: ''}, 
			{id: '8',modename: '�������',url: '',iconame: '',memo: ''}, 
			{id: '9',modename: '���б任',url: '',iconame: '',memo: ''}, 
			{id: '10',modename: '�������',url: '',iconame: '',memo: ''},
			{id: '11',modename: '��ת����������',url: '',iconame: '',memo: ''},
			{id: '12',modename: '��ת��IVR�˵�',url: '',iconame: '',memo: ''},
			{id: '13',modename: 'WEB�����ӿ�',url: '',iconame: '',memo: ''},
			{id: '14',modename: 'AGI��չ�ӿ�',url: '',iconame: '',memo: ''},
			{id: '15',modename: '�ȴ�����',url: '',iconame: '',memo: ''},
			{id: '16',modename: '��������',url: '',iconame: '',memo: ''},
			{id: '17',modename: '���������ַ�',url: '',iconame: '',memo: ''},
			{id: '18',modename: 'ͨ����',url: '',iconame: '',memo: ''}
			
			];
			async.forEach(modes, function(item, callback) {
				Schemas['PBXIvrActMode'].create(item, function(err, inst) {
					callback(err, inst);
				});
			}, function(err, result) {
				cb(err, result);
			});
		},
		//����ϵͳĬ��·��
		setDefaultRoute: function(cb) {
			var routes = [{
				proirety: 1,
				routerline: 1,
				routername: '���Ժ���1',
				optextra: '',
				callergroup: 'all',
				callerid: '', //ƥ��������ʲô��ͷ
				callerlen: -1, //ƥ�����г���
				callednum: '', //ƥ�䱻����ʲô��ͷ
				calledlen: 3, //ƥ�䱻�г���
				replacecallerid: '', //ƥ��������滻
				replacecalledtrim: -1, //ƥ���ɾ������ǰ��λ
				replacecalledappend: '', //ƥ��󲹳䱻��ǰ��λ
				processmode: 'diallocal',
				processdefined: ''
			},{
				proirety: 2,
				routerline: 1,
				routername: '���Ժ���2',
				optextra: '',
				callergroup: 'all',
				callerid: '', //ƥ��������ʲô��ͷ
				callerlen: -1, //ƥ�����г���
				callednum: '200', //ƥ�䱻����ʲô��ͷ
				calledlen: 6, //ƥ�䱻�г���
				replacecallerid: '', //ƥ��������滻
				replacecalledtrim: -1, //ƥ���ɾ������ǰ��λ
				replacecalledappend: '', //ƥ��󲹳䱻��ǰ��λ
				processmode: 'diallocal',
				processdefined: ''
			},{
				proirety: 1,
				routerline: 2,
				routername: '���Ժ���1',
				optextra: '',
				callergroup: 'all',
				callerid: '', //ƥ��������ʲô��ͷ
				callerlen: -1, //ƥ�����г���
				callednum: '9', //ƥ�䱻����ʲô��ͷ
				calledlen: 12, //ƥ�䱻�г���
				replacecallerid: '', //ƥ��������滻
				replacecalledtrim: 1, //ƥ���ɾ������ǰ��λ
				replacecalledappend: '', //ƥ��󲹳䱻��ǰ��λ
				processmode: 'dialout',
				processdefined: '1'
			},{
				proirety: 2,
				routerline: 2,
				routername: '���Ժ���2',
				optextra: '',
				callergroup: 'all',
				callerid: '', //ƥ��������ʲô��ͷ
				callerlen: -1, //ƥ�����г���
				callednum: '0', //ƥ�䱻����ʲô��ͷ
				calledlen: 12, //ƥ�䱻�г���
				replacecallerid: '', //ƥ��������滻
				replacecalledtrim: -1, //ƥ���ɾ������ǰ��λ
				replacecalledappend: '', //ƥ��󲹳䱻��ǰ��λ
				processmode: 'dialout',
				processdefined: '2'
			},{
				proirety: 3,
				routerline: 2,
				routername: '���Ժ���3',
				optextra: '',
				callergroup: 'all',
				callerid: '', //ƥ��������ʲô��ͷ
				callerlen: -1, //ƥ�����г���
				callednum: '', //ƥ�䱻����ʲô��ͷ
				calledlen: 8, //ƥ�䱻�г���
				replacecallerid: '', //ƥ��������滻
				replacecalledtrim: -1, //ƥ���ɾ������ǰ��λ
				replacecalledappend: '', //ƥ��󲹳䱻��ǰ��λ
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
		//����Ĭ��IVR����
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
					Schemas['PBXIvrActions'].create(item, function(err, inst) {
						callback(err, inst);
					});
				}, function(err, result) {
					cb(err, result);
				});
			},
		//����Ĭ��IVR��������
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
					Schemas['PBXExtension'].create(item, function(err, inst) {
						callback(err, inst);
					});
				}, function(err, result) {
					cb(err, result);
				});

			},
			setDefaultQueues:function(cb){
					var queues=[
				{id:'401',queuename:'���Զ���401',members:'8001&8002&8003&8801'},
				{id:'402',queuename:'���Զ���402',members:'8001&8002&8003&8801'}
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
				{id:'1',trunkname:'��������DAHDI',trunkproto:'DADHI',trunkdevice:'g0'},
				{id:'2',trunkname:'��������SIP',trunkproto:'SIP',trunkdevice:'testsip'},
				{id:'3',trunkname:'��������IAX2',trunkproto:'IAX2',trunkdevice:'testiax'}
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
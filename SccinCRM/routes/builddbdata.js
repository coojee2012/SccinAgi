var Schemas = require('../database/schema').Schemas;
var guid = require('guid');
var async = require('async');

exports.get = function(req, res) {
	async.auto({
		SetDefaultIvr: function(cb) {
			Schemas['PBXIvrMenmu'].create({
				id: '200',
				ivrname: '测试IVR',
				description: '一个测试的IVR'
			}, function(err, ivrmenmu) {
				cb(err, ivrmenmu);
			});
		},
		SetDefaultIvrMode: function(cb) {
			var modes = [{
				id: '1',
				modename: '播放语音',
				url: '',
				iconame: '',
				memo: ''
			}, {
				id: '2',
				modename: '播放语音',
				url: '',
				iconame: '',
				memo: ''
			}, {
				id: '3',
				modename: '播放语音',
				url: '',
				iconame: '',
				memo: ''
			}, {
				id: '4',
				modename: '播放语音',
				url: '',
				iconame: '',
				memo: ''
			}, {
				id: '5',
				modename: '录制数字字符',
				url: '',
				iconame: '',
				memo: ''
			}, {
				id: '6',
				modename: '播放语音',
				url: '',
				iconame: '',
				memo: ''
			}, {
				id: '7',
				modename: '播放语音',
				url: '',
				iconame: '',
				memo: ''
			}, {
				id: '8',
				modename: '播放语音',
				url: '',
				iconame: '',
				memo: ''
			}, {
				id: '9',
				modename: '播放语音',
				url: '',
				iconame: '',
				memo: ''
			}, {
				id: '10',
				modename: '播放语音',
				url: '',
				iconame: '',
				memo: ''
			}];
			async.forEach(modes, function(item, callback) {
				Schemas['PBXIvrActMode'].create(item, function(err, inst) {
					callback(err, inst);
				});
			}, function(err, result) {
				cb(err, result);
			});
		},
		SetDefaultRoute: function(cb) {
			var routes = [{
				proirety: 1,
				routerline: 1,
				routername: '测试呼入1',
				optextra: '',
				callergroup: 'all',
				callerid: '', //匹配主叫以什么开头
				callerlen: -1, //匹配主叫长度
				callednum: '200', //匹配被叫以什么开头
				calledlen: 3, //匹配被叫长度
				replacecallerid: '', //匹配后主叫替换
				replacecalledtrim: -1, //匹配后删除被叫前几位
				replacecalledappend: '', //匹配后补充被叫前几位
				processmode: 'diallocal',
				processdefined: '200'
			},{
				proirety: 2,
				routerline: 1,
				routername: '测试呼入2',
				optextra: '',
				callergroup: 'all',
				callerid: '', //匹配主叫以什么开头
				callerlen: -1, //匹配主叫长度
				callednum: '300', //匹配被叫以什么开头
				calledlen: 3, //匹配被叫长度
				replacecallerid: '', //匹配后主叫替换
				replacecalledtrim: -1, //匹配后删除被叫前几位
				replacecalledappend: '', //匹配后补充被叫前几位
				processmode: 'diallocal',
				processdefined: '300'
			},{
				proirety: 1,
				routerline: 2,
				routername: '测试呼出1',
				optextra: '',
				callergroup: 'all',
				callerid: '', //匹配主叫以什么开头
				callerlen: -1, //匹配主叫长度
				callednum: '9', //匹配被叫以什么开头
				calledlen: 11, //匹配被叫长度
				replacecallerid: '', //匹配后主叫替换
				replacecalledtrim: 1, //匹配后删除被叫前几位
				replacecalledappend: '', //匹配后补充被叫前几位
				processmode: 'dialout',
				processdefined: ''
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
				processdefined: ''
			}];
			async.forEach(routes, function(item, callback) {
				Schemas['PBXRouter'].create(item, function(err, inst) {
					callback(err, inst);
				});
			}, function(err, result) {
				cb(err, result);
			});
		},
		SetIvrActions: ['SetDefaultIvr',
			function(cb, results) {
				var actions = [{
					ivrnumber: results.SetDefaultIvr.id,
					ordinal: 1,
					actmode: '1',
					args: 'interruptible=true&folder=cn&filename=test'
				}, {
					ivrnumber: results.SetDefaultIvr.id,
					ordinal: 2,
					actmode: '1',
					args: 'interruptible=true&folder=cn&filename=test'
				}, {
					ivrnumber: results.SetDefaultIvr.id,
					ordinal: 3,
					actmode: '1',
					args: 'interruptible=true&folder=cn&filename=test'
				}, {
					ivrnumber: results.SetDefaultIvr.id,
					ordinal: 4,
					actmode: '1',
					args: 'interruptible=true&folder=cn&filename=test'
				}];
				async.forEach(actions, function(item, callback) {
					Schemas['PBXIvrActions'].create(item, function(err, inst) {
						callback(err, inst);
					});
				}, function(err, result) {
					cb(err, result);
				});
			}
		],
		SetIvrInputs: ['SetDefaultIvr',
			function(cb, results) {
				var inputs = [{
					ivrnumber: results.SetDefaultIvr.id,
					general: 0,
					generaltype: '1',
					generalargs: 'aaa',
					inputnum: '0',
					gotoivrnumber: '200',
					gotoivractid: 0
				}, {
					ivrnumber: results.SetDefaultIvr.id,
					general: 0,
					generaltype: '1',
					generalargs: 'aaa',
					inputnum: '1',
					gotoivrnumber: '200',
					gotoivractid: 0
				}, {
					ivrnumber: results.SetDefaultIvr.id,
					general: 0,
					generaltype: '1',
					generalargs: 'aaa',
					inputnum: '2',
					gotoivrnumber: '200',
					gotoivractid: 0
				}];
				async.forEach(inputs, function(item, callback) {
					Schemas['PBXIvrInputs'].create(item, function(err, inst) {
						callback(err, inst);
					});
				}, function(err, result) {
					cb(err, result);
				});
			}
		]
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
var conf = require('node-conf');
var basedir = conf.load('app').appbase;

var nami = require(basedir + '/asterisk/asmanager').nami,
	util = require('util'),
	async = require('async'),
	AsAction = require("nami").Actions;

var Schemas = require(basedir + '/database/schema').Schemas;
var guid = require('guid');
var logger = require(basedir + '/lib/logger').logger('web');

var gets = {};
var posts = {};
module.exports = {
	get: gets,
	post: posts
};


posts.sippeers = function(req, res, next) {
	nami.send(new AsAction.SipPeers(), function(response) {
		console.log(response);
		//res.render('nami/index', { title: 'NAMI测试',response:util.inspect(response,true,null) });
		res.send(response);

	});
}

posts.ping = function(req, res, next) {
	nami.send(new AsAction.Ping(), function(response) {
		console.log(response);
		//res.render('nami/index', { title: 'NAMI测试',response:util.inspect(response,true,null) });
		res.send(response);

	});
}

posts.hangup = function(req, res, next) {
	var action = new AsAction.Hangup();
	action.Channel = 'sip/abcd';
	nami.send(action, function(response) {
		console.log(response);
		//res.render('nami/index', { title: 'NAMI测试',response:util.inspect(response,true,null) });
		res.send(response);

	});
}

posts.status = function(req, res, next) {
	var action = new AsAction.Status();
	//Status.Channel='sip/abcd';
	nami.send(action, function(response) {
		console.log(response);
		//res.render('nami/index', { title: 'NAMI测试',response:util.inspect(response,true,null) });
		res.send(response);

	});
}

posts.command = function(req, res, next) {
	var cmd = req.body['cmd'] || req.query['cmd'];
	var action = new AsAction.Command();
	action.Command = cmd;
	nami.send(action, function(response) {
		console.log(response);
		//res.render('nami/index', { title: 'NAMI测试',response:util.inspect(response,true,null) });
		res.send(response);

	});
}

posts.extensionstate = function(req, res, next) {
	var exten = req.body['exten'] || req.query['exten'];
	var context = req.body['context'] || req.query['context'];
	var action = new AsAction.ExtensionState();
	action.Exten = exten;
	action.Context = context
	nami.send(action, function(response) {
		console.log(response);
		//res.render('nami/index', { title: 'NAMI测试',response:util.inspect(response,true,null) });
		res.send(response);

	});
}

posts.getconfig = function(req, res, next) {
	var filename = req.body['filename'] || req.query['filename'];
	var category = req.body['category'] || req.query['category'];
	var action = new AsAction.GetConfig();
	action.Filename = filename;
	action.Category = category
	nami.send(action, function(response) {
		console.log(response);
		//res.render('nami/index', { title: 'NAMI测试',response:util.inspect(response,true,null) });
		res.send(response);

	});
}

posts.createconfig = function(req, res, next) {
	var filename = req.body['filename'] || req.query['filename'];
	var action = new AsAction.CreateConfig();
	action.Filename = filename;

	nami.send(action, function(response) {
		console.log(response);
		//res.render('nami/index', { title: 'NAMI测试',response:util.inspect(response,true,null) });
		res.send(response);

	});
}

posts.getconfigjson = function(req, res, next) {
	var filename = req.body['filename'] || req.query['filename'];
	var action = new AsAction.GetConfigJson();
	action.Filename = filename;

	nami.send(action, function(response) {
		console.log(response);
		//res.render('nami/index', { title: 'NAMI测试',response:util.inspect(response,true,null) });
		res.send(response);

	});
}

posts.DAHDIShowChannels = function(req, res, next) {
	var action = new AsAction.DahdiShowChannels();
	nami.send(action, function(response) {
		console.log(response);
		res.send(response);
	});
}

posts.coreshowchannels = function(req, res, next) {
	var action = new AsAction.CoreShowChannels();
	nami.send(action, function(response) {
		console.log(response);
		//res.render('nami/index', { title: 'NAMI测试',response:util.inspect(response,true,null) });
		res.send(response);

	});
}

posts.hangupexten = function(req, res, next) {
	var exten = req.body['exten'] || req.query['exten'];
	var type = req.body['type'] || req.query['type'];
	if (!type) {
		type = 'SIP';
	}
	getconnectchannel(type, exten, function(channels) {
		console.log(channels);
		var action = new AsAction.Hangup();
		action.Channel = channels.src;
		nami.send(action, function(response) {
			res.send(response);
		});
	});
}

posts.transfer = function(req, res, next) {
	var extenfrom = req.body['extenfrom'] || req.query['extenfrom'];
	var extento = req.body['extento'] || req.query['extento'];
	var fromtype = req.body['fromtype'] || req.query['fromtype'];
	if (!fromtype) {
		fromtype = 'SIP';
	}

	getconnectchannel(fromtype, extenfrom, function(channels) {
		var action = new AsAction.Redirect();
		action.Channel = channels.src;
		action.Exten = extento;
		action.Context = 'from-exten-sip';
		nami.send(action, function(response) {
			res.send(response);
		});
	});

}
/**
 * Originate Action
 * @constructor
 * @see Action(String)
 * @see See <a href="https://wiki.asterisk.org/wiki/display/AST/ManagerAction_Originate">https://wiki.asterisk.org/wiki/display/AST/ManagerAction_Originate</a>.
 * @property {String} Channel Channel
 * @property {String} Exten Exten
 * @property {String} Priority Priority
 * @property {String} Application Application
 * @property {String} Data Data
 * @property {String} Timeout Timeout
 * @property {String} CallerID CallerID
 * @property {String} Account Account
 * @property {String} Async Async
 * @property {String} Codecs Codecs
 * @augments Action
 */
posts.dialout = function(req, res, next) {
	var variable = req.body['variable'] || req.query['variable'];
	var outnumber = req.body['outnumber'] || req.query['outnumber'];
	var exten = req.body['exten'] || req.query['exten'];

	var Variable = "CHANNEL(language)=cn,FRI2_OUTGOING_MEMBERID=1,POPTYPE=" + variable;
	var channel = "LOCAL/" + outnumber + "@sub-outgoing";
	var Context = 'sub-outgoing-callback';
	//var Context='app-exten';
	var action = new AsAction.Originate();
	action.Channel = channel;
	//action.Timeout=30;
	action.Async = true;
	action.Account = exten;
	action.CallerID = exten;
	action.Context = Context;
	action.Exten = exten;
	console.log(action);
	if (nami.connected) {
		nami.send(action, function(response) {
			res.send(response);
		});
	} else {
		res.send({
			Response: 'NotConnected'
		});

	}

}

/**
 *  自动拨打专家
 *
 *
 **/
posts.autodial = function(req, res, next) {
	//res.set('Access-Control-Allow-Origin', '*');
	//res.header('Access-Control-Allow-Origin', '*')
	var Userkey=req.get('User-key');
	var UserAgent=req.get('User-Agent');
	console.log('获取到的头信息：',Userkey,UserAgent);
	res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
	var CallInfoID = req.body['CallInfoID'];
	var NoticeContent = req.body['NoticeContent'];
	var SureContent = req.body['SureContent'];
	var QueryContent = req.body['QueryContent'];
	var Phones = req.body['Phones'];
	var KeyNum = req.body['KeyNum'];

	if (!CallInfoID || CallInfoID == "") {
		res.send({
			"success": false,
			"result": '抽取编号不能为空'
		});
		return;
	}

	if (!NoticeContent || NoticeContent == "") {
		res.send({
			"success": false,
			"result": '合成通知评标专家语音类容不能为空'
		});
		return;
	}

	if (!SureContent || SureContent == "") {
		res.send({
			"success": false,
			"result": '合成确认参加评标提示语音类容不能为空'
		});
		return;
	}

	if (!QueryContent || QueryContent == "") {
		res.send({
			"success": false,
			"result": '合成自动查询语音类容不能为空'
		});
		return;
	}


	if (!Phones || Phones == "") {
		res.send({
			"success": false,
			"result": '拨打电话不能为空'
		});
		return;
	}


	async.auto({
		//保存初始化数据到拨打记录表
		addCallRecords: function(callback) {
			try {
				Schemas['crmCallRecords'].create({
					id: guid.create(),
					CallInfoID: CallInfoID
				}, function(err, callrecord) {
					callback(err, callrecord);
				});
			} catch (ex) {
				callback(ex, null);
			}
		},
		//保存初始化数据到语音内容表
		addVoiceContent: ['addCallRecords',
			function(callback, results) {
				try {
					Schemas['crmVoiceContent'].create({
						Contents: NoticeContent,
						callrecord: results.addCallRecords
					}, function(err, inst) {
						callback(err, inst);
					});
				} catch (ex) {
					callback(ex, null);
				}
			}
		],
		//保存初始化数据到拨打电话表
		addCallPhone: ['addCallRecords',
			function(callback, results) {
				var phones = Phones.split(',');
				var count = 0;
				async.whilst(
					function() {
						return count < phones.length;
					},
					function(cb) {

						count++;
						Schemas['crmCallPhone'].create({
							id: guid.create(),
							Phone: phones[count - 1],
							PhoneSequ: count - 1,
							callrecord: results.addCallRecords
						}, function(err, inst) {
							cb(err, inst);
						});
					},
					function(err, results) {
						callback(err, results);

					}
				);


			}
		],
		//保存初始化数据到拨打结果表
		addDialResult: ['addCallRecords',
			function(callback, results) {
				Schemas['crmDialResult'].create({
					CallInfoID: CallInfoID,
					callrecord: results.addCallRecords
				}, function(err, inst) {
					callback(err, inst);
				});
			}
		],
		//合成通知语音
		voiceMixNotice: ['addCallRecords',
			function(callback, results) {
				//处理语音合成
				//合成的语音文件名字  results.addCallRecords.id + -notice.wav
				var exec = require('child_process').exec,
					last = exec('dir', function(error, stdout, stderr) {
						callback(error, stdout);
					});
			}
		],
		//合成确认语音
		voiceMixSure: ['addCallRecords',
			function(callback, results) {
				//处理语音合成
				//合成的语音文件名字  results.addCallRecords.id + -sure.wav
				var exec = require('child_process').exec,
					last = exec('dir', function(error, stdout, stderr) {
						callback(error, stdout);
					});
			}
		],
		//合成查询语音
		voiceMixQuery: ['addCallRecords',
			function(callback, results) {
				//处理语音合成
				//合成的语音文件名字  results.addCallRecords.id + -query.wav
				var exec = require('child_process').exec,
					last = exec('dir', function(error, stdout, stderr) {
						callback(error, stdout);
					});
			}
		],
		//更新合成状态
		updateVoiceContent: ['voiceMixNotice', 'voiceMixSure', 'voiceMixQuery', 'addVoiceContent',
			function(callback, results) {
				try{
				var voc = new Schemas['crmVoiceContent'](results.addVoiceContent);
				voc.State = 1;
				voc.save(function(err, inst) {
					callback(err, inst);
				});
			}catch(ex){
				callback('更新合成状态时发生错误！', null);
			}

			}
		],
		//开始拨打
		callDial: ['updateVoiceContent',
			function(callback, results) {
				//var Variable = "CHANNEL(language)=cn,Content=" + Content + "CallInfoID=" + CallInfoID;
				var channel = "LOCAL/" + 200 + "@sub-outgoing";
				var Context = 'sub-outgoing-callback';
				//var Context='app-exten';
				var action = new AsAction.Originate();
				action.Channel = channel;
				//action.Timeout=30;
				action.Async = true;
				action.Account = results.addCallRecords.id;
				action.CallerID = 200;
				action.Context = Context;
				action.Variable = 'callrecordid=' + results.addCallRecords.id + ',keynum=' + KeyNum;
				action.Exten = 200;
				if (nami.connected) {
					nami.send(action, function(response) {
						callback(null, response);
					});
				} else {
					callback('无法连接到语音服务器！', null);

				}
			}
		]

	}, function(err, results) {

		if (err) {
			var errmsg = "";
			if (typeof(err) === 'object') {
				errmsg += err.TypeError;
			}else{
				errmsg=err;
			}
			res.send({
				"success": false,
				"result": "服务器发生内部异常:"+errmsg+",请联系系统管理员！"
			});
		} else {
			res.send({
				"success": true,
				"result": "调用成功！"
			});
		}

	});



}



posts.getresult = function(req, res, next) {
	res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
	var CallInfoID = req.body['CallInfoID'];
	if (!CallInfoID || CallInfoID == "") {
		res.send({
			"success": false,
			"result": '抽取编号不能为空'
		});
		return;
	}
	Schemas['crmDialResult'].findOne({
		where: {
			CallInfoID: CallInfoID
		}
	}, function(err, inst) {
		if (err) {
			res.send({
				"success": false,
				"result": '获取拨打结果时服务器发生异常'
			});
		} else if (inst == null) {
			res.send({
				"success": false,
				"result": '在服务器上没有找到该数据'
			});
		} else {
			res.send({
				"success": true,
				"result": "" + inst.Result + ""
			});
		}


	});

}

posts.packCall = function(req, res, next) {
	var exten = req.body['exten'] || req.query['exten'];
	var type = req.body['type'] || req.query['type'];
	if (!type) {
		type = 'SIP';
	}
	var timeout = req.body['timeout'] || req.query['timeout'];
	getconnectchannel(type, exten, function(channels) {
		console.log(channels);
		var action = new AsAction.Park();
		action.Channel2 = channels.src;
		action.Channel = channels.dst;
		action.Timeout = 120000;
		nami.send(action, function(response) {
			res.send(response);
		});
	});
}

posts.unPark = function(req, res, next) {
	var exten = req.body['exten'] || req.query['exten'];
	var type = req.body['type'] || req.query['type'];
	if (!type) {
		type = 'SIP';
	}
	parkCalls(function(response) {
		if (response.Response === 'Success' || response.response === 'Success') {

			if (response.events != null && response.events.length > 0) {
				for (var ii = 0; ii < response.events.length; ii++) {
					var fromexten = response.events[ii].from;
					var re = new RegExp(type + "/" + exten, "g");
					if (fromexten.match(re)) {
						var channel = response.events[ii].channel;
						var action = new AsAction.Redirect();
						action.Channel = channel;
						action.Exten = exten;
						action.Context = 'app-exten';
						nami.send(action, function(response) {
							res.send(response);
						});
						break;
					}
				}

			} else {
				res.send({
					response: 'Error',
					Msg: '当前没有被保持的通话！'
				});
			}

		} else {
			res.send(response);
		}
	});
}

posts.checkService = function(req, res, next) {
	var exten = req.body['exten'] || req.query['exten'];
	var type = req.body['type'] || req.query['type'];
	if (!type) {
		type = 'SIP';
	}
	getconnectchannel(type, exten, function(channels) {
		var action = new AsAction.Redirect();
		action.Channel = channels.src;
		action.Exten = exten;
		action.Context = 'checkservice';
		nami.send(action, function(response) {
			res.send(response);
		});
	});

}

posts.GetCallInfo = function(req, res, next) {
	var exten = req.body['fromexten'] || req.query['fromexten'];
	if (exten == null || exten == '') {
		res.send({
			success: '0'
		});
	} else {
		var calleventDB = require('../modules/ippbx/callevent.js');
		calleventDB.findOne({
			where: {
				extensionnumber: exten
			}
		}, function(err, inst) {
			if (err || inst == null)
				res.send({
					success: '0'
				});
			else {
				var resjson = {};
				if (inst.status == "waite") {

					resjson.success = 1;
					if (inst.routerdype == "2") {

						resjson.caller = inst.callednumber;
						resjson.called = inst.callernumber;
					} else {
						resjson.caller = inst.callernumber;
						resjson.called = inst.callednumber;
					}


					resjson.unid = inst.uid;
					resjson.poptype = inst.poptype;
					resjson.callid = inst.callid;

					inst.status = "over";
					inst.poptype = "";
					calleventDB.updateOrCreate(inst, function(err, inst2) {
						if (err)
							res.send({
								success: '0'
							});
						else {
							res.send(resjson);
						}
					});

				} else {
					res.send({
						success: '0'
					});
				}
			}
		});
	}

}

posts.DadOn = function(req, res, next) {
	var exten = req.body['exten'] || req.query['exten'];
	var type = req.body['type'] || req.query['type'];
	var extDB = require('../modules/ippbx/extension.js');

	try {
		extDB.all({
			where: {
				accountcode: exten
			}
		}, function(err, dbs) {
			if (err) {
				res.send({
					Response: 'Error',
					Msg: '获取分机号失败!'
				});
				return;
			}
			console.log(dbs);
			if (dbs != null) {
				var ext = dbs[0];
				if (ext.dndinfo === 'on') {
					ext.dndinfo = 'off';
				} else {
					ext.dndinfo = 'on';
				}
				extDB.updateOrCreate(ext, function(err, inst) {
					if (err) {
						res.send({
							Response: 'Error',
							Msg: '更新状态失败!'
						});
					} else {
						res.send({
							Response: 'Success',
							Msg: '操作成功!'
						});

					}
				});
			} else {

				res.send({
					Response: 'Error',
					Msg: '没有找到分机号,' + exten
				});
			}

		});
	} catch (e) {
		res.send({
			Response: 'Error',
			Msg: e
		});
	}

}

function parkCalls(cb) {
	var action = new AsAction.ParkedCalls();
	nami.send(action, function(response) {
		cb(response);
	});
}

function getconnectchannel(type, exten, cb) {
	var src = '';
	var dst = '';
	var result = {
		src: src,
		dst: dst
	};
	//var re = eval('/'+exten+'/g');
	var parent = "^" + type + '\\/' + exten;

	var re = new RegExp(parent, "gi");
	console.log(re);
	var action = new AsAction.CoreShowChannels();
	nami.send(action, function(response) {
		if (response.response == 'Success') {

			for (var i in response.events) {
				//console.log("测试：");
				//console.log(response.events[i]);
				if (re.exec(response.events[i].channel) || response.events[i].accountcode == exten) {
					src = response.events[i].channel;
					dst = response.events[i].bridgedchannel;
					break;
				}
			}
		}

		cb({
			src: src,
			dst: dst
		});
	});


}

function safekey(userkey){
	var crypto = require('crypto');
    var fs = require('fs');
    
}
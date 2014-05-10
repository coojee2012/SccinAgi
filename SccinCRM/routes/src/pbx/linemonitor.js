var path = require("path");
var guid = require('guid');
var conf = require('node-conf').load('app');
var basedir = conf.appbase;
var Schemas = require(basedir + '/database/schema').Schemas;
var moment = require('moment');
var async = require('async');
var logger = require(basedir + '/lib/logger').logger('web');
var fs = require("fs");
var nami = require(basedir + '/asterisk/asmanager').nami,
	util = require('util'),
	AsAction = require("nami").Actions;

var gets = {};
var posts = {};
module.exports = {
	get: gets,
	post: posts
};

//ajax验证函数集合
var checkFun = {};

//列表显示
gets.index = function(req, res, next, baseurl) {
	res.render('pbx/linemonitor/list.html', {
		baseurl: baseurl,
		modename: 'pbxTrunk'
	});
}

posts.getspaninfo = function(req, res, next, baseurl) {
	async.auto({
		getspans: function(cb) {
			var cmd = 'pri show spans';
			var action = new AsAction.Command();
			action.Command = cmd;
			nami.send(action, function(response) {
				//logger.debug(response);
				var lines = [];
				var pris = [];
				if (response.response.toUpperCase() == 'FOLLOWS') {
					lines = response.lines;
				}
				if (lines.length > 0) {
					pris = lines[lines.length - 1].split('\n');
				}
				//pris.shift();
				//pris.shift();
				pris.pop();
				//logger.debug(pris);
				spansarray(pris, cb);


			});

		},
		getspan: ['getspans',
			function(cb, results) {
				cb(null, null);
			}
		]
	}, function(err, results) {
		if (err)
			res.send({
				success: "ERROR",
				msg: "获取语音卡信息失败！"
			});
		else
			res.send({
				success: "OK",
				data: results.getspans
			});
	});
}

posts.reloadpri = function(req, res, next, baseurl) {
	var cmd = 'dahdi  restart';
	var action = new AsAction.Command();
	action.Command = cmd;
	nami.send(action, function(response) {
		//logger.debug(response);
		var lines = [];
		var pris = [];
		if (response.response.toUpperCase() == 'FOLLOWS') {
			res.send({
				success: "OK",
				msg: "重启语音卡成功！"
			});
		} else {
			res.send({
				success: "ERROR",
				msg: "重启语音卡失败！"
			});
		}



	});
}

posts.bytable = function(req, res, next, baseurl) {


	async.auto({
		gettrunks: function(cb) {
			Schemas.pbxTrunk.all({}, function(err, dbs) {
				cb(err, dbs);
			});
		},
		getpris: function(cb) {
			var cmd = 'pri show channels';
			var action = new AsAction.Command();
			action.Command = cmd;
			nami.send(action, function(response) {
				//console.log(response);
				var lines = [];
				var pris = [];
				if (response.response.toUpperCase() == 'FOLLOWS') {
					lines = response.lines;
				}
				if (lines.length > 0) {
					pris = lines[lines.length - 1].split('\n');
				}
				pris.shift();
				pris.shift();
				pris.pop();
				//logger.debug(pris);
				priarray(pris, cb);

			});
		}

	}, function(err, results) {
		if (err)
			next(err);
		else {
			var output = {};
			output.aaData = results.getpris;
			res.send(output);
		}
	});
}

function spansarray(spans, cb) {
	var res = [];
	async.eachSeries(spans, function(item, callback) {
		var tmparr = item.replace(/PRI\s+span\s+/, "").replace(/\/\d+/, "").split(/\:/);
		var obj = {};
		obj.span = tmparr[0];
		obj.status = tmparr[1];

		spanarray(obj.span, function(count) {
			obj.total = 30;
			obj.used = count;
			//logger.debug(obj);
			res.push(obj);
			callback();
		});

	}, function(err) {
		cb(err, res);
	});
}

function spanarray(span, cb) {
	var cmd = 'pri show span ' + span;
	var action = new AsAction.Command();
	action.Command = cmd;
	nami.send(action, function(response) {
		//logger.debug(response);
		var lines = [];
		var pris = [];
		if (response.response.toUpperCase() == 'FOLLOWS') {
			lines = response.lines;
		}
		if (lines.length > 0) {
			pris = lines[lines.length - 1];
		}
		var count = 0;
		if (/active-calls:(\d+)/.test(pris)) {
			count = RegExp.$1;
		}
		//logger.debug(pris,count);
		//spansarray(pris, cb);
		cb(count);
	});
}

function priarray(pris, cb) {
	var res = [];
	var dialstatus = {};
	dialstatus.Idle = "空闲";
	dialstatus.Proceeding = "拨号中";
	dialstatus.Alerting = "响铃中";
	dialstatus.Connect = "通话中";

	async.eachSeries(pris, function(item, callback) {
		var tmparr = item.replace(/^\s+/, '').split(/\s+/);
		//logger.debug(tmparr);
		var obj = {};
		obj.trunkname = "Span-" + tmparr[0];
		obj.chan = tmparr[1];
		obj.bchan = tmparr[2] == "Yes" ? "是" : "否";
		obj.idle = tmparr[3] == "Yes" ? "可用" : "忙碌";
		if (dialstatus[tmparr[4]]) {
			obj.level = dialstatus[tmparr[4]];
		} else {
			obj.level = tmparr[4];
		}

		obj.busy = tmparr[5] == "Yes" ? "是" : "否";
		obj.channame = tmparr[6];
		res.push(obj);
		callback();
	}, function(err) {
		cb(err, res);
	});
}
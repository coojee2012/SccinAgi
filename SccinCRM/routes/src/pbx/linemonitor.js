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

posts.bytable = function(req, res, next, baseurl) {


	async.auto({
		gettrunks: function(cb) {
			cb(null, null);
		},
		getpris: function(cb) {
			var cmd = 'pri show channels';
			var action = new AsAction.Command();
			action.Command = cmd;
			nami.send(action, function(response) {
				//console.log(response);
				var lines = [];
				var pris = [];
				if (response.response == 'Follows') {
					lines = response.lines;
				}
				if (lines.length > 0) {
					pris = lines[lines.length - 1].split('\n');
				}
				pris.shift();
				pris.shift();
				pris.pop();
				logger.debug(pris);
				priarray(pris,cb);

			});
		}

	}, function(err, results) {
		res.send(results.getpris);
	});

}


function priarray(pris,cb){
	var res=[];
	async.eachSeries(pris, function(item, callback) {
var tmparr=item.replace(/^\s+/,'').replace(/\s+$/,'').split(/\s+/);
logger.debug(tmparr);
callback();
				}, function(err) {
cb(null, pris);
				});
				
}
var async = require('async');
var logger = require('./lib/logger').logger('web');
var moment = require('moment');
var dirname = __dirname;
var conf = require('node-conf');
var appconf = conf.load('app');
var SRCFILE = appconf.debug ? 'src' : 'build';
var path = require('path');
var dbdir = dirname + '/modules/' + SRCFILE + '/';

var t = setInterval(function() {
	var nowtime = moment().subtract('seconds', 30).format("YYYY-MM-DD HH:mm:ss");
	async.auto({
		axeDialrsult: function(cb) {
			var Schemas=require(dbdir+'crm/DialResult');
			Schemas.update({
				where: {
					WorkTime: {
						'lt': nowtime
					},
					Result: -1
				},
				update: {
					Result: 4
				}
			}, function(err, updates) {
				logger.debug('这个是奶妈程序的输出:',updates);
				cb(err, updates);
			})
		}
	}, function(err, results) {

	})
	logger.debug('这个是奶妈程序的输出！');
}, 10000);
var async = require('async');
var logger = require('./lib/logger').logger('web');
var moment = require('moment');
var conf = require('node-conf');
var appconf = conf.load('app');
var SRCFILE = appconf.debug ? '.js' : '.min.js';
var Schemas = require(__dirname + '/modules/DBModules' + SRCFILE).Dbs;

var t = setInterval(function() {
	//var nowtime = moment().subtract('seconds', 300).format("YYYY-MM-DD HH:mm:ss");
    var nowtime = moment().subtract('seconds', 300).unix();
	async.auto({
		axeDialrsult: function(cb) {
			Schemas.crmDialResult.update({
				where: {
                    UnixTime: {
						'lt': nowtime
					},
					Result: -1
				},
				update: {
					Result: 4
				}
			}, function(err, updates) {
				//logger.debug('这个是奶妈程序的输出:', updates);
				cb(err, updates);
			})
		},
		axeLineStat: function(cb) {
			cb(null, null);
		}
	}, function(err, results) {

	})
	logger.debug('这个是奶妈程序的输出！');
}, 3000);
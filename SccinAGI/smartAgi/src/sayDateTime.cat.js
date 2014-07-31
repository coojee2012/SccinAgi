/**
datetime:格式-YYYYMMDD HHmm
sayway:可能的值-date / time / datetime
**/
routing.prototype.sayDateTime = function(datetime, sayway, callback) {
	var self = this;
	var context = self.context;
	var schemas = self.schemas;
	var nami = self.nami;
	var logger = self.logger;
	var args = self.args;
	var vars = self.vars;

	if (!datetime || datetime === '') {
		datetime = args.datetime;
	}
	if (!sayway || sayway === '') {
		sayway = args.sayway;
	}

	if (!callback || typeof(!callback) !== 'function') {
		callback = function(err, results) {
			if (err)
				context.hangup(function(err, rep) {});
			else
				 context.end();
		}
	}

	if (!datetime || datetime === '')
		callback('无效的日期时间参数！', -1);
	else {
		var datime = datetime.split(/\s+/);
		var d = datime[0];
		var year = d.substr(0, 4);
		var month = d.substr(4, 2);
		month=month.replace(/^0/,'');
		var day = d.substr(6, 2);
		day=day.replace(/^0/,'');
		var t = datime[1] || "0000";
		var hour = t.substr(0, 2);
		hour=hour.replace(/^0/,'');
		var minute = t.substr(2, 2);
		minute=minute.replace(/^0/,'');
        logger.debug("年-月-日-时-分：",year+"-"+month+"-"+ day+"-"+hour+"-"+minute);
		if (sayway === 'date') {
			async.auto({
				sayyear: function(cb) {
					context.saydigits(year, cb);
				},
				sayYYYY: ['sayyear',
					function(cb, results) {
						context.Playback('digits/year', cb);
					}
				],
				saymonth: ['sayYYYY',
					function(cb, results) {
						context.saynumber(month, cb);
					}
				],
				sayMM: ['saymonth',
					function(cb, results) {
						context.Playback('digits/month', cb);
					}
				],
				sayday: ['sayMM',
					function(cb, results) {
						context.saynumber(day, cb);
					}
				],
				sayDD: ['sayday',
					function(cb, results) {
						context.Playback('digits/day', cb);
					}
				]
			}, function(err, results) {
				callback(err, results);
			});

		}
		else if(sayway === 'time'){
			async.auto({
				sayhour: function(cb) {
					context.saynumber(hour, cb);
				},
				sayHH: ['sayhour',
					function(cb, results) {
						context.Playback('digits/hour', cb);
					}
				],
				sayminute: ['sayHH',
					function(cb, results) {
						context.saynumber(minute, cb);
					}
				],
				saymm: ['sayminute',
					function(cb, results) {
						context.Playback('digits/minute', cb);
					}
				]
			}, function(err, results) {
                logger.debug("读出时间日期完成：",err);
				callback(err, results);
			});
		}
		else{
			async.auto({
				sayyear: function(cb) {
					context.saydigits(year, cb);
				},
				sayYYYY: ['sayyear',
					function(cb, results) {
						context.Playback('digits/year', cb);
					}
				],
				saymonth: ['sayYYYY',
					function(cb, results) {
						context.saynumber(month, cb);
					}
				],
				sayMM: ['saymonth',
					function(cb, results) {
						context.Playback('digits/month', cb);
					}
				],
				sayday: ['sayMM',
					function(cb, results) {
						context.saynumber(day, cb);
					}
				],
				sayDD: ['sayday',
					function(cb, results) {
						context.Playback('digits/day', cb);
					}
				],
				sayhour:['sayDD',function(cb) {
					context.saynumber(hour, cb);
				}],
				sayHH: ['sayhour',
					function(cb, results) {
						context.Playback('digits/hour', cb);
					}
				],
				sayminute: ['sayHH',
					function(cb, results) {
						context.saynumber(minute, cb);
					}
				],
				saymm: ['sayminute',
					function(cb, results) {
						context.Playback('digits/minute', cb);
					}
				]
			}, function(err, results) {
				callback(err, results);
			});
		}
	}

}
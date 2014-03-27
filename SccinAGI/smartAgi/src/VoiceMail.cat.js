/**
语音信箱
**/
routing.prototype.VoiceMail = function(number, callback) {
	var self = this;
	var context = self.context;
	var schemas = self.schemas;
	var nami = self.nami;
	var logger = self.logger;
	var args = self.args;
	var vars = self.vars;

	if (!number || number === '') {
		number = args.number;
	}
	if (!callback || typeof(!callback) !== 'function') {
		callback = function(err, results) {
			if (err)
				context.hangup(function(err, rep) {});
			else
				context.end();
		}
	}

	if (!number || number === '') {
		context.end();
	} else {
		var voicefilepatch = "/var/spool/asterisk/monitor/voicemail/" + number + '/';
		var voicefilename = guid.create();
		var voiceextenname = "wav";
		async.auto({
			checkOlds: function(cb) {
				console.log(schemas.pbxRcordFile);
				schemas.pbxRcordFile.all({
					where: {
						lable: 'voicemail'
					},
					order: 'cretime DESC',
					skip: 60 //删除超过60条的记录
				}, function(err, dbs) {
					cb(err, dbs);
				});
			},
			delOld: ['checkOlds',
				function(cb, resluts) {
					if (resluts.checkOlds.length > 0) {
						commonfun.delrecordfiles(schemas, resluts.checkOlds, cb);
					} else {
						cb(null, null);
					}
				}
			],
			playusevoice: ['delOld',
				function(cb, results) {
					context.Playback("vm-intro", cb);
				}
			],
			record: ['playusevoice',
				function(cb, results) {
					var maxduration = 60; //默认最多可以录制1小时，0表示随便录好久
					var options = 'sxk'; //默认如果没应答就跳过录音
					var format = voiceextenname; //默认文件后缀名
					var silence = 10; //如果持续了超过X秒的沉默，将停止录音，默认10秒,0表示不判断
					context.Record(voicefilepatch + voicefilename + '.' + format, silence, maxduration, options, function(err, response) {
						cb(err, response);
					});
				}
			],
			playGoodbye: ['record',
				function(cb, results) {
					context.Playback("vm-goodbye", cb);
				}
			],
			getFileSize: ['record',
				function(cb, results) {
					commonfun.getfilestate(voicefilepatch + voicefilename + '.' + voiceextenname, function(err, stats) {
						var size = 0;
						if (err) {
							logger.error(err);
						} else {
							size = stats.size;
						}
						cb(null, size);

					});
				}
			],
			insertdb: ['getFileSize',
				function(cb, results) {
					schemas.pbxRcordFile.create({
						filename: voicefilename,
						lable: 'voicemail',
						folder: voicefilepatch,
						extname: voiceextenname,
						callnumber: vars.agi_callerid,
						extennum: args.called,
						filesize: results.getFileSize
					}, function(err, inst) {
						cb(err, inst);
					});
				}
			]

		}, function(err, results) {
			if (err)
				logger.error('语音信箱：', err);
			callback(err, results);
		});
	}
}
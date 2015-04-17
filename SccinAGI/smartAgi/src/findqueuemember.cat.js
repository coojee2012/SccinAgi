//拨打分机
routing.prototype.findqueuemember = function() {
	var self = this;
	var context = self.context;
	var schemas = self.schemas;
	var nami = self.nami;
	var logger = self.logger;
	var args = self.args;
	var vars = self.vars;
	var extennum = args.localnum;
	async.auto({
		findLocal: function(cb, results) {
				schemas.pbxLocalNumber.findOne({
					where: {
						id: extennum
					}
				}, function(err, inst) {
					if (err)
						cb(err, inst);
					if (inst != null) {
						cb(null, inst.assign);
					} else {
						cb("在本地号码中没有找到队列成员号码。", null);
					}

				});
			}
		,
		dial: ['findLocal',
			function(cb, resluts) {
				var localargs = str2obj(resluts.findLocal);
				var extenproto = localargs.extenproto || 'SIP';
				var timeout = localargs.timeout || '60';
				timeout = parseInt(timeout);
				context.Dial(extenproto + '/' + extennum, timeout, conf.dialOutOptions, function(err, response) {
					logger.debug("拨打队列分机返回结果：", response);
					if (err) {
						cb(err, response);
					} else {
						context.getVariable('DIALSTATUS', function(err, response) {
							cb(null, response);
						});
					}
				});

			}
		],
		afterdial: ['dial',
			function(cb, resluts) {
				var re = /(\d+)\s+\((\w+)\)/;
				var anwserstatus = null;
				if (re.test(resluts.dial.result)) {
					anwserstatus = RegExp.$2;
				}
				logger.debug("拨打队列分机应答状态：", anwserstatus);				
				if (anwserstatus === 'CANCEL') {
					logger.debug("主叫叫直接挂机！");
					cb("主叫直接挂机！", -1);
				} else if (anwserstatus === 'TRANSFER') {
					logger.debug("被叫开启了呼叫转移！");
					cb("被叫开启了呼叫转移！", -1);
				}
				else if (anwserstatus !== 'ANSWER') {
					cb("拨打队列分机应答不成功！", -1);
				} else {
					logger.debug("拨打队列分机应答成功。");
					cb(null, 1);
				}
			}
		]
	}, function(err, results) {
		logger.error(err);
		context.end();
	});
}
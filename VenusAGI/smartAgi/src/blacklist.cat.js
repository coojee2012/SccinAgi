routing.prototype.blacklist = function(caller, callback) {
	var self = this;
	var context = self.context;
	var schemas = self.schemas;
	var nami = self.nami;
	var logger = self.logger;
	var args = self.args;
	var vars = self.vars;
	if (!caller || caller === '' || caller === args.called) {
		caller = vars.agi_callerid;
	}
	if (!callback || typeof(callback) !== 'function') {
		callback = function(err, results) {
			if (err)
				context.hangup(function(err, rep) {});
			else
				context.end();
		}
	}
	try {
		schemas.pbxBlackList.find(caller, function(err, inst) {
			if (err) {
				logger.error('黑名单处理发生异常:', err);
				callback(err, null);
			} else {
				if (inst !== null) {
					context.hangup(callback);
				} else {
					callback(null, null);
				}
			}
		});
	} catch (ex) {
		logger.error('黑名单处理发生异常:', ex);
		callback(ex, null);
	}
}
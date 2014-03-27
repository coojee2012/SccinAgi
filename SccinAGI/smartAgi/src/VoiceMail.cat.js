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

	if(!number || number === ''){
		context.end();
	}else{
		
	}
	
	
}
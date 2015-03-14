routing.prototype.getAsConf = function(filename, callback) {
	var self = this;
	var context = self.context;
	var schemas = self.schemas;
	var nami = self.nami;
	var logger = self.logger;
	var args = self.args;
	var vars = self.vars;

	if (!filename || filename === '') {
		filename = args.filename;
	}
	if (!callback || typeof(callback) !== 'function') {
		callback = function(err, results) {
			if (err)
				context.hangup(function(err, rep) {});
			else
				context.end();
		}
	}

	if (!filename || filename === '') {
		context.end();
	} else {
		var action = new AsAction.GetConfigJson();
		action.Filename = filename+'.conf';
		if (nami.connected) {
			nami.send(action, function(response) {
				console.log(response.json);
				if(response.response==='Success'){
					callback(null, response.json);
				}else{
				callback(null, {});	
				}
				
			});
		} else {
			nami.open();
			nami.send(action, function(response) {
				console.log(response.json);
				if(response.response==='Success'){
					callback(null, response.json);
				}else{
				callback(null, {});	
				}
			});

		}
	}
}
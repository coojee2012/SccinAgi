routing.prototype.sayNumber = function(number, callback) {
	var self = this;
	var context = self.context;
	var schemas = self.schemas;
	var nami = self.nami;
	var logger = self.logger;
	var args = self.args;
	var vars = self.vars;
	context.saynumber(number, function(err, result) {
		callback(err, result);
	});

}
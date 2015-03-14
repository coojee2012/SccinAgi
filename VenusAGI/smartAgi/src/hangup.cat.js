
//挂机处理程序
routing.prototype.hangup = function(num, callback) {
  var self = this;
  var context = self.context;
  var schemas = self.schemas;
  var nami = self.nami;
  var logger = self.logger;
  var args = self.args;
  var vars = self.vars;
  context.hangup(function(err, response) {
    callback(err, response);
  });
};

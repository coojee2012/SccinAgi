//发起录音
routing.prototype.monitor = function(filename, callback) {
  var self = this;
  var context = self.context;
  var schemas = self.schemas;
  var nami = self.nami;
  var logger = self.logger;
  var args = self.args;
  var vars = self.vars;
  if (typeof(filename) === 'function') {
    callback = filename;
    filename = self.sessionnum + '.wav';
  }
  context.MixMonitor(filename, '', '', function(err, response) {
    if (err) {
      logger.error("自动录音，发生错误：", err);
      callback('自动录音发生异常.', err);
    } else {
      callback(null, response);
    }
  });

};
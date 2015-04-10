routing.prototype.listenByPhone = function() {
  var self = this;
  var context = self.context;
  var schemas = self.schemas;
  var nami = self.nami;
  var logger = self.logger;
  var args = self.args;
  var vars = self.vars;
  async.auto({
    listening: function(cb) {
           context.Playback(args.filepath, function(err, response) {
              logger.debug("Playback:", response);
              cb(err, response);
            });    
    }
  }, function(err, results) {
    if (err) {
      logger.error(err);
      logger.debug("当前上下文状态：" + context.state + '，上下文流是否可读：' + context.stream.readable);
      if (context.stream && context.stream.readable) {
        context.hangup(function(err, rep) {});
      }

    } else {
      logger.debug("当前上下文状态：" + context.state + '，上下文流是否可读：' + context.stream.readable);
      if (context.stream && context.stream.readable) {
        context.hangup(function(err, rep) {
          logger.debug("来自自动挂机");
        });
      }
    }
  });
};
routing.prototype.recordbyphone = function() {
  var self = this;
  var context = self.context;
  var schemas = self.schemas;
  var nami = self.nami;
  var logger = self.logger;
  var args = self.args;
  var vars = self.vars;
  async.auto({
    recording: function(cb) {
          var maxduration = 60; //默认最多可以录制1小时，0表示随便录好久
          var options = 'sxk'; //默认如果没应答就跳过录音
          var format = 'wav'; //默认文件后缀名
          var silence = 10; //如果持续了超过X秒的沉默，将停止录音，默认10秒,0表示不判断
          context.Record(args.filepath, silence, maxduration, options, function(err, response) {
           logger.error(response);
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
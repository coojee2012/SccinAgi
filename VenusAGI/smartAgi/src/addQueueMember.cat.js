//动态添加指定队列坐席成员
//queuenum-队列名称
//agent-坐席
routing.prototype.addQueueMember = function() {
  var self = this;
  var context = self.context;
  var schemas = self.schemas;
  var nami = self.nami;
  var logger = self.logger;
  var args = self.args;
  var vars = self.vars;
  async.auto({
    addAgent: function(cb) {
      context.AddQueueMember(args.queuenum, args.agent, function(err, response) {
        cb(err, response);
      });
    }
  }, function(err, results) {
    return;
  });
};
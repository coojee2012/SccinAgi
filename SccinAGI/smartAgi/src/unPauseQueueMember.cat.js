
//取消示忙指定队列坐席成员
//queuenum-队列名称，留空所有队列里面的该坐席都取消示忙
//agent-坐席
routing.prototype.unPauseQueueMember = function(queuenum, assign, callback) {
  var self = this;
  var context = self.context;
  var schemas = self.schemas;
  var nami = self.nami;
  var logger = self.logger;
  var args = self.args;
  var vars = self.vars;
  if (!assign || assign === '') {
    assign = args.assign;
  }
  if (!queuenum || queuenum === '') {
    action = args.queuenum;
  }

  if (!callback || typeof(callback) !== 'function') {
    callback = function(err, results) {
      if (err)
        context.hangup(function(err, rep) {});
      else
         context.end();
    }
  }
  
  async.auto({
    removeAgent: function(cb) {
      var queuenum = args.queuenum || '';
      var agent = args.agent || vars.agi_callerid;
      context.UnpauseQueueMember(queuenum, 'SIP/' + agent + ',0,' + agent, function(err, response) {
        cb(err, response);
      });
    }
  }, function(err, results) {
    callback(err, results);
  });
};
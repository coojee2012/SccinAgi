//拨打队列
routing.prototype.queue = function(queuenum, assign, callback) {
  var self = this;
  var context = self.context;
  var schemas = self.schemas;
  var nami = self.nami;
  var logger = self.logger;
  var args = self.args;
  var vars = self.vars;
  async.auto({
    updateCDR: function(cb) {
      schemas.pbxCdr.update({
        where: {
          id: self.sessionnum
        },
        update: {
          lastapptime: moment().format("YYYY-MM-DD HH:mm:ss"),
          lastapp: '拨打队列' + queuenum
        }
      }, function(err, inst) {
        cb(err, inst);
      });
    },
    findQueue: function(cb) {
      schemas.pbxQueue.find(queuenum, function(err, inst) {
        if (err || inst == null) {
          cb("查找队列发生错误！", null);
        } else {
          cb(null, inst);
        }
      });
    },
    queue: ['updateCDR', 'findQueue',
      function(cb, results) {
        //Queue(queuename,options,URL,announceoverride,timeout,agi,cb)
        var queuetimeout = results.findQueue.queuetimeout == 0 ? 60 : results.findQueue.queuetimeout;
        context.Queue(queuenum, 'tT', '', '', queuetimeout, 'agi://127.0.0.1/queueAnswered?queuenum=' + queuenum + '&sessionnum=' + self.sessionnum, function(err, response) {
          logger.debug("队列拨打返回结果:", response);
          cb(err, response);
        });

      }
    ],

    getQueueStatus: ['queue',
      function(cb, results) {
        context.getVariable('QUEUESTATUS', function(err, response) {
          var queueStatus = '';
          var reg = /(\d+)\s+\((.*)\)/;
          var c = null,
            id = null;
          if (reg.test(response.result)) {
            c = RegExp.$1;
            queueStatus = RegExp.$2;
          }
          logger.debug("获取呼叫队列状态：", queueStatus);
          cb(err, queueStatus);
        });
      }
    ]
  }, function(err, results) {
    callback(err, results);
  });

};
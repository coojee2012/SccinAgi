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
 /* setchannelvar: function(cb) {
        context.SetVariable("sessionnum",self.sessionnum,function(err,response){
          cb(err,response);
        });
      },
   getchannelvar: ["setchannelvar",function(cb) {
        context.getVariable('sessionnum', function(err, response) {
          console.log(response);
        });
      }],*/
    queue: ['updateCDR',
      function(cb, results) {
        //Queue(queuename,options,URL,announceoverride,timeout,agi,cb)
        context.Queue(queuenum, 'tc', '', '', 30, 'agi://127.0.0.1/queueAnswered?queuenum=' + queuenum + '&sessionnum=' + self.sessionnum, function(err, response) {
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
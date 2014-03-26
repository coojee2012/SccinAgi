//队列中坐席应答成功
routing.prototype.queueAnswered = function() {
  var self = this;
  var context = self.context;
  var schemas = self.schemas;
  var nami = self.nami;
  var logger = self.logger;
  var args = self.args;
  var vars = self.vars;
  var sessionnum = args.sessionnum;
  var queuenum = args.queuenum;
  logger.debug("队列被接听:", vars);
  async.auto({
    getAnswerMem: function(cb) {
      context.getVariable('MEMBERINTERFACE', function(err, response) {
        var member = '';
        var reg = /(\d+)\s+\((.*)\)/;
        var c = null,
          id = null;
        if (reg.test(response.result)) {
          c = RegExp.$1;
          member = RegExp.$2;
        }
        if (/\/(\d+)/.test(member)) {
          member = RegExp.$1;
        }
        logger.debug("当前应答坐席：", member);
        cb(err, member);
      });
    },
    //更新CDR应答状态和被叫坐席
    updateCDR: ['getAnswerMem',
      function(cb, results) {
        schemas.pbxCdr.update({
          where: {
            id: sessionnum
          },
          update: {
            answerstatus: 'ANSWERED',
            called: results.getAnswerMem,
            lastapptime: moment().format("YYYY-MM-DD HH:mm:ss")
          }
        }, function(err, inst) {
          cb(err, inst);
        });
      }
    ],
    //写入弹屏数据
    updatePop: ['getAnswerMem',
      function(cb, results) {
        schemas.pbxScreenPop.update({
          where: {
            id: results.getAnswerMem
          },
          update: {
            callernumber: vars.agi_callerid,
            callednumber: results.getAnswerMem,
            sessionnumber: sessionnum,
            status: 'waite',
            routerdype: 1,
            poptype: 'diallocal',
            updatetime: moment().format("YYYY-MM-DD HH:mm:ss")
          }
        }, function(err, inst) {
          cb(err, inst);
        });
      }
    ]
  }, function(err, results) {
    context.end();
  });

}
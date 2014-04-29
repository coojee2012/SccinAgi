//拨打分机
routing.prototype.extension = function(extennum, assign, callback) {
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
          called: extennum,
          lastapp: '拨打分机'
        }
      }, function(err, inst) {
        cb(err, inst);
      });
    },
    //添加被叫弹屏信息
    updateScreenPop: function(cb) {
      schemas.pbxScreenPop.update({
        where: {
          id: extennum
        },
        update: {
          callernumber: vars.agi_callerid,
          callednumber: extennum,
          sessionnumber: self.sessionnum,
          status: 'waite',
          routerdype: 1,
          poptype: 'diallocal',
          updatetime: moment().format("YYYY-MM-DD HH:mm:ss")
        }
      }, function(err, inst) {
        cb(err, inst);
      });
    },
    extenmonitor: function(cb) {
      var ty="呼入";
      if(self.routerline=="呼出")
        ty="呼出";
      self.sysmonitor(ty, cb);
    },
    dial: ['updateCDR','extenmonitor',
      function(cb, resluts) {
        var localargs = str2obj(assign);
        var extenproto = localargs.extenproto || 'SIP';
        var timeout = localargs.timeout || '60';
        timeout = parseInt(timeout);
        //判断分机是否开启呼叫转移
        if (localargs.transnum && /\d+/.test(localargs.transnum)) {
          logger.debug("当前呼叫转移参数：", localargs.transway, localargs.transnum);
          if (localargs.transway && typeof(self[localargs.transway]) === 'function' && self.transferlevel < 10) {
            logger.debug("当前呼叫转移层数：", self.transferlevel);
            self.transferlevel++;
            self[localargs.transway](localargs.transnum, function(err, result) {
              if (err)
                logger.error('呼叫转移过程中发生异常', err);
              cb(null, {
                result: '1 (TRANSFER)'
              });
            });
          } else {
            cb('呼叫转移方式指定错误或呼叫转移循环层级达到10', -1);
          }
        } else {
          context.Dial(extenproto + '/' + extennum, timeout, 'tr', function(err, response) {
            logger.debug("拨打分机返回结果：", response);
            if (err) {
              cb(err, response);
            } else {
              context.getVariable('DIALSTATUS', function(err, response) {
                cb(null, response);
              });
            }
          });
        }
      }
    ],
    afterdial: ['dial',
      function(cb, resluts) {
        var re = /(\d+)\s+\((\w+)\)/;
        var anwserstatus = null;
        if (re.test(resluts.dial.result)) {
          anwserstatus = RegExp.$2;
        }
        logger.debug("应答状态：", anwserstatus);
        //异步更新CDR，不影响流程
        schemas.pbxCdr.update({
          where: {
            id: self.sessionnum
          },
          update: {
            lastapptime: moment().format("YYYY-MM-DD HH:mm:ss"),
            answerstatus: anwserstatus
          }
        }, function(err, inst) {
          if (err)
            logger.error("通话结束后更新通话状态发生异常！", err);
        });

        if (anwserstatus === 'CANCEL') {
          logger.debug("主叫叫直接挂机！");
          cb("主叫直接挂机！", -1);
        } else if (anwserstatus === 'TRANSFER') {
          logger.debug("被叫开启了呼叫转移！");
          cb("被叫开启了呼叫转移！", -1);
        }
        /*else if (anwserstatus === 'CONGESTION') {
          logger.debug("被叫直接挂机！");
          cb("被叫直接挂机！", -1);
        }  else if (anwserstatus === 'NOANSWER') {
          logger.debug("被叫无应答！");
          cb("被叫无应答！", -1);
        }*/
        else if (anwserstatus !== 'ANSWER') {
          self.dialExtenFail(extennum, anwserstatus, function(err, result) {
            cb(err, result);
          });
        } else {
          logger.debug("应答成功。");
          cb(null, 1);
        }
      }
    ]
  }, function(err, results) {
    callback(err, results);
  });
}
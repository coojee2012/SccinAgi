//拨打外部电话
routing.prototype.dialout = function(linenum, callback) {
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
          called: args.called,
          lastapptime: moment().format("YYYY-MM-DD HH:mm:ss"),
          lastapp: '呼叫外部'
        }
      }, function(err, inst) {
        cb(err, inst);
      });
    },
    findLine: ['updateCDR',
      function(cb, results) {
        schemas.pbxTrunk.find(linenum, function(err, inst) {
          if (err || inst == null) {
            cb('没有找到可以呼出的外线', -1);
          } else {
            cb(null, inst);
          }
        });
      }
    ],
    updatePopScreen: ['updateCDR',
      function(cb, results) {
        schemas.pbxScreenPop.update({
          where: {
            id: vars.agi_callerid
          },
          update: {
            callernumber: vars.agi_callerid,
            callednumber: args.called,
            sessionnumber: self.sessionnum,
            status: 'waite',
            routerdype: 2,
            poptype: 'dialout',
            updatetime: moment().format("YYYY-MM-DD HH:mm:ss")
          }
        }, function(err, inst) {
          cb(err, inst);
        });
      }
    ],
    automonitor: ["findLine",
      function(cb) {
        self.sysmonitor("呼出", cb);
      }
    ],
    dial: ['findLine',
      function(cb, results) {
        var trunkproto = results.findLine.trunkproto;
        var trunkdevice = results.findLine.trunkdevice;
        var called = args.called;

        schemas.pbxCallProcees.create({
          callsession: self.sessionnum,
          caller: vars.agi_callerid,
          called: args.called,
          routerline: args.routerline,
          passargs: 'trunkproto=' + trunkproto + '&called=' + called + '&trunkdevice=' + trunkdevice,
          processname: '呼叫外线',
          doneresults: ''
        }, function(err, inst) {
          if (err)
            logger.error("记录呼叫处理过程发生异常：", err);
        });
        var channele = trunkproto + '/' + trunkdevice;
        //context.ChannelStatus(channele, function(err, reponse) {
        //logger.debug('线路状态：', reponse);
        context.Dial(channele + '/' + called, conf.timeout, conf.dialoptions, function(err, response) {
          if (err) {
            cb(err, response);
          } else {
            context.getVariable('DIALSTATUS', function(err, response) {
              cb(null, response);
            });
          }
        });
        //});

      }
    ],
    afterdial: ['dial',
      function(cb, results) {
        var re = /(\d+)\s+\((\w+)\)/;
        var anwserstatus = null;
        if (re.test(results.dial.result)) {
          anwserstatus = RegExp.$2;
        }
        logger.debug("应答状态：", anwserstatus);


        schemas.pbxCallProcees.create({
          callsession: self.sessionnum,
          caller: vars.agi_callerid,
          called: args.called,
          routerline: args.routerline,
          passargs: '',
          processname: '呼叫外线结束',
          doneresults: 'anwserstatus=' + anwserstatus
        }, function(err, inst) {
          if (err)
            logger.error("记录呼叫处理过程发生异常：", err);
        });

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


        cb(null, 1);
      }
    ]

  }, function(err, results) {
    callback(err, results);
  });
};
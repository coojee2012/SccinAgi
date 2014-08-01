//自动语音应答处理
//IVR号码
//IVR执行起点默认为1
routing.prototype.ivr = function(ivrnum, action, callback) {
  var self = this;
  var context = self.context;
  var schemas = self.schemas;
  var nami = self.nami;
  var logger = self.logger;
  var args = self.args;
  var vars = self.vars;
  if (!ivrnum || ivrnum === '') {
    ivrnum = args.ivrnum;
  }
  if (!action || action === '') {
    action = args.action;
  }

  if (!callback || typeof(callback) !== 'function') {
    callback = function(err, results) {
      if (err)
        context.hangup(function(err, rep) {});
      else
        return 0;
    }
  }



  if (self.ivrlevel > 50) {
    callback('IVR嵌套过深', -1);
  } else {
    logger.debug("当前IVR嵌套层数:", self.ivrlevel);
    self.ivrlevel++;
    async.auto({
      updateCDR: function(cb) {
        schemas.pbxCdr.update({
          where: {
            id: self.sessionnum
          },
          update: {
            lastapptime: moment().format("YYYY-MM-DD HH:mm:ss"),
            lastapp: '自动语音应答处理'
          }
        }, function(err, inst) {
          cb(err, inst);
        });
      },
      getIVR: ['updateCDR',
        function(cb, results) {
          schemas.pbxIvrMenmu.find(ivrnum, function(err, inst) {
            if (err || inst == null) {
              cb("查找IVR发生错误或没有找到IVR", null);
            } else {
              cb(err, inst);
            }

          });
        }
      ],
      getIVRActions: ['getIVR',
        function(cb, results) {
          results.getIVR.actions({
              where: {},
              include: 'Actmode',
              order: ['ordinal asc']
            },
            function(err, actions) {
              cb(err, actions);
            }
          );

        }
      ],
      getIVRInputs: ['getIVR',
        function(cb, results) {
          results.getIVR.inputs({
              where: {}
            },
            function(err, inputs) {
              cb(err, inputs);
            }
          );
        }
      ],
      Answer: ['getIVRActions', 'getIVRInputs',
        function(cb, results) {
          context.answer(function(err, response) {
            if (err)
              logger.error(err);

            logger.debug("IVR应答结果：", response);
            cb(err, response);
          });
        }
      ],

      checkaction: ['Answer',
        function(cb, results) {
          if (!action)
            action = 1;
          logger.debug("获取到的IVR动作编号:", action);
          if (/^\d+$/g.test(action)) {
            cb(null, action);
          } else {
            schemas.pbxIvrActions.find(action, function(err, inst) {
              if (err || inst == null) {
                cb("获取IVR动作顺序号错误！", null);
              } else {
                action = inst.ordinal;
                cb(null, action);
              }
            });
          }
        }
      ],
      action: ['checkaction',
        function(cb, results) {
          logger.debug("开始执行IVR动作");
          schemas.pbxCallProcees.create({
            callsession: self.sessionnum,
            caller: vars.agi_callerid,
            called: args.called,
            routerline: args.routerline,
            passargs: 'ivrnum=' + ivrnum + '&action=' + action,
            processname: '呼叫自动语音应答处理',
            doneresults: ''
          }, function(err, inst) {
            if (err)
              logger.error("记录呼叫处理过程发生异常：", err);
          });

          self.ivraction(action, results.getIVRActions, results.getIVRInputs, function(err, result) {
            cb(err, result);
          });
        }
      ]
    }, function(err, results) {
      callback(err, results);
    });
  }
};
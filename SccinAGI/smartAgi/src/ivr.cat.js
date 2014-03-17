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
            cb(err, inst);
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
            cb(err, response);
          });
        }
      ],
      action: ['Answer',
        function(cb, results) {
          logger.debug("开始执行IVR动作");
          if (!action)
            action = 0;

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
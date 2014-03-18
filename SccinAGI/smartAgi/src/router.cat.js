//呼叫路由处理
//args.routerline
//args.called
routing.prototype.router = function() {
  var self = this;
  var context = self.context;
  var schemas = self.schemas;
  var nami = self.nami;
  var logger = self.logger;
  var args = self.args;
  var vars = self.vars;
  async.auto({
    AddCDR: function(cb) {
      schemas.pbxCdr.create({
        id: self.sessionnum,
        caller: vars.agi_callerid,
        called: args.called,
        accountcode: vars.agi_accountcode,
        routerline: args.routerline,
        lastapptime: moment().format("YYYY-MM-DD HH:mm:ss"),
        lastapp: '呼叫路由处理',
        answerstatus: 'NOANSWER'
      }, function(err, inst) {
        cb(err, inst);
      });
    },
    MixMonitor: ['AddCDR',
      function(cb, results) {
        logger.debug("发起自动录音。");
        var filename = self.sessionnum + '.wav';
        context.MixMonitor(filename, '', '', function(err, response) {
          if (err) {
            logger.error("自动录音，发生错误：", err);
            cb('自动录音发生异常.', err);
          } else {
            logger.debug("自动录音，完毕。", response);
            cb(null, response);
          }
        });
      }
    ],
    GetRouters: ['AddCDR',
      function(cb, results) {
        schemas.pbxRouter.all({
          where: {
            routerline: args.routerline,
          },
          order: ['proirety asc']
        }, function(err, insts) {
          cb(err, insts);
        });
      }
    ],
    Route: ['GetRouters',
      function(cb, results) {
        logger.debug(results.GetRouters);
        var processmode = null;
        var processdefined = null;
        var match = false;
        for (var i = 0; i < results.GetRouters.length; i++) {
          if (vars.agi_accountcode === results.GetRouters[i].callergroup || results.GetRouters[i].callergroup === 'all') {
            logger.debug("呼叫线路组匹配成功");
            match = true;
            var reCaller = new RegExp("^" + results.GetRouters[i].callerid);
            var reCalled = new RegExp("^" + results.GetRouters[i].callednum);
            //匹配主叫以什么号码开头
            if (results.GetRouters[i].callerid !== '' && !reCaller.test(vars.agi_callerid))
              match = false;
            //匹配主叫长度
            if (results.GetRouters[i].callerlen !== -1 && vars.agi_callerid.length !== results.GetRouters[i].callerlen)
              match = false;
            //匹配被叫以什么号码开头
            if (results.GetRouters[i].callednum !== '' && !reCalled.test(args.called))
              match = false;
            //匹配被叫长度
            if (results.GetRouters[i].calledlen !== -1 && args.called.length !== results.GetRouters[i].calledlen)
              match = false;
            //匹配成功后，对主叫和被叫进行替换
            if (match) {
              //主叫替换
              logger.debug("路由匹配成功，开始进行替换操作");
              if (results.GetRouters[i].replacecallerid !== '')
                vars.agi_callerid = results.GetRouters[i].replacecallerid;
              //删除被叫前几位
              if (results.GetRouters[i].replacecalledtrim !== -1)
                args.called = args.called.substr(results.GetRouters[i].replacecalledtrim);
              //补充被叫前几位
              if (results.GetRouters[i].replacecalledappend !== '')
                args.called = results.GetRouters[i].replacecalledappend + args.called;

              processmode = results.GetRouters[i].processmode;
              processdefined = results.GetRouters[i].processdefined || args.called; //如果指匹配设置号码否则采用被叫

              break;

            } else {
              continue;
            }
          }
        }
        if (match) {
          schemas.pbxCallProcees.create({
            callsession: self.sessionnum,
            caller: vars.agi_callerid,
            called: args.called,
            routerline: args.routerline,
            passargs: 'processmode=' + processmode + '&processdefined=' + processdefined,
            processname: '呼叫路由处理',
            doneresults: '匹配到呼叫路由'
          }, function(err, inst) {
            if (err)
              logger.error("记录呼叫处理过程发生异常：", err);
          });
          //processmode,路由处理方式，即本地的一个AGI程式
          //processdefined，传递到AGI的参数
          self[processmode](processdefined, function(err, result) {
            cb(err, result);
          });
        } else {
          schemas.pbxCallProcees.create({
            callsession: self.sessionnum,
            caller: vars.agi_callerid,
            called: args.called,
            routerline: args.routerline,
            passargs: '',
            processname: '呼叫路由处理',
            doneresults: '未找到匹配的路由！'
          }, function(err, inst) {
            if (err)
              logger.error("记录呼叫处理过程发生异常：", err);
          });
          cb('未找到匹配的路由！', 1);
        }

      }
    ]
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
}
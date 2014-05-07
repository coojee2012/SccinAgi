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
  self.routerline = args.routerline;
  async.auto({
    AddCDR: function(cb) {
      schemas.pbxCdr.create({
        id: self.sessionnum,
        caller: vars.agi_callerid,
        called: args.called,
        accountcode: vars.agi_accountcode,
        routerline: args.routerline,
        srcchannel: vars.agi_channel,
        uniqueid: vars.agi_uniqueid,
        threadid: vars.agi_threadid,
        context: vars.agi_context,
        agitype: vars.agi_type,
        lastapptime: moment().format("YYYY-MM-DD HH:mm:ss"),
        lastapp: '呼叫路由处理',
        answerstatus: 'NOANSWER'
      }, function(err, inst) {
        cb(err, inst);
      });
    },
    MixMonitor: ['AddCDR',
      function(cb, results) {
        //self.sysmonitor(cb);
        cb(null, null);
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
        var processmode = null;
        var processdefined = null;
        var match = false;
        logger.debug("该类型路由有：", results.GetRouters.length);
        async.eachSeries(results.GetRouters, function(item, cbk) {
          logger.debug("循环去匹配找到的路由规则：", item);
          if (match) {
            logger.debug("已经找到匹配的路由！");
            cbk("已经找到匹配的路由！");
          } else {
            if (vars.agi_accountcode === item.callergroup || item.callergroup === 'all') {
              logger.debug("开始进行呼叫路由判断");
              match = true;
              var reCaller = new RegExp("^" + item.callerid);
              var reCalled = new RegExp("^" + item.callednum);
              if (item.routerline === '呼入') {
                //匹配主叫以什么号码开头
                if (item.callerid !== '' && !reCaller.test(vars.agi_callerid))
                  match = false;
                //匹配主叫长度
                if (item.callerlen > 0   && vars.agi_callerid.length !== item.callerlen)
                  match = false;
              } else if (item.routerline === '呼出') {
                //匹配被叫以什么号码开头
                if (item.callednum !== '' && !reCalled.test(args.called))
                  match = false;
                //匹配被叫长度
                if (item.calledlen > 0 && args.called.length !== item.calledlen)
                  match = false;
              } else {}

              //匹配成功后，对主叫和被叫进行替换
              if (match) {
                //主叫替换
                logger.debug("路由匹配成功，开始进行替换操作");
                if (item.replacecallerid !== '')
                  vars.agi_callerid = item.replacecallerid;
                //删除被叫前几位
                if (item.replacecalledtrim > 0)
                  args.called = args.called.substr(item.replacecalledtrim);
                //补充被叫前几位
                if (item.replacecalledappend !== '')
                  args.called = item.replacecalledappend + args.called;

                processmode = item.processmode;
                processdefined = item.processdefined || args.called; //如果指匹配设置号码否则采用被叫
              }
            }
            cbk();
          }
        }, function(err) {
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
            //processmode,路由处理方式，即本地的一个AGI程式:本地处理，呼叫外线，黑名单
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
        });

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
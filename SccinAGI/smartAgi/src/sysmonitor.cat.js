//发起系统录音
routing.prototype.sysmonitor = function(monitype, callback) {
  var self = this;
  var context = self.context;
  var schemas = self.schemas;
  var nami = self.nami;
  var logger = self.logger;
  var args = self.args;
  var vars = self.vars;
  if (typeof(monitype) === 'function') {
    callback = monitype;
    monitype = '';
  }
  async.auto({
    //检查录音方式
    checkMonitorWay: function(cb) {
      var where = {id:{'neq':''}};
      if (monitype === '呼入') {
        where.recordin = '是';
        where.members = {
          'like': '%' + args.called + '%'
        };
      } else if (monitype === '呼出') {
        where.recordout = '是';
        where.members = {
          'like': '%' + vars.agi_callerid + '%'
        };
      } else if (monitype === '队列') {
        where.recordqueue = '是';
        where.members = {
          'like': '%' + args.called + '%'
        };
      } else {
        cb(null, {
          wayName: '系统自动',
          keepfortype: '按时间',
          keepforargs: 90
        });
      }
      if (where && where.members !== null) {
        schemas.pbxAutoMonitorWays.findOne({
          where: where
        }, function(err, inst) {
          cb(err, inst);
        });
      }

    },
    //创建录音目录
    buildForder: ['checkMonitorWay',
      function(cb, results) {
        if (results.checkMonitorWay !== null) {
          var fs = require('fs');
          var wayname = results.checkMonitorWay.wayName;
          var path = '/var/spool/asterisk/monitor/' + wayname + '/';
          if (fs.existsSync(path)) {

          } else {
            fs.mkdirSync(path);
          }
          cb(null, path);
        } else {
          cb('不需要录音！', null);
        }
      }
    ],
    //查找已有的录音
    findHasRecords: ['checkMonitorWay',
      function(cb, results) {
        if (results.checkMonitorWay !== null) {
          if (results.checkMonitorWay.keepfortype === '按时间') {
            var where = {};
            var olddate = moment().subtract('days', results.checkMonitorWay.keepforargs).format("YYYY-MM-DD");
            where.cretime = {
              'lte': olddate
            };
            schemas.pbxRcordFile.all({
              where: where
            }, function(err, dbs) {
              cb(err, dbs);
            });
          } else if (results.checkMonitorWay.keepfortype === '按条数') {
            schemas.pbxRcordFile.count({}, function(err, counts) {
              if (err) {
                cb(err, []);
              } else if (counts > results.checkMonitorWay.keepforargs) {
                schemas.pbxRcordFile.all({
                  skip: 0,
                  limit: counts - results.checkMonitorWay.keepforargs
                }, function(err, dbs) {
                  cb(err, dbs);
                });
              } else {
                cb(null, []);
              }
            });
          } else {
            cb(null, []);
          }

        } else {
          cb('不需要录音！', []);
        }
      }
    ],
    //处理已有录音
    handleHasRecords: ['findHasRecords',
      function(cb, results) {
        cb(null, null);
      }
    ],
    //开始录音
    monitor: ['buildForder',
      function(cb, results) {
        var filename = self.sessionnum + '.wav';
        context.MixMonitor(results.buildForder + filename, '', '', function(err, response) {
          if (err) {
            cb('自动录音发生异常.', err);
          } else {
            cb(null, response);
          }
        });
      }
    ],
    //添加一条录音记录
    addRecords: ['buildForder',
      function(cb, results) {
        var filename = self.sessionnum + '.wav';
        var  extennum=self.routerline==='呼入'?args.called:vars.agi_callerid;
        var  callnumber=self.routerline==='呼出'?args.called:vars.agi_callerid;
        schemas.pbxRcordFile.create({
          id:self.sessionnum,
          filename:filename,
          extname:'wav',
          calltype:self.routerline,
          extennum:extennum,
          folder:results.buildForder,
          callnumber:callnumber
        }, function(err, inst) {
          cb(err, inst);
        });
      }
    ]
  }, function(err, results) {
    if (err) {
      logger.error("自动录音，发生错误：", err);
      callback('自动录音发生异常.', err);
    } else {
      callback(null, response);
    }
  });

};
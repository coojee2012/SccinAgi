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
      var where = {
        id: {
          'neq': ''
        }
      };
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
          wayName: 'sysauto',
          keepfortype: '按时间',
          keepforargs: 90
        });
        //cb(null, null);
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

          fs.exists(path, function(exists) {
            if (!exists) {
              fs.mkdir(path,'0666', function(err) {
                if (err) {
                  cb('无法创建录音需要的目录：' + path, null);
                } else {
                  cb(null, path);
                }
              });
            } else {
              cb(null, path);
            }
          });
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
            where.id={"neq":''};
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
            schemas.pbxRcordFile.count(null, function(err, counts) {
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
        async.each(results.findHasRecords, function(item, callback) {
          var filepath = item.folder + item.filename + '.' + item.extname;
          fs.exists(filepath, function(exists) {
            if (exists) {
              fs.unlink(filepath, function(err) {
                callback(err);
              });
            } else {
              callback(null);
            }
          });
        }, function(error) {
          if (error)
            logger.error(error);
          else
            cb(null, null);
        });

      }
    ],
    //添加一条录音记录
    addRecords: ['buildForder',
      function(cb, results) {
        var filename = self.sessionnum;
        var extennum = self.routerline === '呼入' ? args.called : vars.agi_callerid;
        var callnumber = self.routerline === '呼出' ? args.called : vars.agi_callerid;
        schemas.pbxRcordFile.create({
//          id: self.sessionnum,
          filename: filename,
          extname: 'wav',
          calltype: self.routerline,
          lable:results.checkMonitorWay.wayName,
          extennum: extennum,
          folder: results.buildForder,
          callnumber: callnumber
        }, function(err, inst) {
          cb(err, inst);
        });
      }
    ],
    //开始录音
    monitor: ['addRecords',
      function(cb, results) {
        var filename = self.sessionnum + '.wav';
        context.MixMonitor(results.buildForder + filename, 'ab', '', function(err, response) {
          if (err) {
            cb('自动录音发生异常.', err);
          } else {
            cb(null, response);
          }
        });
      }
    ]
  }, function(err, results) {
    if (err) {
      logger.error("自动录音，发生错误：", err);
      callback(null, err); //录音模块发生错误，不中断正常流程
    } else {
      callback(null, null);
    }
  });

};
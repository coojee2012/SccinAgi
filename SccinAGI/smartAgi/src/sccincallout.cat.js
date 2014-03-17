//北京专家库自动外呼
//sccincallout?callRecordsID=
routing.prototype.sccincallout = function() {
  var self = this;
  var context = self.context;
  var schemas = self.schemas;
  var callRecordsID = self.args.callRecordsID;
  var nami = self.nami;
  var keyNum = null;
  var logger = self.logger;

  async.auto({
    //获取呼叫记录编号
    getCallrcordsId: function(cb) {
      context.getVariable('callrecordid', function(err, response) {
        logger.debug("获取呼叫记录编号：", response);
        var reg = /(\d+)\s+\((.*)\)/;
        var c = null,
          id = null;
        if (reg.test(response.result)) {
          c = RegExp.$1;
          callRecordsID = RegExp.$2;
        }
        cb(err, callRecordsID);
      });
    },
    //通过通道变量获取有效按键
    getKeyNum: ['getCallrcordsId',
      function(cb) {
        context.getVariable('keynum', function(err, response) {
          logger.debug("获取有效按键：", response);
          var reg = /(\d+)\s+\((.*)\)/;
          var c = null,
            id = null;
          if (reg.test(response.result)) {
            c = RegExp.$1;
            keyNum = parseInt(RegExp.$2);
          }
          cb(err, keyNum);
        });
      }
    ],
    //获取需要拨打的电话号码,倒序取出第一个电话作为需要拨打的电话
    getPhones: ['getKeyNum',
      function(cb, results) {
        schemas.CallPhone.all({
          where: {
            callRecordsID: callRecordsID,
            State: 0
          },
          order: ['PhoneSequ asc']
        }, function(err, insts) {
          cb(err, insts);

        });
      }
    ],
    //更新呼叫记录表
    updateCallRecords: ['getPhones',
      function(cb, results) {
        if (results.getPhones && results.getPhones.length > 0) {
          schemas.CallRecords.update({
            where: {
              id: callRecordsID,
            },
            update: {
              CallState: 1
            }
          }, function(err, inst) {
            cb(err, inst);

          });

        } else {
          cb('未有找到电话号码', results);
        }

      }
    ],
    //更新呼叫结果表
    updateDialResult: ['getPhones',
      function(cb, results) {
        if (results.getPhones && results.getPhones.length > 0) {
          schemas.DialResult.update({
            where: {
              id: callRecordsID
            },
            update: {
              State: 1
            }
          }, function(err, inst) {
            cb(err, inst);

          });

        } else {
          cb('未有找到电话号码', results);
        }
      }
    ],
    //开始呼叫
    Dial: ['getPhones', 'updateDialResult', 'updateCallRecords',
      function(cb, results) {
        if (results.getPhones && results.getPhones.length > 0) {
          async.auto({
            //更新电话记录表
            updateCallPhone: function(cb) {
              schemas.CallPhone.update({
                where: {
                  id: results.getPhones[0].id
                },
                update: {
                  State: 1
                }

              }, function(err, inst) {
                cb(err, inst);
              });
            },
            //添加呼叫日志
            addCallLog: function(cb) {
              schemas.CallLog.create({
                Phone: results.getPhones[0].Phone,
                PhoneSequ: results.getPhones[0].PhoneSequ,
                callphone: results.getPhones[0]
              }, function(err, inst) {
                cb(err, inst);
              });
            },
            //产生拨打
            dial: ['addCallLog', 'updateCallPhone',
              function(cb) {
                context.Dial(conf.line + results.getPhones[0].Phone, conf.timeout, conf.dialoptions, function(err, response) {
                  if (err) {
                    cb(err, response);
                  } else {
                    context.getVariable('DIALSTATUS', function(err, response2) {
                      cb(null, response2);

                    });
                  }
                });
              }
            ],
            //获取拨打状态并记录在callog表里面
            dialStatus: ['dial',
              function(cb, results) {
                var re = /(\d+)\s+\((\w+)\)/;
                var anwserstatus = null;
                if (re.test(results.dial.result)) {
                  anwserstatus = RegExp.$2;
                }
                schemas.UserKeysRecord.create({
                  id: guid.create(),
                  Key: anwserstatus,
                  keyTypeID: '111111',
                  calllog: results.addCallLog
                }, function(err, inst) {
                  cb(err, inst);
                });
              }
            ]
          }, function(err, results) {
            cb(err, results);
          });
        } else {
          cb('未有找到电话号码', results);
        }
      }
    ]
  }, function(err, results) {
    if (err) {
      logger.error(err);
      context.hangup(function(err, response) {
        logger.error("没有找到需要拨打的号码，挂机！");
      });
    } else {
      var anwserstatus = results.Dial.dialStatus.Key;
      if (anwserstatus === 'CONGESTION') {
        context.hangup(function(err, response) {
          logger.debug("被叫直接挂机！");
        });
      }

      if (anwserstatus !== 'ANSWER') {
        self.NextDial(callRecordsID, keyNum, function(err, result) {
          logger.debug("继续拨打成功！");
        });
      } else {
        logger.debug("准备开始播放语音文件。");
      }
    }
  });

};

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
  self.args.routerline = '扩展应用';
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
        srcchannel: vars.agi_channel,
        uniqueid: vars.agi_uniqueid,
        threadid: vars.agi_threadid,
        context: vars.agi_context,
        agitype: vars.agi_type,
        lastapptime: moment().format("YYYY-MM-DD HH:mm:ss"),
        lastapp: 'sccincallout',
        answerstatus: 'NOANSWER'
      }, function(err, inst) {
        cb(err, inst);
      });
    },
    //获取呼叫记录编号
    getCallrcordsId: function(cb) {
      try {
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
      } catch (ex) {
        logger.error(ex);
        cb('获取呼叫记录编号发生异常！', null);
      }
    },
    //通过通道变量获取有效按键
    getKeyNum: ['getCallrcordsId',
      function(cb) {
        try {
          context.getVariable('keynum', function(err, response) {
            logger.debug("获取有效按键：", response);
            var reg = /(\d+)\s+\((.*)\)/;
            var c = null,
              id = null;
            if (reg.test(response.result)) {
              c = RegExp.$1;
              keyNum = RegExp.$2;
            }
            cb(err, keyNum);
          });
        } catch (ex) {
          logger.error(ex);
          cb('通道变量获取有效按键发生异常！', null);
        }
      }
    ],
    //获取需要拨打的电话号码,倒序取出第一个电话作为需要拨打的电话
    getPhones: ['getKeyNum',
      function(cb, results) {
        try {
          schemas.crmCallPhone.all({
            where: {
              callRecordsID: callRecordsID,
              State: 0
            }//,
            //order: ['PhoneSequ asc']
          }, function(err, insts) {
            cb(err, insts);
          });
        } catch (ex) {
          logger.error(ex);
          cb('获取需要拨打的电话号码发生异常！', null);
        }
      }
    ],
    //更新呼叫记录表
    updateCallRecords: ['getPhones',
      function(cb, results) {
        try {
          if (results.getPhones && results.getPhones.length > 0) {
            schemas.crmCallRecords.update({
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
        } catch (ex) {
          logger.error('更新呼叫记录表发生异常:', ex);
          cb('更新呼叫记录表发生异常！', null);
        }

      }
    ],
    //更新呼叫结果表
    updateDialResult: ['getPhones',
      function(cb, results) {
        try {
          if (results.getPhones && results.getPhones.length > 0) {
            schemas.crmDialResult.update({
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
            cb(null, null);
          }
        } catch (ex) {
          logger.error('更新呼叫结果表发生异常:', ex);
          cb('更新呼叫结果表发生异常！', null);
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
              try {
                schemas.crmCallPhone.update({
                  where: {
                    id: results.getPhones[0].id
                  },
                  update: {
                    State: 1
                  }

                }, function(err, inst) {
                  cb(err, inst);
                });
              } catch (ex) {
                logger.error('更新电话记录表发生异常:', ex);
                cb('更新电话记录表发生异常！', null);
              }
            },
            //添加呼叫日志
            addCallLog: function(cb) {
              try {
                schemas.crmCallLog.create({
                  Phone: results.getPhones[0].Phone,
                 // PhoneSequ: results.getPhones[0].PhoneSequ,
                  callphone: results.getPhones[0]
                }, function(err, inst) {
                  cb(err, inst);
                });
              } catch (ex) {
                logger.error('添加呼叫日志发生异常:', ex);
                cb('添加呼叫日志发生异常！', null);
              }
            },
            //产生拨打
            dial: ['addCallLog', 'updateCallPhone',
              function(cb) {
                try {
                  context.Dial(conf.line + results.getPhones[0].Phone, conf.timeout, conf.dialoptions, function(err, response) {
                    if (err) {
                      cb(err, response);
                    } else {
                      console.log(context);
                      context.getVariable('DIALSTATUS', function(err, response2) {
                        cb(null, response2);

                      });
                    }
                  });
                } catch (ex) {
                  logger.error('产生拨打发生异常:', ex);
                  cb('产生拨打发生异常！', null);
                }
              }
            ],
            //获取拨打状态并记录在callog表里面
            dialStatus: ['dial',
              function(cb, results) {
                try {
                  var re = /(\d+)\s+\((\w+)\)/;
                  var anwserstatus = null;
                  if (re.test(results.dial.result)) {
                    anwserstatus = RegExp.$2;
                  }
                  schemas.crmUserKeysRecord.create({
                    id: guid.create(),
                    Key: anwserstatus,
                    keyTypeID: '111111',
                    calllog: results.addCallLog
                  }, function(err, inst) {
                    cb(err, inst);
                  });
                } catch (ex) {
                  logger.error('获取拨打状态发生异常:', ex);
                  cb('获取拨打状态发生异常！', null);
                }
              }
            ]
          }, function(err, results) {
            cb(err, results);
          });
        } else {
          try {
            schemas.crmDialResult.update({
              where: {
                id: callRecordsID
              },
              update: {
                Result: 109, //未找到需要拨打的号码
                State: 1
              }
            }, function(err, inst) {
              cb(err, inst);
            });
          } catch (ex) {
            logger.error('保存拨打结果发生异常:', ex);
            cb(ex, null);
          }
        }
      }
    ]
  }, function(err, results) {
    var upDialResult = function(Result) {
      try {
        schemas.crmDialResult.update({
          where: {
            id: callRecordsID
          },
          update: {
            Result: Result,
            State: 1
          }
        }, function(err, inst) {});
      } catch (ex) {
        logger.error('保存拨打结果发生异常:', ex);
      }
    };

    var hangupcall = function(msg) {
      if (context.stream && context.stream.readable) {
        context.hangup(function(err, response) {
          logger.debug(msg);
        });
      }
    }

    if (err) {
      logger.error('外呼程序发生异常：', err);
      upDialResult(110);
      hangupcall("没有找到需要拨打的号码");
      logger.error("没有找到需要拨打的号码，挂机！");
    } else {
      var anwserstatus = results.Dial.dialStatus.Key;
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

      if (anwserstatus === 'CONGESTION') {
         upDialResult(100);
         hangupcall("被叫拒绝接听！");
      } else if (anwserstatus === 'CHANUNAVAIL') {
        upDialResult(101);
         hangupcall("号码无效！");     
      } else if (anwserstatus === 'NOANSWER') {
        upDialResult(102);
        hangupcall("无应答！");
      } else if (anwserstatus === 'BUSY') {
        upDialResult(103);
        hangupcall("电话忙！");
      } else if (anwserstatus === 'DONTCALL') {
        upDialResult(104);
        hangupcall("被叫转移电话1！");
      } else if (anwserstatus === 'TORTURE') {
        upDialResult(105);
        hangupcall("被叫转移电话2");
      } else if (anwserstatus === 'INVALIDARGS') {
        upDialResult(106);
        hangupcall("无效的呼叫参数！");
      } else if (anwserstatus === 'CANCEL') {
        upDialResult(107);
        hangupcall("呼叫取消");
      } else if (anwserstatus !== 'ANSWER') {
        upDialResult(108);
        hangupcall("其他");
      } else {
        //upDialResult(10);
        logger.debug("准备开始播放语音文件。");
      }
      //以下是多路拨打
      /* if (anwserstatus !== 'ANSWER') {
          self.NextDial(callRecordsID, keyNum, function(err, result) {
            if (err) {
              logger.error(err);
              context.hangup(function(err, response) {
                logger.debug("呼叫下一个电话发生异常，挂机！");
              });
            } else if (result === 'over') {
              context.hangup(function(err, response) {
                logger.debug("所有电话已经呼叫完毕，挂机！");
              });
            } else {
              context.hangup(function(err, response) {
                logger.debug("本轮呼叫完毕，挂机！");
              });
            }
          });
        } else {
          logger.debug("准备开始播放语音文件。");
        }*/


    }
  });

};
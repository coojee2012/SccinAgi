var async = require('async');
var AsAction = require("nami").Actions;
var guid = require('guid');
var conf = require('node-conf').load('fastagi');
var routing = function(v) {
  this.context = v.context;
  this.schemas = v.Schemas;
  this.agiconf = v.agiconf;
  this.nami = v.nami;
  this.args = v.args;
  this.logger = v.logger;
  this.vars = v.vars;
  this.sessionnum = guid.create();
};
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
      schemas.PBXCdr.create({
        id: self.sessionnum,
        caller: vars.agi_callerid,
        called: args.called,
        accountcode: vars.agi_accountcode,
        routerline: args.routerline,
        lastapp: 'router',
        answerstatus: 'NOANSWER'
      }, function(err, inst) {
        cb(err, inst);
      });
    },
    GetRouters: ['AddCDR',
      function(cb, results) {
        schemas.PBXRouter.all({
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
            match = true;
            if (results.GetRouters[i].callerid !== '' && vars.agi_callerid !== results.GetRouters[i].callerid)
              match = false;
            if (results.GetRouters[i].callerlen !== -1 && vars.agi_callerid.length !== results.GetRouters[i].callerlen)
              match = false;
          }
        }
        cb(null, 1);
      }
    ]
  }, function(err, results) {
    if (err) {
      logger.error(err);
      context.hangup(function(err, rep) {

      });

    } else {
      context.hangup(function(err, rep) {
        logger.debug("来自自动挂机");
      });
    }
  });


}
//自动语音应答处理
routing.prototype.ivr = function(context, vars) {

};
//内部拨打
routing.prototype.diallocal = function(context, vars) {


};
//拨打队列
routing.prototype.queue = function(context, vars) {


};
//拨打外部电话
routing.prototype.dialout = function(context, vars) {

};
//默认触发处理
routing.prototype.
default = function(context, vars) {
  context.hangup(function(err, rep) {
    console.log("Hangup success:", rep);
    context.end();
  });

}

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


routing.prototype.hangupcall = function() {

}

//北京专家库自动拨打接通后处理程序
routing.prototype.calloutback = function() {
  var self = this;
  var context = self.context;
  var schemas = self.schemas;
  var callRecordsID = null;
  var keyNum = null;
  var logger = self.logger;
  async.auto({
      //通过通道变量获取呼叫记录编号
      getCallrcordsId: function(cb) {
        context.getVariable('callrecordid', function(err, response) {
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
      //获取当前拨打的号码
      getPhones: ['getKeyNum',
        function(cb, results) {
          schemas.CallPhone.all({
            where: {
              callRecordsID: callRecordsID,
              State: 1
            },
            order: ['PhoneSequ desc']
          }, function(err, insts) {
            cb(err, insts);

          });
        }
      ],
      //更新呼叫记录
      updateCallRecords: ['getKeyNum',
        function(cb, results) {
          schemas.CallRecords.update({
            where: {
              id: callRecordsID
            },
            update: {
              CallState: 2
            }
          }, function(err, inst) {
            cb(err, inst);
          });
        }
      ],
      //获取按键记录
      getKey: ['getPhones', 'updateCallRecords',
        function(cb, results) {
          var phone = results.getPhones[0];
          //获取用户按键函数
          //count  当前第几次调用
          var GetInputKey = function(count) {
            async.auto({
              //播放语音
              playinfo: function(callback) {
                context.GetData('welcome', 5000, 1, function(err, response) {
                  console.log("撒也不按，挂机了", response);
                  callback(err, response);
                });
              },
              //检查用户按键
              checkinput: ['playinfo',
                function(callback, results) {
                  var key = results.playinfo.result;
                  key.replace(/\s+/, "");
                  //记录用户按键到按键记录表
                  schemas.UserKeysRecord.create({
                    id: guid.create(),
                    Key: key,
                    keyTypeID: '111111',
                    callLogID: phone.id
                  }, function(err, inst) {
                    var intkey = parseInt(key);
                    if (intkey <= keyNum) {
                      count = 100;
                      callback(err, {
                        count: count,
                        key: key
                      });
                    } else if (key === '0') {
                      count = 100;
                      callback(err, {
                        count: count,
                        key: key
                      });
                    } else if (key === conf.replaykey) {
                      count++;
                      callback(err, {
                        count: count,
                        key: key
                      });
                    } else {
                      context.Playback('b_error', function(err, response2) {
                        count++;
                        callback(err, {
                          count: count,
                          key: key
                        });
                      });
                    }
                  });
                }
              ]
            }, function(err, results) {
              logger.debug("当前循环次数：", results.checkinput);
              //直接挂机了
              if (results.checkinput.key === '-1') {
                schemas.DialResult.update({
                  where: {
                    id: callRecordsID
                  },
                  update: {
                    Result: 3,
                    State: 1
                  }
                }, function(err, inst) {
                  cb(err, inst);
                });
              }
              //按键错误或等待按键超时小于3次
              else if (results.checkinput.count < 3) {
                GetInputKey(results.checkinput.count);
              }
              //用户确定参加评标
              else if (results.checkinput.count == 100 && results.checkinput.key !== '0') {
                self.SureCome(callRecordsID, phone, results.checkinput.key, function(err, results) {
                  cb(err, results);
                });
              }
              //用户确定不参加评标
              else if (results.checkinput.count == 100 && results.checkinput.key === '0') {
                self.NoCome(callRecordsID, function(err, results) {
                  cb(err, results);
                });
              }
              //播放三次无反应
              else {

                schemas.DialResult.update({
                  where: {
                    id: callRecordsID
                  },
                  update: {
                    Result: 3,
                    State: 1
                  }
                }, function(err, inst) {
                  context.Playback('b_timeout&b_bye', function(err, response) {
                    context.hangup(function(err, response) {
                      context.end();
                      cb(err, inst);
                    });

                  });

                });


              }

            });
          }

          var count = 0;
          GetInputKey(count);

        }
      ],
    },

    function(err, results) {
      if (err) {
        console.log(results.getKey);
        context.hangup(function(err, response) {
          context.end();
        });
      }

    });

}


//发起拨打下一个电话

routing.prototype.NextDial = function(callrecordsid, keyNum, cb) {
  var self = this;
  var context = self.context;
  var schemas = self.schemas;
  var logger = self.logger;
  var AMI = self.nami;

  async.auto({
    getPhones: function(cb) {
      schemas.CallPhone.all({
        where: {
          callRecordsID: callrecordsid,
          State: 0
        },
        order: ['PhoneSequ asc']
      }, function(err, insts) {
        cb(err, insts);

      });
    },
    startnewdial: ['getPhones',
      function(cb, results) {
        if (results.getPhones && results.getPhones.length > 0) {

          var channel = "LOCAL/" + 200 + "@sub-outgoing";
          var Context = 'sub-outgoing-callback';
          var action = new AsAction.Originate();
          action.Channel = channel;
          //action.Timeout=30;
          action.Async = true;
          action.Account = callrecordsid;
          action.CallerID = 200;
          action.Context = Context;
          action.Variable = 'callrecordid=' + callrecordsid + ',keynum=' + keyNum;
          action.Exten = 200;
          if (AMI.connected) {
            AMI.send(action, function(response) {
              cb(null, response);
            });
          } else {
            AMI.open();
            AMI.send(action, function(response) {
              cb(null, response);
            });

          }


        } else {
          cb();

        }
      }
    ]

  }, function(err, results) {
    cb(err, results);
  });

}

//确定参加评标后处理

routing.prototype.SureCome = function(callrecordid, phone, key, cb) {
  var self = this;
  var context = self.context;
  var schemas = self.schemas;
  var logger = self.logger;
  async.auto({
    saveDialResult: function(callback) {
      schemas.DialResult.update({
        where: {
          id: callrecordid
        },
        update: {
          Result: 1,
          State: 1
        }
      }, function(err, inst) {
        callback(err, inst);
      });
    },
    voiceNotice: ['saveDialResult',
      function(callback, results) {
        var Notice = function(count) {
          async.auto({
            playvoice: function(callback) {
              context.GetData('b_you_have_joined_please_bring_cert', 5000, 1, function(err, response) {
                callback(err, response);
              });
            },
            checkInput: ['playvoice',
              function(callback, results) {
                var key = results.playvoice.result;
                key.replace(/\s+/, "");
                //记录用户按键到按键记录表
                schemas.UserKeysRecord.create({
                  id: guid.create(),
                  Key: key,
                  keyTypeID: '111111',
                  callLogID: phone.id
                }, function(err, inst) {
                  switch (key) {
                    case "9":
                      count++;
                      callback(err, {
                        count: count,
                        key: key
                      });
                      break;
                    default:
                      context.Playback('b_error', function(err, response2) {
                        count++;
                        callback(err, {
                          count: count,
                          key: key
                        });
                      });
                      break;
                  }
                });
              }
            ]


          }, function(err, results) {
            if (results.checkInput.key === '-1') {
              callback(null, -1);
            } else if (results.checkInput.count < 3) {
              Notice(results.checkInput.count);
            } else {
              context.Playback('b_timeout&b_bye', function(err, response) {
                context.hangup(function(err, response) {
                  context.end();
                });

              });
            }

          });
        }

        var count = 0;
        Notice(count);


      }
    ]
  }, function(err, results) {
    cb(err, results);
  });
}

//确定不参加评标

routing.prototype.NoCome = function(callrecordid, cb) {
  var self = this;
  var context = self.context;
  var schemas = self.schemas;
  var logger = self.logger;
  async.auto({
    saveDialResult: function(callback) {
      schemas.DialResult.update({
        where: {
          id: callrecordid
        },
        update: {
          Result: 3,
          State: 1
        }
      }, function(err, inst) {
        callback(err, inst);
      });
    },
    voiceNotice: ['saveDialResult',
      function(callback, results) {
        context.Playback('b_bye', function(err, response) {
          context.hangup(function(err, response) {
            context.end();
            callback(err, response);
          });

        });
      }
    ]
  }, function(err, results) {
    cb(err, results);
  });
}
module.exports = routing;
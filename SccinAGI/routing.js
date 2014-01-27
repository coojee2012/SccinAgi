var async = require('async');
var AsAction = require("nami").Actions;
var guid = require('guid');
var routing = {};

//呼叫路由处理
routing.router = function(context, args, variables, schemas) {
  //console.log(this);

  context.hangup(function(err, rep) {
    console.log("Hangup success:", rep);
  });
  context.end();
}
//自动语音应答处理
routing.ivr = function(context, vars) {

};
//内部拨打
routing.diallocal = function(context, vars) {


};
//拨打队列
routing.queue = function(context, vars) {


};
//拨打外部电话
routing.dialout = function(context, vars) {

};
//默认触发处理
routing.
default = function(context, vars) {
  context.hangup(function(err, rep) {
    console.log("Hangup success:", rep);
    context.end();
  });

}

//北京专家库自动外呼
//sccincallout?callRecordsID=
routing.sccincallout = function(context, vars) {
  var callRecordsID = vars.args.callRecordsID;
  var schemas = vars.schemas;
  var AMI = vars.nami;
  async.auto({
    getcallrcordsid: function(cb) {
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
    getPhones: ['getcallrcordsid',
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
    updateCallRecords: ['getPhones',
      function(cb, results) {
        if (results.getPhones && results.getPhones.length > 0) {
          schemas.CallRecords.update({
            where: {
              id: callRecordsID
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
    Dial: ['getPhones', 'updateDialResult', 'updateCallRecords',
      function(cb, results) {
        if (results.getPhones && results.getPhones.length > 0) {
          async.auto({
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
            addCallLog: function(cb) {
              schemas.CallLog.create({
                Phone: results.getPhones[0].Phone,
                PhoneSequ: results.getPhones[0].PhoneSequ,
                callphone: results.getPhones[0]
              }, function(err, inst) {
                cb(err, inst);
              });
            },
            dial: ['addCallLog', 'updateCallPhone',
              function(cb) {
                context.Dial('SIP/8001', function(err, response) {
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
      context.hangup(function(err, response) {
        console.log("没有找到需要拨打的号码，挂机！");
      });
    } else {
      var anwserstatus = results.Dial.dialStatus.Key;
      if (anwserstatus === 'CONGESTION') {
        context.hangup(function(err, response) {
          console.log("被叫直接挂机！！");
        });
      }
      if (anwserstatus !== 'ANSWER') {
        NextDial(AMI, schemas, callRecordsID, function(err, result) {
          console.log("继续拨打成功！");
        });
      } else {
        console.log("准备开始播放语音文件。");
      }
    }
  });

};


routing.hangupcall = function(context, vars) {
  console.log(vars);
}

//北京专家库自动拨打接通后处理程序
routing.calloutback = function(context, vars) {
  var schemas = vars.schemas;
  var callRecordsID = null;
  async.auto({
      //通过通道变量获取呼叫记录编号
      getcallrcordsid: function(cb) {
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
      //获取当前拨打的号码
      getPhones: ['getcallrcordsid',
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
      updateCallRecords: ['getcallrcordsid',
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
                    switch (key) {
                      case "1":
                        count = 100;
                        callback(err, {
                          count: count,
                          key: key
                        });
                        break;
                      case "2":
                        count = 100;
                        callback(err, {
                          count: count,
                          key: key
                        });
                        break;
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
              console.log("当前循环次数：", results.checkinput);
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
              else if (results.checkinput.count == 100 && results.checkinput.key === '1') {
                SureCome(context, schemas, callRecordsID, phone, cb);
              } 
              //用户确定不参加评标
              else if (results.checkinput.count == 100 && results.checkinput.key === '2') {

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
      /* context.hangup(function(err, response) {
      context.end();
    });*/
    });

}

function dial(context, schemas, items, cb) {
  var count = 0;
  async.whilst(
    function() {
      return count < items.length;
    },
    function(callback) {

      async.auto({
        addCallinfo: function(cb) {
          var callphone = new schemas.CallPhone(items[count]);
          callphone.State = 1;
          callphone.save(function(err, inst) {
            cb(err, inst);
          });

        },
        dial: ['addCallinfo',
          function(cb, res2) {
            context.Dial('SIP/800' + (count + 1), function(err, response) {
              console.log('拨打电话完毕。');
              if (response.result != '1') {
                console.log('呼叫不成功');
                cb('呼叫不成功', response);

              } else {
                console.log('呼叫成功');
                cb('呼叫成功', response);
              }

            });
          }
        ]
      }, function(err, results) {
        console.log("完成次数:", count);
        count++;
        cb(err, results);


      });
    },
    function(err) {
      // 5 seconds have passed
    }
  );

}

function NextDial(AMI, schemas, callrecordsid, cb) {
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
          action.Variable = 'callrecordid=' + callrecordsid + ',testvar=test';
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

function SureCome(context, schemas, callrecordid, phone, cb) {
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
            playvoice: function(CB) {
              context.GetData('b_you_have_joined_please_bring_cert', 5000, 1, function(err, response) {
                CB(err, response);
              });
            },
            checkInput: ['playvoice',
              function(CB, results) {
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
                      CB(err, {
                        count: count,
                        key: key
                      });
                      break;
                    default:
                      context.Playback('b_error', function(err, response2) {
                        count++;
                        CB(err, {
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
            if (results.checkInput.count < 3) {
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

function NoCome(context, schemas, callrecordid, cb) {

}
module.exports = routing;
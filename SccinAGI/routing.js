var async = require('async');
var AsAction = require("nami").Actions;
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

//北京专家库自动外呼处理
//sccincallout?callRecordsID=
routing.sccincallout = function(context, vars) {
  var callRecordsID = vars.args.callRecordsID;
  var schemas = vars.schemas;
  var AMI = vars.nami;
  async.auto({
    getPhones: function(cb) {
      schemas.CallPhone.all({
        where: {
          callRecordsID: callRecordsID,
          State: 0
        },
        order: ['PhoneSequ asc']
      }, function(err, insts) {
        cb(err, insts);

      });
    },
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
            addCallinfo: function(cb) {
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
            dial: ['addCallinfo',
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
            ]
          }, function(err, results) {
            cb(err, results);
          });
        } else {
         cb('未有找到电话号码', results);
        }
      }
    ]


  },function(err, results) {
    if(err){
      console.log("错误捕获处理！");
       context.hangup(function(err, response) {
            console.log("没有找到需要拨打的号码，挂机！");
          });
    }
    else{
    var re = /1\s+\(ANSWER\)/;
    var test = re.test(results.Dial.dial.result);
    re.lastIndex = 0;
    if (!test) {
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

routing.calloutback = function(context, vars) {

  context.Playback('welcome', 'skip', function(err, response) {
    context.hangup(function(err, response) {
      context.end();
    });
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

          var channel = "LOCAL/" + callrecordsid + "@sub-outgoing";
          var Context = 'sub-outgoing-callback';
          var action = new AsAction.Originate();
          action.Channel = channel;
          //action.Timeout=30;
          action.Async = true;
          action.Account = 8801;
          action.CallerID = 8801;
          action.Context = Context;
          action.Exten = 8801;
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
module.exports = routing;
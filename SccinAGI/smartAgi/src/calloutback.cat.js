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
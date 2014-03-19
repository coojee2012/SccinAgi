//确定参加评标后处理

routing.prototype.SureCome = function(callrecordid, phone, keyNum, cb) {
  var self = this;
  var context = self.context;
  var schemas = self.schemas;
  var logger = self.logger;
  async.auto({
    saveDialResult: function(callback) {
      try {
        schemas.crmDialResult.update({
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
      } catch (ex) {
        logger.error('保存拨打结果发生异常:', ex);
        callback('保存拨打结果发生异常！', null);
      }
    },
    voiceNotice: ['saveDialResult',
      function(callback, results) {
        var Notice = function(count) {
          async.auto({
            playvoice: function(callback) {
              try {
                context.GetData('/home/share/'+'sure', 5000, 1, function(err, response) {
                  callback(err, response);
                });
              } catch (ex) {
                logger.error('语音通知确认评标发生异常:', ex);
                callback('语音通知确认评标发生异常！', null);
              }
            },
            checkInput: ['playvoice',
              function(callback, results) {
                try{
                var key = results.playvoice.result;
                key.replace(/\s+/, "");
                //记录用户按键到按键记录表
                schemas.crmUserKeysRecord.create({
                  id: guid.create(),
                  Key: key,
                  keyTypeID: '111111',
                  callLogID: phone.id
                }, function(err, inst) {
                  switch (key) {
                    case keyNum[2]:
                      count++;
                      callback(err, {
                        count: count,
                        key: key
                      });
                      break;
                      case "timeout":
                       context.Playback('timeout', function(err, response2) {
                        count++;
                        callback(err, {
                          count: count,
                          key: key
                        });
                      });
                      break;
                    default:
                      context.Playback('inputerror', function(err, response2) {
                        count++;
                        callback(err, {
                          count: count,
                          key: key
                        });
                      });
                      break;
                  }
                });
              }catch(ex){
                logger.error('语音通知确认评标记录按键发生异常:', ex);
                callback('语音通知确认评标记录按键发生异常！', null);
              }
              }
            ]


          }, function(err, results) {
            if (results.checkInput.key === '-1') {
              callback(null, -1);
            } else if (results.checkInput.count < 3) {
              Notice(results.checkInput.count);
            } else {
              context.Playback('waiteout', function(err, response) {
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
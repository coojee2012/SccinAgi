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
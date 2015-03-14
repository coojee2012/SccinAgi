//确定不参加评标
routing.prototype.NoCome = function(callrecordid, cb) {
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
            Result: 2,
            State: 1
          }
        }, function(err, inst) {
          callback(err, inst);
        });
      } catch (ex) {
        logger.error('记录确认不参加评标发生异常:', ex);
        callback('记录确认不参加评标发生异常！', null);
      }
    },
    voiceNotice: ['saveDialResult',
      function(callback, results) {
        context.Playback('nosure', function(err, response) {
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
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
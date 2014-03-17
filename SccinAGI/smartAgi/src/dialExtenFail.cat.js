//呼叫坐席分机失败处理
routing.prototype.dialExtenFail = function(extennum, failstatus, callback) {
  var self = this;
  var context = self.context;
  var schemas = self.schemas;
  var nami = self.nami;
  var logger = self.logger;
  var args = self.args;
  var vars = self.vars;
  async.auto({
      getFailOptions: function(cb) {
        schemas.pbxExtension.find(extennum, function(err, inst) {
          if (err || inst == null) {
            cb('呼叫失败处理获取分机信息发生异常！', -1);
          } else {
            cb(null, inst);
          }
        });
      },
      doFail: ['getFailOptions',
        function(cb, results) {
          var failargs = str2obj(results.getFailOptions.failed);
          logger.debug('呼叫失败处理:', results.getFailOptions.failed);
          if (failargs.deailway && failargs.deailway !== '' && typeof(failargs.deailway) === 'function') {
            self[failargs.deailway](failargs.number, function(err, result) {
              cb(err, result);
            });
          } else {
            self.hangup('', function(err, result) {
              cb(err, result);
            });
          }
        }
      ]
    },
    function(err, results) {
      callback(err, -results);
    });

}
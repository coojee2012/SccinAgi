//内部拨打
routing.prototype.diallocal = function(localnum, callback) {
  var self = this;
  var context = self.context;
  var schemas = self.schemas;
  var nami = self.nami;
  var logger = self.logger;
  var args = self.args;
  var vars = self.vars;

  if (!localnum || localnum === '') {
    localnum = args.localnum;
  }
  if (!callback || typeof(!callback) !== 'function') {
    callback = function(err, results) {
      if (err)
        context.hangup(function(err, rep) {});
      else
        context.end();
    }
  }
  async.auto({
    updateCDR: function(cb) {
      schemas.pbxCdr.update({
        where: {
          id: self.sessionnum
        },
        update: {
          lastapptime: moment().format("YYYY-MM-DD HH:mm:ss"),
          lastapp: '本地呼叫'
        }
      }, function(err, inst) {
        cb(err, inst);
      });
    },
    //在本地号码表里面寻找合适的号码，如果没有找到，默认到IVR号码为200
    findLocal: ['updateCDR',
      function(cb, results) {
        schemas.pbxLocalNumber.findOne({
          where: {
            id: localnum
          }
        }, function(err, inst) {
          if (err)
            cb(err, inst);
          logger.debug(inst);
          if (inst != null) {
            logger.debug("本地处理："+inst.localtype);
            self[inst.localtype](localnum, inst.assign, function(err, result) {
              cb(err, result);
            });
          }
          //默认拨打IVR 200 1
          else {
            logger.debug("本地默认处理拨打IVR200");
            self.ivr(200, 1, function(err, result) {
              cb(err, result);
            })
          }
        });
      }
    ]
  }, function(err, results) {
    callback(err, results);
  });

};
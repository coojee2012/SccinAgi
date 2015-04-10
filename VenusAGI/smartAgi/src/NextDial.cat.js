//发起拨打下一个电话

routing.prototype.NextDial = function(callrecordsid, keyNum, cb) {
  var self = this;
  var context = self.context;
  var schemas = self.schemas;
  var logger = self.logger;
  var AMI = self.nami;

  async.auto({
    getPhones: function(cb) {
      schemas.crmCallPhone.all({
        where: {
          callRecordsID: callrecordsid,
          State: 0
        }//,
        //order: ['PhoneSequ asc']
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
          action.CallerID = 66899866;
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
          cb(null,'over');
        }
      }
    ]

  }, function(err, results) {
    cb(err, results);
  });

}
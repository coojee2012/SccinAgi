var async = require('async');
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
  async.auto({
      getPhones: function(cb) {
        schemas.CallPhone.all({
          where: {
            callRecordsID: callRecordsID
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
          async.forEachSeries(results.getPhones, function(item, callback) {
            async.auto({
              addCallinfo:function(){

              },
              dial:function(){
                context.Dial('SIP/8001',function(){
                  console.log('answer channels');
                });
              }
            },function(){
              callback();

            });
            
          }, cb);
        }
      ]


    }, function(err, results) {
      context.hangup();
    }


  );



/*  context.GetData('welcome', 30000, 3, function(err, response) {
    console.log("获取到数据:", response);
    var digi = response.result || 111111;
    console.log(digi);
    context.SayDigits(digi, function(err, response) {



    });

    context.hangup();

  });*/
  /*context.answer(function(){
context.Playback('welcome','skip');	
});*/

  //context.hangup();
};


routing.calloutback=function(context,vars){

context.Playback('welcome','skip'); 
}

function dial(item, cb) {

}
module.exports = routing;
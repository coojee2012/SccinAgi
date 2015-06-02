//北京专家库自动拨打接通后处理程序
routing.prototype.calloutback = function() {
  var self = this;
  var context = self.context;
  var schemas = self.schemas;
  var callRecordsID = null;
  var keyNum = null;
  var ProjMoveID = null;
  var logger = self.logger;
  self.args.routerline = '扩展应用';
  var args = self.args;
  var vars = self.vars;
  async.auto({
      AddCDR: function(cb) {
        schemas.pbxCdr.create({
          id: self.sessionnum,
          caller: vars.agi_callerid,
          called: args.called,
          accountcode: vars.agi_accountcode,
          routerline: args.routerline,
          srcchannel: vars.agi_channel,
          uniqueid: vars.agi_uniqueid,
          threadid: vars.agi_threadid,
          context: vars.agi_context,
          agitype: vars.agi_type,
          lastapptime: moment().format("YYYY-MM-DD HH:mm:ss"),
          lastapp: 'calloutback',
          answerstatus: 'CALLBACK'
        }, function(err, inst) {
          cb(err, inst);
        });
      },
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
      getProjMoveID: ['getCallrcordsId',
        function(cb, results) {
          schemas.crmCallRecords.find(callRecordsID, function(err, inst) {
            if (err || inst === null) {
              cb(err, inst);
            } else {
              ProjMoveID = inst.ProjMoveID;
              cb(null, inst.ProjMoveID);
            }
          });
        }
      ],
      //通过通道变量获取有效按键
      getKeyNum: ['getCallrcordsId',
        function(cb, results) {
          context.getVariable('keynum', function(err, response) {
            var reg = /(\d+)\s+\((.*)\)/;
            var c = null,
              id = null;
            if (reg.test(response.result)) {
              c = RegExp.$1;

              //keyNum = parseInt(RegExp.$2);
              keyNum = RegExp.$2.split('\|');
              logger.debug('keyNum:', keyNum);
            }
            cb(err, keyNum);
          });
        }
      ],
      //获取当前拨打的号码
      getPhones: ['getKeyNum',
        function(cb, results) {
          schemas.crmCallPhone.all({
            where: {
              callRecordsID: callRecordsID,
              State: 1
            } //,
            //order: ['PhoneSequ desc']
          }, function(err, insts) {
            cb(err, insts);

          });
        }
      ],
      //更新呼叫记录
      updateCallRecords: ['getKeyNum',
        function(cb, results) {
          schemas.crmCallRecords.update({
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
      getKey: ['getPhones', 'getProjMoveID', 'updateCallRecords',
        function(cb, results) {
          var phone = results.getPhones[0];
          //获取用户按键函数
          //count  当前第几次调用      
          var hangupStatus = function() {
            schemas.crmDialResult.update({
              where: {
                id: callRecordsID
              },
              update: {
                Result: 3,
                State: 1
              }
            }, function(err, inst) {
              if (context.stream && context.stream.readable) {
                console.log('context.stream.readable:',context.stream.readable);
                context.Playback('waiteout', function(err, response) {
                  context.hangup(function(err, response) {
                    context.end();
                    cb(err, inst);
                  });
                });
              }

            });
          }

          var GetInputkey = function(count) {
            //操过最大次数
            if (count > 2) {
              hangupStatus();
            }
            //没有超过 
            else {
                context.Playback('/home/share/' + results.getProjMoveID + '-notice', function(err, response) {
                    if(err){
                        //console.log("Playback err:",response);
                        hangupStatus();
                        cb(err,response);
                    }
                    else{
                        //console.log("Playback success:",response);
                        if(response. result ===  '0') {
                            context.waitForDigit(5000, function (err, response) {
                                // context.GetData('/home/share/' + results.getProjMoveID + '-notice', 5000, 1, function(err, response) {

                                if (err) {
                                    cb(err, null);
                                }

                                else {

                                    // var key = response.result;
                                    //  key.replace(/\s+/, "");

                                    var key = String.fromCharCode(response.result);
                                    //记录用户按键到按键记录表
                                    schemas.crmUserKeysRecord.create({
                                        id: guid.create(),
                                        Key: key,
                                        keyTypeID: '111111',
                                        callLogID: phone.id
                                    }, function (err, inst) {
                                    });
                                    //确认参加

                                    if (key === keyNum[0]) {
                                        logger.debug("专家确定参加评标！");
                                        var GetSureKey = function (surecount) {
                                            if (surecount > 2) {
                                                hangupStatus();
                                            } else {

                                                context.GetData('suercomttip', 5000, 1, function (errsure, responsesure) {
                                                    if (errsure)
                                                        cb(errsure, null);
                                                    else {
                                                        logger.debug("再次确认参加收键:", responsesure);
                                                        var keysure = responsesure.result;
                                                        keysure.replace(/\s+/, "");
                                                        //记录用户按键到按键记录表
                                                        schemas.crmUserKeysRecord.create({
                                                            id: guid.create(),
                                                            Key: keysure,
                                                            keyTypeID: '111111',
                                                            callLogID: phone.id
                                                        }, function (err, inst) {
                                                        });
                                                        //按井号确认参加
                                                        if (keysure === '' || keysure === '#') {
                                                            self.SureCome(callRecordsID, ProjMoveID, phone, keyNum, function (err, results) {
                                                                cb(err, results);
                                                            });
                                                        }
                                                        //按星号重新确认
                                                        else if (keysure === '*') {
                                                            count++
                                                            GetInputkey(count);
                                                        }
                                                        //等待确认按键超时
                                                        else if (/timeout/.test(keysure) && surecount < 3) {
                                                            context.Playback('timeout', function (err22, response22) {
                                                                if (err22)
                                                                    cb(err22, null);
                                                                else {
                                                                    surecount++;
                                                                    GetSureKey(surecount);
                                                                }

                                                            });

                                                        } else if (keysure !== '-1' && surecount < 3) {
                                                            context.Playback('inputerror', function (err22, response22) {
                                                                if (err22)
                                                                    cb(err22, null);
                                                                else {
                                                                    surecount++;
                                                                    GetSureKey(surecount);
                                                                }

                                                            });

                                                        }
                                                        //按键错误或等待超时就挂机了
                                                        else {
                                                            hangupStatus();
                                                        }
                                                    }
                                                });
                                            }
                                        }
                                        GetSureKey(0);
                                    }
                                    //不参加
                                    else if (key === keyNum[1]) {
                                        logger.debug("专家确定不参加评标！");
                                        var GetCannelKey = function (CannelCount) {

                                            if (CannelCount + 0 > 2) {
                                                hangupStatus();
                                            } else {
                                                logger.debug("专家确定不参加评标次数：", CannelCount);
                                                context.GetData('canneltip', 5000, 1, function (errcannel, responsecannel) {
                                                    if (errcannel)
                                                        cb(errcannel, null);
                                                    else {
                                                        var keycannel = responsecannel.result;
                                                        keycannel.replace(/\s+/, "");
                                                        //记录用户按键到按键记录表
                                                        schemas.crmUserKeysRecord.create({
                                                            id: guid.create(),
                                                            Key: keycannel,
                                                            keyTypeID: '111111',
                                                            callLogID: phone.id
                                                        }, function (err, inst) {
                                                        });
                                                        //按井号确认参加
                                                        if (keycannel === '' || keycannel === '#') {
                                                            self.NoCome(callRecordsID, function (err, results) {
                                                                cb(err, results);
                                                            });
                                                        }
                                                        //按星号重新确认
                                                        else if (keycannel === '*') {
                                                            count++;
                                                            GetInputkey(count);
                                                        }
                                                        //等待确认按键超时
                                                        else if (/timeout/.test(keycannel)) {
                                                            context.Playback('timeout', function (err22, response22) {
                                                                if (err22)
                                                                    cb(err22, null);
                                                                else {
                                                                    CannelCount++;
                                                                    GetCannelKey(CannelCount);
                                                                }

                                                            });

                                                        } else if (keycannel !== '-1') {
                                                            context.Playback('inputerror', function (err22, response22) {
                                                                if (err22)
                                                                    cb(err22, null);
                                                                else {
                                                                    CannelCount++;
                                                                    GetCannelKey(CannelCount);
                                                                }

                                                            });

                                                        }
                                                        //按键错误或等待超时就挂机了
                                                        else {
                                                            hangupStatus();
                                                        }
                                                    }
                                                });
                                            }
                                        }
                                        GetCannelKey(0);
                                    }
                                    //重听
                                    else if (key === keyNum[2]) {
                                        logger.debug("专家重听评标信息！");
                                        count++;
                                        GetInputkey(count);
                                    }
                                    //等待确认按键超时
                                    else if (/timeout/.test(key)) {
                                        logger.debug("等待专家按键超时！");
                                        context.Playback('timeout', function (err22, response22) {
                                            if (err22)
                                                cb(err22, null);
                                            else {
                                                count++;
                                                GetInputkey(count);
                                            }

                                        });

                                    }
                                    //挂机
                                    else if (key !== '-1') {
                                        logger.debug("专家按键错误！");
                                        context.Playback('inputerror', function (err22, response22) {
                                            if (err22)
                                                cb(err22, null);
                                            else {
                                                count++;
                                                GetInputkey(count);
                                            }

                                        });

                                    }
                                    //按键错误或等待超时就挂机了
                                    else {
                                        hangupStatus();
                                    }
                                }

                            });
                        }
                        else{
                            hangupStatus();
                        }
                    }
                });

               //end
            }

          }



          GetInputkey(0);


        }
      ]
    },function(err, results) {
      if (err) {
          schemas.crmDialResult.update({
              where: {
                  id: callRecordsID
              },
              update: {
                  Result: 3,
                  State: 1
              }
          },function(err, inst) {
          });
        //console.log(results.getKey);
        if (context.stream && context.stream.readable) {
          context.hangup(function(err, response) {
            context.end();
          });
        }
      }
    });

}
//循环执行IVR动作
//actionid 当前执行编号
//需要执行的actions
//按键终端信息
//回掉函数
routing.prototype.ivraction = function(actionid, actions, inputs, callback) {
  var self = this;
  var context = self.context;
  var schemas = self.schemas;
  var nami = self.nami;
  var logger = self.logger;
  var args = self.args;
  var vars = self.vars;
  logger.debug("进入IVR动作执行流程编号:", actionid);

  if (actionid < actions.length) {
    logger.debug(actions[actionid].__cachedRelations.Actmode);
    var actmode = actions[actionid].__cachedRelations.Actmode;
    var actargs = str2obj(actions[actionid].args);
    /* if (actions[actionid].args && actions[actionid].args != "") {
      var tmp = actions[actionid].args.split('&');
      for (var i in tmp) {
        var kv = tmp[i].split('=');
        actargs[kv[0]] = kv[1];
      }
    }*/

    schemas.pbxCallProcees.create({
      callsession: self.sessionnum,
      caller: vars.agi_callerid,
      called: args.called,
      routerline: args.routerline,
      passargs: 'actionid=' + actionid + '&' + actions[actionid].args,
      processname: actmode.modename,
      doneresults: ''
    }, function(err, inst) {
      if (err)
        logger.error("记录呼叫处理过程发生异常：", err);
    });

    logger.debug("Action 参数:", actargs);
    //async auto 执行action 开始
    async.auto({
      Action: function(cb) {
        if (actmode.modename === '播放语音') {
          //不允许按键中断
          logger.debug("IVR播放语音");
          if (actargs.interruptible !== 'true') {
            logger.debug("准备播放语音。");
            context.Playback(actargs.folder + '/' + actargs.filename, function(err, response) {
              logger.debug("Playback:", response);
              cb(err, response);
            });
          }
          //允许按键中断
          else {
            //获取用户按键函数
            //count  当前第几次调用
            var retrytime = 3;
            if (actargs.retrytime && /\d+/.test(actargs.retrytime))
              retrytime = parseInt(actargs.retrytime);
            var timeout = 5000;
            if (actargs.timeout && /\d+/.test(actargs.timeout))
              timeout = parseInt(actargs.timeout) * 1000;
            var failivrnum = actargs.failivrnum;
            var failactid = 0;
            if (actargs.failactid && /\d+/.test(actargs.failactid))
              failactid = parseInt(actargs.failactid);

            var GetInputKey = function(count) {
              async.auto({
                //播放语音
                playinfo: function(callback) {
                  context.GetData(actargs.folder + '/' + actargs.filename, timeout, 1, function(err, response) {
                    callback(err, response);
                  });
                },
                //检查用户按键
                checkinput: ['playinfo',
                  function(callback, results) {
                    var key = results.playinfo.result;
                    key = key.replace(/\s+|\(|\)/g, "");
                    self.ivrinput(key, inputs, function(err, result) {
                      if (result == 0) {
                        count++;
                        callback(err, {
                          count: count,
                          key: key
                        });
                      } else {
                        callback(err, {
                          count: 100,
                          key: key
                        });
                      }
                    });

                  }
                ]
              }, function(err, results) {
                logger.debug("当前循环次数：", results.checkinput);
                if (err) {
                  cb(err, -1);
                } else {
                  //直接挂机了
                  if (results.checkinput.key === '-1') {
                    cb('对方主动挂机。', -1);
                  }
                  //按键错误或等待按键超时小于3次
                  else if (results.checkinput.count < retrytime) {
                    GetInputKey(results.checkinput.count);
                  }
                  //播放三次无反应
                  else {
                    context.Playback('b_bye', function(err, response) {
                      cb('超过允许最大的按键等待次数或错误次数', -1);
                    });

                  }
                }

              });
            }

            var count = 0;
            GetInputKey(count);

          }

        }
        // 检查号码归属地
        else if (actmode.modename === '检查号码归属地') {



        } else if (actmode.modename === '发起录音') {
          var maxduration = actargs.maxduration || 60; //默认最多可以录制1小时，0表示随便录好久
          var options = actargs.options || 'sy'; //默认如果没应答就跳过录音
          var format = actargs.format || 'wav'; //默认文件后缀名
          var silence = actargs.silence || 10; //如果持续了超过X秒的沉默，将停止录音，默认10秒,0表示不判断
          var filename = "";
          if (/\<\%(\w+)\%\>(\S+)/.test(actargs.varname)) {
            var hans = RegExp.$1;
            var extname = RegExp.$2;
            if (hans !== '' && typeof(commonfun[hans]) === 'function') {
              filename += commonfun[hans]();
              filename += '-' + extname;
            } else {
              filename = extname;
            }
          } else {
            filename = actargs.varname;
          }
          var filepath = '/var/spool/asterisk/monitor/IVR/' + actions[actionid].ivrnumber + '/';

          async.auto({
            buildDir: function(cb) {
              commonfun.mkdir(filepath, function(err, path) {
                if (err)
                  cb(null, '/var/spool/asterisk/monitor/');
                else
                  cb(null, path);
              });
            },
            createFile:['buildDir',function(cb){

            }],
            recording:[],
            addRecord:[]
          }, function(err, results) {

          });

        } else if (actmode.modename === '播放录音') {

        }
        //录制数字字符
        else if (actmode.modename === '录制数字字符') {
          logger.debug("准备开始录制数字字符。");
          var maxdigits = 20; //默认最多可接收20个按键
          var inputkey = '';
          if (actargs.maxdigits && /\d+/.test(actargs.maxdigits))
            maxdigits = parseInt(actargs.maxdigits);
          if (maxdigits <= 0) {
            cb(null, 1);
          } else {
            async.auto({
              GetKey: function(callback) {
                var beep = actargs.beep;
                var getkey = function() {
                  context.waitForDigit(6000, function(err, response) {
                    logger.debug(response);
                    if (err)
                      callback(err, response);
                    else {
                      var tmpkey = String.fromCharCode(response.result);
                      if (tmpkey !== '#')
                        inputkey = inputkey + tmpkey;
                      logger.debug("录制到数字字符:" + inputkey);
                      if (inputkey.length < maxdigits && tmpkey !== '#') //当没有到达指定位数或#号
                      {
                        getkey();
                      } else {
                        if (actargs.addbefore && actargs.addbefore === 'true')
                          inputkey = self.lastinputkey + inputkey; //添加上一层动作的最后一个按键输入
                        var tempvarname = 'lastwaitfordigit';
                        if (actargs.varname && actargs.varname !== '')
                          tempvarname = actargs.varname;

                        self.activevar[tempvarname] = inputkey; //将输入的按键保存到临时变量
                        logger.debug("保存到变量" + tempvarname + "的数字字符:" + self.activevar[tempvarname]);
                        callback(null, inputkey);
                      }

                    }
                  });

                };

                if (beep === 'true') {
                  context.Playback('beep', function(err, response) {
                    getkey();
                  });
                } else {
                  getkey();
                }
              }
            }, function(err, results) {
              cb(err, results);
            });


          }
        }
        //读出数字字符 
        else if (actmode.modename === '读出数字字符') {
          logger.debug("准备读出数字字符。");
          var tempvarname = 'lastwaitfordigit';
          if (actargs.varname && actargs.varname !== '')
            tempvarname = actargs.varname;
          var digits = self.activevar[tempvarname];
          logger.debug("准备从变量" + tempvarname + "读出数字字符:" + digits);
          if (actargs.digits && /\d+/.test(actargs.digits))
            digits = actargs.digits;
          if (digits && digits !== '') {
            async.auto({
              saydigits: function(callback) {
                logger.debug("需要读出数字字符:", digits);
                context.saydigits(digits, function(err, response) {
                  logger.debug("读出数字字符返回结果：", response);
                  callback(err, response);
                });
              }
            }, function(err, results) {
              cb(err, results);
            });

          } else {
            cb('没有需要读取的数字', -1);
          }

        } else if (actmode.modename === '数字方式读出') {

        } else if (actmode.modename === '读出日期时间') {

        } else if (actmode.modename === '检测日期') {

        } else if (actmode.modename === '主叫变换') {

        }
        //拨打号码
        else if (actmode.modename === '拨打号码') {
          var dialnum = self.activevar.lastwaitfordigit;
          if (actargs.varname && actargs.varname !== '')
            dialnum = self.activevar[actargs.varname];
          if (actargs.digits && actargs.digits !== '')
            dialnum = actargs.digits;
          if (/\d+/.test(dialnum)) {
            if (actargs.dialway && actargs.dialway !== '') {
              async.auto({
                dial: function(callback) {
                  logger.debug('拨打号码：' + actargs.dialway + "/" + dialnum);
                  self[actargs.dialway](dialnum, function(err, result) {
                    callback(err, result);
                  });
                }
              }, function(err, results) {
                cb(err, results);
              });


            } else {
              logger.debug('非法拨打方式');
              cb("非法拨打方式", -1);
            }

          } else {
            logger.debug('需要拨打的号码有误。');
            cb('需要拨打的号码有误。', -1);
          }


        } else if (actmode.modename === '跳转到语音信箱') {

        } else if (actmode.modename === '跳转到IVR菜单') {

        } else if (actmode.modename === 'WEB交互接口') {

        } else if (actmode.modename === 'AGI扩展接口') {

        } else if (actmode.modename === '等待几秒') {

        } else if (actmode.modename === '播放音调') {

        } else if (actmode.modename === '通道阀') {
          async.auto({
            getActiveChannels: function(callback) {
              var trunkProto = actargs.trunkProto;
              logger.debug("准备获取通道类型为:" + trunkProto + "的通道信息");
              if (trunkProto && trunkProto !== '') {
                trunkProto = trunkProto.toLowerCase();
                var action = new AsAction.Command();
                //action.Command='core show codecs';
                action.Command = trunkProto + ' show channels';
                if (nami.connected) {
                  nami.send(action, function(response) {
                    var lines = response.lines.pop();
                    callback(null, lines);
                  });
                } else {
                  nami.open();
                  nami.send(action, function(response) {
                    callback(null, response);
                  });

                }
              } else {
                callback('无效通道协议。', -1);
              }

            },
            dosth: ['getActiveChannels',
              function(callback, results) {
                var lines = results.getActiveChannels;
                if (lines && lines !== '') {
                  lines = lines.split('\n');
                }
                logger.debug("当前获取到" + actargs.trunkProto + "的通道信息:", lines)
                if (30 >= actargs.max) {
                  self.channelMax(function(err, result) {
                    callback(err, result);
                  });

                } else {
                  callback(null, 1);
                }

              }
            ]

          }, function(err, results) {
            cb(err, results);
          });
        }
        //默认挂机
        else {
          cb('默认处理', -1);
        }
      }
    }, function(err, results) {
      if (err)
        callback(err, -1);
      else {
        actionid++;
        self.ivraction(actionid, actions, inputs, callback);
      }

    }); //async auto 执行action 结束

  } else {
    callback('所有的动作执行完毕', -1);
  }
}
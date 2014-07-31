//循环执行IVR动作
//actionid 当前执行编号
//需要执行的actions
//按键终端信息
//回掉函数
/**
   执行动作参数说明：
   1、播放语音：interruptible：允许按键中断，【'true'/'false'】,默认为true
        folder:语音目录，相对于：/var/lib/asterisk/sounds/cn/
        filename:语音文件名
        下面参数在interruptible=true时有效
        retrytime：允许重听的次数，默认为3
        timeout：等待按键超时时间，毫秒，默认为10000
        failivrnum：获取按键失败处理IVR号码，默认为挂机IVR
        failactid：获取按键失败处理IVR号码动作编号，默认为0

   2、发起录音：varname：需要播放的录音变量名
             format：播放的录音格式
             maxduration：默认最多可以录制1小时，0表示随便录好久
             options：默认如果没应答就跳过录音
             【  a - 在已有录音文件后面追加录音.
                n - 即使电话没有应答，也要录音.
          q - 安静模式（录音前不播放beep声）.
        s - 如果线路未应答，将跳过录音.
        t - 用*号终止录音，代替默认按#号终止录音
        x - 忽略所有按键，只有挂机才能终止录音.
        k - 保持录音，即使线路已经挂断了.
        y - 任何按键都可以终止录音.】
             silence：如果持续了超过X秒的沉默，将停止录音，默认10秒,0表示不判断


   3、播放录音：varname：需要播放的录音变量名
             format：播放的录音格式
   4、录制数字字符：maxdigits：最大接收字符数，默认为20
            beep：【true/false】，录制字符前是否播放beep声，默认为false
            varname：保存的变量名，仅在当前会话有效
            addbefore：【true/false】,是否保存用户上一次的输入，默认为false
   5、读出数字字符：varname：需读出的变量名，仅在当前会话有效
            digits：直接读出给定的数字字符
   6、拨打号码：varname：从会话中保存的变量获取号码
          digits：指定号码
          dialway：拨打方式【diallocal/dialout】
   7、数字方式读出：varname：从给定的变量读取
                    digits：从给定的字符读取

   8、读出日期时间:fromvar:从变量中获取日期时间，格式 YYYYMMDD HHMM
                    fromstr:指定日期时间，格式 YYYYMMDD HHMM
                    saynow:[true,false],读出当前日期时间，true将不会从变量获取
                    sayway:[date,time,datetime]，读出方式

   9、检测日期：months：【1-12】，采用复选框的方式，传回的值用,号分开，如：1，3，5
                dates:[1-31]，采用复选框的方式，传回的值用,号分开，如：1，3，5
                weeks:[1-7]，采用复选框的方式，传回的值用,号分开，如：1，3，5               
                hours:[0-23]，采用复选框的方式，传回的值用,号分开，如：1，3，5
                minutes:[0-59]，采用复选框的方式，传回的值用,号分开，如：1，3，5

   10、主叫变换：optiontype：替换方式【replace，addbefore,append】
                  number:号码

   11、检查号码归属地:quhao:匹配的区号，可以是一组区号，用“,”号分开，如：010,028
                      doneway:处理方式，【diallocal,dialout】
                      number:处理号码
                      ivrnumber:成功匹配跳转到的IVR号码
                      actionid:IVR执行动作序号


   12、跳转到语音信箱

   13、跳转到IVR菜单：ivrnumber:成功匹配跳转到的IVR号码
                      actionid:IVR执行动作序号

   14、WEB交互接口

   15、AGI扩展接口

   16、等待几秒

   17、播放音调

   18、挂机


**/
routing.prototype.ivraction = function(actionid, actions, inputs, callback) {
  var self = this;
  var context = self.context;
  var schemas = self.schemas;
  var nami = self.nami;
  var logger = self.logger;
  var args = self.args;
  var vars = self.vars;
  logger.debug("进入IVR动作执行流程编号:", actionid);

  //if (context.stream && context.stream.readable) {
    if (actionid > 0 && actionid <= actions.length) {
      logger.debug(actions[actionid - 1].__cachedRelations.Actmode);
      var actmode = actions[actionid - 1].__cachedRelations.Actmode;
      var actargs = str2obj(actions[actionid - 1].args);
      logger.debug("Action 参数:", actargs);
      //async auto 执行action 开始
      async.auto({
        AddProcees: function(cb) {
          schemas.pbxCallProcees.create({
            callsession: self.sessionnum,
            caller: vars.agi_callerid,
            called: args.called,
            routerline: args.routerline,
            passargs: 'actionid=' + actionid + '&' + actions[actionid - 1].args,
            processname: actmode.modename,
            doneresults: ''
          }, function(err, inst) {
            if (err)
              logger.error("记录呼叫处理过程发生异常：", err);
            cb(err, inst);
          });
        },
        Action: function(cb) {
          //播放语音
          logger.debug('actionid:', actionid);
          if (actmode.modename === '播放语音') {
            //不允许按键中断
            logger.debug("IVR播放语音");
            var musicfile = actargs.folder + '/' + actargs.filename;
            if (actargs.specfile && actargs.specfile !== "") {


              var specfile = actargs.specfile;
              if (/\%(\S+)\%/.test(specfile)) {
                var tmp = RegExp.$1;
                var tmpval = self.activevar[tmp];
                logger.debug("播放语音上下文环境" + tmp + ":", tmpval);
                specfile = specfile.replace(/\%(\S+)\%/, tmpval);
                specfile = specfile.replace(/\%/g, "");
              }
              logger.debug("播放语音的绝对路径：", specfile);
              musicfile = specfile;
            }


            if (actargs.interruptible !== 'true') {
              logger.debug("准备播放语音。");
              context.Playback(musicfile, function(err, response) {
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
                    context.GetData(musicfile, timeout, 1, function(err, response) {
                      logger.debug("按键返回：",response);
                      callback(err, response);
                    });
                  },
                  //检查用户按键
                  checkinput: ['playinfo',
                    function(callback, results) {
                      var key = results.playinfo.result;
                      key = key.replace(/\s+|\(|\)/g, "");
                       logger.debug("用户按键：",key);
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
                      logger.debug("按键错误或等待按键超时，须重试！");
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
            var callerid = self.vars.agi_callerid;
            var quhao = actargs.quhao; //可以是“,”号分开的多个区号
            var doneway = actargs.doneway; //diallocal or dialout
            var number = actargs.number;
            if (!number || number === '' || !quhao || quhao === '') {
              cb('归属地匹配参数有误！', null);
            } else {
              quhao = quhao.split(',');
              if (/^(013|015|018|13|15|18)(\d{5})\d{4}$/.test(callerid)) {
                var haoma7 = RegExp.$1 + '' + RegExp.$2;
                haoma7 = haoma7.replace(/^0/, '');
                schemas.pbxMobileCode.findOne({
                  where: {
                    number7: haoma7
                  }
                }, function(err, inst) {
                  if (err || inst === null)
                    cb('查询号码库发生异常或为找到对应的号码库', null);
                  else {
                    var code = inst.quhao;
                    code = code.replace(/\D+/, '');
                    if (_.contains(quhao, code)) {
                      self[doneway](number, cb);
                    } else {
                      cb(null, null);
                    }
                  }
                });

              } else if (/(^0[1-2]\d|^0[3-9]\d\d)\d{7,8}$/.test(callerid)) {
                var code = RegExp.$1;
                if (_.contains(quhao, code)) {
                  self[doneway](number, cb);
                } else {
                  cb(null, null);
                }
              } else {
                cb(null, null);
              }
            }
          }
          //发起录音
          else if (actmode.modename === '发起录音') {
            var maxduration = actargs.maxduration || 60; //默认最多可以录制1小时，0表示随便录好久
            var options = actargs['options'] || 's'; //默认如果没应答就跳过录音
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
              filename = actargs.varname || '';
            }
            if (!filename || filename === '') {
              cb('录音文件名不能为空！', null);
            } else {
              filename += "." + format;
              var filepath = '/var/spool/asterisk/monitor/IVR/' + actions[actionid - 1].ivrnumber + '/';

              async.auto({
                buildDir: function(callback) {
                  commonfun.mkdir(filepath, function(err, path) {
                    if (err)
                      callback(null, '/var/spool/asterisk/monitor/');
                    else
                      callback(null, path);
                  });
                },
                createFile: ['buildDir',
                  function(callback, results) {
                    /* fs.writeFile(results.buildDir + filename, '', function(err) {
                    if (err) cb(err, null);
                    else
                      cb(null, results.buildDir + filename);
                  });*/
                    callback(null, filepath + filename);
                  }
                ],
                recording: ['createFile',
                  function(callback, results) {
                    context.Record(results.createFile, silence, maxduration, options, function(err, response) {
                      callback(err, response);
                    });
                  }
                ],
                checkRecording: ['recording',
                  function(callback, resluts) {
                    try {
                      context.getVariable('RECORD_STATUS', function(err, response) {
                        logger.debug("获取录音状态：", response);
                        var reg = /(\d+)\s+\((.*)\)/;
                        var c = null,
                          status = null;
                        if (reg.test(response.result)) {
                          c = RegExp.$1;
                          status = RegExp.$2;
                        }
                        callback(err, status);
                      });
                    } catch (ex) {
                      logger.error(ex);
                      callback('获取录音状态：', null);
                    }
                  }
                ],
                addRecord: ['checkRecording',
                  function(callback, results) {
                    schemas.pbxRcordFile.create({
                      id: self.sessionnum,
                      filename: filename,
                      extname: format,
                      callnumber: vars.agi_callerid,
                      extennum: args.called,
                      folder: filepath
                    }, function(err, inst) {
                      callback(err, inst);
                    })
                  }
                ]
              }, function(err, results) {
                cb(err, results);
              });
            }
          }
          //播放录音 
          else if (actmode.modename === '播放录音') {
            var format = actargs.format || 'wav'; //默认文件后缀名
            var filepath = '/var/spool/asterisk/monitor/IVR/' + actions[actionid - 1].ivrnumber + '/';
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
              filename = actargs.varname || '';
            }

            context.Playback(filepath + filename + '.' + format, function(err, response) {
              cb(err, response);
            });
          }
          //录制数字字符
          else if (actmode.modename === '录制数字字符') {
            logger.debug("准备开始录制数字字符。");
            var maxdigits = 20; //默认最多可接收20个按键
            var inputkey = '';
            var timeout = 10 * 1000;
            if (actargs.timeout && /\d+/.test(actargs.timeout) && actargs.timeout + 0 > 0) {
              timeout = actargs.timeout * 1000;
            }
            var ivrnumber = actargs.ivrnumber;
            var ivractionid = actargs.actionid || 1;



            if (actargs.maxdigits && /\d+/.test(actargs.maxdigits))
              maxdigits = parseInt(actargs.maxdigits);
            if (maxdigits <= 0) {
              cb(null, 1);
            } else {
              async.auto({
                GetKey: function(callback) {
                  var beep = actargs.beep;
                  var getkey = function() {
                    context.waitForDigit(timeout, function(err, response) {
                      logger.debug("录制数字字符返回：", response);
                      if (err)
                        callback(err, response);
                      else {
                        if (response.result == '0') {
                          self.ivr(ivrnumber, ivractionid, callback);
                        } else {
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
          }
          //数字方式读出 
          else if (actmode.modename === '数字方式读出') {
            var tempvarname = 'lastwaitfordigit';
            if (actargs.varname && actargs.varname !== '')
              tempvarname = actargs.varname;
            var digits = self.activevar[tempvarname];

            if (actargs.digits && /\d+/.test(actargs.digits))
              digits = actargs.digits;
            logger.debug('数学读出：', digits);
            if (digits && digits !== '') {
              self.sayNumber(digits, function(err, result) {
                cb(err, result);
              });
            } else {
              cb('没有需要读取的数字', -1);
            }
          }
          //读出日期时间 
          else if (actmode.modename === '读出日期时间') {
            var datetimestr = "";
            var formatstr = "";
            if (actargs.sayway && actargs.sayway === 'date') {
              formatstr = "YYYYMMDD";
            } else if (actargs.sayway && actargs.sayway === 'time') {
              formatstr = "HHmm";
            } else {
              formatstr = "YYYYMMDD HHmm";
            }

            if (actargs.saynow === 'true') {
              datetimestr = moment().format(formatstr);
            } else if (actargs.fromvar !== '') {
              datetimestr = self.activevar[actargs.fromvar];
              datetimestr = moment(datetimestr, ["YYYY-MM-DD HH:mm", "YY-MM-DD HH:mm", "MM-DD-YYYY HH:mm",
                "DD-MM HH:mm", "DD-MM-YYYY HH:mm"
              ]).format(formatstr);
            } else if (actargs.fromstr !== '') {
              datetimestr = moment(actargs.fromstr, ["YYYY-MM-DD HH:mm", "YY-MM-DD HH:mm", "MM-DD-YYYY HH:mm",
                "DD-MM HH:mm", "DD-MM-YYYY HH:mm"
              ]).format(formatstr);
            }

            if (datetimestr !== '') {
                logger.debug("读出的日期：", datetimestr);
              self.sayDateTime(datetimestr, actargs.sayway, function(err, result) {
                cb(err, result);
              });
            } else {
              cb('没有可以读取的日期时间！', -1);
            }
          }
          //检测日期 
          else if (actmode.modename === '检测日期') {
            var isok = true;
            var year = moment().year();
            var month = moment().month() + 1; //1-12
            var date = moment().date(); //1-31
            var week = moment().isoWeekday(); //1-7
            var hour = moment().hour(); //0-23
            var minute = moment().minute(); //0-59
            var second = moment().second(); //0-59

            if (actargs.months && actargs.months !== '') {
              var months = actargs.months.split(',');
              if (_.contains(months, month.toString()))
                isok = true;
              else
                isok = false;
            }
            if (actargs.dates && actargs.dates !== '' && isok) {
              var dates = actargs.dates.split(',');
              if (_.contains(dates, date.toString()))
                isok = true;
              else
                isok = false;
            }
            if (actargs.weeks && actargs.weeks !== '' && isok) {
              var weeks = actargs.weeks.split(',');
              if (_.contains(weeks, week.toString()))
                isok = true;
              else
                isok = false;
            }
            if (actargs.hours && actargs.hours !== '' && isok) {
              var hours = actargs.hours.split(',');
              if (_.contains(hours, hour.toString()))
                isok = true;
              else
                isok = false;
            }
            if (actargs.minutes && actargs.minutes !== '' && isok) {
              var minutes = actargs.minutes.split(',');
              if (_.contains(minutes, minute.toString()))
                isok = true;
              else
                isok = false;
            }
            var ivrnumber = actargs.ivrnumber;
            var ivractionid = actargs.actionid || 1;
            if (isok) {
              self.ivr(ivrnumber, ivractionid, cb);
            } else {
              cb(null, null);
            }
          } else if (actmode.modename === '变量判断') {
            logger.debug("进行变量判断");

            if (actargs.varname && actargs.varname !== '') {
              var tempvarname = actargs.varname;
              var tmpvalue = self.activevar[tempvarname] + "";
              var varval = actargs.varval + "";
              var checkway = actargs.checkway === "" ? "eq" : actargs.checkway;
              if (checkway === "eq" && varval == tmpvalue) {
                var ivrnumber = actargs.ivrnumber;
                var ivractionid = actargs.actionid || 1;
                self.ivr(ivrnumber, ivractionid, cb);
              } else if (checkway === "neq" && varval != tmpvalue) {
                var ivrnumber = actargs.ivrnumber;
                var ivractionid = actargs.actionid || 1;
                self.ivr(ivrnumber, ivractionid, cb);
              } else if (checkway === "gt" && varval > tmpvalue) {
                var ivrnumber = actargs.ivrnumber;
                var ivractionid = actargs.actionid || 1;
                self.ivr(ivrnumber, ivractionid, cb);
              } else if (checkway === "lt" && varval < tmpvalue) {
                var ivrnumber = actargs.ivrnumber;
                var ivractionid = actargs.actionid || 1;
                self.ivr(ivrnumber, ivractionid, cb);
              } else {
                cb(null, null);
              }
            } else {
              cb(null, null);
            }



          }
          //主叫变换 
          else if (actmode.modename === '主叫变换') {
            var optiontype = actargs.optiontype;
            var number = actargs.number;
            if (!optiontype || !number) {
              cb(null, null);
            } else {
              if (optiontype === 'replace')
                self.vars.agi_callerid = number;
              else if (optiontype === 'addbefore')
                self.vars.agi_callerid = number + self.vars.agi_callerid;
              else if (optiontype === 'append') {
                self.vars.agi_callerid = self.vars.agi_callerid + number;
              } else {}
              cb(null, null);
            }
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
          }
          //跳转到语音信箱
          else if (actmode.modename === '跳转到语音信箱') {
            var number = actargs.number;
            self.VoiceMail(number, cb);
          }
          //跳转到IVR菜单
          else if (actmode.modename === '跳转到IVR菜单') {
            var ivrnumber = actargs.ivrnumber;
            var ivractionid = actargs.actionid || 1;
            if (!ivrnumber || ivrnumber === '') {
              cb('无法跳转到指定IVR，IVR编号为空！', null);
            } else {
              self.ivr(ivrnumber, ivractionid, cb);
            }
          }
          //WEB交互接口 
          //返回值为一格式化字符串：status=done|fail,通道变量1=变量值1，通道变量2=变量值2，
          //成功调用后，将根据返回字符串和设置的通道变量前缀，设置通道变量，以供其他应用使用
          else if (actmode.modename === 'WEB交互接口') {
            var url = actargs.url; //支持http:// | https://
            var methods = actargs.methods; //get | post
            var timeout = actargs.timeout || 10; //默认10秒
            var programs = actargs.programs; //a~1,b~2,c~3,d~<%caller | called | 或其他已知自定义通道变量 %>
            var varprex = actargs.varprex || 　'webapp-'; //设置本次结果需要设置的通道变量前缀，默认为 'webapp-'
            var doneivrnum = actargs.doneivrnum;
            var doneivractid = actargs.doneivractid || 1;
            var failivrnum = actargs.failivrnum;
            var failivractid = actargs.failivractid || 1;
            var timeoutivrnum = actargs.timeoutivrnum;
            var timeoutivractid = actargs.timeoutivractid || 1;
            var proto = url.substring(0, url.indexOf(":")) === 'https' ? 'https' : 'http';
            var p = require(proto);
            var options = {
              host: commonfun.getHost(url),
              hostname: commonfun.getHost(url),
              port: commonfun.getPort(url),
              path: commonfun.getPath(url),
              //path:url,
              rejectUnauthorized: false,
              headers: {
                //"Content-Type": 'text/html'
                "Content-Type": 'application/json',
                "User-Agent": "BjExpert",
                'User-key': 'BjExpert'
              },
              method: methods
            };
            logger.debug("Web交互接口访问设置：", options);
            var datas = {};
            var getdata = "?";
            var channelvar = [];
            programs = programs.split(',');
            _(programs).forEach(function(num) {
              var keyval = num.split('~');
              var key = keyval[0];
              var val = keyval[1];

              if (/\%(\S+)\%/.test(val)) {

                var tmpval = RegExp.$1;

                datas[key] = val.replace(/\%(\S+)\%/, self.activevar[tmpval]);
                getdata += key + '=' + val.replace(/\%(\S+)\%/, self.activevar[tmpval]) + '&';
              } else {
                datas[key] = val;
                getdata += key + '=' + val + '&';
              }

            });

            async.auto({
              getChannelval: function(cb1) {
                cb1(null, datas);
                /*async.each(channelvar, function(item, cb11) {
                context.getVariable(item.val, function(err, response) {
                  var reg = /(\d+)\s+\((.*)\)/;
                  var c = null;
                  if (reg.test(response.result)) {
                    c = RegExp.$1;
                    datas[item.key] = RegExp.$2;
                  } else {
                    datas[item.key] = ""
                  }
                  cb11(err);
                });
              }, function(err) {
                logger.debug('执行了getChannelval！');
                cb1(err, datas);
              });*/
              },
              getData: ['getChannelval',
                function(cb1, results) {
                  logger.debug("WEB交互接口参数：", datas);
                  datas = JSON.stringify(datas);
                  if (options.method.toUpperCase() === 'GET') {
                    options.path = options.path + getdata;
                  }
                  var req = p.request(options, function(res) {
                    var retval = "";
                    logger.debug('STATUS: ' + res.statusCode);
                    logger.debug('HEADERS: ' + JSON.stringify(res.headers));
                    res.setEncoding('utf8');
                    res.on('data', function(chunk) {
                      logger.debug('WEB交互接口获取到返回数据：', retval);
                      retval += chunk
                    });
                    res.on('end', function() {
                      logger.debug('WEB交互接口执行了GetData！', retval);
                      cb1(null, retval);
                    });
                  });
                  req.on('error', function(e) {
                    logger.error('WEB交互接口发生异常: ', e);
                    cb1('error', null);
                  });
                  req.setTimeout(timeout * 1000, function() {
                    req.end();
                    logger.error('WEB交互接口超时 ');
                    cb1('timeout', null);
                  });
                  req.write(datas + '\n');
                  req.end();
                }
              ],
              setChannelVal: ['getData',
                function(cb1, results) {
                  var getstr = results.getData;
                  logger.debug("WEB交互返回值：", getstr);
                  // var getobj = getstr.split('&');
                  var getobj = null;
                  if (typeof(getstr) === "object") {
                    logger.debug("WEB交互返回值是一个对象！");
                    getobj = getstr;
                  } else {
                    logger.debug("WEB交互返回值是一个字符串！");
                    try {
                      getobj = JSON.parse(getstr);
                    } catch (ex) {
                      logger.error("WEB交互返回值不是一个有效的JSON数据：", getstr);
                      getobj={};
                      getobj.success = false;
                    }

                  }
                  logger.debug("WEB交互转换成对象：", getobj);
                  //var channelvals = [];
                  // logger.debug('getobj:', getobj);
                  /* _(getobj).forEach(function(num) {
                  var nums = num.split('=');
                  if (nums[0] === 'status') {
                    if (nums[1] === 'fail') {
                      cb1('fail', null);
                    }
                  } else {
                    self.activevar[varprex + nums[0]] = nums[1];
                  }
                });*/
                  if (getobj.success) {
                    logger.debug("WEB交互转换逻辑成功！");
                    delete getobj.success;
                    for (var key in getobj) {
                      self.activevar[varprex + key] = getobj[key];
                    }
                    logger.debug("当前上下文变量；", self.activevar);
                    cb1(null, null);
                  } else {
                    logger.debug("WEB交互转换逻辑失败！");
                    cb1('fail', null);
                  }

                }
              ]
            }, function(err, results) {
              if (err && err === 'fail') {
                self.ivr(failivrnum, failivractid, cb);
              } else if (err || err === 'timeout') {
                self.ivr(timeoutivrnum, timeoutivractid, cb);
              } else {
                self.ivr(doneivrnum, doneivractid, cb);
              }
            });
          }
          //AGI扩展接口
          else if (actmode.modename === 'AGI扩展接口') {
            var addr = actargs.addr;
            var programs = "?";
            _.forOwn(actargs, function(num, key) {
              if (key !== 'addr')
                programs += key + '=' + num + '&';
            });
            context.AGI(addr + programs, cb);
          }
          //等待几秒
          else if (actmode.modename === '等待几秒') {
            var seconds = actargs.seconds;
            context.Wait(seconds, cb);
          }
          //播放音调 
          else if (actmode.modename === '播放音调') {
            var tonename = actargs.tonename;
            var seconds = actargs.seconds;
            async.auto({
              playtones: function(cb1) {
                context.PlayTones(tonename, cb1);
              },
              waitamoment: ['playtones',
                function(cb1, results) {
                  context.Wait(seconds, cb1);
                }
              ],
              stopPlaytones: ['waitamoment',
                function(cb1, results) {
                  context.StopPlayTones(cb1);
                }
              ]
            }, function(err, results) {
              cb(err, results);
            });
          }
          //通道阀
          else if (actmode.modename === '通道阀') {
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
          //黑名单
          else if (actmode.modename === '黑名单') {
            self.blacklist('', cb);
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
      logger.debug('所有的动作执行完毕!');
      callback('所有的动作执行完毕', -1);
    }
 // } else {
 //   logger.debug('通道的另一方主动挂机结束!');
 //   callback('通道的另一方主动挂机结束!', -1);
 // }

}
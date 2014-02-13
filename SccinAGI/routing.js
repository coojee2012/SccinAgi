var async = require('async');
var AsAction = require("nami").Actions;
var guid = require('guid');
var conf = require('node-conf').load('fastagi');
var routing = function(v) {
  this.context = v.context;
  this.schemas = v.Schemas;
  this.agiconf = v.agiconf;
  this.nami = v.nami;
  this.args = v.args;
  this.logger = v.logger;
  this.vars = v.vars;
  this.sessionnum = guid.create();
  this.ivrlevel = 0;
  this.lastinputkey = '';
  this.activevar = {}; //用户存储用户输入的临时变量
};
//呼叫路由处理
//args.routerline
//args.called
routing.prototype.router = function() {
  var self = this;
  var context = self.context;
  var schemas = self.schemas;
  var nami = self.nami;
  var logger = self.logger;
  var args = self.args;
  var vars = self.vars;
  async.auto({
    AddCDR: function(cb) {
      schemas.PBXCdr.create({
        id: self.sessionnum,
        caller: vars.agi_callerid,
        called: args.called,
        accountcode: vars.agi_accountcode,
        routerline: args.routerline,
        lastapp: 'router',
        answerstatus: 'NOANSWER'
      }, function(err, inst) {
        cb(err, inst);
      });
    },
    GetRouters: ['AddCDR',
      function(cb, results) {
        schemas.PBXRouter.all({
          where: {
            routerline: args.routerline,
          },
          order: ['proirety asc']
        }, function(err, insts) {
          cb(err, insts);
        });
      }
    ],
    Route: ['GetRouters',
      function(cb, results) {
        logger.debug(results.GetRouters);
        var processmode = null;
        var processdefined = null;
        var match = false;
        for (var i = 0; i < results.GetRouters.length; i++) {
          if (vars.agi_accountcode === results.GetRouters[i].callergroup || results.GetRouters[i].callergroup === 'all') {
            logger.debug("呼叫线路组匹配成功");
            match = true;
            var reCaller = new RegExp("^" + results.GetRouters[i].callerid);
            var reCalled = new RegExp("^" + results.GetRouters[i].callerid);
            //匹配主叫以什么号码开头
            if (results.GetRouters[i].callerid !== '' && !reCaller.test(vars.agi_callerid))
              match = false;
            //匹配主叫长度
            if (results.GetRouters[i].callerlen !== -1 && vars.agi_callerid.length !== results.GetRouters[i].callerlen)
              match = false;
            //匹配被叫以什么号码开头
            if (results.GetRouters[i].callednum !== '' && !reCalled.test(args.called))
              match = false;
            //匹配被叫长度
            if (results.GetRouters[i].calledlen !== -1 && args.called.length !== results.GetRouters[i].calledlen)
              match = false;
            //匹配成功后，对主叫和被叫进行替换
            if (match) {
              //主叫替换
              logger.debug("路由匹配成功，开始进行替换操作");
              if (results.GetRouters[i].replacecallerid !== '')
                vars.agi_callerid = results.GetRouters[i].replacecallerid;
              //删除被叫前几位
              if (results.GetRouters[i].replacecalledtrim !== -1)
                args.called = args.called.substr(results.GetRouters[i].replacecalledtrim);
              //补充被叫前几位
              if (results.GetRouters[i].replacecalledappend !== '')
                args.called = results.GetRouters[i].replacecalledappend + args.called;

              processmode = results.GetRouters[i].processmode;
              processdefined = results.GetRouters[i].processdefined || args.called;

              break;

            } else {
              continue;
            }
          }
        }
        if (match) {
          self[processmode](processdefined, function(err, result) {
            cb(err, result);
          });
        } else {
          cb('未找到匹配的路由！', 1);
        }

      }
    ]
  }, function(err, results) {
    if (err) {
      logger.error(err);
      logger.debug("当前上下文状态："+context.state+'，上下文流是否可读：'+context.stream.readable);
       if(context.stream && context.stream.readable){
        context.hangup(function(err, rep) {
      });
      }

    } else {
      logger.debug("当前上下文状态："+context.state+'，上下文流是否可读：'+context.stream.readable);
      if(context.stream && context.stream.readable){
        context.hangup(function(err, rep) {
        logger.debug("来自自动挂机");
      });
      }
    }
  });
}
//自动语音应答处理
//IVR号码
//IVR执行起点默认为1
routing.prototype.ivr = function(ivrnum, action, callback) {
  var self = this;
  var context = self.context;
  var schemas = self.schemas;
  var nami = self.nami;
  var logger = self.logger;
  var args = self.args;
  var vars = self.vars;
  if (self.ivrlevel > 50) {
    callback('IVR嵌套过深', -1);
  } else {
    logger.debug("当前IVR嵌套层数:", self.ivrlevel);
    self.ivrlevel++;
    async.auto({
      updateCDR: function(cb) {
        schemas.PBXCdr.update({
          where: {
            id: self.sessionnum
          },
          update: {
            lastapp: 'ivr'
          }
        }, function(err, inst) {
          cb(err, inst);
        });
      },
      getIVR: ['updateCDR',
        function(cb, results) {
          schemas.PBXIvrMenmu.find(ivrnum, function(err, inst) {
            cb(err, inst);
          });
        }
      ],
      getIVRActions: ['getIVR',
        function(cb, results) {
          results.getIVR.actions({
              where: {},
              include: 'Actmode',
              order: ['ordinal asc']
            },
            function(err, actions) {
              cb(err, actions);
            }
          );

        }
      ],
      getIVRInputs: ['getIVR',
        function(cb, results) {
          results.getIVR.inputs({
              where: {}
            },
            function(err, inputs) {
              cb(err, inputs);
            }
          );
        }
      ],
      Answer: ['getIVRActions', 'getIVRInputs',
        function(cb, results) {
          context.answer(function(err, response) {
            cb(err, response);
          });
        }
      ],
      action: ['Answer',
        function(cb, results) {
          logger.debug("开始执行IVR动作");
          self.ivraction(0, results.getIVRActions, results.getIVRInputs, function(err, result) {
            cb(err, result);
          });
        }
      ]
    }, function(err, results) {
      callback(err, results);
    });
  }
};
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
    var actargs = {};
    if (actions[actionid].args && actions[actionid].args != "") {
      var tmp = actions[actionid].args.split('&');
      for (var i in tmp) {
        var kv = tmp[i].split('=');
        actargs[kv[0]] = kv[1];
      }
    }
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
                      if (inputkey.length < maxdigits && tmpkey !== '#') //当没有到达指定位数或#号
                      {

                        logger.debug("录制到数字字符:" + inputkey);
                        getkey();
                      } else {
                        if (actargs.addbefore && actargs.addbefore === 'true')
                          inputkey = self.lastinputkey + inputkey; //添加上一层动作的最后一个按键输入
                        var tempvarname = 'lastwaitfordigit';
                        if (actargs.varname && actargs.varname !== '')
                          tempvarname = actargs.varname;
                        self.activevar[tempvarname] = inputkey; //将输入的按键保存到临时变量
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

        }
        //默认挂机
        else {

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
//响应IVR按键
routing.prototype.ivrinput = function(key, inputs, callback) {
  var self = this;
  var context = self.context;
  var schemas = self.schemas;
  var nami = self.nami;
  var logger = self.logger;
  var args = self.args;
  var vars = self.vars;
  if (key === '-1')
    callback('获取按键时一方挂机', -1);

  var getinput = null;

  self.lastinputkey = key;

  for (var i in inputs) {
    if (inputs[i].inputnum === key) {
      getinput = inputs[i];
      break;
    }
  }

  if (getinput !== null) {
    logger.debug("找到对应的按键流程：", getinput);
    self.ivr(getinput.gotoivrnumber, getinput.gotoivractid, function(err, result) {
      if (err)
        logger.debug("上层IVR返回了异常：", err);
      callback(err, result);
    });
  } else {
    logger.debug("没有找到按键:", key);
    if (key === 'timeout') {
      context.Playback('b_timeout', function(err, response) {
        callback(null, 0);
      });
    } else {
      context.Playback('b_error', function(err, response) {
        callback(null, 0);
      });
    }

  }
}
//内部拨打
routing.prototype.diallocal = function(localnum, callback) {
  var self = this;
  var context = self.context;
  var schemas = self.schemas;
  var nami = self.nami;
  var logger = self.logger;
  var args = self.args;
  var vars = self.vars;
  async.auto({
    updateCDR: function(cb) {
      schemas.PBXCdr.update({
        where: {
          id: self.sessionnum
        },
        update: {
          lastapp: 'diallocal'
        }
      }, function(err, inst) {
        cb(err, inst);
      });
    },
    //在本地号码表里面寻找合适的号码，如果没有找到，默认到IVR号码为200
    findLocal: ['updateCDR',
      function(cb, results) {
        schemas.PBXLocalNumber.findOne({
          where: {
            id: localnum
          }
        }, function(err, inst) {
          if (err)
            cb(err, inst);
          logger.debug(inst);
          if (inst != null) {
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
//拨打外部电话
routing.prototype.dialout = function(linenum, cb) {

};
//拨打队列
routing.prototype.queue = function(queuenum, assign, callback) {
  var self = this;
  var context = self.context;
  var schemas = self.schemas;
  var nami = self.nami;
  var logger = self.logger;
  var args = self.args;
  var vars = self.vars;
  async.auto({
    updateCDR: function(cb) {
      schemas.PBXCdr.update({
        where: {
          id: self.sessionnum
        },
        update: {
          lastapp: 'diallocal'
        }
      }, function(err, inst) {
        cb(err, inst);
      });
    },
    queue: ['updateCDR',
      function(cb, results) {
        //Queue(queuename,options,URL,announceoverride,timeout,agi,cb)
        context.Queue(queuenum, 'tc', '', '', 30, 'agi://192.168.0.114/queueAnswered?queuenum=' + queuenum+'&sessionnum='+self.sessionnum, function(err, response) {
          logger.debug("队列拨打返回结果:", response);
          cb(err, response);
        });
      }
    ],
    getQueueStatus: ['queue',
      function(cb, results) {
        context.getVariable('QUEUESTATUS', function(err, response) {
          var queueStatus = '';
          var reg = /(\d+)\s+\((.*)\)/;
          var c = null,
            id = null;
          if (reg.test(response.result)) {
            c = RegExp.$1;
            queueStatus = RegExp.$2;
          }
          logger.debug("获取呼叫队列状态：", queueStatus);
          cb(err, queueStatus);
        });
      }
    ]
  }, function(err, results) {
    callback(err, results);
  });

};
//队列中坐席应答成功
routing.prototype.queueAnswered = function() {
  var self = this;
  var context = self.context;
  var schemas = self.schemas;
  var nami = self.nami;
  var logger = self.logger;
  var args = self.args;
  var vars = self.vars;
  var sessionnum=args.sessionnum;
  var queuenum=args.queuenum;
  logger.debug("队列被接听:", vars);
  async.auto({
    getAnswerMem: function(cb) {
      context.getVariable('MEMBERINTERFACE', function(err, response) {
        var member = '';
        var reg = /(\d+)\s+\((.*)\)/;
        var c = null,
          id = null;
        if (reg.test(response.result)) {
          c = RegExp.$1;
          member = RegExp.$2;
        }
        if(/\/(\d+)/.test(member)){
          member = RegExp.$1;
        }
        logger.debug("当前应答坐席：", member);
        cb(err, member);
      });
    },
    //更新CDR应答状态和被叫坐席
    updateCDR:['getAnswerMem', function(cb,results) {
      schemas.PBXCdr.update({
        where: {
          id: sessionnum
        },
        update: {
          answerstatus:'ANSWERED',
          called:results.getAnswerMem,
          lastapp: 'queue'+queuenum
        }
      }, function(err, inst) {
        cb(err, inst);
      });
    }],
    //写入弹屏数据
    updatePop:['getAnswerMem',function(cb,results){
      cb(null,1);
    }]
  }, function(err, results) {
    context.end();
  });

}
//动态添加指定队列坐席成员
//queuenum-队列名称
//agent-坐席
routing.prototype.addQueueMember = function() {
  var self = this;
  var context = self.context;
  var schemas = self.schemas;
  var nami = self.nami;
  var logger = self.logger;
  var args = self.args;
  var vars = self.vars;
  async.auto({
    addAgent: function(cb) {
      context.AddQueueMember(args.queuenum, args.agent, function(err, response) {
        cb(err, response);
      });
    }
  }, function(err, results) {
    return;
  });
};
//动态删除指定队列坐席成员
//queuenum-队列名称
//agent-坐席
routing.prototype.removeQueueMember = function() {
  var self = this;
  var context = self.context;
  var schemas = self.schemas;
  var nami = self.nami;
  var logger = self.logger;
  var args = self.args;
  var vars = self.vars;
  async.auto({
    removeAgent: function(cb) {
      context.RemoveQueueMember(args.queuenum, args.agent, function(err, response) {
        cb(err, response);
      });
    }
  }, function(err, results) {
    return;
  });
};

//示忙指定队列坐席成员
//queuenum-队列名称，留空所有队列里面的该坐席都示忙
//agent-坐席
routing.prototype.pauseQueueMember = function(queuenum, assign, callback) {
  var self = this;
  var context = self.context;
  var schemas = self.schemas;
  var nami = self.nami;
  var logger = self.logger;
  var args = self.args;
  var vars = self.vars;
  async.auto({
    removeAgent: function(cb) {
      var queuenum = args.queuenum || '';
      var agent = args.agent || vars.agi_callerid;

      context.PauseQueueMember(queuenum, 'SIP/' + agent + ',0,' + agent, function(err, response) {
        cb(err, response);
      });
    }
  }, function(err, results) {
    callback(err, results);
  });
};

//取消示忙指定队列坐席成员
//queuenum-队列名称，留空所有队列里面的该坐席都取消示忙
//agent-坐席
routing.prototype.unPauseQueueMember = function(queuenum, assign, callback) {
  var self = this;
  var context = self.context;
  var schemas = self.schemas;
  var nami = self.nami;
  var logger = self.logger;
  var args = self.args;
  var vars = self.vars;
  async.auto({
    removeAgent: function(cb) {
      var queuenum = args.queuenum || '';
      var agent = args.agent || vars.agi_callerid;
      context.UnpauseQueueMember(queuenum, 'SIP/' + agent + ',0,' + agent, function(err, response) {
        cb(err, response);
      });
    }
  }, function(err, results) {
    callback(err, results);
  });
};

//发起录音
routing.prototype.monitor = function(context, vars) {


};
//调用其它AGI程序
routing.prototype.agi = function(agiaddr, callback) {

}
//默认触发处理
routing.prototype.dodefault = function(context, vars) {
  context.hangup(function(err, rep) {
    console.log("Hangup success:", rep);
    context.end();
  });

};

//北京专家库自动外呼
//sccincallout?callRecordsID=

routing.prototype.sccincallout = function() {
  var self = this;
  var context = self.context;
  var schemas = self.schemas;
  var callRecordsID = self.args.callRecordsID;
  var nami = self.nami;
  var keyNum = null;
  var logger = self.logger;

  async.auto({
    //获取呼叫记录编号
    getCallrcordsId: function(cb) {
      context.getVariable('callrecordid', function(err, response) {
        logger.debug("获取呼叫记录编号：", response);
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
    //通过通道变量获取有效按键
    getKeyNum: ['getCallrcordsId',
      function(cb) {
        context.getVariable('keynum', function(err, response) {
          logger.debug("获取有效按键：", response);
          var reg = /(\d+)\s+\((.*)\)/;
          var c = null,
            id = null;
          if (reg.test(response.result)) {
            c = RegExp.$1;
            keyNum = parseInt(RegExp.$2);
          }
          cb(err, keyNum);
        });
      }
    ],
    //获取需要拨打的电话号码,倒序取出第一个电话作为需要拨打的电话
    getPhones: ['getKeyNum',
      function(cb, results) {
        schemas.CallPhone.all({
          where: {
            callRecordsID: callRecordsID,
            State: 0
          },
          order: ['PhoneSequ asc']
        }, function(err, insts) {
          cb(err, insts);

        });
      }
    ],
    //更新呼叫记录表
    updateCallRecords: ['getPhones',
      function(cb, results) {
        if (results.getPhones && results.getPhones.length > 0) {
          schemas.CallRecords.update({
            where: {
              id: callRecordsID,
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
    //更新呼叫结果表
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
    //开始呼叫
    Dial: ['getPhones', 'updateDialResult', 'updateCallRecords',
      function(cb, results) {
        if (results.getPhones && results.getPhones.length > 0) {
          async.auto({
            //更新电话记录表
            updateCallPhone: function(cb) {
              schemas.CallPhone.update({
                where: {
                  id: results.getPhones[0].id
                },
                update: {
                  State: 1
                }

              }, function(err, inst) {
                cb(err, inst);
              });
            },
            //添加呼叫日志
            addCallLog: function(cb) {
              schemas.CallLog.create({
                Phone: results.getPhones[0].Phone,
                PhoneSequ: results.getPhones[0].PhoneSequ,
                callphone: results.getPhones[0]
              }, function(err, inst) {
                cb(err, inst);
              });
            },
            //产生拨打
            dial: ['addCallLog', 'updateCallPhone',
              function(cb) {
                context.Dial(conf.line + results.getPhones[0].Phone, conf.timeout, conf.dialoptions, function(err, response) {
                  if (err) {
                    cb(err, response);
                  } else {
                    context.getVariable('DIALSTATUS', function(err, response2) {
                      cb(null, response2);

                    });
                  }
                });
              }
            ],
            //获取拨打状态并记录在callog表里面
            dialStatus: ['dial',
              function(cb, results) {
                var re = /(\d+)\s+\((\w+)\)/;
                var anwserstatus = null;
                if (re.test(results.dial.result)) {
                  anwserstatus = RegExp.$2;
                }
                schemas.UserKeysRecord.create({
                  id: guid.create(),
                  Key: anwserstatus,
                  keyTypeID: '111111',
                  calllog: results.addCallLog
                }, function(err, inst) {
                  cb(err, inst);
                });
              }
            ]
          }, function(err, results) {
            cb(err, results);
          });
        } else {
          cb('未有找到电话号码', results);
        }
      }
    ]
  }, function(err, results) {
    if (err) {
      logger.error(err);
      context.hangup(function(err, response) {
        logger.error("没有找到需要拨打的号码，挂机！");
      });
    } else {
      var anwserstatus = results.Dial.dialStatus.Key;
      if (anwserstatus === 'CONGESTION') {
        context.hangup(function(err, response) {
          logger.debug("被叫直接挂机！");
        });
      }

      if (anwserstatus !== 'ANSWER') {
        self.NextDial(callRecordsID, keyNum, function(err, result) {
          logger.debug("继续拨打成功！");
        });
      } else {
        logger.debug("准备开始播放语音文件。");
      }
    }
  });

};


routing.prototype.hangupcall = function() {

}

//北京专家库自动拨打接通后处理程序
routing.prototype.calloutback = function() {
  var self = this;
  var context = self.context;
  var schemas = self.schemas;
  var callRecordsID = null;
  var keyNum = null;
  var logger = self.logger;
  async.auto({
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
      //通过通道变量获取有效按键
      getKeyNum: ['getCallrcordsId',
        function(cb) {
          context.getVariable('keynum', function(err, response) {
            var reg = /(\d+)\s+\((.*)\)/;
            var c = null,
              id = null;
            if (reg.test(response.result)) {
              c = RegExp.$1;
              keyNum = parseInt(RegExp.$2);
            }
            cb(err, keyNum);
          });
        }
      ],
      //获取当前拨打的号码
      getPhones: ['getKeyNum',
        function(cb, results) {
          schemas.CallPhone.all({
            where: {
              callRecordsID: callRecordsID,
              State: 1
            },
            order: ['PhoneSequ desc']
          }, function(err, insts) {
            cb(err, insts);

          });
        }
      ],
      //更新呼叫记录
      updateCallRecords: ['getKeyNum',
        function(cb, results) {
          schemas.CallRecords.update({
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
      getKey: ['getPhones', 'updateCallRecords',
        function(cb, results) {
          var phone = results.getPhones[0];
          //获取用户按键函数
          //count  当前第几次调用
          var GetInputKey = function(count) {
            async.auto({
              //播放语音
              playinfo: function(callback) {
                context.GetData('welcome', 5000, 1, function(err, response) {
                  console.log("撒也不按，挂机了", response);
                  callback(err, response);
                });
              },
              //检查用户按键
              checkinput: ['playinfo',
                function(callback, results) {
                  var key = results.playinfo.result;
                  key.replace(/\s+/, "");
                  //记录用户按键到按键记录表
                  schemas.UserKeysRecord.create({
                    id: guid.create(),
                    Key: key,
                    keyTypeID: '111111',
                    callLogID: phone.id
                  }, function(err, inst) {
                    var intkey = parseInt(key);
                    if (intkey <= keyNum) {
                      count = 100;
                      callback(err, {
                        count: count,
                        key: key
                      });
                    } else if (key === '0') {
                      count = 100;
                      callback(err, {
                        count: count,
                        key: key
                      });
                    } else if (key === conf.replaykey) {
                      count++;
                      callback(err, {
                        count: count,
                        key: key
                      });
                    } else {
                      context.Playback('b_error', function(err, response2) {
                        count++;
                        callback(err, {
                          count: count,
                          key: key
                        });
                      });
                    }
                  });
                }
              ]
            }, function(err, results) {
              logger.debug("当前循环次数：", results.checkinput);
              //直接挂机了
              if (results.checkinput.key === '-1') {
                schemas.DialResult.update({
                  where: {
                    id: callRecordsID
                  },
                  update: {
                    Result: 3,
                    State: 1
                  }
                }, function(err, inst) {
                  cb(err, inst);
                });
              }
              //按键错误或等待按键超时小于3次
              else if (results.checkinput.count < 3) {
                GetInputKey(results.checkinput.count);
              }
              //用户确定参加评标
              else if (results.checkinput.count == 100 && results.checkinput.key !== '0') {
                self.SureCome(callRecordsID, phone, results.checkinput.key, function(err, results) {
                  cb(err, results);
                });
              }
              //用户确定不参加评标
              else if (results.checkinput.count == 100 && results.checkinput.key === '0') {
                self.NoCome(callRecordsID, function(err, results) {
                  cb(err, results);
                });
              }
              //播放三次无反应
              else {

                schemas.DialResult.update({
                  where: {
                    id: callRecordsID
                  },
                  update: {
                    Result: 3,
                    State: 1
                  }
                }, function(err, inst) {
                  context.Playback('b_timeout&b_bye', function(err, response) {
                    context.hangup(function(err, response) {
                      context.end();
                      cb(err, inst);
                    });

                  });

                });


              }

            });
          }

          var count = 0;
          GetInputKey(count);

        }
      ],
    },

    function(err, results) {
      if (err) {
        console.log(results.getKey);
        context.hangup(function(err, response) {
          context.end();
        });
      }

    });

}


//发起拨打下一个电话

routing.prototype.NextDial = function(callrecordsid, keyNum, cb) {
  var self = this;
  var context = self.context;
  var schemas = self.schemas;
  var logger = self.logger;
  var AMI = self.nami;

  async.auto({
    getPhones: function(cb) {
      schemas.CallPhone.all({
        where: {
          callRecordsID: callrecordsid,
          State: 0
        },
        order: ['PhoneSequ asc']
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
          action.CallerID = 200;
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
          cb();

        }
      }
    ]

  }, function(err, results) {
    cb(err, results);
  });

}

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
module.exports = routing;
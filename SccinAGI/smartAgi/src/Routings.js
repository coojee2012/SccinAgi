var _ = require('lodash');
var async = require('async');
var fs=require('fs');
var AsAction = require("nami").Actions;
var moment = require('moment');
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
  this.transferlevel = 0; //防止呼叫转移死循环
  this.lastinputkey = '';
  this.routerline='';
  this.activevar = {}; //用户存储用户输入的临时变量，相当于通道变量一样，跨域AGI后失效
};

var commonfun={};
module.exports = routing;

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
//确定参加评标后处理

routing.prototype.SureCome = function(callrecordid, phone, keyNum, cb) {
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
            Result: 1,
            State: 1
          }
        }, function(err, inst) {
          callback(err, inst);
        });
      } catch (ex) {
        logger.error('保存拨打结果发生异常:', ex);
        callback('保存拨打结果发生异常！', null);
      }
    },
    voiceNotice: ['saveDialResult',
      function(callback, results) {
        var Notice = function(count) {
          async.auto({
            playvoice: function(callback) {
              try {
                context.GetData('/home/share/'+callrecordid+'-sure', 5000, 1, function(err, response) {
                  callback(err, response);
                });
              } catch (ex) {
                logger.error('语音通知确认评标发生异常:', ex);
                callback('语音通知确认评标发生异常！', null);
              }
            },
            checkInput: ['playvoice',
              function(callback, results) {
                try{
                var key = results.playvoice.result;
                key.replace(/\s+/, "");
                //记录用户按键到按键记录表
                schemas.crmUserKeysRecord.create({
                  id: guid.create(),
                  Key: key,
                  keyTypeID: '111111',
                  callLogID: phone.id
                }, function(err, inst) {
                  switch (key) {
                    case keyNum[2]:
                      count++;
                      callback(err, {
                        count: count,
                        key: key
                      });
                      break;
                      case "timeout":
                       context.Playback('timeout', function(err, response2) {
                        count++;
                        callback(err, {
                          count: count,
                          key: key
                        });
                      });
                      break;
                    default:
                      context.Playback('inputerror', function(err, response2) {
                        count++;
                        callback(err, {
                          count: count,
                          key: key
                        });
                      });
                      break;
                  }
                });
              }catch(ex){
                logger.error('语音通知确认评标记录按键发生异常:', ex);
                callback('语音通知确认评标记录按键发生异常！', null);
              }
              }
            ]


          }, function(err, results) {
            if (results.checkInput.key === '-1') {
              callback(null, -1);
            } else if (results.checkInput.count < 3) {
              Notice(results.checkInput.count);
            } else {
              context.Playback('waiteout', function(err, response) {
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
/**
语音信箱
**/
routing.prototype.VoiceMail = function(number, callback) {
	var self = this;
	var context = self.context;
	var schemas = self.schemas;
	var nami = self.nami;
	var logger = self.logger;
	var args = self.args;
	var vars = self.vars;

	if (!number || number === '') {
		number = args.number;
	}
	if (!callback || typeof(!callback) !== 'function') {
		callback = function(err, results) {
			if (err)
				context.hangup(function(err, rep) {});
			else
				context.end();
		}
	}

	if (!number || number === '') {
		context.end();
	} else {
		var voicefilepatch = "/var/spool/asterisk/monitor/voicemail/" + number + '/';
		var voicefilename = guid.create();
		var voiceextenname = "wav";
		async.auto({
			checkOlds: function(cb) {
				console.log(schemas.pbxRcordFile);
				schemas.pbxRcordFile.all({
					where: {
						lable: 'voicemail'
					},
					order: 'cretime DESC',
					skip: 60 //删除超过60条的记录
				}, function(err, dbs) {
					cb(err, dbs);
				});
			},
			delOld: ['checkOlds',
				function(cb, resluts) {
					if (resluts.checkOlds.length > 0) {
						commonfun.delrecordfiles(schemas, resluts.checkOlds, cb);
					} else {
						cb(null, null);
					}
				}
			],
			playusevoice: ['delOld',
				function(cb, results) {
					context.Playback("vm-intro", cb);
				}
			],
			record: ['playusevoice',
				function(cb, results) {
					var maxduration = 60; //默认最多可以录制1小时，0表示随便录好久
					var options = 'sxk'; //默认如果没应答就跳过录音
					var format = voiceextenname; //默认文件后缀名
					var silence = 10; //如果持续了超过X秒的沉默，将停止录音，默认10秒,0表示不判断
					context.Record(voicefilepatch + voicefilename + '.' + format, silence, maxduration, options, function(err, response) {
						cb(err, response);
					});
				}
			],
			playGoodbye: ['record',
				function(cb, results) {
					context.Playback("vm-goodbye", cb);
				}
			],
			getFileSize: ['record',
				function(cb, results) {
					commonfun.getfilestate(voicefilepatch + voicefilename + '.' + voiceextenname, function(err, stats) {
						var size = 0;
						if (err) {
							logger.error(err);
						} else {
							size = stats.size;
						}
						cb(null, size);

					});
				}
			],
			insertdb: ['getFileSize',
				function(cb, results) {
					schemas.pbxRcordFile.create({
						filename: voicefilename,
						lable: 'voicemail',
						folder: voicefilepatch,
						extname: voiceextenname,
						callnumber: vars.agi_callerid,
						extennum: args.called,
						filesize: results.getFileSize
					}, function(err, inst) {
						cb(err, inst);
					});
				}
			]

		}, function(err, results) {
			if (err)
				logger.error('语音信箱：', err);
			callback(err, results);
		});
	}
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
//调用其它AGI程序
routing.prototype.agi = function(agiaddr, callback) {

}
routing.prototype.blacklist = function(caller, callback) {
	var self = this;
	var context = self.context;
	var schemas = self.schemas;
	var nami = self.nami;
	var logger = self.logger;
	var args = self.args;
	var vars = self.vars;
	if (!caller || caller === '' || caller === args.called) {
		caller = vars.agi_callerid;
	}
	if (!callback || typeof(!callback) !== 'function') {
		callback = function(err, results) {
			if (err)
				context.hangup(function(err, rep) {});
			else
				context.end();
		}
	}
	try {
		schemas.pbxBlackList.find(caller, function(err, inst) {
			if (err) {
				logger.error('黑名单处理发生异常:', err);
				callback(err, null);
			} else {
				if (inst !== null) {
					context.hangup(callback);
				} else {
					callback(null, null);
				}
			}
		});
	} catch (ex) {
		logger.error('黑名单处理发生异常:', ex);
		callback(ex, null);
	}
}
//北京专家库自动拨打接通后处理程序
routing.prototype.calloutback = function() {
  var self = this;
  var context = self.context;
  var schemas = self.schemas;
  var callRecordsID = null;
  var keyNum = null;
  var logger = self.logger;
  self.args.routerline='扩展应用';
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
      //通过通道变量获取有效按键
      getKeyNum: ['getCallrcordsId',
        function(cb) {
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
      getKey: ['getPhones', 'updateCallRecords',
        function(cb, results) {
          var phone = results.getPhones[0];
          //获取用户按键函数
          //count  当前第几次调用
          var GetInputKey = function(count) {
            async.auto({
              //播放语音
              playinfo: function(callback) {
                context.GetData('/home/share/' +callRecordsID+ '-notice', 5000, 1, function(err, response) {
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
                  schemas.crmUserKeysRecord.create({
                    id: guid.create(),
                    Key: key,
                    keyTypeID: '111111',
                    callLogID: phone.id
                  }, function(err, inst) {
                    //var intkey = key;
                    if (key === keyNum[0]) {
                      count = 100;
                      callback(err, {
                        count: count,
                        key: key
                      });
                    } else if (key === keyNum[1]) {
                      count = 100;
                      callback(err, {
                        count: count,
                        key: key
                      });
                    } else if (key === keyNum[2]) {
                      count++;
                      callback(err, {
                        count: count,
                        key: key
                      });
                    } else if (key === 'timeout') {
                      context.Playback('timeout', function(err, response2) {
                        count++;
                        callback(err, {
                          count: count,
                          key: key
                        });
                      });
                    } else {
                      context.Playback('inputerror', function(err, response2) {
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
                schemas.crmDialResult.update({
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
              else if (results.checkinput.count == 100 && results.checkinput.key === keyNum[0]) {
                self.SureCome(callRecordsID, phone, keyNum, function(err, results) {
                  cb(err, results);
                });
              }
              //用户确定不参加评标
              else if (results.checkinput.count == 100 && results.checkinput.key === keyNum[1]) {
                self.NoCome(callRecordsID, function(err, results) {
                  cb(err, results);
                });
              }
              //播放三次无反应或按键错误超过3次
              else {

                schemas.crmDialResult.update({
                  where: {
                    id: callRecordsID
                  },
                  update: {
                    Result: 3,
                    State: 1
                  }
                }, function(err, inst) {
                  context.Playback('waiteout', function(err, response) {
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
//当前通道达到预先设定的阀值，播放友情提示并记录到未接来电
routing.prototype.channelMax = function(callback) {
  async.auto({}, function(err, resluts) {
    callback(err, resluts);
  })
}

function str2obj(str) {
  var obj = {};
  if (str && str !== '') {
    var tmp = str.split('&');
    for (var i in tmp) {
      var kv = tmp[i].split('=');
      obj[kv[0]] = kv[1];
    }
  }
  return obj;
}

commonfun.guid = function() {
  return guid.create();
}
commonfun.unixtime = function() {
  var d = new Date();
  var unixtime = d.getTime();
  var random = Math.random() * 100;
  return unixtime.toString() + '-' + random.toString();
}
commonfun.mkdir = function(path, cb) {
  fs.exists(path, function(exists) {
    if (!exists) {
      fs.mkdir(path, function(err) {
        if (err) {
          cb('无法创建需要的目录：' + path, null);
        } else {
          cb(null, path);
        }
      });
    } else {
      cb(null, path);
    }
  });
}

//Parse the url, get the port
//e.g. http://www.google.com/path/another -> 80
//     http://foo.bar:8081/a/b -> 8081

commonfun.getPort = function(url) {
  var hostPattern = /\w+:\/\/([^\/]+)(\/)?/i;
  var domain = url.match(hostPattern);

  var pos = domain[1].indexOf(":");
  if (pos !== -1) {
    domain[1] = domain[1].substr(pos + 1);
    return parseInt(domain[1]);
  } else if (url.toLowerCase().substr(0, 5) === "https") return 443;
  else return 80;
}

//Parse the url,get the host name
//e.g. http://www.google.com/path/another -> www.google.com

commonfun.getHost = function(url) {
  var hostPattern = /\w+:\/\/([^\/]+)(\/)?/i;
  var domain = url.match(hostPattern);

  var pos = domain[1].indexOf(":");
  if (pos !== -1) {
    domain[1] = domain[1].substring(0, pos);
  }
  return domain[1];
}

commonfun.getPath = function(url) {
  var pathPattern = /\w+:\/\/([^\/]+)(\/.+)(\/$)?/i;
  var fullPath = url.match(pathPattern);
  return fullPath ? fullPath[2] : '/';
}

commonfun.delrecordfiles = function(schemas, dbs, callback) {
  var self = this;
  var fs = require('fs');
  var schema = schemas.pbxRcordFile;
  async.each(dbs, function(item, cb) {
    self.delbyid(schema, item.id, function(err, results) {
      if (err)
        cb(err);
      else {
        var file = item.folder + item.filename + item.extname;
        fs.unlink(file, cb);
      }
    });
  }, function(err) {
    callback(err, null);
  });
}

commonfun.delbyid = function(schema, id, cb) {
  schema.find(id, function(err, inst) {
    if (err) {
      cb(err, null);
    } else {
      if (!inst) {
        cb(null, null);
      } else {
        inst.destroy(function(err) {
          if (err) {
            cb(err, null);
          } else {
            cb(null, null);
          }
        });
      }
    }
  });
}

commonfun.getfilestate = function(filename, cb) {
  var fs = require('fs');
  fs.stat(filename, function(err, stats) {
    cb(err, stats);
  });
}
//拨打电话会议
routing.prototype.conference = function(confno, assign, callback) {

}
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
            self[inst.localtype](localnum, inst.assign, function(err, result) {
              cb(err, result);
            });
          }
          //默认拨打IVR 200 1
          else {
            logger.debug("本地默认处理拨打IVR200");
            self.ivr(200, 0, function(err, result) {
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
routing.prototype.dialout = function(linenum, callback) {
  var self = this;
  var context = self.context;
  var schemas = self.schemas;
  var nami = self.nami;
  var logger = self.logger;
  var args = self.args;
  var vars = self.vars;
  async.auto({
    updateCDR: function(cb) {
      schemas.pbxCdr.update({
        where: {
          id: self.sessionnum
        },
        update: {
          called: args.called,
          lastapptime: moment().format("YYYY-MM-DD HH:mm:ss"),
          lastapp: '呼叫外部'
        }
      }, function(err, inst) {
        cb(err, inst);
      });
    },
    findLine: ['updateCDR',
      function(cb, results) {
        schemas.pbxTrunk.find(linenum, function(err, inst) {
          if (err || inst == null) {
            cb('没有找到可以呼出的外线', -1);
          } else {
            cb(null, inst);
          }
        });
      }
    ],
    updatePopScreen: ['updateCDR',
      function(cb, results) {
        schemas.pbxScreenPop.update({
          where: {
            id: vars.agi_callerid
          },
          update: {
            callernumber: vars.agi_callerid,
            callednumber: args.called,
            sessionnumber: self.sessionnum,
            status: 'waite',
            routerdype: 2,
            poptype: 'dialout',
            updatetime: moment().format("YYYY-MM-DD HH:mm:ss")
          }
        }, function(err, inst) {
          cb(err, inst);
        });
      }
    ],
    dial: ['findLine',
      function(cb, results) {
        var trunkproto = results.findLine.trunkproto;
        var trunkdevice = results.findLine.trunkdevice;
        var called = args.called;

        schemas.pbxCallProcees.create({
          callsession: self.sessionnum,
          caller: vars.agi_callerid,
          called: args.called,
          routerline: args.routerline,
          passargs: 'trunkproto=' + trunkproto + '&called=' + called + '&trunkdevice=' + trunkdevice,
          processname: '呼叫外线',
          doneresults: ''
        }, function(err, inst) {
          if (err)
            logger.error("记录呼叫处理过程发生异常：", err);
        });
        var channele = trunkproto + '/' + trunkdevice;
        //context.ChannelStatus(channele, function(err, reponse) {
        //logger.debug('线路状态：', reponse);
        context.Dial(channele + '/' + called, conf.timeout, conf.dialoptions, function(err, response) {
          if (err) {
            cb(err, response);
          } else {
            context.getVariable('DIALSTATUS', function(err, response) {
              cb(null, response);
            });
          }
        });
        //});

      }
    ],
    afterdial: ['dial',
      function(cb, results) {
        var re = /(\d+)\s+\((\w+)\)/;
        var anwserstatus = null;
        if (re.test(results.dial.result)) {
          anwserstatus = RegExp.$2;
        }
        logger.debug("应答状态：", anwserstatus);


        schemas.pbxCallProcees.create({
          callsession: self.sessionnum,
          caller: vars.agi_callerid,
          called: args.called,
          routerline: args.routerline,
          passargs: '',
          processname: '呼叫外线结束',
          doneresults: 'anwserstatus=' + anwserstatus
        }, function(err, inst) {
          if (err)
            logger.error("记录呼叫处理过程发生异常：", err);
        });

        schemas.pbxCdr.update({
          where: {
            id: self.sessionnum
          },
          update: {
            lastapptime: moment().format("YYYY-MM-DD HH:mm:ss"),
            answerstatus: anwserstatus
          }
        }, function(err, inst) {
          if (err)
            logger.error("通话结束后更新通话状态发生异常！", err);
        });


        cb(null, 1);
      }
    ]

  }, function(err, results) {
    callback(err, results);
  });
};
//默认触发处理
routing.prototype.dodefault = function(context, vars) {
  context.hangup(function(err, rep) {
    console.log("Hangup success:", rep);
    context.end();
  });

};
//拨打分机
routing.prototype.extension = function(extennum, assign, callback) {
  var self = this;
  var context = self.context;
  var schemas = self.schemas;
  var nami = self.nami;
  var logger = self.logger;
  var args = self.args;
  var vars = self.vars;
  async.auto({
    updateCDR: function(cb) {
      schemas.pbxCdr.update({
        where: {
          id: self.sessionnum
        },
        update: {
          lastapptime: moment().format("YYYY-MM-DD HH:mm:ss"),
          called: extennum,
          lastapp: '拨打分机'
        }
      }, function(err, inst) {
        cb(err, inst);
      });
    },
    //添加被叫弹屏信息
    updateScreenPop: function(cb) {
      schemas.pbxScreenPop.update({
        where: {
          id: extennum
        },
        update: {
          callernumber: vars.agi_callerid,
          callednumber: extennum,
          sessionnumber: self.sessionnum,
          status: 'waite',
          routerdype: 1,
          poptype: 'diallocal',
          updatetime: moment().format("YYYY-MM-DD HH:mm:ss")
        }
      }, function(err, inst) {
        cb(err, inst);
      });
    },
    dial: ['updateCDR',
      function(cb, resluts) {
        var localargs = str2obj(assign);
        var extenproto = localargs.extenproto || 'SIP';
        var timeout = localargs.timeout || '60';
        timeout = parseInt(timeout);
        //判断分机是否开启呼叫转移
        if (localargs.transnum && /\d+/.test(localargs.transnum)) {
          logger.debug("当前呼叫转移参数：", localargs.transway, localargs.transnum);
          if (localargs.transway && typeof(self[localargs.transway]) === 'function' && self.transferlevel < 10) {
            logger.debug("当前呼叫转移层数：", self.transferlevel);
            self.transferlevel++;
            self[localargs.transway](localargs.transnum, function(err, result) {
              if (err)
                logger.error('呼叫转移过程中发生异常', err);
              cb(null, {
                result: '1 (TRANSFER)'
              });
            });
          } else {
            cb('呼叫转移方式指定错误或呼叫转移循环层级达到10', -1);
          }
        } else {
          context.Dial(extenproto + '/' + extennum, timeout, 'tr', function(err, response) {
            logger.debug("拨打分机返回结果：", response);
            if (err) {
              cb(err, response);
            } else {
              context.getVariable('DIALSTATUS', function(err, response) {
                cb(null, response);
              });
            }
          });
        }
      }
    ],
    afterdial: ['dial',
      function(cb, resluts) {
        var re = /(\d+)\s+\((\w+)\)/;
        var anwserstatus = null;
        if (re.test(resluts.dial.result)) {
          anwserstatus = RegExp.$2;
        }
        logger.debug("应答状态：", anwserstatus);
        //异步更新CDR，不影响流程
        schemas.pbxCdr.update({
          where: {
            id: self.sessionnum
          },
          update: {
            lastapptime: moment().format("YYYY-MM-DD HH:mm:ss"),
            answerstatus: anwserstatus
          }
        }, function(err, inst) {
          if (err)
            logger.error("通话结束后更新通话状态发生异常！", err);
        });

        if (anwserstatus === 'CANCEL') {
          logger.debug("主叫叫直接挂机！");
          cb("主叫直接挂机！", -1);
        } else if (anwserstatus === 'TRANSFER') {
          logger.debug("被叫开启了呼叫转移！");
          cb("被叫开启了呼叫转移！", -1);
        }
        /*else if (anwserstatus === 'CONGESTION') {
          logger.debug("被叫直接挂机！");
          cb("被叫直接挂机！", -1);
        }  else if (anwserstatus === 'NOANSWER') {
          logger.debug("被叫无应答！");
          cb("被叫无应答！", -1);
        }*/
        else if (anwserstatus !== 'ANSWER') {
          self.dialExtenFail(extennum, anwserstatus, function(err, result) {
            cb(err, result);
          });
        } else {
          logger.debug("应答成功。");
          cb(null, 1);
        }
      }
    ]
  }, function(err, results) {
    callback(err, results);
  });
}
routing.prototype.getAsConf = function(filename, callback) {
	var self = this;
	var context = self.context;
	var schemas = self.schemas;
	var nami = self.nami;
	var logger = self.logger;
	var args = self.args;
	var vars = self.vars;

	if (!filename || filename === '') {
		filename = args.filename;
	}
	if (!callback || typeof(!callback) !== 'function') {
		callback = function(err, results) {
			if (err)
				context.hangup(function(err, rep) {});
			else
				context.end();
		}
	}

	if (!filename || filename === '') {
		context.end();
	} else {
		var action = new AsAction.GetConfigJson();
		action.Filename = filename+'.conf';
		if (nami.connected) {
			nami.send(action, function(response) {
				console.log(response.json);
				if(response.response==='Success'){
					callback(null, response.json);
				}else{
				callback(null, {});	
				}
				
			});
		} else {
			nami.open();
			nami.send(action, function(response) {
				console.log(response.json);
				if(response.response==='Success'){
					callback(null, response.json);
				}else{
				callback(null, {});	
				}
			});

		}
	}
}

//挂机处理程序
routing.prototype.hangup = function(num, callback) {
  var self = this;
  var context = self.context;
  var schemas = self.schemas;
  var nami = self.nami;
  var logger = self.logger;
  var args = self.args;
  var vars = self.vars;
  context.hangup(function(err, response) {
    callback(err, response);
  });
};

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
  if (!ivrnum || ivrnum === '') {
    ivrnum = args.ivrnum;
  }
  if (!action || action === '') {
    action = args.action;
  }

  if (!callback || typeof(!callback) !== 'function') {
    callback = function(err, results) {
      if (err)
        context.hangup(function(err, rep) {});
      else
        return 0;
    }
  }
  
  if (self.ivrlevel > 50) {
    callback('IVR嵌套过深', -1);
  } else {
    logger.debug("当前IVR嵌套层数:", self.ivrlevel);
    self.ivrlevel++;
    async.auto({
      updateCDR: function(cb) {
        schemas.pbxCdr.update({
          where: {
            id: self.sessionnum
          },
          update: {
            lastapptime: moment().format("YYYY-MM-DD HH:mm:ss"),
            lastapp: '自动语音应答处理'
          }
        }, function(err, inst) {
          cb(err, inst);
        });
      },
      getIVR: ['updateCDR',
        function(cb, results) {
          schemas.pbxIvrMenmu.find(ivrnum, function(err, inst) {
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
             logger.debug("IVR应答成功！");
            cb(err, response);
          });
        }
      ],
      action: ['Answer',
        function(cb, results) {
          logger.debug("开始执行IVR动作");
          if (!action)
            action = 0;

          schemas.pbxCallProcees.create({
            callsession: self.sessionnum,
            caller: vars.agi_callerid,
            called: args.called,
            routerline: args.routerline,
            passargs: 'ivrnum=' + ivrnum + '&action=' + action,
            processname: '呼叫自动语音应答处理',
            doneresults: ''
          }, function(err, inst) {
            if (err)
              logger.error("记录呼叫处理过程发生异常：", err);
          });

          self.ivraction(action, results.getIVRActions, results.getIVRInputs, function(err, result) {
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

  if (actionid && actionid < actions.length) {
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



    logger.debug("Action 参数:", actargs);
    var autoaction = actionid;
    //async auto 执行action 开始
    async.auto({
      AddProcees: function(cb) {
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
          cb(err, inst);
        });
      },
      Action: function(cb) {
        //播放语音
        logger.debug('actionid:', actionid);
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
            var filepath = '/var/spool/asterisk/monitor/IVR/' + actions[actionid].ivrnumber + '/';

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
          var filepath = '/var/spool/asterisk/monitor/IVR/' + actions[actionid].ivrnumber + '/';
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
            formatstr = "YYMMDD";
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
          var ivractionid = actargs.actionid || 0;
          if (isok) {
            self.ivr(ivrnumber, ivractionid, cb);
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
          var number=actargs.number;
          self.VoiceMail(number,cb);
        }
        //跳转到IVR菜单
        else if (actmode.modename === '跳转到IVR菜单') {
          var ivrnumber = actargs.ivrnumber;
          var ivractionid = actargs.actionid || 0;
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
          var doneivractid = actargs.doneivractid || 0;
          var failivrnum = actargs.failivrnum;
          var failivractid = actargs.failivractid || 0;
          var timeoutivrnum = actargs.timeoutivrnum;
          var timeoutivractid = actargs.timeoutivractid || 0;
          var proto = url.substring(0, url.indexOf(":")) === 'https' ? 'https' : 'http';
          var p = require(proto);
          var options = {
            host: commonfun.getHost(url),
            port: commonfun.getPort(url),
            path: commonfun.getPath(url),
            headers: {
              "Content-Type": 'text/html'
            },
            method: methods
          };
          var datas = {};
          var channelvar = [];
          programs = programs.split(',');
          _(programs).forEach(function(num) {
            var keyval = num.split('~');
            var key = keyval[0];
            var val = keyval[1];
            if (/\<\%(\S+)\%\>/.test(val)) {
              /* channelvar.push({
                "key": key,
                "val": RegExp.$1
              });*/
              datas[key] = self.activevar[key];
            } else {
              datas[key] = val;
            }

          });
          logger.debug('datas:', datas);
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
                logger.debug(datas);
                datas = JSON.stringify(datas);
                var req = p.request(options, function(res) {
                  var retval = "";
                  logger.debug('STATUS: ' + res.statusCode);
                  logger.debug('HEADERS: ' + JSON.stringify(res.headers));
                  res.setEncoding('utf8');
                  res.on('data', function(chunk) {
                    //logger.debug('获取到返回数据：', retval);
                    retval += chunk
                  });
                  res.on('end', function() {
                    //logger.debug('执行了getData！', retval);
                    cb1(null, retval);
                  });
                });
                req.on('error', function(e) {
                  //logger.debug('problem with request: ' + e.message);
                  cb1('error', null);
                });
                req.setTimeout(timeout * 1000, function() {
                  req.end();
                  cb1('timeout', null);
                });
                req.write(datas + '\n');
                req.end();
              }
            ],
            setChannelVal: ['getData',
              function(cb1, results) {
                var getstr = results.getData;
                var getobj = getstr.split('&');
                //var channelvals = [];
                // logger.debug('getobj:', getobj);
                _(getobj).forEach(function(num) {
                  var nums = num.split('=');
                  if (nums[0] === 'status') {
                    if (nums[1] === 'fail') {
                      cb1('fail', null);
                    }
                  } else {
                    /* logger.debug('channels push:',varprex + nums[0]);
                    channelvals.push({
                      key: varprex + nums[0],
                      val: nums[1]
                    });*/
                    self.activevar[varprex + nums[0]] = nums[1];
                  }
                });
                cb1(null, null);
                /*logger.debug('channelvals:', channelvals);
                async.each(channelvals, function(item, cb2) {
                  logger.debug('设置变量：', item.key, '->', item.val);
                  context.SetVariable('cname', 'tr', function(err, response) {
                    logger.debug('设置变量2：', item.key, '->', item.val);
                    cb2(err, response);
                  });
                }, function(err) {
                  logger.debug('执行了setChannelVal！');
                  cb1(err, null);
                });*/
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
        else if(actmode.modename === '黑名单'){
          self.blacklist('',cb);
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
//发起录音
routing.prototype.monitor = function(filename, callback) {
  var self = this;
  var context = self.context;
  var schemas = self.schemas;
  var nami = self.nami;
  var logger = self.logger;
  var args = self.args;
  var vars = self.vars;
  if (typeof(filename) === 'function') {
    callback = filename;
    filename = self.sessionnum + '.wav';
  }
  context.MixMonitor(filename, '', '', function(err, response) {
    if (err) {
      logger.error("自动录音，发生错误：", err);
      callback('自动录音发生异常.', err);
    } else {
      callback(null, response);
    }
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
      schemas.pbxCdr.update({
        where: {
          id: self.sessionnum
        },
        update: {
          lastapptime: moment().format("YYYY-MM-DD HH:mm:ss"),
          lastapp: '拨打队列' + queuenum
        }
      }, function(err, inst) {
        cb(err, inst);
      });
    },
    queue: ['updateCDR',
      function(cb, results) {
        //Queue(queuename,options,URL,announceoverride,timeout,agi,cb)
        context.Queue(queuenum, 'tc', '', '', 30, 'agi://192.168.0.114/queueAnswered?queuenum=' + queuenum + '&sessionnum=' + self.sessionnum, function(err, response) {
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
  var sessionnum = args.sessionnum;
  var queuenum = args.queuenum;
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
        if (/\/(\d+)/.test(member)) {
          member = RegExp.$1;
        }
        logger.debug("当前应答坐席：", member);
        cb(err, member);
      });
    },
    //更新CDR应答状态和被叫坐席
    updateCDR: ['getAnswerMem',
      function(cb, results) {
        schemas.pbxCdr.update({
          where: {
            id: sessionnum
          },
          update: {
            answerstatus: 'ANSWERED',
            called: results.getAnswerMem,
            lastapptime: moment().format("YYYY-MM-DD HH:mm:ss")
          }
        }, function(err, inst) {
          cb(err, inst);
        });
      }
    ],
    //写入弹屏数据
    updatePop: ['getAnswerMem',
      function(cb, results) {
        schemas.pbxScreenPop.update({
          where: {
            id: results.getAnswerMem
          },
          update: {
            callernumber: vars.agi_callerid,
            callednumber: results.getAnswerMem,
            sessionnumber: sessionnum,
            status: 'waite',
            routerdype: 1,
            poptype: 'diallocal',
            updatetime: moment().format("YYYY-MM-DD HH:mm:ss")
          }
        }, function(err, inst) {
          cb(err, inst);
        });
      }
    ]
  }, function(err, results) {
    context.end();
  });

}
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
  self.routerline = args.routerline;
  async.auto({
    AddCDR: function(cb) {
      schemas.pbxCdr.create({
        id: self.sessionnum,
        caller: vars.agi_callerid,
        called: args.called,
        accountcode: vars.agi_accountcode,
        routerline: args.routerline,
        srcchannel:vars.agi_channel,
        uniqueid:vars.agi_uniqueid,
        threadid:vars.agi_threadid,
        context: vars.agi_context,
        agitype: vars.agi_type,
        lastapptime: moment().format("YYYY-MM-DD HH:mm:ss"),
        lastapp: '呼叫路由处理',
        answerstatus: 'NOANSWER'
      }, function(err, inst) {
        cb(err, inst);
      });
    },
    MixMonitor: ['AddCDR',
      function(cb, results) {
        self.sysmonitor(cb);
      }
    ],
    GetRouters: ['AddCDR',
      function(cb, results) {
        schemas.pbxRouter.all({
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
            var reCalled = new RegExp("^" + results.GetRouters[i].callednum);
            if (results.GetRouters[i].routerline === '呼入') {
              //匹配主叫以什么号码开头
              if (results.GetRouters[i].callerid !== '' && !reCaller.test(vars.agi_callerid))
                match = false;
              //匹配主叫长度
              if (results.GetRouters[i].callerlen !== -1 && vars.agi_callerid.length !== results.GetRouters[i].callerlen)
                match = false;
            } else if (results.GetRouters[i].routerline === '呼出') {
              //匹配被叫以什么号码开头
              if (results.GetRouters[i].callednum !== '' && !reCalled.test(args.called))
                match = false;
              //匹配被叫长度
              if (results.GetRouters[i].calledlen !== -1 && args.called.length !== results.GetRouters[i].calledlen)
                match = false;
            } else {}

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
              processdefined = results.GetRouters[i].processdefined || args.called; //如果指匹配设置号码否则采用被叫

              break;

            } else {
              continue;
            }
          }
        }
        if (match) {
          schemas.pbxCallProcees.create({
            callsession: self.sessionnum,
            caller: vars.agi_callerid,
            called: args.called,
            routerline: args.routerline,
            passargs: 'processmode=' + processmode + '&processdefined=' + processdefined,
            processname: '呼叫路由处理',
            doneresults: '匹配到呼叫路由'
          }, function(err, inst) {
            if (err)
              logger.error("记录呼叫处理过程发生异常：", err);
          });
          //processmode,路由处理方式，即本地的一个AGI程式:本地处理，呼叫外线，黑名单
          //processdefined，传递到AGI的参数
          self[processmode](processdefined, function(err, result) {
            cb(err, result);
          });
        } else {
          schemas.pbxCallProcees.create({
            callsession: self.sessionnum,
            caller: vars.agi_callerid,
            called: args.called,
            routerline: args.routerline,
            passargs: '',
            processname: '呼叫路由处理',
            doneresults: '未找到匹配的路由！'
          }, function(err, inst) {
            if (err)
              logger.error("记录呼叫处理过程发生异常：", err);
          });
          cb('未找到匹配的路由！', 1);
        }

      }
    ]
  }, function(err, results) {
    if (err) {
      logger.error(err);
      logger.debug("当前上下文状态：" + context.state + '，上下文流是否可读：' + context.stream.readable);
      if (context.stream && context.stream.readable) {
        context.hangup(function(err, rep) {});
      }

    } else {
      logger.debug("当前上下文状态：" + context.state + '，上下文流是否可读：' + context.stream.readable);
      if (context.stream && context.stream.readable) {
        context.hangup(function(err, rep) {
          logger.debug("来自自动挂机");
        });
      }
    }
  });
}
/**
datetime:格式-YYYYMMDD HHmm
sayway:可能的值-date / time / datetime
**/
routing.prototype.sayDateTime = function(datetime, sayway, callback) {
	var self = this;
	var context = self.context;
	var schemas = self.schemas;
	var nami = self.nami;
	var logger = self.logger;
	var args = self.args;
	var vars = self.vars;

	if (!datetime || datetime === '') {
		datetime = args.datetime;
	}
	if (!sayway || sayway === '') {
		sayway = args.sayway;
	}

	if (!callback || typeof(!callback) !== 'function') {
		callback = function(err, results) {
			if (err)
				context.hangup(function(err, rep) {});
			else
				 context.end();
		}
	}

	if (!datetime || datetime === '')
		callback('无效的日期时间参数！', -1);
	else {
		var datime = datetime.split(/\s+/);
		var d = datime[0];
		var year = d.substr(0, 4);
		var month = d.substr(4, 2);
		month=month.replace(/^0/,'');
		var day = d.substr(6, 2);
		day=day.replace(/^0/,'');
		var t = datime[1] || "0000";
		var hour = t.substr(0, 2);
		hour=hour.replace(/^0/,'');
		var minute = t.substr(2, 2);
		minute=minute.replace(/^0/,'');
		if (sayway === 'date') {
			async.auto({
				sayyear: function(cb) {
					context.saydigits(year, cb);
				},
				sayYYYY: ['sayyear',
					function(cb, results) {
						context.Playback('digits/year', cb);
					}
				],
				saymonth: ['sayYYYY',
					function(cb, results) {
						context.saynumber(month, cb);
					}
				],
				sayMM: ['saymonth',
					function(cb, results) {
						context.Playback('digits/month', cb);
					}
				],
				sayday: ['sayMM',
					function(cb, results) {
						context.saynumber(day, cb);
					}
				],
				sayDD: ['sayday',
					function(cb, results) {
						context.Playback('digits/day', cb);
					}
				]
			}, function(err, results) {
				callback(err, results);
			});

		}
		else if(sayway === 'time'){
			async.auto({
				sayhour: function(cb) {
					context.saynumber(hour, cb);
				},
				sayHH: ['sayhour',
					function(cb, results) {
						context.Playback('digits/hour', cb);
					}
				],
				sayminute: ['sayHH',
					function(cb, results) {
						context.saynumber(minute, cb);
					}
				],
				saymm: ['sayminute',
					function(cb, results) {
						context.Playback('digits/minute', cb);
					}
				]
			}, function(err, results) {
				callback(err, results);
			});
		}
		else{
			async.auto({
				sayyear: function(cb) {
					context.saydigits(year, cb);
				},
				sayYYYY: ['sayyear',
					function(cb, results) {
						context.Playback('digits/year', cb);
					}
				],
				saymonth: ['sayYYYY',
					function(cb, results) {
						context.saynumber(month, cb);
					}
				],
				sayMM: ['saymonth',
					function(cb, results) {
						context.Playback('digits/month', cb);
					}
				],
				sayday: ['sayMM',
					function(cb, results) {
						context.saynumber(day, cb);
					}
				],
				sayDD: ['sayday',
					function(cb, results) {
						context.Playback('digits/day', cb);
					}
				],
				sayhour:['sayDD',function(cb) {
					context.saynumber(hour, cb);
				}],
				sayHH: ['sayhour',
					function(cb, results) {
						context.Playback('digits/hour', cb);
					}
				],
				sayminute: ['sayHH',
					function(cb, results) {
						context.saynumber(minute, cb);
					}
				],
				saymm: ['sayminute',
					function(cb, results) {
						context.Playback('digits/minute', cb);
					}
				]
			}, function(err, results) {
				callback(err, results);
			});
		}
	}

}
routing.prototype.sayNumber = function(number, callback) {
	var self = this;
	var context = self.context;
	var schemas = self.schemas;
	var nami = self.nami;
	var logger = self.logger;
	var args = self.args;
	var vars = self.vars;

	if (!number || number === '') {
		number = args.number;
	}
	if (typeof(number) === 'function') {
		callback = number;
	}
	if (!callback || typeof(!callback) !== 'function') {
		callback = function(err, results) {
			if (err)
				context.hangup(function(err, rep) {});
			else
				 context.end();
		}
	}

	context.saynumber(number, function(err, result) {
		callback(err, result);
	});

}
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
        lastapp: 'sccincallout',
        answerstatus: 'NOANSWER'
      }, function(err, inst) {
        cb(err, inst);
      });
    },
    //获取呼叫记录编号
    getCallrcordsId: function(cb) {
      try {
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
      } catch (ex) {
        logger.error(ex);
        cb('获取呼叫记录编号发生异常！', null);
      }
    },
    //通过通道变量获取有效按键
    getKeyNum: ['getCallrcordsId',
      function(cb) {
        try {
          context.getVariable('keynum', function(err, response) {
            logger.debug("获取有效按键：", response);
            var reg = /(\d+)\s+\((.*)\)/;
            var c = null,
              id = null;
            if (reg.test(response.result)) {
              c = RegExp.$1;
              keyNum = RegExp.$2;
            }
            cb(err, keyNum);
          });
        } catch (ex) {
          logger.error(ex);
          cb('通道变量获取有效按键发生异常！', null);
        }
      }
    ],
    //获取需要拨打的电话号码,倒序取出第一个电话作为需要拨打的电话
    getPhones: ['getKeyNum',
      function(cb, results) {
        try {
          schemas.crmCallPhone.all({
            where: {
              callRecordsID: callRecordsID,
              State: 0
            },
            order: ['PhoneSequ asc']
          }, function(err, insts) {
            cb(err, insts);
          });
        } catch (ex) {
          logger.error(ex);
          cb('获取需要拨打的电话号码发生异常！', null);
        }
      }
    ],
    //更新呼叫记录表
    updateCallRecords: ['getPhones',
      function(cb, results) {
        try {
          if (results.getPhones && results.getPhones.length > 0) {
            schemas.crmCallRecords.update({
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
        } catch (ex) {
          logger.error('更新呼叫记录表发生异常:', ex);
          cb('更新呼叫记录表发生异常！', null);
        }

      }
    ],
    //更新呼叫结果表
    updateDialResult: ['getPhones',
      function(cb, results) {
        try {
          if (results.getPhones && results.getPhones.length > 0) {
            schemas.crmDialResult.update({
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
            cb(null, null);
          }
        } catch (ex) {
          logger.error('更新呼叫结果表发生异常:', ex);
          cb('更新呼叫结果表发生异常！', null);
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
              try {
                schemas.crmCallPhone.update({
                  where: {
                    id: results.getPhones[0].id
                  },
                  update: {
                    State: 1
                  }

                }, function(err, inst) {
                  cb(err, inst);
                });
              } catch (ex) {
                logger.error('更新电话记录表发生异常:', ex);
                cb('更新电话记录表发生异常！', null);
              }
            },
            //添加呼叫日志
            addCallLog: function(cb) {
              try {
                schemas.crmCallLog.create({
                  Phone: results.getPhones[0].Phone,
                  PhoneSequ: results.getPhones[0].PhoneSequ,
                  callphone: results.getPhones[0]
                }, function(err, inst) {
                  cb(err, inst);
                });
              } catch (ex) {
                logger.error('添加呼叫日志发生异常:', ex);
                cb('添加呼叫日志发生异常！', null);
              }
            },
            //产生拨打
            dial: ['addCallLog', 'updateCallPhone',
              function(cb) {
                try {
                  context.Dial(conf.line + results.getPhones[0].Phone, conf.timeout, conf.dialoptions, function(err, response) {
                    if (err) {
                      cb(err, response);
                    } else {
                      console.log(context);
                      context.getVariable('DIALSTATUS', function(err, response2) {
                        cb(null, response2);

                      });
                    }
                  });
                } catch (ex) {
                  logger.error('产生拨打发生异常:', ex);
                  cb('产生拨打发生异常！', null);
                }
              }
            ],
            //获取拨打状态并记录在callog表里面
            dialStatus: ['dial',
              function(cb, results) {
                try {
                  var re = /(\d+)\s+\((\w+)\)/;
                  var anwserstatus = null;
                  if (re.test(results.dial.result)) {
                    anwserstatus = RegExp.$2;
                  }
                  schemas.crmUserKeysRecord.create({
                    id: guid.create(),
                    Key: anwserstatus,
                    keyTypeID: '111111',
                    calllog: results.addCallLog
                  }, function(err, inst) {
                    cb(err, inst);
                  });
                } catch (ex) {
                  logger.error('获取拨打状态发生异常:', ex);
                  cb('获取拨打状态发生异常！', null);
                }
              }
            ]
          }, function(err, results) {
            cb(err, results);
          });
        } else {
          try {
            schemas.crmDialResult.update({
              where: {
                id: callRecordsID
              },
              update: {
                Result: 109, //未找到需要拨打的号码
                State: 1
              }
            }, function(err, inst) {
              cb(err, inst);
            });
          } catch (ex) {
            logger.error('保存拨打结果发生异常:', ex);
            cb(ex, null);
          }
        }
      }
    ]
  }, function(err, results) {
    var upDialResult = function(Result) {
      try {
        schemas.crmDialResult.update({
          where: {
            id: callRecordsID
          },
          update: {
            Result: Result,
            State: 1
          }
        }, function(err, inst) {});
      } catch (ex) {
        logger.error('保存拨打结果发生异常:', ex);
      }
    };

    if (err) {
      logger.error('外呼程序发生异常：', err);
      upDialResult(110);
      context.hangup(function(err, response) {
        logger.error("没有找到需要拨打的号码，挂机！");
      });
    } else {
      var anwserstatus = results.Dial.dialStatus.Key;
      //异步更新CDR，不影响流程
      schemas.pbxCdr.update({
        where: {
          id: self.sessionnum
        },
        update: {
          lastapptime: moment().format("YYYY-MM-DD HH:mm:ss"),
          answerstatus: anwserstatus
        }
      }, function(err, inst) {
        if (err)
          logger.error("通话结束后更新通话状态发生异常！", err);
      });

      if (anwserstatus === 'CONGESTION') {
        upDialResult(100);
        context.hangup(function(err, response) {
          logger.debug("被叫拒绝接听！");
        });
      } else if (anwserstatus === 'CHANUNAVAIL') {
        upDialResult(101);
        context.hangup(function(err, response) {
          logger.debug("号码无效！");
        });
      } else if (anwserstatus === 'NOANSWER') {
        upDialResult(102);
        context.hangup(function(err, response) {
          logger.debug("无应答！");
        });
      } else if (anwserstatus === 'BUSY') {
        upDialResult(103);
        context.hangup(function(err, response) {
          logger.debug("电话忙！");
        });
      } else if (anwserstatus === 'DONTCALL') {
        upDialResult(104);
        context.hangup(function(err, response) {
          logger.debug("被叫转移电话1！");
        });
      } else if (anwserstatus === 'TORTURE') {
        upDialResult(105);
        context.hangup(function(err, response) {
          logger.debug("被叫转移电话2");
        });
      } else if (anwserstatus === 'INVALIDARGS') {
        upDialResult(106);
        context.hangup(function(err, response) {
          logger.debug("无效的呼叫参数！");
        });
      } else if (anwserstatus === 'CANCEL') {
        upDialResult(107);
        context.hangup(function(err, response) {
          logger.debug("呼叫取消");
        });
      } else if (anwserstatus !== 'ANSWER') {
        upDialResult(108);
        context.hangup(function(err, response) {
          logger.debug("其他");
        });
      } else {
        //upDialResult(10);
        logger.debug("准备开始播放语音文件。");
      }
      //以下是多路拨打
      /* if (anwserstatus !== 'ANSWER') {
          self.NextDial(callRecordsID, keyNum, function(err, result) {
            if (err) {
              logger.error(err);
              context.hangup(function(err, response) {
                logger.debug("呼叫下一个电话发生异常，挂机！");
              });
            } else if (result === 'over') {
              context.hangup(function(err, response) {
                logger.debug("所有电话已经呼叫完毕，挂机！");
              });
            } else {
              context.hangup(function(err, response) {
                logger.debug("本轮呼叫完毕，挂机！");
              });
            }
          });
        } else {
          logger.debug("准备开始播放语音文件。");
        }*/


    }
  });

};
//发起系统录音
routing.prototype.sysmonitor = function(monitype, callback) {
  var self = this;
  var context = self.context;
  var schemas = self.schemas;
  var nami = self.nami;
  var logger = self.logger;
  var args = self.args;
  var vars = self.vars;
  if (typeof(monitype) === 'function') {
    callback = monitype;
    monitype = '';
  }
  async.auto({
    //检查录音方式
    checkMonitorWay: function(cb) {
      var where = {
        id: {
          'neq': ''
        }
      };
      if (monitype === '呼入') {
        where.recordin = '是';
        where.members = {
          'like': '%' + args.called + '%'
        };
      } else if (monitype === '呼出') {
        where.recordout = '是';
        where.members = {
          'like': '%' + vars.agi_callerid + '%'
        };
      } else if (monitype === '队列') {
        where.recordqueue = '是';
        where.members = {
          'like': '%' + args.called + '%'
        };
      } else {
        cb(null, {
          wayName: '系统自动',
          keepfortype: '按时间',
          keepforargs: 90
        });
      }
      if (where && where.members !== null) {
        schemas.pbxAutoMonitorWays.findOne({
          where: where
        }, function(err, inst) {
          cb(err, inst);
        });
      }

    },
    //创建录音目录
    buildForder: ['checkMonitorWay',
      function(cb, results) {
        if (results.checkMonitorWay !== null) {
          var fs = require('fs');
          var wayname = results.checkMonitorWay.wayName;
          var path = '/var/spool/asterisk/monitor/' + wayname + '/';

          fs.exists(path, function(exists) {
            if (!exists) {
              fs.mkdir(path, function(err) {
                if (err) {
                  cb('无法创建录音需要的目录：'+path, null);
                } else {
                  cb(null, path);
                }
              });
            } else {
              cb(null, path);
            }
          });
        } else {
          cb('不需要录音！', null);
        }
      }
    ],
    //查找已有的录音
    findHasRecords: ['checkMonitorWay',
      function(cb, results) {
        if (results.checkMonitorWay !== null) {
          if (results.checkMonitorWay.keepfortype === '按时间') {
            var where = {};
            var olddate = moment().subtract('days', results.checkMonitorWay.keepforargs).format("YYYY-MM-DD");
            where.cretime = {
              'lte': olddate
            };
            schemas.pbxRcordFile.all({
              where: where
            }, function(err, dbs) {
              cb(err, dbs);
            });
          } else if (results.checkMonitorWay.keepfortype === '按条数') {
            schemas.pbxRcordFile.count({}, function(err, counts) {
              if (err) {
                cb(err, []);
              } else if (counts > results.checkMonitorWay.keepforargs) {
                schemas.pbxRcordFile.all({
                  skip: 0,
                  limit: counts - results.checkMonitorWay.keepforargs
                }, function(err, dbs) {
                  cb(err, dbs);
                });
              } else {
                cb(null, []);
              }
            });
          } else {
            cb(null, []);
          }

        } else {
          cb('不需要录音！', []);
        }
      }
    ],
    //处理已有录音
    handleHasRecords: ['findHasRecords',
      function(cb, results) {
        cb(null, null);
      }
    ],
    //开始录音
    monitor: ['buildForder',
      function(cb, results) {
        var filename = self.sessionnum + '.wav';
        context.MixMonitor(results.buildForder + filename, '', '', function(err, response) {
          if (err) {
            cb('自动录音发生异常.', err);
          } else {
            cb(null, response);
          }
        });
      }
    ],
    //添加一条录音记录
    addRecords: ['buildForder',
      function(cb, results) {
        var filename = self.sessionnum + '.wav';
        var extennum = self.routerline === '呼入' ? args.called : vars.agi_callerid;
        var callnumber = self.routerline === '呼出' ? args.called : vars.agi_callerid;
        schemas.pbxRcordFile.create({
          id: self.sessionnum,
          filename: filename,
          extname: 'wav',
          calltype: self.routerline,
          extennum: extennum,
          folder: results.buildForder,
          callnumber: callnumber
        }, function(err, inst) {
          cb(err, inst);
        });
      }
    ]
  }, function(err, results) {
    if (err) {
      logger.error("自动录音，发生错误：", err);
      callback(null, err);//录音模块发生错误，不中断正常流程
    } else {
      callback(null, response);
    }
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
  if (!assign || assign === '') {
    assign = args.assign;
  }
  if (!queuenum || queuenum === '') {
    action = args.queuenum;
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
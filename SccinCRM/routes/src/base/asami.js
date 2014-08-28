var conf = require('node-conf');
var basedir = conf.load('app').appbase;
/*var tts = require(basedir + '/lib/tts').tts;*/

var nami = require(basedir + '/asterisk/asmanager').nami,
    util = require('util'),
    async = require('async'),
    AsAction = require("nami").Actions;

var Schemas = require(basedir + '/database/schema').Schemas;
var guid = require('guid');
var logger = require(basedir + '/lib/logger').logger('web');

var gets = {};
var posts = {};
module.exports = {
    get: gets,
    post: posts
};


posts.sippeers = function (req, res, next) {
    nami.send(new AsAction.SipPeers(), function (response) {
        console.log(response);
        //res.render('nami/index', { title: 'NAMI测试',response:util.inspect(response,true,null) });
        res.send(response);

    });
}

posts.ping = function (req, res, next) {
    nami.send(new AsAction.Ping(), function (response) {
        console.log(response);
        //res.render('nami/index', { title: 'NAMI测试',response:util.inspect(response,true,null) });
        res.send(response);

    });
}

posts.hangup = function (req, res, next) {
    var action = new AsAction.Hangup();
    action.Channel = 'sip/abcd';
    nami.send(action, function (response) {
        console.log(response);
        //res.render('nami/index', { title: 'NAMI测试',response:util.inspect(response,true,null) });
        res.send(response);

    });
}

posts.status = function (req, res, next) {
    var action = new AsAction.Status();
    //Status.Channel='sip/abcd';
    nami.send(action, function (response) {
        console.log(response);
        //res.render('nami/index', { title: 'NAMI测试',response:util.inspect(response,true,null) });
        res.send(response);

    });
}

posts.command = function (req, res, next) {
    var cmd = req.body['cmd'] || req.query['cmd'];
    var action = new AsAction.Command();
    action.Command = cmd;
    nami.send(action, function (response) {
        console.log(response);
        //res.render('nami/index', { title: 'NAMI测试',response:util.inspect(response,true,null) });
        res.send(response);

    });
}

posts.extensionstate = function (req, res, next) {
    var exten = req.body['exten'] || req.query['exten'];
    var context = req.body['context'] || req.query['context'];
    var action = new AsAction.ExtensionState();
    action.Exten = exten;
    action.Context = context
    nami.send(action, function (response) {
        console.log(response);
        //res.render('nami/index', { title: 'NAMI测试',response:util.inspect(response,true,null) });
        res.send(response);

    });
}

posts.getconfig = function (req, res, next) {
    var filename = req.body['filename'] || req.query['filename'];
    var category = req.body['category'] || req.query['category'];
    var action = new AsAction.GetConfig();
    action.Filename = filename;
    action.Category = category
    nami.send(action, function (response) {
        console.log(response);
        //res.render('nami/index', { title: 'NAMI测试',response:util.inspect(response,true,null) });
        res.send(response);

    });
}

posts.createconfig = function (req, res, next) {
    var filename = req.body['filename'] || req.query['filename'];
    var action = new AsAction.CreateConfig();
    action.Filename = filename;

    nami.send(action, function (response) {
        console.log(response);
        //res.render('nami/index', { title: 'NAMI测试',response:util.inspect(response,true,null) });
        res.send(response);

    });
}

posts.getconfigjson = function (req, res, next) {
    var filename = req.body['filename'] || req.query['filename'];
    var action = new AsAction.GetConfigJson();
    action.Filename = filename;

    nami.send(action, function (response) {
        console.log(response);
        //res.render('nami/index', { title: 'NAMI测试',response:util.inspect(response,true,null) });
        res.send(response);

    });
}

posts.DAHDIShowChannels = function (req, res, next) {
    var action = new AsAction.DahdiShowChannels();
    nami.send(action, function (response) {
        console.log(response);
        res.send(response);
    });
}

posts.coreshowchannels = function (req, res, next) {
    var action = new AsAction.CoreShowChannels();
    nami.send(action, function (response) {
        console.log(response);
        //res.render('nami/index', { title: 'NAMI测试',response:util.inspect(response,true,null) });
        res.send(response);

    });
}

posts.hangupexten = function (req, res, next) {
    var exten = req.body['exten'] || req.query['exten'];
    var type = req.body['type'] || req.query['type'];
    if (!type) {
        type = 'SIP';
    }
    getconnectchannel(type, exten, function (channels) {
        console.log(channels);
        var action = new AsAction.Hangup();
        action.Channel = channels.src;
        nami.send(action, function (response) {
            res.send(response);
        });
    });
}

posts.transfer = function (req, res, next) {
    var extenfrom = req.body['extenfrom'] || req.query['extenfrom'];
    var extento = req.body['extento'] || req.query['extento'];
    var fromtype = req.body['fromtype'] || req.query['fromtype'];
    if (!fromtype) {
        fromtype = 'SIP';
    }

    getconnectchannel(fromtype, extenfrom, function (channels) {
        var action = new AsAction.Redirect();
        action.Channel = channels.src;
        action.Exten = extento;
        action.Context = 'from-exten-sip';
        nami.send(action, function (response) {
            res.send(response);
        });
    });

}
/**
 * Originate Action
 * @constructor
 * @see Action(String)
 * @see See <a href="https://wiki.asterisk.org/wiki/display/AST/ManagerAction_Originate">https://wiki.asterisk.org/wiki/display/AST/ManagerAction_Originate</a>.
 * @property {String} Channel Channel
 * @property {String} Exten Exten
 * @property {String} Priority Priority
 * @property {String} Application Application
 * @property {String} Data Data
 * @property {String} Timeout Timeout
 * @property {String} CallerID CallerID
 * @property {String} Account Account
 * @property {String} Async Async
 * @property {String} Codecs Codecs
 * @augments Action
 */
posts.dialout = function (req, res, next) {
    var variable = req.body['variable'] || req.query['variable'];
    var outnumber = req.body['outnumber'] || req.query['outnumber'];
    var exten = req.body['exten'] || req.query['exten'];

    var Variable = "CHANNEL(language)=cn,FRI2_OUTGOING_MEMBERID=1,POPTYPE=" + variable;
    var channel = "LOCAL/" + outnumber + "@sub-outgoing/n";
    var Context = 'sub-outgoing-callback';
    //var Context='app-exten';
    var action = new AsAction.Originate();
    action.Channel = channel;
    //action.Timeout=30;
    action.Async = true;
    action.Account = exten;
    action.CallerID = exten;
    action.Context = Context;
    action.Exten = exten;
    console.log(action);
    if (nami.connected) {
        nami.send(action, function (response) {
            res.send(response);
        });
    } else {
        res.send({
            Response: 'NotConnected'
        });

    }

}

/**
 *  自动拨打专家
 *
 *
 **/
posts.autodial = function (req, res, next) {
    //res.set('Access-Control-Allow-Origin', '*');
    //res.header('Access-Control-Allow-Origin', '*')
    var tts = require(basedir + '/lib/tts').tts;
    var Userkey = req.get('User-key');
    var UserAgent = req.get('User-Agent');
    logger.debug('拨打服务获取到的头信息：', Userkey, UserAgent);
    res.setHeader('Content-type', 'application/json');
    //res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
    var CallInfoID = req.body['CallInfoID'];
    var ProjMoveID = req.body['ProjMoveID'];
    var NoticeContent = req.body['NoticeContent'] || "";
    NoticeContent = NoticeContent.replace(/\s+/g, '');
    var SureContent = req.body['SureContent'] || "";
    SureContent = SureContent.replace(/\s+/g, '');
    var QueryContent = req.body['QueryContent'] || "";
    QueryContent = QueryContent.replace(/\s+/g, '');
    var HardContent = req.body['HardContent'] || "";
    HardContent = HardContent.replace(/\s+/g, '');

    var Phones = req.body['Phones'];
    Phones = Phones.replace(/\s+/g, '');
    var KeyNum = req.body['KeyNum'];

    if (!CallInfoID || CallInfoID == "") {
        res.send({
            "success": false,
            "result": '抽取编号不能为空'
        });

    } else if (!ProjMoveID || ProjMoveID == "") {
        res.send({
            "success": false,
            "result": '项目编号不能为空'
        });

    } else if (!NoticeContent || NoticeContent == "") {
        res.send({
            "success": false,
            "result": '合成通知评标专家语音类容不能为空'
        });

    } else if (!SureContent || SureContent == "") {
        res.send({
            "success": false,
            "result": '合成确认参加评标提示语音类容不能为空'
        });

    } else if (!QueryContent || QueryContent == "") {
        res.send({
            "success": false,
            "result": '合成自动查询语音类容不能为空'
        });

    } else if (!HardContent || HardContent == "") {
        res.send({
            "success": false,
            "result": '合成重听参评信息语音类容不能为空'
        });
    } else if (!Phones || Phones == "") {
        res.send({
            "success": false,
            "result": '拨打电话不能为空'
        });

    } else {
        async.auto({
            //保存初始化数据到拨打记录表
            addCallRecords: function (callback) {
                logger.debug("执行：addCallRecords");
                try {
                    Schemas['crmCallRecords'].create({
                        id: guid.create(),
                        CallInfoID: CallInfoID,
                        ProjMoveID: ProjMoveID
                    }, function (err, callrecord) {
                        callback(err, callrecord);
                    });
                } catch (ex) {
                    callback(ex, null);
                }
            },
            getSythState: function (callback) {
                logger.debug("执行：getSythState");
                try {
                    Schemas['crmVoiceContent'].find(ProjMoveID, function (err, inst) {
                        callback(err, inst);
                    });
                } catch (ex) {
                    callback(ex, null);
                }
            },
            //保存初始化数据到语音内容表
            addVoiceContent: ['addCallRecords', 'getSythState',
                function (callback, results) {
                    logger.debug("执行：addVoiceContent");
                    try {
                        if (results.getSythState === null) {
                            Schemas['crmVoiceContent'].create({
                                //NoticeContents: NoticeContent,
                                //SureContents: SureContent,
                                //QueryContents: QueryContent,
                                id: ProjMoveID
                            }, function (err, inst) {
                                callback(err, inst);
                            });
                        } else {
                            callback(null, results.getSythState);
                        }
                    } catch (ex) {
                        callback(ex, null);
                    }
                }
            ],
            //保存初始化数据到拨打电话表
            addCallPhone: ['addCallRecords',
                function (callback, results) {
                    logger.debug("执行：addCallPhone");
                    var phones = Phones.split(',');
                    var count = 0;
                    async.whilst(
                        function () {
                            return count < phones.length;
                        },
                        function (cb) {

                            count++;
                            Schemas['crmCallPhone'].create({
                                id: guid.create(),
                                Phone: phones[count - 1],
                                //PhoneSequ: count - 1,
                                callrecord: results.addCallRecords
                            }, function (err, inst) {
                                cb(err, inst);
                            });
                        },
                        function (err, results) {
                            callback(err, results);

                        }
                    );


                }
            ],
            //保存初始化数据到拨打结果表
            addDialResult: ['addCallRecords',
                function (callback, results) {
                    logger.debug("执行：addDialResult");
                    Schemas['crmDialResult'].create({
                        CallInfoID: CallInfoID,
                        callrecord: results.addCallRecords
                    }, function (err, inst) {
                        callback(err, inst);
                    });
                }
            ],
            //将新插入的合成表数据，更新合成状态为合成中
            setVoiceContent: ['addVoiceContent',
                function (callback, results) {
                    logger.debug("执行：setVoiceContent");
                    try {
                        if (results.addVoiceContent.State === 0) {
                            var voc = new Schemas['crmVoiceContent'](results.addVoiceContent);
                            voc.State = 1;
                            voc.save(function (err, inst) {
                                callback(err, inst);
                            });
                        } else if (results.addVoiceContent.State === 1) {
                            callback('有相同项目编号的语音正在合成中！', null);
                        } else {
                            callback(null, results.addVoiceContent);
                        }
                    } catch (ex) {
                        callback('更新合成中状态时发生错误！', null);
                    }

                }
            ],
            //合成通知语音
            voiceMixNotice: ['setVoiceContent',
                function (callback, results) {
                    logger.debug("执行：voiceMixNotice");
                    //处理语音合成
                    //合成的语音文件名字  results.addCallRecords.id + -notice.wav
                    if (results.setVoiceContent.State === 1) {
                        tts.synth('/home/share/' + ProjMoveID + '-notice.wav', NoticeContent, function (state, msg) {
                            logger.debug("执行：voiceMixNotice成功？", state);
                            if (state === 'true') {

                                callback(null, 1);
                            } else {
                                logger.error('合成通知语音失败:', msg);
                                callback({
                                    "Error": '合成通知语音失败！'
                                }, null);
                            }
                        });
                    } else {
                        callback(null, 2);
                    }

                }
            ],
            //合成确认语音
            voiceMixSure: ['voiceMixNotice',
                function (callback, results) {
                    logger.debug("执行：voiceMixSure,", results.voiceMixNotice);
                    if (results.voiceMixNotice === null)
                        callback('合成确认语音失败!', null);
                    //处理语音合成
                    //合成的语音文件名字  results.addCallRecords.id + -sure.wav
                    if (results.setVoiceContent.State === 1) {
                        tts.synth('/home/share/' + ProjMoveID + '-sure.wav', SureContent, function (state, msg) {
                            if (state === 'true') {
                                logger.debug("执行：voiceMixSure成功？:", state);
                                callback(null, 1);
                            } else {
                                logger.error('合成确认语音失败:', msg);
                                callback('合成确认语音失败!', null);
                            }
                        });
                    } else {
                        callback(null, 2);
                    }

                }
            ],
            //合成查询语音
            voiceMixQuery: ['voiceMixSure',
                function (callback, results) {
                    logger.debug("执行：voiceMixQuery,", results.voiceMixSure);
                    if (results.voiceMixSure === null)
                        callback('合成查询语音失败!', null);
                    //处理语音合成
                    //合成的语音文件名字  results.addCallRecords.id + -query.wav
                    if (results.setVoiceContent.State === 1) {
                        tts.synth('/home/share/' + ProjMoveID + '-query.wav', QueryContent, function (state, msg) {
                            if (state === 'true') {
                                logger.debug("执行：voiceMixQuery成功？");
                                callback(null, 1);
                            } else {
                                logger.error('合成查询语音失败:', msg);
                                callback('合成查询语音失败!', null);
                            }
                        });
                    } else {
                        callback(null, 2);
                    }
                }
            ],
            //合成重听确认参评的内容语音
            voiceMixHardContent: ['voiceMixQuery',
                function (callback, results) {
                    logger.debug("执行：HardContent", results.voiceMixQuery);
                    if (results.voiceMixQuery === null)
                        callback('合成重复收听语音失败!', null);
                    //处理语音合成
                    //合成的语音文件名字  results.addCallRecords.id + -query.wav
                    if (results.setVoiceContent.State === 1) {
                        tts.synth('/home/share/' + ProjMoveID + '-hard.wav', HardContent, function (state, msg) {
                            if (state === 'true') {
                                logger.debug("执行：voiceMixHardContent成功？");
                                callback(null, 1);
                            } else {
                                logger.error('合成重复收听语音失败:', msg);
                                callback('合成重复收听语音失败!', null);
                            }
                        });
                    } else {
                        callback(null, 2);
                    }
                }
            ],
            //更新合成状态为已完成
            updateVoiceContent: ['voiceMixHardContent',
                //updateVoiceContent: ['addVoiceContent',
                function (callback, results) {
                    logger.debug("执行：updateVoiceContent，", results.voiceMixHardContent);
                    var state = 2;
                    if (results.voiceMixHardContent === null)
                        state = 0;
                    try {
                        var voc = new Schemas['crmVoiceContent'](results.addVoiceContent);
                        voc.State = state;
                        voc.save(function (err, inst) {
                            callback(err, inst);
                        });
                    } catch (ex) {
                        callback('更新合成完成状态时发生错误！', null);
                    }

                }
            ],
            //验证可用通道是否满足拨打条件
            checkChans: ['updateVoiceContent',
                function (callback, results) {
                    logger.debug("执行：checkChans");
                    Schemas['pbxCdr'].count({
                        alive: 'yes'
                    }, function (err, counts) {
                        if (err)
                            callback(err, null);
                        else {
                            if (counts && counts > conf.load('app').maxchans) {
                                callback('当前可用线路不足，已用:' + counts, counts);
                            } else {
                                callback(null, counts);
                            }
                        }

                    });
                }
            ],
            //开始拨打
            callDial: ['checkChans',
                function (callback, results) {
                    if (results.voiceMixNotice === null || results.voiceMixSure === null || results.voiceMixQuery === null)
                        callback("由于语音文件合成失败，不能拨打！", null);
                    logger.debug("执行：callDial");
                    //var Variable = "CHANNEL(language)=cn,Content=" + Content + "CallInfoID=" + CallInfoID;
                    var channel = "LOCAL/" + 200 + "@sub-outgoing/n";
                    var Context = 'sub-outgoing-callback';
                    //var Context='app-exten';
                    var action = new AsAction.Originate();
                    action.Channel = channel;
                    //action.Timeout=30;
                    action.Async = true;
                    action.Account = results.addCallRecords.id;
                    action.CallerID = 200;
                    action.Context = Context;
                    action.Variable = 'callrecordid=' + results.addCallRecords.id + ',keynum=' + KeyNum;
                    action.Exten = 200;
                    if (nami.connected) {
                        nami.send(action, function (response) {
                            callback(null, response);
                        });
                    } else {
                        callback('无法连接到语音服务器！', null);

                    }
                }
            ]

        }, function (err, results) {
            logger.debug("执行：callback!");

            if (err) {
                logger.error('调用拨打服务发生异常：', err);
                var errmsg = "";
                if (typeof(err) === 'object') {
                    errmsg += err.TypeError || err.Error || '';
                } else {
                    errmsg = err;
                }
                res.send({
                    "success": false,
                    "result": "服务器发生内部异常:" + errmsg + ",请联系系统管理员！"
                });

            } else {
                res.send({
                    "success": true,
                    "result": "调用成功！"
                });

            }

        });

    }

}


posts.getresult = function (req, res, next) {
    var Userkey = req.get('User-key');
    var UserAgent = req.get('User-Agent');
    logger.debug('获取结果服务获取到的头信息：', Userkey, UserAgent);

    res.setHeader('Content-type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
    var CallInfoID = req.body['CallInfoID'];
    logger.debug("开始获取：" + CallInfoID + '的呼叫结果！');

    if (!CallInfoID || CallInfoID == "") {
        res.send({
            "success": false,
            "result": '抽取编号不能为空'
        });

    } else {
        try {
            Schemas['crmDialResult'].findOne({
                where: {
                    CallInfoID: CallInfoID
                }
            }, function (err, inst) {
                if (err) {
                    res.send({
                        "success": false,
                        "result": '获取拨打结果时服务器发生异常'
                    });
                } else if (inst == null) {
                    res.send({
                        "success": false,
                        "result": '在服务器上没有找到该数据'
                    });
                } else {
                    res.send({
                        "success": true,
                        "result": inst.Result.toString()
                    });
                }
            });
        } catch (ex) {
            logger.error("获取拨打结果发生异常：", ex);
            res.send({
                "success": false,
                "result": '获取拨打结果时服务器发生异常'
            });

        }
    }
}

gets.getresult = function (req, res, next) {
    var Userkey = req.get('User-key');
    var UserAgent = req.get('User-Agent');
    logger.debug('获取结果服务获取到的头信息：', Userkey, UserAgent);

    res.setHeader('Content-type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
    var CallInfoID = req.query['CallInfoID'];
    logger.debug("开始获取：" + CallInfoID + '的呼叫结果！');

    if (!CallInfoID || CallInfoID == "") {
        res.send({
            "success": false,
            "result": '抽取编号不能为空'
        });

    } else {
        try {
            Schemas['crmDialResult'].findOne({
                where: {
                    CallInfoID: CallInfoID
                }
            }, function (err, inst) {
                if (err) {
                    res.send({
                        "success": false,
                        "result": '获取拨打结果时服务器发生异常'
                    });
                } else if (inst == null) {
                    res.send({
                        "success": false,
                        "result": '在服务器上没有找到该数据'
                    });
                } else {
                    res.send({
                        "success": true,
                        "result": inst.Result.toString()
                    });
                }
            });
        } catch (ex) {
            logger.error("获取拨打结果发生异常：", ex);
            res.send({
                "success": false,
                "result": '获取拨打结果时服务器发生异常'
            });

        }
    }
}


posts.packCall = function (req, res, next) {
    var exten = req.body['exten'] || req.query['exten'];
    var type = req.body['type'] || req.query['type'];
    if (!type) {
        type = 'SIP';
    }
    var timeout = req.body['timeout'] || req.query['timeout'];
    getconnectchannel(type, exten, function (channels) {
        logger.debug(channels);
        var action = new AsAction.Park();
        action.Channel2 = channels.src;
        action.Channel = channels.dst;
        action.Timeout = 120000;
        nami.send(action, function (response) {
            res.send(response);
        });
    });
}

posts.packsinfo = function (req, res, next) {
    var exten = req.body['exten'] || req.query['exten'];
    var type = req.body['type'] || req.query['type'];
    if (!type) {
        type = 'SIP';
    }
    parkCalls(function (response) {
        if (response.Response === 'Success' || response.response === 'Success') {
            if (response.events != null && response.events.length > 0) {
                var parked = false;
                for (var ii = 0; ii < response.events.length; ii++) {
                    if (!response.events[ii].from)
                        continue;
                    var fromexten = response.events[ii].from;
                    var re = new RegExp(type + "/" + exten, "g");
                    if (fromexten.match(re)) {
                        parked = true;
                        break;
                    }
                }
                res.send({
                    response: 'Success',
                    parked: parked
                });

            } else {
                res.send({
                    response: 'Success',
                    parked: false
                });
            }

        } else {
            res.send(response);
        }
    });
}

posts.unPark = function (req, res, next) {
    var exten = req.body['exten'] || req.query['exten'];
    var type = req.body['type'] || req.query['type'];
    if (!type) {
        type = 'SIP';
    }
    parkCalls(function (response) {
        if (response.Response === 'Success' || response.response === 'Success') {
            logger.debug("准备取回保持：", response);
            if (response.events != null && response.events.length > 0) {
                var parked = false;
                for (var ii = 0; ii < response.events.length; ii++) {
                    if (!response.events[ii].from)
                        continue;
                    var fromexten = response.events[ii].from;
                    var re = new RegExp(type + "/" + exten, "g");
                    if (fromexten.match(re)) {
                        parked = true;
                        var channel = response.events[ii].channel;
                        var action = new AsAction.Redirect();
                        action.Channel = channel;
                        action.Exten = exten;
                        action.Context = 'app-exten';
                        action.Priority = 1;
                        nami.send(action, function (response) {
                            res.send(response);
                        });
                        break;
                    }
                }
                if (!parked) {
                    res.send({
                        response: 'Error',
                        message: '没有找到取回!'
                    });
                }

            } else {
                res.send({
                    response: 'Error',
                    message: '当前没有被保持的通话！'
                });
            }

        } else {
            res.send(response);
        }
    });
}

posts.checkService = function (req, res, next) {
    var exten = req.body['exten'] || req.query['exten'];
    var type = req.body['type'] || req.query['type'];
    if (!type) {
        type = 'SIP';
    }
    getconnectchannel(type, exten, function (channels) {
        var action = new AsAction.Redirect();
        action.Channel = channels.src;
        action.Exten = exten;
        action.Context = 'checkservice';
        nami.send(action, function (response) {
            res.send(response);
        });
    });

}

posts.GetCallInfo = function (req, res, next) {
    var exten = req.body['exten'] || req.query['exten'];
    logger.debug("正在获取分机：" + exten + "的来去电信息！");
    if (exten == null || exten == '') {
        res.send({
            success: '0'
        });
    } else {
        Schemas.pbxScreenPop.findOne({
            where: {
                id: exten
            }
        }, function (err, inst) {
            if (err || inst == null)
                res.send({
                    success: '0'
                });
            else {
                var resjson = {};
                if (inst.status == "waite") {

                    resjson.success = 1;
                    if (inst.routerdype == "dialqueue" || inst.routerdype == "diallocal") {

                        resjson.caller = inst.callednumber;
                        resjson.called = inst.callernumber;
                    } else {
                        resjson.caller = inst.callernumber;
                        resjson.called = inst.callednumber;
                    }


                    resjson.unid = inst.uid || "";
                    resjson.poptype = inst.poptype;
                    resjson.callid = inst.sessionnumber;

                    inst.status = "over";
                    inst.poptype = "";
                    Schemas.pbxScreenPop.updateOrCreate(inst, function (err, inst2) {
                        if (err)
                            res.send({
                                success: '0'
                            });
                        else {
                            logger.debug("获取到来电信息：", resjson);
                            res.send(resjson);
                        }
                    });

                } else {
                    res.send({
                        success: '0'
                    });
                }
            }
        });
    }

}
gets.GetCallInfo = function (req, res, next) {

    var exten = req.body['fromexten'] || req.query['fromexten'];
    if (exten == null || exten == '') {
        res.send('callback({"success": "0","msg":"没有获取到分机号！"})');
    } else {
        Schemas.pbxScreenPop.findOne({
            where: {
                extensionnumber: exten
            }
        }, function (err, inst) {
            if (err || inst == null)
                res.send('callback({"success": "0","msg":"获取弹屏信息发生错误。"})');
            else {
                var resjson = {};
                if (inst.status == "waite") {

                    resjson.success = 1;
                    if (inst.routerdype == "2") {

                        resjson.caller = inst.callednumber;
                        resjson.called = inst.callernumber;
                    } else {
                        resjson.caller = inst.callernumber;
                        resjson.called = inst.callednumber;
                    }


                    resjson.unid = inst.uid;
                    resjson.poptype = inst.poptype;
                    resjson.callid = inst.callid;

                    inst.status = "over";
                    inst.poptype = "";
                    Schemas.pbxScreenPop.updateOrCreate(inst, function (err, inst2) {
                        if (err)
                            res.send('callback({"success": "0","msg":"更新弹屏状态发生异常！"})');
                        else {
                            res.send('callback(' + JSON.stringify(resjson) + ')');
                        }
                    });

                } else {
                    res.send('callback({"success": "0","msg":"当前无响铃。"})');
                }
            }
        });
    }
    //res.send('callback({"a":"v"})');
}

posts.DadOn = function (req, res, next) {
    var exten = req.body['exten'] || req.query['exten'];
    var type = req.body['type'] || req.query['type'];
    var extDB = require('../modules/ippbx/extension.js');

    try {
        extDB.all({
            where: {
                accountcode: exten
            }
        }, function (err, dbs) {
            if (err) {
                res.send({
                    Response: 'Error',
                    Msg: '获取分机号失败!'
                });
                return;
            }
            console.log(dbs);
            if (dbs != null) {
                var ext = dbs[0];
                if (ext.dndinfo === 'on') {
                    ext.dndinfo = 'off';
                } else {
                    ext.dndinfo = 'on';
                }
                extDB.updateOrCreate(ext, function (err, inst) {
                    if (err) {
                        res.send({
                            Response: 'Error',
                            Msg: '更新状态失败!'
                        });
                    } else {
                        res.send({
                            Response: 'Success',
                            Msg: '操作成功!'
                        });

                    }
                });
            } else {

                res.send({
                    Response: 'Error',
                    Msg: '没有找到分机号,' + exten
                });
            }

        });
    } catch (e) {
        res.send({
            Response: 'Error',
            Msg: e
        });
    }

}

posts.GetDnd = function (req, res, next) {
    var exten = req.body.exten || "";
    GetDndInfo(exten, function (err, pased) {
        if (err)
            res.send({
                success: false,
                pased: pased,
                msg: err
            });
        else {
            res.send({
                success: true,
                pased: pased,
                msg: "成功！"
            });
        }
    });
}

function GetDndInfo(exten, callback) {
    var action = new AsAction.QueueStatus();
    action.Member = exten;
    nami.send(action, function (response) {
        if (response.response == 'Success') {
            if (response.events.length > 0) {
                var pased = false;
                for (var i in response.events) {
                    console.log(response.events[i]);
                    if (response.events[i].event == 'QueueMember' && response.events[i].paused === '1') {
                        pased = true;
                    }
                }
                callback(null, pased);
            } else {
                callback('获取成员信息发生错误！', false);
            }
        } else {
            callback('获取示忙信息发生错误！', false);
        }
    });
}

posts.DndQueueMember = function (req, res, next) {
    var exten = req.body.exten || "";
    var action = new AsAction.QueueStatus();
    action.Member = exten;
    //action.Queue = 401;
    nami.send(action, function (response) {
        if (response.response == 'Success') {
            if (response.events.length > 0) {
                var pased = false;
                for (var i in response.events) {
                    //logger.debug(response.events[i]);
                    if (response.events[i].event == 'QueueMember' && response.events[i].paused === '1') {
                        pased = true;
                    }
                }
                var act = null;
                var msg = "";
                if (pased) {
                    act = new AsAction.QueueUnpause();
                    msg = "示闲";
                } else {
                    act = new AsAction.QueuePause();
                    msg = "示忙";
                }
                act.Interface = "LOCAL/" + exten + "@sub-queuefindnumber/n";
                act.Reason = "";
                nami.send(act, function (response2) {
                    logger.debug(response2);
                    if (response2.response == 'Success')
                        res.send({
                            success: true,
                            pased: !pased,
                            msg: msg + "成功！"
                        });
                    else {
                        res.send({
                            success: false,
                            pased: !pased,
                            msg: msg + "失败！"
                        });
                    }
                });
            } else {
                res.send({
                    success: false,
                    msg: "获取成员状态事件发生异常！"
                });
            }
        } else {
            res.send({
                success: false,
                msg: "获取成员状态发生异常！"
            });
        }

    });
}

posts.QueuePause = function (req, res, next) {
    var exten = req.body.exten || "";

    var action = new AsAction.QueuePause();
    action.Interface = "";
    action.Reason = "";
    //action.Queue = 401;
    nami.send(action, function (response) {
        res.send(response);
    });
}

posts.QueueUnPause = function (req, res, next) {
    var exten = req.body.exten || "";

    var action = new AsAction.QueueUnPause();
    action.Interface = exten;
    action.Reason = "";
    //action.Queue = 401;
    nami.send(action, function (response) {
        res.send(response);
    });
}


function parkCalls(cb) {
    var action = new AsAction.ParkedCalls();
    nami.send(action, function (response) {
        cb(response);
    });
}

function getconnectchannel(type, exten, cb) {
    var src = '';
    var dst = '';
    var result = {
        src: src,
        dst: dst
    };
    //var re = eval('/'+exten+'/g');
    var parent = "^" + type + '\\/' + exten;

    var re = new RegExp(parent, "gi");
    console.log(re);
    var action = new AsAction.CoreShowChannels();
    nami.send(action, function (response) {
        if (response.response == 'Success') {

            for (var i in response.events) {
                //console.log("测试：");
                //console.log(response.events[i]);
                if (re.exec(response.events[i].channel) || response.events[i].accountcode == exten) {
                    src = response.events[i].channel;
                    dst = response.events[i].bridgedchannel;
                    break;
                }
            }
        }

        cb({
            src: src,
            dst: dst
        });
    });


}

function safekey(userkey) {
    var crypto = require('crypto');
    var fs = require('fs');

}
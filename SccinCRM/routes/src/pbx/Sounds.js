var path = require("path");
var guid = require('guid');
var conf = require('node-conf').load('app');
var basedir = conf.appbase;
var Schemas = require(basedir + '/database/schema').Schemas;
var moment = require('moment');
var async = require('async');
var logger = require(basedir + '/lib/logger').logger('web');
var fs = require("fs");
var nami = require(basedir + '/asterisk/asmanager').nami,
    util = require('util'),
    AsAction = require("nami").Actions;

var gets = {};
var posts = {};
module.exports = {
    get: gets,
    post: posts
};

//呼出规则列表显示
gets.index = function(req, res, next, baseurl) {
    var os = require("os");
    var systype = os.type();
    var sysrelease = os.release();
    if (/Windows_\w+/.test(systype)) {
        res.render('pbx/Sounds/list.html', {
            osinfo: systype + " " + sysrelease,
            used: "-.-",
            unused: '-.-',
            baifenbi: '1%',
            baseurl: baseurl,
            modename: 'pbxSounds'
        });
    } else {
        var baifenbi = "1%";
        var exec = require('child_process').exec,
            child, used, unused;

        child = exec('df -h /home',
            function(error, stdout, stderr) {
                console.log('stdout: ' + stdout);
                console.log('stderr: ' + stderr);
                var std = stdout.split("\n");
                if (std.length > 0) {
                    var m = std[2].split(/\s+/);
                    console.log(m);
                    used = m[1];
                    unused = m[2];
                    baifenbi = m[4];
                } else {
                    used = "-.-";
                    unused = "-.-";
                }
                if (error !== null) {
                    next(error);
                } else {
                    res.render('pbx/Sounds/list.html', {
                        osinfo: systype + " " + sysrelease,
                        used: used,
                        unused: unused,
                        baifenbi: baifenbi,
                        baseurl: baseurl,
                        modename: 'pbxSounds'
                    });
                }
            });



    }
}

gets.create = function(req, res, next, baseurl) {
    res.render('pbx/Sounds/create.html', {
        baseurl: baseurl
    });
}
//编辑
gets.edit = function(req, res, next, baseurl) {
    var id = req.query["id"];
    async.auto({
        find: function(cb) {
            Schemas['pbxSounds'].find(id, function(err, inst) {
                if (err || inst == null)
                    cb('编辑查找不存在！', inst);
                else
                    cb(err, inst);
            });
        }
    }, function(err, results) {
        res.render('pbx/Sounds/edit.html', {
            baseurl: baseurl,
            inst: results.find
        });
    });
}
posts.delete = function(req, res, next, baseurl) {
    var id = req.body['id'];
    Schemas['pbxSounds'].find(id, function(err, inst) {
        var myjson = {};
        if (err) {
            myjson.success = 'ERROR';
            myjson.msg = '查询数据发生异常,请联系管理员！';
            res.send(myjson);
        } else {
            if (!inst) {
                myjson.success = 'ERROR';
                myjson.msg = '没有找到需要删除的数据！';
                res.send(myjson);
            } else {

                var oldfolder = '/var/lib/asterisk/sounds/cn/' + inst.folder + '/';
                var oldfilename = inst.filename;
                var oldextname = inst.extname;
                var oldpath = oldfolder + oldfilename + '.' + oldextname;
                inst.destroy(function(err) {
                    if (err) {
                        myjson.success = 'ERROR';
                        myjson.msg = '删除数据发生异常,请联系管理员！！';
                        res.send(myjson);
                    } else {
                        fs.unlink(oldpath, function(err) {
                            if (err) {
                                myjson.success = 'ERROR';
                                myjson.msg = '删除语音文件发生异常,请联系管理员！！';
                                res.send(myjson);
                            } else {
                                myjson.success = 'OK';
                                myjson.msg = '删除成功！';
                                res.send(myjson);
                            }
                        });

                    }

                });
            }
        }
    });
}



//保存（适用于新增和修改）
posts.save = function(req, res, next, baseurl) {
    var sounddir=conf.asounds;
    var Obj = {};
    for (var key in req.body) {
        if (/^tmp(\S+)/.test(key)) {
            //console.log(RegExp.$1);
            // Obj.args += RegExp.$1 + '=' + req.body[key] + '&';
        } else {
            Obj[key] = req.body[key];
        }

    }

    var tmpdir = req.body.tmpdir;
    var tmpname = req.body.tmpname;

    var newfolder = sounddir + req.body.folder + '/';
    var newname = req.body.filename;
    var extname = req.body.extname;

    async.auto({
            isHaveCheck: function(cb) {
                Schemas['pbxSounds'].find(Obj.id, function(err, inst) {
                    cb(err, inst);
                });
            },
            renamefile: ['isHaveCheck',
                function(cb, results) {
                    //新增语音文件
                    if (tmpdir !== '' && tmpname !== '' && results.isHaveCheck === null) {
                        var tmp_path = tmpdir + tmpname + '.' + extname;
                        var target_path = newfolder + newname + '.' + extname;
                        // 移动文件
                        fs.rename(tmp_path, target_path, function(err) {
                            if (err)
                                cb(err, null);
                            else
                            // 删除临时文件夹文件, 
                                fs.unlink(tmp_path, function() {
                                    if (err)
                                        cb(err, null);
                                    else
                                        cb(null, null);
                                });
                        });
                    }
                    //新增语音文件，错误
                    else if (results.isHaveCheck === null && (tmpdir !== '' || tmpname !== '')) {
                        cb("请先上传或录制语音文件！", null);
                    }
                    //修改语音文件基本信息
                    else if (results.isHaveCheck !== null && (tmpdir !== '' || tmpname !== '')) {
                        cb(null, null);
                    }
                    //修改语音文件基本信息及语音文件
                    else if (results.isHaveCheck !== null && tmpdir !== '' && tmpname !== '') {
                        var oldfolder = sounddir + results.isHaveCheck.folder + '/';
                        var oldfilename = results.isHaveCheck.filename;
                        var oldextname = results.isHaveCheck.extname;
                        var oldpath = oldfolder + oldfilename + '.' + oldextname;
                        var tmp_path = tmpdir + tmpname + '.' + extname;
                        var target_path = newfolder + newname + '.' + extname;

                        fs.unlink(oldpath, function(err) {
                            if (err)
                                cb(err, null);
                            else
                                fs.rename(tmp_path, target_path, function(err) {
                                    if (err)
                                        cb(err, null);
                                    else
                                        fs.unlink(tmp_path, function(err) {
                                            if (err)
                                                cb(err, null);
                                            else
                                                cb(null, null);
                                        });
                                });
                        });


                    }
                    //什么也没做
                    else {
                        cb(null, null);
                    }
                }
            ],
            createNew: ['renamefile',
                function(cb, results) {
                    if (results.isHaveCheck !== null) { //如果存在本函数什么都不做
                        cb(null, -1);
                    } else {
                        Obj.id = guid.create();
                        Obj.label = "";
                        Schemas['pbxSounds'].create(Obj, function(err, inst) {
                            if (err)
                                cb(err, -1);
                            else {
                                cb(err, inst);
                            }

                        });
                    }
                }
            ],
            updateOld: ['renamefile',
                function(cb, results) {
                    if (results.isHaveCheck === null) { //如果不存在本函数什么都不做
                        cb(null, -1);
                    } else {
                        Schemas['pbxSounds'].update({
                            where: {
                                id: Obj.id
                            },
                            update: Obj
                        }, function(err, inst) {
                            console.log(inst);
                            cb(err, inst);
                        });
                    }
                }
            ]
        },
        function(err, results) {
            var myjson = {
                success: '',
                id: '',
                msg: ''
            };
            if (results.createNew && results.createNew !== -1) {
                results.createNew.isValid(function(valid) {
                    if (!valid) {
                        myjson.success = 'ERROR';
                        myjson.msg = "服务器感知到你提交的数据非法，不予受理！";
                    } else {
                        myjson.success = 'OK';
                        myjson.msg = '新增成功！';
                        myjson.id = results.createNew.id;
                    }
                });
            } else if (results.updateOld && results.updateOld !== -1) {
                myjson.success = 'OK';
                myjson.msg = '修改成功！';
                myjson.id = results.isHaveCheck.id;

            } else if (err) {
                console.log(err);
                myjson.success = 'ERROR';
                myjson.msg = '保存数据发生异常,请联系管理员！';
            }
            res.send(myjson);
        });
}


posts.delfile = function(req, res, next, baseurl) {
    var filename = req.body.filename;

    if (filename == '') {
        res.send({
            success: "ERROR",
            msg: "删除的文件名为空！"
        });
    } else {
        var filepath = basedir + "/public/uploads/ " + filename;
        console.log(filepath);
        fs.exists(filepath, function(exists) {
            if (exists) {
                fs.unlink(filepath, function(err) {
                    res.send({
                        success: "OK ",
                        msg: "删除成功！"
                    });
                });
            } else {
                res.send({
                    success: "ERROR ",
                    msg: "文件不存在！"
                });
            }
        });
    }
}

posts.recordByExten = function(req, res, next, baseurl) {
    
    var exten = req.body['exten'];
    var myDate = new Date();
    var tmpname = myDate.getTime();
    var Variable = "filepath=/tmp/" + tmpname + '.wav'; //+basedir+'/uploads/dddddddd.wav';
    var channel = "LOCAL/" + exten + "@sub-recordByExten";
    var Context = 'sub-recordByExten-callback';
    //var Context='app-exten';
    var action = new AsAction.Originate();
    action.Channel = channel;
    //action.Timeout=30;
    action.Async = true;
    action.Account = exten;
    action.CallerID = exten;
    action.Context = Context;
    action.Variable = Variable;
    action.Exten = exten;
    console.log(action);
    if (nami.connected) {
        nami.send(action, function(response) {
            if (response.response == 'Success' || response.response == 'success') {
                res.send({
                    success: 'OK',
                    tmpname: tmpname,
                    tmpdir: "/tmp/"
                });
            } else {
                res.send({
                    success: 'ERROR',
                    msg: response.message
                });
            }

        });
    } else {
        res.send({
            success: 'ERROR',
            msg: 'AMI连接中断！'
        });

    }
}

posts.listenByPhone = function(req, res, next, baseurl) {
    var dirtype=req.body.dirtype || "sounds";
    var folder = req.body.folder;
    var filename = req.body.filename;
    var exten = req.body.exten;
    if (!/^\/\S+/.test(folder))
    {
    if(dirtype==='sounds')
      folder = conf.asounds + folder;  
    else if(dirtype==='monitor')
       folder = conf.monitor + folder;   
    else
    {}
    }
        
    var Variable = "filepath=" + folder + filename; //+basedir+'/uploads/dddddddd.wav';
    var channel = "LOCAL/" + exten + "@sub-listenByPhone";
    var Context = 'sub-listenByPhone-callback';
    //var Context='app-exten';
    var action = new AsAction.Originate();
    action.Channel = channel;
    //action.Timeout=30;
    action.Async = true;
    action.Account = exten;
    action.CallerID = exten;
    action.Context = Context;
    action.Variable = Variable;
    action.Exten = exten;
    console.log(action);
    if (nami.connected) {
        nami.send(action, function(response) {
            if (response.response == 'Success' || response.response == 'success') {
                res.send({
                    success: 'OK',
                    msg: "响铃后摘机收听！ "
                });
            } else {
                res.send({
                    success: 'ERROR',
                    msg: response.message
                });
            }

        });
    } else {
        res.send({
            success: 'ERROR',
            msg: 'AMI连接中断！'
        });

    }

}
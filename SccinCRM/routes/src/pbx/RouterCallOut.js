var path = require("path");
var guid = require('guid');
var conf = require('node-conf');
var basedir = conf.load('app').appbase;
var Schemas = require(basedir + '/database/schema').Schemas;
var moment = require('moment');
var async = require('async');

var logger = require(basedir + '/lib/logger').logger('web');
var gets = {};
var posts = {};
module.exports = {
    get: gets,
    post: posts
};

//呼出规则列表显示
gets.index = function(req, res, next, baseurl) {
    res.render('pbx/RouterCallOut/list.html', {
        baseurl: baseurl,
        modename: 'pbxRouter'
    });
}

//新建
gets.create = function(req, res, next, baseurl) {
    res.render('pbx/RouterCallOut/create.html', {
        baseurl: baseurl
    });
}
//编辑
gets.edit = function(req, res, next, baseurl) {
    var id = req.query["id"];
    async.auto({
        findUser: function(cb) {
            Schemas['pbxRouter'].find(id, function(err, inst) {
                if (err || inst == null)
                    cb('编辑查找呼出规则发生错误或呼出规则不存在！', inst);
                else
                    cb(err, inst);
            });
        }
    }, function(err, results) {
        res.render('pbx/RouterCallOut/edit.html', {
            baseurl: baseurl,
            inst: results.findUser
        });
    });
}


//保存（适用于新增和修改）
posts.save = function(req, res, next, baseurl) {
    var Obj = {};
    for (var key in req.body) {
        Obj[key] = req.body[key];
    }
    //console.log(Obj);
    async.auto({
            isHaveCheck: function(cb) {
                if (!Obj.routername || Obj.routername === '') {
                    cb('呼出规则不能为空', -1);
                } else {
                    if (!Obj.id || Obj.id === '') {
                        delete Obj.id;
                        cb(null, null);
                    } else {
                    Schemas['pbxRouter'].find(Obj.id, function(err, inst) {
                        cb(err, inst);
                    });
                }
                }
            },
            maxProirety: function(cb) {
                Schemas['pbxRouter'].findOne({
                    where: {
                        routerline: '呼出'
                    },
                    order: 'proirety DESC'
                }, function(err, inst) {
                    if (err) {
                        cb(err, inst);
                    } else {
                        var n = inst === null ? 1 : inst.proirety + 1;
                        cb(null, n);
                    }

                });
            },
            createNew: ['isHaveCheck','maxProirety',
                function(cb, results) {
                    if (results.isHaveCheck !== null) { //如果存在本函数什么都不做
                        cb(null, -1);
                    } else {

                        //初始化的数据
                        Obj.proirety = results.maxProirety;
                        Obj.routerline = "呼出";

                        Schemas['pbxRouter'].create(Obj, function(err, inst) {
                            cb(err, inst);
                        });
                    }
                }
            ],
            updateOld: ['isHaveCheck',
                function(cb, results) {
                    if (results.isHaveCheck === null) { //如果不存在本函数什么都不做
                        cb(null, -1);
                    } else {

                        //Obj.lastModify = moment().format("YYYY-MM-DD HH:mm:ss");
                        Schemas['pbxRouter'].update({
                            where: {
                                id: Obj.id
                            },
                            update: Obj
                        }, function(err, inst) {
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
            if (results.createNew !== -1) {
                results.createNew.isValid(function(valid) {
                    if (!valid) {
                        myjson.success = 'ERROR';
                        myjson.msg = "服务器感知到你提交的数据非法，不予受理！";
                    } else {
                        myjson.success = 'OK';
                        myjson.msg = '新增成功!';
                        myjson.id = results.createNew.id;
                    }
                });
            } else if (results.updateOld !== -1) {
                myjson.success = 'OK';
                myjson.msg = '修改成功!';
                myjson.id = results.updateOld.id;

            } else if (err) {
                console.log(err);
                myjson.success = 'ERROR';
                myjson.msg = '保存数据发生异常,请联系管理员！';
            }
            res.send(myjson);
        });
}
posts.delete = function(req, res, next, baseurl) {
    var id = req.body['id'];
    Schemas['pbxRouter'].find(id, function(err, inst) {
        var myjson = {};
        if (err) {
            myjson.success = 'ERROR';
            myjson.msg = '查询数据发生异常,请联系管理员！';
        } else {
            if (!inst) {
                myjson.success = 'ERROR';
                myjson.msg = '没有找到需要删除的数据！';
                res.send(myjson);
            } else {
                inst.destroy(function(err) {
                    if (err) {
                        myjson.success = 'ERROR';
                        myjson.msg = '删除数据发生异常,请联系管理员！！';
                        res.send(myjson);
                    } else {
                        Schemas['pbxRouter'].all({
                            where: {
                                routerline: '呼出'
                            },
                            order: 'proirety ASC'
                        }, function(err, dbs) {
                            var ids = "";
                            for (var i = 0; i < dbs.length; i++) {
                                ids += dbs[i].id + '|';
                            }
                            req.body['ids'] = ids;
                            posts.sortRouter(req, res, next, baseurl);
                        });
                    }

                });
            }
        }
    });
}

posts.sortRouter = function(req, res, next, baseurl) {
    var flagIndex = 1;
    var myjson = {};
    myjson.success = 'OK';
    myjson.msg = '排序成功！';
    var ids = req.body['ids'].split('|');

    for (var i = 0; i < ids.length; i++) {
        if (ids[i] != null && ids[i] != "") {
            Schemas['pbxRouter'].update({
                where: {
                    id: ids[i]
                },
                update: {
                    proirety: flagIndex++
                }
            }, function(err2, inst2) {
                if (err2) {
                    myjson.success = 'ERROR';
                    myjson.msg = '更新数据发生异常,请联系管理员！！';
                }
            });
        }
    }
    res.send(myjson);
}
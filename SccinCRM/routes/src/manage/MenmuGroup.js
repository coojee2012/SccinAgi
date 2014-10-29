/**
 * Created by LinYong on 2014/8/5.
 */
var path = require("path");
var guid = require('guid');
var conf = require('node-conf');
var basedir = conf.load('app').appbase;
var async = require('async');
var Schemas = require(basedir + '/database/schema').Schemas;
var moment = require('moment');
var util = require('util');
var commfun = require(basedir + '/lib/comfun');
var logger = require(basedir + '/lib/logger').logger('web');
var gets = {};
var posts = {};
module.exports = {
    get: gets,
    post: posts
};
//ajax验证函数集合
var checkFun = {};

//列表显示
gets.index = function (req, res, next, baseurl) {
    res.render('manage/MenmuGroup/list.html', {
        baseurl: baseurl,
        pageIndex:req.query["displayStart"] || 0,
        where:util.inspect(commfun.searchContions(req.query["where"])),
        modename: 'manageMenmuGroup'
    });
}

posts.save = function (req, res, next, baseurl) {
    var Obj = {};
    for (var key in req.body) {
        Obj[key] = req.body[key];
    }
    //console.log(Obj);
    async.auto({
            isHaveCheck: function (cb) {
                if (!Obj.groupName || Obj.groupName === '') {
                    cb('菜单名称不能为空', -1);
                } else {
                    Schemas['manageMenmuGroup'].find(Obj.id, function (err, inst) {
                        cb(err, inst);
                    });
                }
            },
            createNew: ['isHaveCheck',
                function (cb, results) {
                    if (results.isHaveCheck !== null) { //如果存在本函数什么都不做
                        cb(null, -1);
                    } else {
                        Obj.id = guid.create();
                        Schemas['manageMenmuGroup'].create(Obj, function (err, inst) {
                            cb(err, inst);
                        });
                    }
                }
            ],
            updateOld: ['isHaveCheck',
                function (cb, results) {
                    if (results.isHaveCheck === null) { //如果不存在本函数什么都不做
                        cb(null, -1);
                    } else {

                        Schemas['manageMenmuGroup'].update({
                            where: {
                                id: Obj.id
                            },
                            update: Obj
                        }, function (err, inst) {
                            cb(err, inst);
                        });
                    }
                }
            ]
        },
        function (err, results) {
            var myjson = {
                success: '',
                id: '',
                msg: ''
            };
            if (results.createNew !== -1) {
                results.createNew.isValid(function (valid) {
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

posts.delete = function (req, res, next, baseurl) {
    var id = req.body['id'];
    async.auto({
        checkInUse: function (cb) {
            Schemas['manageMenmus'].findOne({where: {mgID: id}}, function (err, inst) {
                if (err || inst != null) {
                    cb("查询数据发生异常或数据被其他菜单使用中，请先删除相关菜单!", inst);
                } else {
                    cb(null, null);
                }

            });
        },
        checkHave: function (cb) {
            Schemas['manageMenmuGroup'].find(id, function (err, inst) {
                if (err || inst == null) {
                    cb("查询数据发生异常或没有找到需要删除的数据!", inst);
                } else {
                    cb(null, inst);
                }
            });
        },
        del: ["checkInUse", "checkHave", function (cb, results) {
            results.checkHave.destroy(function (err) {

                cb(err, null);
            });
        }]
    }, function (err, results) {
        var myjson = {};
        if (err) {
            myjson.success = 'ERROR';
            myjson.msg = err;
        } else {
            myjson.success = 'OK';
            myjson.msg = '删除成功！';
        }
        res.send(myjson);
    });

}
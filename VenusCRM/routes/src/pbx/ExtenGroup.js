var conf = require('node-conf');
var basedir =  Venus.baseDir;
var Schemas = require(basedir + '/database/schema').Schemas;
var guid = require('guid');
var async = require('async');
var logger = require(basedir + '/lib/logger').logger('web');
var commfun = require(basedir + '/lib/comfun');
var util = require('util');
var gets = {};
var posts = {};
module.exports = {
    get: gets,
    post: posts
};
//分机列表显示
gets.index = function (req, res, next, baseurl) {
    res.render('pbx/ExtenGroup/list.html',
        {
            pageIndex:req.query["displayStart"] || 0,
            where:util.inspect(commfun.searchContions(req.query["where"])),
            baseurl: baseurl
        });
}

//保存（适用于新增和修改）
posts.save = function (req, res, next, baseurl) {
    var Obj = {};
    for (var key in req.body) {
        Obj[key] = req.body[key];
    }
    async.auto({
            isHaveCheck: function (cb) {
                Schemas['pbxExtenGroup'].find(Obj.id, function (err, inst) {
                    cb(err, inst);
                });
            },
            createNew: ['isHaveCheck',
                function (cb, results) {
                    if (results.isHaveCheck !== null) { //如果存在本函数什么都不做
                        cb(null, -1);
                    } else {
                        Obj.id = guid.create();
                        Schemas['pbxExtenGroup'].create(Obj, function (err, inst) {
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
                        Schemas['pbxExtenGroup'].update({
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
                logger.error(err);
                myjson.success = 'ERROR';
                myjson.msg = '保存数据发生异常,请联系管理员！';
            }
            res.send(myjson);
        });
}


posts.delete = function (req, res, next, baseurl) {
    var id = req.body['id'];
    Schemas['pbxExtenGroup'].find(id, function (err, inst) {
        var myjson = {};
        if (err) {
            logger.error(err);
            myjson.success = 'ERROR';
            myjson.msg = '查询数据发生异常,请联系管理员！';
        } else {
            if (!inst) {
                myjson.success = 'ERROR';
                myjson.msg = '没有找到需要删除的数据！';
            } else {

            }
            inst.destroy(function (err) {
                if (err) {
                    logger.error(err);
                    myjson.success = 'ERROR';
                    myjson.msg = '删除数据发生异常,请联系管理员！！';
                } else {
                    myjson.success = 'OK';
                    myjson.msg = '删除成功！';
                }
                res.send(myjson);

            });

        }

    });
}
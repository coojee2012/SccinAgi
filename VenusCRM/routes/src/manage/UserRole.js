var path = require("path");
var guid = require('guid');
var conf = require('node-conf');
var basedir = Venus.baseDir;
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

//角色名验证
checkFun['roleName'] = function (roleName, res) {
    if (!roleName || roleName == '') {
        res.send({
            "info": "输入不能为空！",
            "status": "n"
        });
    } else {
        Schemas['manageUserRole'].findOne({
            where: {
                roleName: roleName
            }
        }, function (err, inst) {
            if (err)
                res.send({
                    "info": "后台验证发生错误！",
                    "status": "n"
                });
            else {
                if (inst != null)
                    res.send({
                        "info": "已经存在！",
                        "status": "n"
                    });
                else {
                    res.send({
                        "info": "验证通过！",
                        "status": "y"
                    });
                }
            }
        });
    }
};

//处理页面需要的Ajax验证
posts.checkAjax = function (req, res, next, baseurl) {
    var param = req.body['param'];
    var name = req.body['name'];
    if (typeof(checkFun[name] === 'function')) {
        checkFun[name](param, res);
    } else {
        res.send({
            "info": "服务器验证异常:函数不存在！",
            "status": "n"
        });
    }

}

//角色列表显示
gets.index = function (req, res, next, baseurl) {
    res.render('manage/UserRole/list.html', {
        baseurl: baseurl,
        pageIndex:req.query["displayStart"] || 0,
        where:util.inspect(commfun.searchContions(req.query["where"])),
        modename: 'manageUserRole'
    });
}

//新建
gets.create = function (req, res, next, baseurl) {
    res.render('manage/UserRole/create.html', {
        baseurl: baseurl
    });
}
//编辑
gets.edit = function (req, res, next, baseurl) {
    var id = req.query["id"];
    async.auto({
        findUser: function (cb) {
            Schemas['manageUserRole'].find(id, function (err, inst) {
                if (err || inst == null)
                    cb('编辑查找角色发生错误或角色不存在！', inst);
                else
                    cb(err, inst);
            });
        }
    }, function (err, results) {
        res.render('manage/UserRole/edit.html', {
            baseurl: baseurl,
            displayStart:req.query["displayStart"] || 0,
            where:req.query["where"] || "",
            inst: results.findUser
        });
    });
}


//保存（适用于新增和修改）
posts.save = function (req, res, next, baseurl) {
    var Obj = {};
    for (var key in req.body) {
        Obj[key] = req.body[key];
    }
    //console.log(Obj);
    async.auto({
            isHaveCheck: function (cb) {
                if (!Obj.roleName || Obj.roleName === '') {
                    cb('角色不能为空', -1);
                } else {
                    Schemas['manageUserRole'].find(Obj.id, function (err, inst) {
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
                        Schemas['manageUserRole'].create(Obj, function (err, inst) {
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

                        Obj.lastModify = moment().format("YYYY-MM-DD HH:mm:ss");

                        Schemas['manageUserRole'].update({
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

posts.getMenmus = function (req, res, next, baseurl) {
    var roleid = req.body.roleid;
    async.auto({
        allmenmus: function (cb) {
            var include = new Array();
            for (var key in Schemas['manageMenmuGroup'].relations) {
                include.push(key);
            }
            logger.debug("具有的关系：", include);
            Schemas['manageMenmuGroup'].all({
                include: include,
                order: 'id ASC'
            }, function (err, dbs) {
                logger.debug(dbs[0].__cachedRelations);
                var menmus = {};
                for (var i = 0; i < dbs.length; i++) {
                    menmus[dbs[i].groupName] = dbs[i].__cachedRelations.menmus;
                }
                cb(err, menmus);
            });
        },
        rolemenmus: function (cb) {
            Schemas['manageMenmuRoleRelations'].all({
                where: {roleId: roleid}
            }, function (err, dbs) {
                var menmuIds = new Array();
                for (var m = 0; m < dbs.length; m++) {
                    menmuIds.push(dbs[m].menmuID);
                }
                cb(err, menmuIds);
            })

        }
    }, function (err, results) {
        if (err)
            res.send({success: 'ERROR', msg: '获取角色菜单错误！'});
        else
            res.send({success: 'OK', msg: '', allmenmus: results.allmenmus, rolemenmus: results.rolemenmus})
    });
}

posts.saveRoleMenmus = function (req, res, next, baseurl) {
    var menmuIds = req.body.menmuIds || "";
        menmuIds = menmuIds.replace(/\,$/, "");

    var roleId = req.body.roleId;
    if (!roleId || roleId == "" || menmuIds == "")
        res.send({success: 'ERROR', msg: "角色编号或分配菜单不能为空！"});
    else {
        var MenmuIds = menmuIds.split(',');
        async.auto({
            allRoleMenmus: function (cb) {
                Schemas['manageMenmuRoleRelations'].all({
                    where: {roleId: roleId}
                }, function (err, dbs) {
                    cb(err, dbs);
                });
            },
            delAllRoleMenmus: ['allRoleMenmus', function (cb, results) {
                async.each(results.allRoleMenmus, function (item, callback) {
                    item.destroy(function (err) {
                        callback(err);
                    });
                }, function (err) {
                    cb(err);
                });
            }],
            addRoleMenmus: ["delAllRoleMenmus", function (cb, results) {
                async.each(MenmuIds, function (item, callback) {
                    var obj = {};
                    obj.roleId = roleId;
                    obj.menmuID = item;
                    Schemas['manageMenmuRoleRelations'].create(obj, function (err, inst) {
                        callback(err, inst);
                    });
                }, function (err) {
                    cb(err);
                });
            }]
        }, function (err, results) {
            if (err)
                res.send({success: 'ERROR', msg: '保存角色菜单错误！'});
            else
                res.send({success: 'OK', msg: '保存成功！'})
        });

    }

}

posts.delete = function (req, res, next, baseurl) {
    var id = req.body['id'];
    Schemas['manageUserRole'].find(id, function (err, inst) {
        var myjson = {};
        if (err) {
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
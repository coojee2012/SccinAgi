var guid = require('guid');
var async = require('async');
var _ = require('lodash');
var conf = require('node-conf');
var basedir = conf.load('app').appbase;
var Schemas = require(basedir + '/database/schema').Schemas;
var logger = require(basedir + '/lib/logger').logger('web');
var gets = {};
var posts = {};
module.exports = {
    get: gets,
    post: posts
};

//ajax验证函数集合
var checkFun = {};

checkFun['id'] = function (id, res) {
    //console.log(uLogin);
    if (!id || id == '') {
        res.send({
            "info": "输入不能为空！",
            "status": "n"
        });
    } else {
        Schemas['pbxIvrMenmu'].findOne({
            where: {
                id: id
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
//显示列表
gets.index = function (req, res, next, baseurl) {
    res.render('.' + baseurl + '/list.html', {
        baseurl: baseurl,
        modename: 'pbxIvrMenmu'
    });
}
//新建
gets.create = function (req, res, next, baseurl) {
    res.render('.' + baseurl + '/create.html', {
        baseurl: baseurl,
        modename: 'pbxIvrMenmu'
    });
}

//编辑
gets.edit = function (req, res, next, baseurl) {
    var id = req.query["id"];
    async.auto({
        findUser: function (cb) {
            Schemas['pbxIvrMenmu'].find(id, function (err, inst) {
                if (err || inst == null)
                    cb('IVR不存在！', inst);
                else
                    cb(err, inst);
            });
        }
    }, function (err, results) {
        res.render('.' + baseurl + '/edit.html', {
            baseurl: baseurl,
            inst: results.findUser
        });
    });
}

//树
gets.ivrtree = function (req, res, next, baseurl) {
    var id = req.query["id"];
    async.auto({
        findAction: function (cb) {
            Schemas['pbxIvrActions'].all({
                where: {
                    ivrnumber: id
                }
            }, function (err, inst) {
                var actionList = new Array();
                for(var i = 0;i < inst.length;i++)
                {
                    Schemas['pbxIvrActMode'].find(inst[i].actmode,function(err,actModel){
                        var model = {};
                        model.text = actModel.modename;
                        model.icon = actModel.iconame;
                        actionList.push(model);
                    });
                }
                console.log(actionList);
                cb(err, actionList);
            });
        },
        findMenu:function(cb){
            Schemas['pbxIvrMenmu'].find(id, function (err, inst) {
                if (err || inst == null)
                    cb('IVR不存在！', inst);
                else
                    cb(err, inst);
            });
        }
    }, function (err, results) {
        res.render('.' + baseurl + '/ivrtree.html', {
            baseurl: baseurl,
            modename: 'pbxIvrMenmu',
            inst: results.findAction,
            menuInst:results.findMenu
        });
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
                if (!Obj.id || Obj.id === '') {
                    cb('IVR号码不能为空', -1);
                } else {
                    Schemas['pbxIvrMenmu'].find(Obj.id, function (err, inst) {
                        cb(err, inst);
                    });
                }
            },
            createNew: ['isHaveCheck',
                function (cb, results) {
                    if (results.isHaveCheck !== null) { //如果存在本函数什么都不做
                        cb(null, -1);
                    } else {
                        Schemas['pbxIvrMenmu'].create(Obj, function (err, inst) {
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
                        Schemas['pbxIvrMenmu'].update({
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
                myjson.id = Obj.id;

            } else if (err) {
                console.log(err);
                myjson.success = 'ERROR';
                myjson.msg = '保存数据发生异常,请联系管理员！';
            }
            res.send(myjson);
        });
}

//删除
posts.delete = function (req, res, next, baseurl) {
    var id = req.body['id'];
    Schemas['pbxIvrMenmu'].find(id, function (err, inst) {
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
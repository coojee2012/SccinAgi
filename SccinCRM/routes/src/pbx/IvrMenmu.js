var guid = require('guid');
var async = require('async');
var _ = require('lodash');
var conf = require('node-conf');
var basedir = conf.load('app').appbase;
var Schemas = require(basedir + '/database/schema').Schemas;
var logger = require(basedir + '/lib/logger').logger('web');
var commfun = require(basedir + '/lib/comfun');
var util = require('util');
var gets = {};
var posts = {};
module.exports = {
    get: gets,
    post: posts
};

//ajax验证函数集合
var checkFun = {};

checkFun['id'] = function(id, res) {
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
        }, function(err, inst) {
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
posts.checkAjax = function(req, res, next, baseurl) {
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
gets.index = function(req, res, next, baseurl) {
    res.render('.' + baseurl + '/list.html', {
        baseurl: baseurl,
        pageIndex:req.query["displayStart"] || 0,
        where:util.inspect(commfun.searchContions(req.query["where"])),
        modename: 'pbxIvrMenmu'
    });
}
//新建
gets.create = function(req, res, next, baseurl) {
    res.render('.' + baseurl + '/create.html', {
        baseurl: baseurl,
        modename: 'pbxIvrMenmu'
    });
}

//编辑
gets.edit = function(req, res, next, baseurl) {
    var id = req.query["id"];
    async.auto({
        findUser: function(cb) {
            Schemas['pbxIvrMenmu'].find(id, function(err, inst) {
                if (err || inst == null)
                    cb('IVR不存在！', inst);
                else
                    cb(err, inst);
            });
        }
    }, function(err, results) {
        res.render('.' + baseurl + '/edit.html', {
            baseurl: baseurl,
            displayStart:req.query["displayStart"] || 0,
            where:req.query["where"] || "",
            inst: results.findUser
        });
    });
}

//树
gets.ivrtree = function(req, res, next, baseurl) {
    var id = req.query["id"];
    async.auto({
        findAction: function(cb) {
            var include = new Array();
            for (var key in Schemas['pbxIvrActions'].relations) {
                include.push(key);
            }
            Schemas['pbxIvrActions'].all({
                include: include,
                where: {
                    ivrnumber: id
                },
                order: 'ordinal ASC'
            }, function(err, inst) {
                var actionList = new Array();
                for (var i = 0; i < inst.length; i++) {
                    /*   Schemas['pbxIvrActMode'].find(inst[i].actmode, function(err, actModel) {
                        var model = {};
                        model.text = actModel.modename;
                        model.icon = actModel.iconame;
                        actionList.push(model);
                    });*/
                    var model = {};
                    model.id = inst[i].id;
                    model.text = inst[i].__cachedRelations.Actmode.modename;
                    model.icon = inst[i].__cachedRelations.Actmode.iconame;
                    actionList.push(model);
                }
                console.log(actionList);
                cb(err, actionList);
            });
        },
        findMenu: function(cb) {
            Schemas['pbxIvrMenmu'].find(id, function(err, inst) {
                if (err || inst == null)
                    cb('IVR不存在！', inst);
                else
                    cb(err, inst);
            });
        },
        getActmodes: function(cb) {
            Schemas['pbxIvrActMode'].all({
                order: 'id ASC'
            }, function(err, dbs) {
                cb(err, dbs);
            });
        },
        findInputs: function(cb) {
            Schemas['pbxIvrInputs'].all({
                where: {
                    ivrnumber: id
                },
                order: ['general ASC', 'inputnum ASC']
            }, function(err, dbs) {
                cb(err, dbs);
            });
        }
    }, function(err, results) {
        res.render('.' + baseurl + '/ivrtree.html', {
            layout: false,
            baseurl: baseurl,
            modename: 'pbxIvrMenmu',
            inst: results.findAction,
            actmods: results.getActmodes,
            inputs: results.findInputs,
            menuInst: results.findMenu
        });
    });
}

posts.reorder = function(req, res, next, baseurl) {
    var neworders = req.body.neworders.split(",");
    orderactions(neworders, function(err) {
        if (err) {
            res.send({
                success: "ERROR",
                msg: "排序失败！"
            });
        } else {
            res.send({
                success: "OK",
                msg: "排序成功！"
            });
        }
    })

}

posts.addaction = function(req, res, next, baseurl) {
    var modeid = req.body.modeid;
    var ivrnum = req.body.ivrnum;
    async.auto({
        count: function(cb) {
            Schemas.pbxIvrActions.count({
                ivrnumber: ivrnum
            }, function(err, count) {
                console.log(count);
                cb(err, count);
            });
        },
        create: ['count',
            function(cb, results) {
                var node = {
                    ivrnumber: ivrnum,
                    ordinal: results.count + 1,
                    actmode: '' + modeid + '',
                    args: ''
                }
                Schemas.pbxIvrActions.create(node, function(err, inst) {
                    cb(err, inst);
                });
            }
        ]
    }, function(err, results) {
        if (err) {
            res.send({
                success: "ERROR",
                id: "",
                msg: err
            });
        } else {
            res.send({
                success: "OK",
                id: results.create.id
            });
        }

    });


}

posts.delaction = function(req, res, next, baseurl) {
    var ids = req.body.ids.split(",");
    var ivrnum = req.body.ivrnum;
    if (ids.length > 0) {
        async.auto({
            find: function(cb) {
                Schemas.pbxIvrActions.all({
                    where: {
                        id: {
                            "inq": ids
                        },
                        ivrnumber: ivrnum
                    }
                }, function(err, dbs) {
                    cb(err, dbs);
                });
            },
            del: ["find",
                function(cb, results) {
                    delsthes(results.find, cb);
                }
            ],
            findtwo: ["del",
                function(cb, results) {
                    Schemas.pbxIvrActions.all({
                        where: {
                            ivrnumber: ivrnum
                        },
                        order: 'ordinal asc'
                    }, function(err, dbs) {
                        cb(err, _.map(dbs, function(act) {
                            return act.id;
                        }));
                    });
                }
            ],
            order: ["findtwo",
                function(cb, results) {
                    orderactions(results.findtwo, cb);
                }
            ]
        }, function(err, results) {
            if (err)
                res.send({
                    success: "ERROR",
                    msg: "删除发生错误:" + err
                });
            else
                res.send({
                    success: "OK",
                    msg: "删除成功！"
                });
        });
    } else {
        res.send({
            success: "ERROR",
            msg: "没有什么需要删除的！"
        });
    }
}

posts.delinput = function(req, res, next, baseurl) {
    var ids = req.body.ids.split(",");
    var ivrnum = req.body.ivrnum;
    if (ids.length > 0) {
        async.auto({
            find: function(cb) {
                Schemas.pbxIvrInputs.all({
                    where: {
                        id: {
                            "inq": ids
                        },
                        ivrnumber: ivrnum
                    }
                }, function(err, dbs) {
                    cb(err, dbs);
                });
            },
            del: ["find",
                function(cb, results) {
                    delsthes(results.find, cb);
                }
            ]
        }, function(err, results) {
            if (err)
                res.send({
                    success: "ERROR",
                    msg: "删除发生错误:" + err
                });
            else
                res.send({
                    success: "OK",
                    msg: "删除成功！"
                });
        });
    } else {
        res.send({
            success: "ERROR",
            msg: "没有什么需要删除的！"
        });
    }
}

function delsthes(actions, callback) {
    async.each(actions, function(item, cb) {
        item.destroy(function(err) {
            if (err) {
                cb(err);
            } else {
                cb(null);
            }
        });
    }, function(err) {
        callback(err);
    });
}


function orderactions(neworders, cb) {
    var count = 0;
    async.whilst(
        function() {
            return count < neworders.length;
        },
        function(callback) {
            count++;
            Schemas.pbxIvrActions.update({
                where: {
                    id: neworders[count - 1]
                },
                update: {
                    ordinal: count
                }
            }, function(err, inst) {
                callback(err, inst);
            });
        },
        function(err) {
            cb(err);
        }
    );
}


//保存（适用于新增和修改）
posts.save = function(req, res, next, baseurl) {
    var Obj = {};
    for (var key in req.body) {
        Obj[key] = req.body[key];
    }
    async.auto({
            isHaveCheck: function(cb) {
                if (!Obj.id || Obj.id === '') {
                    cb('IVR号码不能为空', -1);
                } else {
                    Schemas['pbxIvrMenmu'].find(Obj.id, function(err, inst) {
                        cb(err, inst);
                    });
                }
            },
            createNew: ['isHaveCheck',
                function(cb, results) {
                    if (results.isHaveCheck !== null) { //如果存在本函数什么都不做
                        cb(null, -1);
                    } else {
                        Schemas['pbxIvrMenmu'].create(Obj, function(err, inst) {
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
                        Schemas['pbxIvrMenmu'].update({
                            where: {
                                id: Obj.id
                            },
                            update: Obj
                        }, function(err, inst) {
                            cb(err, inst);
                        });
                    }
                }
            ],
            defaultinputs: ["createNew",
                function(cb, results) {
                    if (results.createNew === -1) { //如果不存在本函数什么都不做
                        cb(null, -1);
                    } else {
                        var inputs = [{
                            ivrnumber: Obj.id,
                            inputnum: "101",
                            generaltype: "timeout",
                            general: 1
                        }, {
                            ivrnumber: Obj.id,
                            inputnum: "102",
                            generaltype: "invalidkey",
                            general: 1
                        }, {
                            ivrnumber: Obj.id,
                            inputnum: "103",
                            generaltype: "retry",
                            general: 1
                        }];
                        async.forEach(inputs, function(item, callback) {
                            Schemas['pbxIvrInputs'].create(item, function(err, inst) {
                                callback(err, inst);
                            });
                        }, function(err, results) {
                            cb(err, results);
                        });
                    }
                }
            ],
            addlocalnum: ["createNew",
                function(cb, results) {
                    commfun.addlocalnum(results.createNew.id, 'ivr', 1, cb);
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
posts.delete = function(req, res, next, baseurl) {
    var id = req.body['id'];
    async.auto({
        findivrmenmu: function(cb) {
            Schemas['pbxIvrMenmu'].find(id, function(err, inst) {
                if (err || inst === null) {
                    cb("查找IVR发生错误！", null);
                } else if (inst.isreadonly === '是') {
                    cb("系统只读，不能被删除！", null);
                } else {
                    cb(null, inst);
                }
            });
        },
        delmenmu: ["findivrmenmu",
            function(cb, results) {
                results.findivrmenmu.destroy(function(err) {
                    cb(err, null);
                });
            }
        ],
        findivractions: ["delmenmu",
            function(cb, results) {
                Schemas['pbxIvrActions'].all({
                    where: {
                        ivrnumber: id
                    }
                }, function(err, dbs) {
                    cb(err, dbs);
                });
            }
        ],
        findivrinputs: ["delmenmu",
            function(cb, results) {
                Schemas['pbxIvrInputs'].all({
                    where: {
                        ivrnumber: id
                    }
                }, function(err, dbs) {
                    cb(err, dbs);
                });
            }
        ],
        delactions: ["findivractions",
            function(cb, results) {
                delsthes(results.findivractions, cb);
            }
        ],
        delinputs: ["findivrinputs",
            function(cb, results) {
                delsthes(results.findivrinputs, cb);
            }
        ],
        dellocalnum: ["delmenmu",
            function(cb, results) {
                commfun.dellocalnum(id, cb);
            }
        ]
    }, function(err, results) {
        var myjson = {};
        if (err) {
            myjson.success = 'ERROR';
            myjson.msg = '查询数据发生异常,请联系管理员！';
        } else {
            myjson.success = 'OK';
            myjson.msg = '删除成功！';
        }
        res.send(myjson);
    });
}

posts.addinput = function(req, res, next) {
    var ivrnum = req.body.ivrnum;
    var keynum = req.body.keynum;
    async.auto({
        check: function(cb) {
            Schemas.pbxIvrInputs.all({
                where: {
                    ivrnumber: ivrnum,
                    inputnum: keynum
                }
            }, function(err, dbs) {
                if (err)
                    cb("数据库查询发生异常！", null);
                else if (dbs.length > 0)
                    cb("已经存在同样的按键！", null);
                else
                    cb(null, null);
            });
        },
        add: ["check",
            function(cb, results) {
                Schemas.pbxIvrInputs.create({
                    ivrnumber: ivrnum,
                    inputnum: keynum,
                    generaltype: "1"
                }, function(err, inst) {
                    cb(err, inst);
                });
            }
        ]
    }, function(err, results) {
        if (err)
            res.send({
                success: 'ERROR',
                id: "",
                msg: err
            });
        else
            res.send({
                success: 'OK',
                id: results.add.id,
                msg: '保存成功！'
            });
    });
}
var path = require("path");
var guid = require('guid');
var conf = require('node-conf').load('app');
var basedir =Venus.baseDir;
var Schemas = require(basedir + '/database/schema').Schemas;
var moment = require('moment');
var async = require('async');
var logger = require(basedir + '/lib/logger').logger('web');
var fs = require("fs");
var nami = require(basedir + '/asterisk/asmanager').nami,
    util = require('util'),
    AsAction = require("nami").Actions;
var commfun = require(basedir + '/lib/comfun');
var gets = {};
var posts = {};
module.exports = {
    get: gets,
    post: posts
};
//ajax验证函数集合
var checkFun = {};
//分机号验证
checkFun['wayName'] = function(wayName, res) {
    if (!wayName || wayName == '') {
        res.send({
            "info": "输入不能为空！",
            "status": "n"
        });
    } else {
        Schemas['pbxAutoMonitorWays'].findOne({where:{
            wayName:wayName

        }}, function(err, inst) {
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
posts.checkAjax = function(req, res,next,baseurl) {
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

//列表显示
gets.index = function(req, res, next, baseurl) {

    Schemas.pbxAutoMonitorWays.all({}, function(err, dbs) {
        if (!dbs)
            dbs = [];
        if (err)
            logger.error(err);
        res.render('pbx/RecordFile/list.html', {
            pageIndex:req.query["displayStart"] || 0,
            where:util.inspect(commfun.searchContions(req.query["where"])),
            baseurl: baseurl,
            ways: dbs,
            modename: 'pbxRcordFile'
        });
    });

}
gets.create = function(req, res, next, baseurl) {


    Schemas['pbxExtension'].all({}, function(err, dbs) {
        if (err) {
            next(err);
        } else {
            var str = "";
            for (var i = 0; i < dbs.length; i++) {
                str += '<option value="' + dbs[i].id + '">' + dbs[i].id + ' "' + dbs[i].accountcode + '" </option>';
            }
           res.render('pbx/RecordFile/create.html', {
        hasExtens:str,
        baseurl: baseurl
    });
        }
    });

    
}

//编辑
gets.edit = function(req, res, next, baseurl) {
    var id = req.query["id"];
    async.auto({
        find: function(cb) {
            Schemas['pbxAutoMonitorWays'].find(id, function(err, inst) {
                if (err || inst == null)
                    cb('编辑查找记录不存在！', inst);
                else
                    cb(err, inst);
            });
        },
        findMembers: ['find',
            function(cb, results) {
                var yyMembers = !results.find.members?[]:results.find.members.toString().split('\,');
                console.log(yyMembers);
                Schemas['pbxExtension'].all({}, function(err, dbs) {
                    if (err) {
                        cb('编辑查询分机发生错误！', -1);
                    } else {
                        //var totalMembers = [];
                        var hasMembers = [];
                        for (var i = 0; i < dbs.length; i++) {
                            //totalMembers.push(dbs[i].id);
                            var isHave = false;
                            for (var k = 0; k < yyMembers.length; k++) {
                                if (dbs[i].id === yyMembers[k]) {
                                    isHave = true;
                                    break;
                                }
                            }
                            if (!isHave) {
                                hasMembers.push(dbs[i].id);
                            }
                            //str += '<option value="' + dbs[i].id + '">' + dbs[i].id + ' "' + dbs[i].accountcode + '" </option>';
                        }

                        var hasExtens = "";
                        var yyExtens = "";
                        for (var ii = 0; ii < hasMembers.length; ii++) {
                            
                            hasExtens += '<option value="' + hasMembers[ii] + '">' + hasMembers[ii] + ' "' + hasMembers[ii] + '" </option>';
                        }
                        for (var kk = 0; kk < yyMembers.length; kk++) {
                            
                            yyExtens += '<option value="' + yyMembers[kk] + '">' + yyMembers[kk] + ' "' + yyMembers[kk] + '" </option>';
                        }
                        
                        cb(null, {
                            hasExtens: hasExtens,
                            yyExtens: yyExtens
                        });
                    }
                });
            }
        ]

    }, function(err, results) {
        res.render('pbx/RecordFile/edit.html', {
            baseurl:baseurl,
            hasExtens: results.findMembers.hasExtens,
            yyExtens: results.findMembers.yyExtens,
            displayStart:req.query["displayStart"] || 0,
            where:req.query["where"] || "",
            inst: results.find
        });
    });
}


//保存（适用于新增和修改）
posts.save = function(req, res,next,baseurl) {
    var Obj = {};
    for (var key in req.body) {
        Obj[key] = req.body[key];
    }
    console.log(Obj);
    async.auto({
            isHaveCheck: function(cb) {
                if (!Obj.wayName || Obj.wayName === '') {
                    cb('名称不能为空', -1);
                } else {
                    Schemas['pbxAutoMonitorWays'].find(Obj.id, function(err, inst) {
                         console.log("找到了：",inst);
                        cb(err, inst);
                    });
                }

            },
            createNew: ['isHaveCheck',
                function(cb, results) {
                    if (results.isHaveCheck !== null) { //如果存在本函数什么都不做
                        cb(null, -1);
                    } else {
                        delete Obj.id;
                        Schemas['pbxAutoMonitorWays'].create(Obj, function(err, inst) {
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
                        Schemas['pbxAutoMonitorWays'].update({
                            where: {
                                id: Obj.id
                            },
                            update: Obj
                        }, function(err, inst) {
                            cb(err, results.isHaveCheck);
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


posts.delete = function(req, res,next,baseurl) {
    var id = req.body['id'];
    Schemas['pbxAutoMonitorWays'].find(id, function(err, inst) {
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
            inst.destroy(function(err) {
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
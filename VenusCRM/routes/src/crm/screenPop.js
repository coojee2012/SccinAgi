/**
 * Created by LinYong on 2014/9/4.
 */
'use strict';
var guid = require('guid');
var async = require('async');
var _ = require('lodash');
var conf = require('node-conf');
var basedir = Venus.baseDir;
var Schemas = require(basedir + '/database/schema').Schemas;
var logger = require(basedir + '/lib/logger').logger('web');
var util = require('util');
var gets = {};
var posts = {};
module.exports = {
    get: gets,
    post: posts
};

//ajax验证函数集合
var checkFun = {};

gets.index = function (req, res, next, baseurl) {
    var caller = req.query["caller"];
    var called = req.query["called"];
    var callinfo={};
    callinfo.sessionid=req.query["callid"];
    callinfo.poptype=req.query["poptype"];

    async.auto({
        getCustom: function (cb) {
            Schemas.crmCustomInfo.findOne({
                where: {
                    phones: {'like': '%' + caller + '%'}
                }
            }, function (err, inst) {
                cb(err, inst);
            });
        },
        getCompany: ['getCustom', function (cb, results) {
            var where = {};
            if (!results.getCustom) {
                where = {
                    telphones: {'like': '%' + caller + '%'}
                };
            } else {
                where = {
                    id: results.getCustom.companyId
                };
            }
            Schemas.crmCompanyInfo.findOne({
                where: where
            }, function (err, inst) {
                cb(err, inst);
            });
        }],
        getCompanyCustoms: ['getCompany', function (cb, results) {
            if (!results.getCustom && results.getCompany) {
                Schemas.crmCustomInfo.all({
                    where: {
                        companyId: results.getCompany.id
                    }
                }, function (err, inst) {
                    cb(err, inst);
                });
            } else {
                cb(null, []);
            }
        }],
        getRecords: ['getCompany', function (cb, results) {
            if (results.getCompany) {
                Schemas.crmCallRecords.all({
                    where: {
                        companyId: results.getCompany.id
                    },
                    order:'createTime DESC'
                }, function (err, inst) {
                    cb(err, inst);
                });
            } else {
                cb(null, null);
            }

        }]
    }, function (err, results) {
        if (err) {
            next(err);
        }
        else {
            res.render('crm/screenPop/index.html', {
                baseurl: baseurl,
                caller: caller,
                called: called,
                callinfo:callinfo,
                custom:results.getCustom || {phones:caller},
                company:results.getCompany || {},
                records:results.getRecords || [],
                companyCustom:results.getCompanyCustoms || []
            });
        }

    });


}


posts.save = function (req, res, next, baseurl) {
        var Custom = {};
        var Company = {};
        Custom.id = req.body.customId;
        Custom.customName = req.body.customName;
        Custom.position = req.body.position || '';
        Custom.sex = req.body.sex;
        Custom.phones = req.body.phones || '';
        Custom.customMemo = req.body.customMemo || '';

        Company.id = req.body.companyId;
        Company.companyName = req.body.companyName || req.body.customName || '';
        Company.companyAddr = req.body.companyAddr || '';
        Company.telphones = req.body.telphones || '';

        async.auto({
                isHaveCheckCompany: function (cb) {

                    Schemas['crmCompanyInfo'].findOne({
                        where: {id: Company.id}
                    }, function (err, inst) {
                        cb(err, inst);
                    });

                },
                createNewCompany: ['isHaveCheckCompany',
                    function (cb, results) {
                        if (results.isHaveCheckCompany !== null) { //如果存在本函数什么都不做
                            cb(null, -1);
                        } else {
                            Company.id = guid.create();
                            Custom.companyId = Company.id;
                            Schemas['crmCompanyInfo'].create(Company, function (err, inst) {
                                cb(err, inst);
                            });
                        }
                    }
                ],
                updateOldCompany: ['isHaveCheckCompany',
                    function (cb, results) {
                        if (results.isHaveCheckCompany === null) { //如果不存在本函数什么都不做
                            cb(null, -1);
                        } else {
                            Custom.companyId = Company.id;
                            Schemas['crmCompanyInfo'].update({
                                where: {
                                    id: Company.id
                                },
                                update: Company
                            }, function (err, inst) {
                                cb(err, inst);
                            });
                        }
                    }
                ],
                isHaveCheckCustom: ['createNewCompany', 'updateOldCompany', function (cb, results) {
                    Schemas['crmCustomInfo'].findOne({
                        where: {id: Custom.id}
                    }, function (err, inst) {
                        cb(err, inst);
                    });
                }],
                createNewCustom: ['isHaveCheckCustom',
                    function (cb, results) {
                        if (results.isHaveCheckCustom !== null) { //如果存在本函数什么都不做
                            cb(null, -1);
                        } else {
                            Custom.id = guid.create();
                            Schemas['crmCustomInfo'].create(Custom, function (err, inst) {
                                cb(err, inst);
                            });
                        }
                    }
                ],
                updateOldCustom: ['isHaveCheckCustom',
                    function (cb, results) {
                        if (results.isHaveCheckCustom === null) { //如果不存在本函数什么都不做
                            cb(null, -1);
                        } else {
                            Schemas['crmCustomInfo'].update({
                                where: {
                                    id: Custom.id
                                },
                                update: Custom
                            }, function (err, inst) {
                                cb(err, inst);
                            });
                        }
                    }
                ]
            },
            function (err, results) {
                if (err) {
                    res.send({
                        success: 'ERROR',
                        msg: err.code || err
                    });
                } else {
                    res.send({
                        success: 'OK',
                        customId: Custom.id,
                        companyId: Company.id,
                        msg: '保存成功'
                    });
                }

            });
    }

posts.saveRecords=function(req, res, next, baseurl){

    var Obj = {};
    for (var key in req.body) {
        Obj[key] = req.body[key];
    }
    //console.log(Obj);
    async.auto({
            isHaveCheck: function (cb) {
                if (!Obj.record || Obj.record === '') {
                    cb('话务记录内容不能为空', -1);
                } else {
                    Schemas['crmCallRecords'].find(Obj.id, function (err, inst) {
                        cb(err, inst);
                    });
                }
            },
            createNew: ['isHaveCheck',
                function (cb, results) {
                    if (results.isHaveCheck !== null) { //如果存在本函数什么都不做
                        cb(null, -1);
                    } else {
                        Schemas['crmCallRecords'].create(Obj, function (err, inst) {
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
                        Schemas['crmCallRecords'].update({
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



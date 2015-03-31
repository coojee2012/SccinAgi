/**
 * Created by 勇 on 2015/3/21.
 */
'use strict';
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
    res.render('crm/CompanyInfo/list.html', {
        baseurl: baseurl,
        pageIndex: req.query.displayStart || 0,
        where: util.inspect(commfun.searchContions(req.query.where)),
        modename: 'crmCompanyInfo'
    });
}

//新建
gets.create = function (req, res, next, baseurl) {
    res.render('crm/CompanyInfo/create.html', {
        baseurl: baseurl
    });
}
//编辑
gets.edit = function (req, res, next, baseurl) {
    var id = req.query.id;
    async.auto({
        findUser: function (cb) {
            Schemas.crmCompanyInfo.findOne({
                where:{id:id}
            }, function (err, inst) {
                if (err || inst === null){
                    cb('编辑查找公司发生错误或公司不存在！', inst);
                }

                else
                {

                    cb(err, inst);
                }

            });
        }
    }, function (err, results) {
        res.render('crm/CompanyInfo/edit.html', {
            baseurl: baseurl,
            displayStart:req.query.displayStart || 0,
            where:req.query.where || "",
            inst: results.findUser || {}
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
                if (!Obj.customName || Obj.customName === '') {
                    cb('姓名不能为空', -1);
                } else {
                    Schemas.crmCompanyInfo.find(Obj.id, function (err, inst) {
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
                        Schemas.crmCompanyInfo.create(Obj, function (err, inst) {
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
                        Schemas.crmCompanyInfo.update({
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
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
    res.render('crm/CustomInfo/list.html', {
        baseurl: baseurl,
        pageIndex: req.query["displayStart"] || 0,
        where: util.inspect(commfun.searchContions(req.query["where"])),
        modename: 'crmCustomInfo'
    });
}

//新建
gets.create = function (req, res, next, baseurl) {
    res.render('crm/CustomInfo/create.html', {
        baseurl: baseurl
    });
}
//编辑
gets.edit = function (req, res, next, baseurl) {
    var id = req.query.id;
    async.auto({
        findUser: function (cb) {
            Schemas.crmCustomInfo.findOne({
                include:['company'],
                where:{id:id}
            }, function (err, inst) {
                if (err || inst === null){
                    cb('编辑查找联系人发生错误或联系人不存在！', inst);
                }

                else
                {
                   inst.company=inst.__cachedRelations.company || {id:"",companyName:""};
                    cb(err, inst);
                }

            });
        }
    }, function (err, results) {
        res.render('crm/CustomInfo/edit.html', {
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
                    Schemas.crmCustomInfo.find(Obj.id, function (err, inst) {
                        cb(err, inst);
                    });
                }
            },
            companyDefault: function (cb) {
                if (!Obj.companyId || Obj.companyId === '') {
                    var companyId = guid.create();
                    Schemas.crmCompanyInfo.create({
                        id: companyId,
                        companyName: Obj.customName
                    }, function (err, inst) {
                        cb(err, companyId);
                    });
                }
                else {
                    cb(null, Obj.companyId);
                }
            },
            createNew: ['isHaveCheck', 'companyDefault',
                function (cb, results) {
                    if (results.isHaveCheck !== null) { //如果存在本函数什么都不做
                        cb(null, -1);
                    } else {
                        Obj.id = guid.create();
                        Obj.companyId = results.companyDefault;
                        Schemas.crmCustomInfo.create(Obj, function (err, inst) {
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


                        Schemas.crmCustomInfo.update({
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

posts.searchCompany = function (req, res, next, baseurl) {
    var companyName = req.body.name;
    Schemas.crmCompanyInfo.all({
        where: {companyName: {'like': "%"+companyName+"%"}}
    }, function (err, dbs) {
       if(err){
           res.send({success:'ERROR',msg:err});
       }else{
           res.send({success:'OK',data:dbs});
       }
    });
}

posts.addNewCompany=function(req,res,next,baseurl){
    var companyName = req.body.name;
    var companyId = guid.create();
    Schemas.crmCompanyInfo.create({
        id: companyId,
        companyName: companyName
    }, function (err, inst) {
        if(err || !inst){
            res.send({success:'ERROR',msg:err||'新增公司信息发生异常！'}) ;
        }else{
           res.send({success:'OK',inst:inst}) ;
        }
    });
}
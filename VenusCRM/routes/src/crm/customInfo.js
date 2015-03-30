/**
 * Created by 勇 on 2015/3/21.
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
    res.render('crm/CustomInfo/list.html', {
        baseurl: baseurl,
        pageIndex:req.query["displayStart"] || 0,
        where:util.inspect(commfun.searchContions(req.query["where"])),
        modename: 'manageMenmus'
    });
}

//新建
gets.create = function (req, res, next, baseurl) {
    res.render('crm/CustomInfo/create.html', {
        baseurl: baseurl
    });
}
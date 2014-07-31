/**
 * Created by LinYong on 2014/7/28.
 */
var path = require("path");
var guid = require('guid');
var conf = require('node-conf');
var basedir = conf.load('app').appbase;
var async = require('async');
var Schemas = require(basedir + '/database/schema').Schemas;
var moment = require('moment');

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
gets.index = function(req, res, next, baseurl) {
    res.render('manage/Menmus/list.html', {
        baseurl: baseurl,
        modename: 'manageMenmus'
    });
}
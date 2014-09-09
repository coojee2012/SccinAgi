/**
 * Created by LinYong on 2014/9/4.
 */
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

gets.index=function(req,res,next,baseurl){
    var caller=req.query["caller"];
    var called=req.query["called"];
    res.render('crm/screenPop/index.html', {
        baseurl: baseurl,
        caller: caller,
        called:called
    });
}

var path = require("path");
var guid = require('guid');
var conf = require('node-conf').load('app');
var basedir = conf.appbase;
var Schemas = require(basedir + '/database/schema').Schemas;
var moment = require('moment');
var async = require('async');
var logger = require(basedir + '/lib/logger').logger('web');
var fs = require("fs");
var nami = require(basedir + '/asterisk/asmanager').nami,
    util = require('util'),
    AsAction = require("nami").Actions;

var gets = {};
var posts = {};
module.exports = {
    get: gets,
    post: posts
};

//列表显示
gets.index = function(req, res, next, baseurl) {

    Schemas.pbxAutoMonitorWays.all({}, function(err, dbs) {
        if (!dbs)
            dbs = [];
        if (err)
            logger.error(err);
        res.render('pbx/RecordFile/list.html', {
            baseurl: baseurl,
            ways: dbs,
            modename: 'pbxRcordFile'
        });
    });

}
gets.create = function(req, res, next, baseurl) {
    res.render('pbx/RecordFile/create.html', {
        hasExtens:"",
        baseurl: baseurl
    });
}
var path = require("path");
var guid = require('guid');
var conf = require('node-conf');
var basedir = conf.load('app').appbase;
var Schemas = require(basedir + '/database/schema').Schemas;
var moment = require('moment');
var async = require('async');
var logger = require(basedir + '/lib/logger').logger('web');
var gets = {};
var posts = {};
module.exports = {
    get: gets,
    post: posts
};

//呼出规则列表显示
gets.index = function(req, res, next, baseurl) {
	var os=require("os");
	var systype=os.type();
	var sysrelease=os.release();

    res.render('pbx/Sounds/list.html', {
    	osinfo:systype+" "+sysrelease,
        baseurl: baseurl,
        modename: 'pbxSounds'
    });
}
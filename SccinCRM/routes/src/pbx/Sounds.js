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
    var os = require("os");
    var systype = os.type();
    var sysrelease = os.release();
    if (/Windows_\w+/.test(systype)) {
        res.render('pbx/Sounds/list.html', {
            osinfo: systype + " " + sysrelease,
            used: "-.-",
            unused: '-.-',
            baifenbi: '1%',
            baseurl: baseurl,
            modename: 'pbxSounds'
        });
    } else {
        var baifenbi = "1%";
        if (/\d+/.test(used) && /\d+/.test(unused)) {
            baifenbi = (used / (used + unused)) * 100 + '%';
        }
        res.render('pbx/Sounds/list.html', {
            osinfo: systype + " " + sysrelease,
            used: "-.-",
            unused: '-.-',
            baifenbi: baifenbi,
            baseurl: baseurl,
            modename: 'pbxSounds'
        });
       
    }
}
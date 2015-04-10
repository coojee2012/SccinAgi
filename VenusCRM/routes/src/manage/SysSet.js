/**
 * Created by LinYong on 2014/7/23.
 */
var guid = require('guid');
var async = require('async');
var _ = require('lodash');
var conf = require('node-conf');
var basedir = Venus.baseDir;
var Schemas = require(basedir + '/database/schema').Schemas;
var logger = require(basedir + '/lib/logger').logger('web');
var commfun = require(basedir + '/lib/comfun');
var fs = require('fs');
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
    res.render('manage/SysSet/list.html', {
        baseurl: baseurl
    });
}
posts.baseConf = function (req, res, next, baseurl) {
    res.render('manage/SysSet/baseConf.html', {
        baseurl: baseurl,
        baseConf: conf.load('app')
    });
}
posts.baseConfSave = function (req, res, next, baseurl) {
    var obj = commfun.cloneobj(req.body);
    obj.allowips = obj.allowips.split(",");
    obj.hostport = Number(obj.hostport);
    obj.debug = Boolean(Number(obj.debug));
    var str = JSON.stringify(obj, null, '\n');
    fs.writeFile(basedir + '/config/app.json', str, function (err) {
        if (err) {
            res.send({success: false, msg: '保存失败:' + err});
        } else {
            res.send({success: true, msg: '保存成功！'});
        }
    });
}

posts.DbConf = function (req, res, next, baseurl) {
    res.render('manage/SysSet/DbConf.html', {
        baseurl: baseurl,
        DbConf: conf.load('jdmysql')
    });
}
posts.DbConfSave = function (req, res, next, baseurl) {
    var obj = commfun.cloneobj(req.body);
    obj.port = Number(obj.port);
    obj.log = Boolean(Number(obj.log));
    obj.slave = Boolean(Number(obj.slave));
    obj.debug = Boolean(Number(obj.debug));
    var str = JSON.stringify(obj, null, '\n');
    var fs = require('fs');
    fs.writeFile(basedir + '/config/jdmysql.json', str, function (err) {
        if (err) {
            res.send({success: false, msg: '保存失败:' + err});
        } else {
            res.send({success: true, msg: '保存成功！'});
        }
    });
}

posts.AsConf = function (req, res, next, baseurl) {
    res.render('manage/SysSet/AsConf.html', {
        baseurl: baseurl,
        AsConf: conf.load('asterisk')
    });
}

posts.AsConfSave=function (req, res, next, baseurl) {
    var obj = commfun.cloneobj(req.body);
    obj.port = Number(obj.port);
    var str = JSON.stringify(obj, null, '\n');
    var fs = require('fs');
    fs.writeFile(basedir + '/config/asterisk.json', str, function (err) {
        if (err) {
            res.send({success: false, msg: '保存失败:' + err});
        } else {
            res.send({success: true, msg: '保存成功！'});
        }
    });
}
posts.SysLog = function (req, res, next, baseurl) {
    fs.readFile(basedir + '/web.log', function (err, data) {
        if (err) {
            res.render('manage/SysSet/SysLog.html', {
                baseurl: baseurl,
                Log: err
            });
        } else {
            res.render('manage/SysSet/SysLog.html', {
                baseurl: baseurl,
                Log: data
            });
        }

    });

}

posts.ClearSysLog = function (req, res, next, baseurl) {
    fs.writeFile(basedir + '/web.log', '', function (err) {
        if (err) {
            res.send({success: false, msg: '清理失败:' + err});
        } else {
            res.send({success: true, msg: '清理成功！'});
        }
    });
}

posts.SysOption= function (req, res, next, baseurl) {
var optionType=req.body.optionType;
    res.send({success: true, msg: '清理成功！'});
}
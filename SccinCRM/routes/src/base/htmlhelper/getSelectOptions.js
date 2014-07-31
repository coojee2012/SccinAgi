var conf = require('node-conf');
var basedir = conf.load('app').appbase;


var nami = require(basedir + '/asterisk/asmanager').nami,
	util = require('util'),
	async = require('async'),
	AsAction = require("nami").Actions;

var Schemas = require(basedir + '/database/schema').Schemas;
var guid = require('guid');
var logger = require(basedir + '/lib/logger').logger('web');

var gets = {};
var posts = {};
module.exports = {
	get: gets,
	post: posts
};
//部门下拉组件
posts.departments = function(req, res, next) {
	Schemas.manageDepartments.all({}, function(err, dbs) {
		async.map(dbs, function(item, callback) {
			var obj = {};
			obj.v = item.id;
			obj.t = item.depName;
			callback(null, obj);
		}, function(err, results) {
			res.send(results);
		});

	});
}

posts.menmuGroups=function(req,res,next){
    Schemas.manageMenmuGroup.all({}, function(err, dbs) {
        async.map(dbs, function(item, callback) {
            var obj = {};
            obj.v = item.id;
            obj.t = item.groupName;
            callback(null, obj);
        }, function(err, results) {
            res.send(results);
        });

    });
}
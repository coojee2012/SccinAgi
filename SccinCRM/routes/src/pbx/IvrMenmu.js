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

//处理页面需要的Ajax验证
posts.checkAjax = function(req, res, next, baseurl) {
	var param = req.body['param'];
	var name = req.body['name'];
	if (typeof(checkFun[name] === 'function')) {
		checkFun[name](param, res);
	} else {
		res.send({
			"info": "服务器验证异常:函数不存在！",
			"status": "n"
		});
	}

}
//显示列表
gets.index = function(req, res, next, baseurl) {
	res.render('.' + baseurl + '/list.html', {
		baseurl: baseurl,
		modename: 'pbxIvrMenmu'
	});
}
//新建
gets.create = function(req, res, next, baseurl) {
		res.render('.' + baseurl + '/create.html', {
		baseurl: baseurl,
		modename: 'pbxIvrMenmu'
	});
}
//树
gets.ivrtree = function(req, res, next, baseurl) {
		res.render('.' + baseurl + '/ivrtree.html', {
		baseurl: baseurl,
		modename: 'pbxIvrMenmu'
	});
}
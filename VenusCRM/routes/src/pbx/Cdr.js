var guid = require('guid');
var async = require('async');
var _ = require('lodash');
var conf = require('node-conf');
var basedir =  Venus.baseDir;
var Schemas = require(basedir + '/database/schema').Schemas;
var logger = require(basedir + '/lib/logger').logger('web');
var commfun = require(basedir + '/lib/comfun');
var util = require('util');
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

//分机列表显示
gets.index = function(req, res, next, baseurl) {
	res.render('.' + baseurl + '/list.html', {
		baseurl: baseurl,
        pageIndex:req.query["displayStart"] || 0,
        where:util.inspect(commfun.searchContions(req.query["where"])),
		modename: 'pbxCdr'
	});
}

posts.calldetail = function(req, res, next, baseurl) {
	var id = req.body.id;
	if (!id || id == '') {
		res.send({
			success: 'ERROR',
			msg: '编号不能为空！'
		});
	} else {
		Schemas.pbxCallProcees.all({
			where: {
				callsession: id
			},
			order: "cretime ASC"
		}, function(err, dbs) {
			if (err)
				res.send({
					success: 'ERROR',
					msg: err
				});
			else{
				res.send({
					success: 'OK',
					msg: "查询成功！",
					dbs:dbs
				});
			}
		});
	}
}
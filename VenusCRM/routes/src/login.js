var conf = require('node-conf');
var basedir =  Venus.baseDir;

var Schemas = require(basedir+'/database/schema').Schemas;
var logger = require(basedir+'/lib/logger').logger('web');
var async = require('async');
var crypto = require('crypto');
var _ = require('lodash');

var gets = {};
var posts = {};

gets.index = function(req, res, next) {
	res.render('login.html', {
		layout: false,
		username: '',
		password: '',
		exten: '',
		tip: ''
	});
}

posts.index = function(req, res, next) {
	var username = req.body['username'] || '';
	var password = req.body['password'] || '';
	var exten = req.body['exten'] || '';

	var md5 = crypto.createHash('md5');
	var hexpassword = md5.update(password).digest('hex').toUpperCase();
	async.auto({
		authentication: function(cb) {
			authentication(username, hexpassword, cb);
		},
		findUseExten: ['authentication',
			function(cb, results) {
				if (exten === '')
					exten = results.authentication.uExten;
				findexten(exten, cb);
			}
		],
		setsession: ['findUseExten',
			function(cb, results) {
				setsession(results.authentication, results.findUseExten, req, cb);
			}
		]
	}, function(err, results) {
		if (err) {
			res.render('login.html', {
				layout: false,
				username: username,
				password: '',
				exten: exten,
				tip: err
			});
		} else {
			res.redirect('/');
		}
	});
}


module.exports = {
	get: gets,
	post: posts
};

function authentication(uname, upass, callback) {
	var include = new Array();
	for (var key in Schemas['manageUserInfo'].relations) {
		include.push(key);
	}
	logger.debug("具有的关系:", include);
	try {
		Schemas['manageUserInfo'].findOne({
			include: include,
			where: {
				uLogin: uname,
				uPass: upass
			}
		}, function(err, inst) {
			if (err) {
				logger.error(err);
				callback('登陆服务器发生异常，请联系管理员！', null);
			} else {
				if (inst === null) {
					callback('用户名或密码错误，请重试！', null);
				} else {
					callback(null, inst);
				}
			}
		});
	} catch (err) {
		logger.error(err);
		callback('登陆服务器发生异常，请联系管理员！', null);
	}
}

function setsession(user, exten, req, callback) {
	if (user === null) {
		callback('传入非法用户！', null);
	} else {
		try {
			req.session.user = user;
			req.session.department = user.__cachedRelations['department'];
			req.session.role = user.__cachedRelations['role'];
			req.session.exten = exten;
			callback(null, req.session);
		} catch (err) {
			logger.error(err);
			callback('登陆服务器发生异常，请联系管理员！', null);
		}
	}
}

function findexten(exten, callback) {
	Schemas['pbxExtension'].find(exten, function(err, inst) {
        console.log(inst);
		if (err) {
			callback('查找分机发生异常!', null);
		} else if (inst === null) {
			callback('系统不存在该分机号!', null);
		} else {
			callback(null, inst);
		}
	});
}
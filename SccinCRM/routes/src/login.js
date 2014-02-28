var Schemas = require('../../database/schema').Schemas;
var logger = require('../../lib/logger').logger('web');
var async = require('async');
var crypto = require('crypto');
exports.get = function(req, res, next) {
	res.render('login.html', {
		layout: false,
		username: '',
		password: '',
		exten: '',
		tip: ''
	});
}

exports.post = function(req, res, next) {
	var username = req.body['username'] || '';
	var password = req.body['password'] || '';
	var exten = req.body['exten'] || '';
	var Schemas = require('../../database/schema').Schemas;

	var md5 = crypto.createHash('md5');
	var hexpassword = md5.update(password).digest('hex').toUpperCase();
	async.auto({
		auther: function(cb) {
			authuer(username, hexpassword, cb);
		},
		setsession: ['auther',
			function(cb, results) {
				setsession(results.auther, exten, req, cb);
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

function authuer(uname, upass, callback) {
	var include = new Array();
	for (var key in Schemas['CRMUserInfo'].relations) {
		include.push(key);
	}
	logger.info("具有的关系:", include);
	try {
		Schemas['CRMUserInfo'].findOne({
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
			req.session.user = user.uName;
			req.session.depid = user.depId;
			req.session.depname = user.department.depName;
			req.session.roleid = user.roleId;
			req.session.username = user.role.roleName;
			req.session.exten = exten || user.uExten;
			callback(null, req.session);
		} catch (err) {
			logger.error(err);
			callback('登陆服务器发生异常，请联系管理员！', null);
		}
	}
}
var conf = require('node-conf');
var basedir = conf.load('app').appbase;
var Schemas = require(basedir+'/database/schema').Schemas;
var logger = require(basedir+'/lib/logger').logger('web');
var async = require('async');
var util = require('util');
var crypto = require('crypto');


/*var inld=new Array();
for(var key in UserInfo.relations){
	inld.push(key);
}*/

var gets = {};
var posts = {}

gets.index = function(req, res, next) {
	logger.debug(req.session);
	var user = req.session.user;
	var exten = req.session.exten;
	var department = req.session.department;
	var role = req.session.role;

	async.auto({
		getRoleMenmus: function(cb) {
			var include = new Array();
			for (var key in Schemas['manageUserRole'].relations) {
				include.push(key);
			}
			logger.info("具有的关系:", include);
			if (role.id === '0') {
				cb(null, '*')
			} else {
				Schemas['manageUserRole'].findOne({
					include: include,
					where: {
						id: role.id
					}

				}, function(err, inst) {
					logger.info(inst);
					cb(err, inst.__cachedRelations['users']);
				});
			}
		},
		getMenmus: ['getRoleMenmus',
			function(cb, results) {
				var where = {};
				if (util.isArray(results.getRoleMenmus)) {

				} else {
					where.id = {
						'neq': ''
					};
				}
				Schemas['manageMenmus'].all({
					include: [],
					where: where
				}, function(err, dbs) {
					cb(err, dbs);
				});

			}
		],
		setMenmus: ['getMenmus',
			function(cb, results) {
				var startmenmus = {};
				var menmus = {};
				startmenmus.starmenmu_grsz = {
					title: '个人设置',
					url: '/UserManager/EditSelf',
					winWidth: 600,
					winHeight: 400,
					apptype: 'appwin',
					postdata: {}
				};
				startmenmus.starmenmu_syzn = {
					title: '使用指南',
					url: '/RoleAdmin/Index',
					winWidth: 1100,
					winHeight: 650,
					apptype: 'appwin',
					postdata: {}
				};
				startmenmus.starmenmu_gywm = {
					title: '关于我们',
					url: 'http://zjk.sccin.com/zhinan.html',
					winWidth: 1100,
					winHeight: 650,
					apptype: 'appwin',
					postdata: {}
				};
				startmenmus.starmenmu_tcxt = {
					title: '退出系统',
					url: '/Login/Index',
					winWidth: 1100,
					winHeight: 650,
					apptype: 'loginout',
					postdata: {}
				};
				/*startmenmus.starmenmu_xtsz = {
					title: '系统设置',
					url: '#',
					apptype: 'haschild',
					postdata: {},
					winWidth: 1024,
					winHeight: 768
				};*/

				if (results.getMenmus.length > 0) {
					for (var i = 0; i < results.getMenmus.length; i++) {
						if (results.getMenmus[i].mgID === 7) {
							startmenmus['sub_item_xtsz_' + results.getMenmus[i].id] = {
								title: results.getMenmus[i].mgName,
								url: results.getMenmus[i].menURL,
								apptype: 'appwin',
								postdata: {},
								//winWidth: results.getMenmus[i].width,
								//winHeight: results.getMenmus[i].height
							};
						} else if (results.getMenmus[i].mgID === 8) {
							startmenmus['sub_item_pbx_' + results.getMenmus[i].id] = {
								title: results.getMenmus[i].menName,
								url: results.getMenmus[i].menURL,
								apptype: 'appwin',
								postdata: {},
								//winWidth: results.getMenmus[i].width,
								//winHeight: results.getMenmus[i].height
							};
						} else {
							menmus["menmu_" + results.getMenmus[i].id] = {
								title: results.getMenmus[i].menName,
								url: results.getMenmus[i].menURL,
								//winWidth: results.getMenmus[i].width,
								//winHeight: results.getMenmus[i].height
							}
						}
					}
				}
				cb(null, {
					startmenmus: startmenmus,
					menmus: menmus
				});
			}
		]

	}, function(err, results) {
		if (err)
			next(err);
		else {
			res.render('index.html', {
				layout: false,
				user: {
					id: user.id,
					name: user.uName
				},
				department: {
					id: department.id,
					name: department.depName
				},
				role: {
					id: role.id,
					name: role.roleName,
					isAgent: role.isAgent
				},
				exten: {
					number: exten.id,
					proto: exten.deviceproto
				},
				umenmus: results.getMenmus,
				menmus: util.inspect(results.setMenmus.startmenmus),
				startmenmus: util.inspect(results.setMenmus.startmenmus)
			});
		}
	});

};

posts.index = function(req, res, next) {

};

module.exports = {
	get: gets,
	post: posts
};
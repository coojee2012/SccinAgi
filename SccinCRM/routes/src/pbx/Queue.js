var path = require("path");
var guid = require('guid');
var conf = require('node-conf');
var basedir = conf.load('app').appbase;
var async = require('async');
var Schemas = require(basedir + '/database/schema').Schemas;
var commfun = require(basedir + '/lib/comfun');
var _ = require('lodash');
var logger = require(basedir + '/lib/logger').logger('web');
var gets = {};
var posts = {};
module.exports = {
	get: gets,
	post: posts
};

//ajax验证函数集合
var checkFun = {};
//分机号验证
checkFun['id'] = function(id, res) {
	if (!id || id == '') {
		res.send({
			"info": "输入不能为空！",
			"status": "n"
		});
	} else {
		Schemas['pbxQueue'].find(id, function(err, inst) {
			if (err)
				res.send({
					"info": "后台验证发生错误！",
					"status": "n"
				});
			else {
				if (inst != null)
					res.send({
						"info": "已经存在！",
						"status": "n"
					});
				else {
					res.send({
						"info": "验证通过！",
						"status": "y"
					});
				}
			}
		});
	}
};

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
	res.render('pbx/Queue/list.html', {
		baseurl: baseurl,
		modename: 'pbxQueue'
	});
}

//新建
gets.create = function(req, res, next, baseurl) {
	Schemas['pbxExtension'].all({}, function(err, dbs) {
		if (err) {
			next(err);
		} else {
			var str = "";
			for (var i = 0; i < dbs.length; i++) {
				str += '<option value="' + dbs[i].id + '">' + dbs[i].id + ' "' + dbs[i].accountcode + '" </option>';
			}
			res.render('pbx/Queue/create.html', {
				baseurl: baseurl,
				hasExtens: str
			});
		}
	});

}
//编辑
gets.edit = function(req, res, next, baseurl) {
	var id = req.query["id"];
	async.auto({
		findQueue: function(cb) {
			Schemas['pbxQueue'].find(id, function(err, inst) {
				if (err || inst == null)
					cb('编辑查找队列发生错误或队列不存在！', inst);
				else
					cb(err, inst);
			});
		},
		findMembers: ['findQueue',
			function(cb, results) {
				var yyMembers = !results.findQueue.members ? [] : results.findQueue.members.toString().split('\,');
				console.log(yyMembers);
				Schemas['pbxExtension'].all({}, function(err, dbs) {
					if (err) {
						cb('编辑队列查询分机发生错误！', -1);
					} else {
						//var totalMembers = [];
						var hasMembers = [];
						for (var i = 0; i < dbs.length; i++) {
							//totalMembers.push(dbs[i].id);
							var isHave = false;
							for (var k = 0; k < yyMembers.length; k++) {
								if (dbs[i].id === yyMembers[k]) {
									isHave = true;
									break;
								}
							}
							if (!isHave) {
								hasMembers.push(dbs[i].id);
							}
							//str += '<option value="' + dbs[i].id + '">' + dbs[i].id + ' "' + dbs[i].accountcode + '" </option>';
						}

						var hasExtens = "";
						var yyExtens = "";
						for (var ii = 0; ii < hasMembers.length; ii++) {

							hasExtens += '<option value="' + hasMembers[ii] + '">' + hasMembers[ii] + ' "' + hasMembers[ii] + '" </option>';
						}
						for (var kk = 0; kk < yyMembers.length; kk++) {

							yyExtens += '<option value="' + yyMembers[kk] + '">' + yyMembers[kk] + ' "' + yyMembers[kk] + '" </option>';
						}

						cb(null, {
							hasExtens: hasExtens,
							yyExtens: yyExtens
						});
					}
				});
			}
		]

	}, function(err, results) {
		res.render('pbx/Queue/edit.html', {
			baseurl: baseurl,
			hasExtens: results.findMembers.hasExtens,
			yyExtens: results.findMembers.yyExtens,
			inst: results.findQueue
		});
	});


}


//保存（适用于新增和修改）
posts.save = function(req, res, next, baseurl) {
	var Obj = {};
	for (var key in req.body) {
		if (key == "members" && _.isArray(req.body[key])) {
			Obj[key] = req.body[key].join(",");
		} else
			Obj[key] = req.body[key];
	}
	logger.debug(Obj);
	async.auto({
			isHaveCheck: function(cb) {
				if (!Obj.id || Obj.id === '') {
					cb('队列号不能为空', -1);
				} else {
					Schemas['pbxQueue'].find(Obj.id, function(err, inst) {
						cb(err, inst);
					});
				}

			},
			createNew: ['isHaveCheck',
				function(cb, results) {
					if (results.isHaveCheck !== null) { //如果存在本函数什么都不做
						cb(null, -1);
					} else {
						Schemas['pbxQueue'].create(Obj, function(err, inst) {
							cb(err, inst);

						});
					}
				}
			],
			updateOld: ['isHaveCheck',
				function(cb, results) {
					if (results.isHaveCheck === null) { //如果不存在本函数什么都不做
						cb(null, -1);
					} else {
						Schemas['pbxQueue'].update({
							where: {
								id: Obj.id
							},
							update: Obj
						}, function(err, inst) {
							cb(err, inst);
						});
					}
				}
			],
			addlocalnum: ["createNew",
				function(cb, results) {
					commfun.addlocalnum(results.createNew.id, 'queue', "", cb);
				}
			]
		},
		function(err, results) {
			var myjson = {
				success: '',
				id: '',
				msg: ''
			};
			if (results.createNew !== -1) {
				results.createNew.isValid(function(valid) {
					if (!valid) {
						myjson.success = 'ERROR';
						myjson.msg = "服务器感知到你提交的数据非法，不予受理！";
					} else {
						myjson.success = 'OK';
						myjson.msg = '新增成功!';
						myjson.id = results.createNew.id;
					}
				});
			} else if (results.updateOld !== -1) {
				myjson.success = 'OK';
				myjson.msg = '修改成功!';
				myjson.id = results.isHaveCheck.id;

			} else if (err) {
				logger.error("添加或修改队列发生异常：", err);
				myjson.success = 'ERROR';
				myjson.msg = '保存数据发生异常,请联系管理员！';
			}
			res.send(myjson);
		});
}


posts.delete = function(req, res, next, baseurl) {
	var id = req.body['id'];
	Schemas['pbxQueue'].find(id, function(err, inst) {
		var myjson = {};
		if (err) {
			myjson.success = 'ERROR';
			myjson.msg = '查询数据发生异常,请联系管理员！';
			res.send(myjson);
		} else {
			if (!inst) {
				myjson.success = 'ERROR';
				myjson.msg = '没有找到需要删除的数据！';
				res.send(myjson);
			} else {
				inst.destroy(function(err) {
					if (err) {
						myjson.success = 'ERROR';
						myjson.msg = '删除数据发生异常,请联系管理员！！';
						res.send(myjson);
					} else {
						commfun.dellocalnum(id, function(err, o) {
							if (err) {
								myjson.success = 'ERROR';
								myjson.msg = '删除分机本地号码发生异常,请联系管理员！！';
								res.send(myjson);
							} else {
								myjson.success = 'OK';
								myjson.msg = '删除成功！';
								res.send(myjson);
							}
						});
					}
				});
			}
		}

	});
}
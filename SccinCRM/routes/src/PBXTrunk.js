var Schemas = require('../../database/schema').Schemas;
var guid = require('guid');
var async = require('async');
var logger = require('../../lib/logger').logger('web');
//ajax验证函数集合
var checkFun = {};

//处理页面需要的Ajax验证
exports.checkAjax = function(req, res,next) {
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
exports.list = function(req, res,next) {

	res.render('PBXTrunk/list.html', {
		modename: 'PBXTrunk'
	});
}

//新建
exports.create = function(req, res,next) {
	var trunkproto = req.query['trunkproto'];
	if (!trunkproto || trunkproto == '')
		trunkproto = 'SIP';
	async.auto({
		getHasChannels: function(cb) {
			getHasChannels(trunkproto, function(err, result) {
				cb(err, result);
			})
		}
	}, function(err, results) {
		if (err) {
			logger.error(err);

		} else {
			res.render('PBXTrunk/create.html', {
				trunkproto: trunkproto,
				hasChannels: results.getHasChannels,
				yyChannels: "",
				partv: 'part' + trunkproto + '.html'
			});
		}
	});


}
//编辑
exports.edit = function(req, res,next) {
	var id = req.query["id"];
	async.auto({
			findTrunk: function(cb) {
				Schemas['PBXTrunk'].find(id, function(err, inst) {
					if (err || inst == null)
						cb('编辑查找发生错误或数据不存在！', inst);
					else
						cb(err, inst);
				});
			},
			findMembers: ['findTrunk',
				function(cb, results) {
					var args = results.findTrunk.args;
					var hasExtens = "";
					var yyExtens = "";
					getHasChannels(results.findTrunk.trunkproto, function(err, result) {
						cb(null, {
							hasExtens: hasExtens,
							yyExtens: yyExtens
						});
					});

				}
			]

		},

		function(err, results) {

			res.render('PBXTrunk/edit.html', {
				hasExtens: results.findMembers.hasExtens,
				yyExtens: results.findMembers.yyExtens,
				inst: results.findTrunk
			});
		});


}


//保存（适用于新增和修改）
exports.save = function(req, res,next) {
	var Obj = {};
	Obj.args = '';
	for (var key in req.body) {
		if (/^str\_(\S+)/.test(key)) {
			//console.log(RegExp.$1);
			Obj.args += RegExp.$1 + '=' + req.body[key] + '&';
		} else {
			Obj[key] = req.body[key];
		}

	}
	if (Obj.args !== '')
		Obj.args = Obj.args.toString().substring(0, Obj.args.length - 1);
	async.auto({
			isHaveCheck: function(cb) {
				Schemas['PBXTrunk'].find(Obj.id, function(err, inst) {
					cb(err, inst);
				});
			},
			createNew: ['isHaveCheck',
				function(cb, results) {
					if (results.isHaveCheck !== null) { //如果存在本函数什么都不做
						cb(null, -1);
					} else {
						Obj.id = guid.create();
						setTrunkDev(Obj, function(err, devstr) {
							if (err)
								cb(err, -1);
							else {
								Obj.trunkdevice = devstr;
								Schemas['PBXTrunk'].create(Obj, function(err, inst) {
									if (err)
										cb(err, -1);
									else {
										if (inst.trunkproto === 'PRI' || inst.trunkproto === 'FXO') {
											var linestr = inst.args.split('=');
											var lines = [];
											if (linestr[1] && linestr[1] !== '')
												lines = linestr[1].split(',');
											updateChannels(lines,devstr, function(err, result) {
												cb(err, inst);
											});
										} else {
											cb(err, inst);
										}

									}

								});
							}

						});

					}
				}
			],
			updateOld: ['isHaveCheck',
				function(cb, results) {
					if (results.isHaveCheck === null) { //如果不存在本函数什么都不做
						cb(null, -1);
					} else {
						Schemas['PBXTrunk'].update({
							where: {
								id: Obj.id
							},
							update: Obj
						}, function(err, inst) {
							cb(err, inst);
						});
					}
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
				myjson.id = results.updateOld.id;

			} else if (err) {
				console.log(err);
				myjson.success = 'ERROR';
				myjson.msg = '保存数据发生异常,请联系管理员！';
			}
			res.send(myjson);
		});
}


exports.delete = function(req, res,next) {
	var id = req.body['id'];
	Schemas['PBXTrunk'].find(id, function(err, inst) {
		var myjson = {};
		if (err) {
			myjson.success = 'ERROR';
			myjson.msg = '查询数据发生异常,请联系管理员！';
		} else {
			if (!inst) {
				myjson.success = 'ERROR';
				myjson.msg = '没有找到需要删除的数据！';
			} else {

			}
			inst.destroy(function(err) {
				if (err) {
					myjson.success = 'ERROR';
					myjson.msg = '删除数据发生异常,请联系管理员！！';
				} else {
					myjson.success = 'OK';
					myjson.msg = '删除成功！';
				}
				res.send(myjson);

			});

		}

	});
}


function setTrunkDev(Obj, callback) {
	var trunkdevice = '';
	if (Obj.trunkproto === 'SIP' || Obj.trunkproto === 'IAX2') {
		trunkdevice = getRandomStr(10);
		callback(null, trunkdevice);
	} else if (Obj.trunkproto === 'PRI' || Obj.trunkproto === 'FXO') {
		Schemas['PBXTrunk'].all({
			where: {
				trunkproto: {
					'inq': ['PRI', 'FXO']
				}
			}
		}, function(err, dbs) {
			var count = 0;
			if (dbs !== null)
				count = dbs.length;
			callback(err, count);
		});
	} else {
		callback(null, Obj.trunkdevice);
	}
}

function getRandomStr(len) {
	var x = "123456789poiuytrewqasdfghjklmnbvcxzQWERTYUIPLKJHGFDSAZXCVBNM";
	var str = "";
	for (var i = 0; i < len; i++) {
		str += x.charAt(Math.ceil(Math.random() * 100000000) % x.length);
	}
	return str;
}

function getHasChannels(trunkproto, callback) {
	var hasChannels = "";
	Schemas['PBXCard'].all({
		where: {
			trunkproto: trunkproto,
			dataline: {
				'neq': '是'
			},
			group: '-1'
		},
		order: ['cardname asc', 'line asc']
	}, function(err, dbs) {
		if (err) {
			callback(err, null);
		} else {
			for (var i = 0; i < dbs.length; i++) {
				hasChannels += '<option value="' + dbs[i].line + '">[' + dbs[i].cardname + ']' + trunkproto + ' - ' + dbs[i].line + ' </option>';
			}
			callback(null, hasChannels);
		}
	});
}

function updateChannels(lines,group, callback) {
	async.each(lines, function(item, cb) {
		Schemas['PBXCard'].update({
			where: {
				line:item
			},
			update: {
				group:group
			}
		}, function(err, result) {
			cb(err, result);
		});
	}, function(err, results) {
		callback(err, results);
	});
}
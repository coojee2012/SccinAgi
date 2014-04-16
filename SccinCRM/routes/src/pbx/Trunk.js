var guid = require('guid');
var async = require('async');
var _ = require('lodash');
var conf = require('node-conf');
var basedir = conf.load('app').appbase;
var Schemas = require(basedir+'/database/schema').Schemas;
var logger = require(basedir+'/lib/logger').logger('web');
var gets = {};
var posts = {};
module.exports = {
	get: gets,
	post: posts
};

//ajax验证函数集合
var checkFun = {};

//处理页面需要的Ajax验证
posts.checkAjax = function(req, res, next,baseurl) {
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
gets.index = function(req, res, next,baseurl) {
	res.render('.'+baseurl+'/list.html', {
		baseurl:baseurl,
		modename: 'pbxTrunk'
	});
}

//新建
gets.create = function(req, res, next,baseurl) {
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
			res.render('.'+baseurl+'/create.html', {
				baseurl:baseurl,
				trunkproto: trunkproto,
				hasChannels: results.getHasChannels,
				yyChannels: "",
				partv: 'part' + trunkproto + '.html'
			});
		}
	});


}
//编辑
gets.edit = function(req, res, next,baseurl) {
	var id = req.query["id"];
	async.auto({
			findTrunk: function(cb) {
				Schemas['pbxTrunk'].find(id, function(err, inst) {
					if (err || inst == null)
						cb('编辑查找发生错误或数据不存在！', inst);
					else
						cb(err, inst);
				});
			},
			getHasChannels: ['findTrunk',
				function(cb, results) {
					if (_.contains(['FXO', 'PRI'], results.findTrunk.trunkproto)) {
						getHasChannels(results.findTrunk.trunkproto, function(err, result) {
							cb(null, result);
						});
					} else {
						cb(null, "");
					}
				}
			],
			getyyChannels: ['findTrunk',
				function(cb, results) {
					if (_.contains(['FXO', 'PRI'], results.findTrunk.trunkproto)) {
						getyyChannels(results.findTrunk.args, function(err, result) {
							cb(null, result);
						});
					} else {
						cb(null, "");
					}

				}
			]

		},
		function(err, results) {
			res.render('.'+baseurl+'/edit.html', {
				baseurl:baseurl,
				hasChannels: results.getHasChannels,
				yyChannels: results.getyyChannels,
				partv: 'part' + results.findTrunk.trunkproto + '.html',
				inst: results.findTrunk
			});
		});


}


//保存（适用于新增和修改）
posts.save = function(req, res, next,baseurl) {
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
				Schemas['pbxTrunk'].find(Obj.id, function(err, inst) {
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
								Schemas['pbxTrunk'].create(Obj, function(err, inst) {
									if (err)
										cb(err, -1);
									else {
										if (inst.trunkproto === 'PRI' || inst.trunkproto === 'FXO') {
											var linestr = inst.args.split('=');
											var lines = [];
											if (linestr[1] && linestr[1] !== '')
												lines = linestr[1].split(',');
											updateChannels(lines, devstr, function(err, result) {
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
						Schemas['pbxTrunk'].update({
							where: {
								id: Obj.id
							},
							update: Obj
						}, function(err, inst) {
							if (results.isHaveCheck.trunkproto === 'PRI' || results.isHaveCheck.trunkproto === 'FXO') {
								var oldargs = results.isHaveCheck.args;
								var oldlinestr = oldargs.split('=');
								var oldlines = [];
								if (oldlinestr[1] && oldlinestr[1] !== '')
									oldlines = oldlinestr[1].split(',');
								var linestr = Obj.args.split('=');
								var lines = [];
								if (linestr[1] && linestr[1] !== '')
									lines = linestr[1].split(',');
								updateChannels(oldlines, '-1', function(err, result) {
									updateChannels(lines, results.isHaveCheck.trunkdevice, function(err, result) {
										cb(err, inst);
									});
								});
							} else {
								cb(err, inst);
							}
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
						myjson.msg = '新增成功,请及时同步到服务器，使其生效！';
						myjson.id = results.createNew.id;
					}
				});
			} else if (results.updateOld !== -1) {
				myjson.success = 'OK';
				myjson.msg = '修改成功,请及时同步到服务器，使其生效！';
				myjson.id = results.updateOld.id;

			} else if (err) {
				console.log(err);
				myjson.success = 'ERROR';
				myjson.msg = '保存数据发生异常,请联系管理员！';
			}
			res.send(myjson);
		});
}


posts.delete = function(req, res, next,baseurl) {
	var id = req.body['id'];
	Schemas['pbxTrunk'].find(id, function(err, inst) {
		var myjson = {};
		if (err) {
			myjson.success = 'ERROR';
			myjson.msg = '查询数据发生异常,请联系管理员！';
		} else {
			if (!inst) {
				myjson.success = 'ERROR';
				myjson.msg = '没有找到需要删除的数据！';
				res.send(myjson);
			} else {
				async.auto({
					updateDahdi: function(cb) {
						if (_.contains(['FXO', 'PRI'], inst.trunkproto)) {
							var oldargs = inst.args;
							var oldlinestr = oldargs.split('=');
							var oldlines = [];
							if (oldlinestr[1] && oldlinestr[1] !== '')
								oldlines = oldlinestr[1].split(',');
							updateChannels(oldlines, '-1', function(err, result) {
								cb(err, result);
							});
						} else {
							cb(null, 1);
						}
					},
					destory: function(cb) {
						inst.destroy(function(err) {
							cb(err, 1);
						});
					}

				}, function(err, results) {
					if (err) {
						myjson.success = 'ERROR';
						myjson.msg = '删除数据发生异常,请联系管理员！！';
					} else {
						myjson.success = 'OK';
						myjson.msg = '删除成功,请及时同步到服务器，使其生效！';
					}
					res.send(myjson);
					
				});


			}

		}
		
	});
}


function setTrunkDev(Obj, callback) {
	var trunkdevice = '';
	if (Obj.trunkproto === 'SIP' || Obj.trunkproto === 'IAX2') {
		trunkdevice = getRandomStr(10);
		callback(null, trunkdevice);
	} else if (Obj.trunkproto === 'PRI' || Obj.trunkproto === 'FXO') {
		Schemas['pbxTrunk'].all({
			where: {
				trunkproto: {
					'inq': ['PRI', 'FXO']
				}
			}
		}, function(err, dbs) {
			var count = 0;
			if (dbs !== null) {
				var tmparr = _.range(dbs.length+1);//根据记录的长度创建一个相当长度的数组
				var hasgroup=_.map(dbs, function(item) { return _.parseInt(item.trunkdevice); });
				 count = _.chain(tmparr).difference(hasgroup).min();
			}
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
	Schemas['pbxCard'].all({
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

function getyyChannels(args, callback) {
	var yyChannels = "";
	if (!args || args == '') {
		callback(null, "");
		return;
	}
	var channels = "";
	var extobj = args.split('&');
	extobj.forEach(function(item) {
		var items = item.split('=');
		if (items[0] === 'channel')
			channels = items[1];
	});
	if (!channels || channels === '') {
		callback(null, "");
		return;
	}
	var chans = channels.split(',');
	chans = _.map(chans, function(item) {
		return _.parseInt(item);
	});
	Schemas['pbxCard'].all({
		where: {
			line: {
				'inq': chans
			}
		},
		order: ['cardname asc', 'line asc']
	}, function(err, dbs) {
		if (err) {
			callback(err, null);
		} else {
			_.forEach(dbs, function(item) {
				yyChannels += '<option value="' + item.line + '">[' + item.cardname + ']' + item.trunkproto + ' - ' + item.line + ' </option>';
			});
			callback(null, yyChannels);
		}
	});
}

function updateChannels(lines, group, callback) {
	async.each(lines, function(item, cb) {
		Schemas['pbxCard'].update({
			where: {
				line: item
			},
			update: {
				group: group
			}
		}, function(err, result) {
			cb(err, result);
		});
	}, function(err, results) {
		callback(err, results);
	});
}
var conf = require('node-conf');
var basedir = conf.load('app').appbase;
var Schemas = require(basedir + '/database/schema').Schemas;
var async = require('async');
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
//分机号验证
checkFun['accountcode'] = function(accountcode, res) {
	if (!accountcode || accountcode == '') {
		res.send({
			"info": "输入的分机号不能为空！",
			"status": "n"
		});
	} else {
		Schemas['pbxExtension'].find(accountcode, function(err, inst) {
			if (err)
				res.send({
					"info": "后台验证发生错误！",
					"status": "n"
				});
			else {
				if (inst != null)
					res.send({
						"info": "分机已经存在！",
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

//分机列表显示
gets.index = function(req, res, next, baseurl) {

	res.render('pbx/Extension/list.html', {
        pageIndex:req.query["displayStart"] || 0,
        where:util.inspect(commfun.searchContions(req.query["where"])),
		baseurl: baseurl
	});
}

gets.upsert = function(req, res, next, baseurl) {
	res.render('pbx/Extension/upsert.html', {
		baseurl: baseurl
	});
}

//展现新建页面
//页面传入deviceproto参数，根据deviceproto值表现不同协议的分机新建页面
gets.create = function(req, res, next, baseurl) {
	var deviceproto = req.query['deviceproto'];
	if (!deviceproto || deviceproto == '')
		deviceproto = 'SIP';
	res.render('pbx/Extension/create.html', {
		baseurl: baseurl,
		deviceproto: deviceproto,
		partv: 'partv' + deviceproto + '.html'
	});
}
//展现编辑页面
gets.edit = function(req, res, next, baseurl) {
	var id = req.query['id'];
	Schemas['pbxExtension'].find(id, function(err, inst) {
		if (err)
			res.redirect(500, '/err/500');
		else {
			if (inst != null)
				res.render('pbx/Extension/edit.html', {
					baseurl: baseurl,
					inst: inst,
                    displayStart:req.query["displayStart"] || 0,
                    where:req.query["where"] || "",
					partv: 'partv' + inst.deviceproto + '.html'
				});
			else {
				res.redirect(404, '/err/404');
			}
		}
	});
}

posts.delete = function(req, res, next, baseurl) {
	var id = req.body['id'];
	Schemas['pbxExtension'].find(id, function(err, inst) {
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

//保存分机信息（适用于新增和修改）
posts.save = function(req, res, next, baseurl) {
	var extenObj = {};
	extenObj.devicestring = '';
	for (var key in req.body) {
		if (/^str\_(\S+)/.test(key)) {
			var t=RegExp.$1;
			console.log(t);
			extenObj.devicestring += t + '=' + req.body[key] + '&';
		} else {
			extenObj[key] = req.body[key];
		}
	}
	extenObj.devicestring += 'secret=' + req.body['password'] + '&';
	extenObj.devicestring = extenObj.devicestring.toString().substring(0, extenObj.devicestring.length - 1);
	extenObj.devicenumber = extenObj.accountcode;
	async.auto({
			isHaveCheck: function(cb) {
				Schemas['pbxExtension'].find(extenObj.id, function(err, inst) {
					cb(err, inst);
				});
			},
			createNew: ['isHaveCheck',
				function(cb, results) {
					if (results.isHaveCheck !== null) { //如果存在本函数什么都不做
						cb(null, -1);
					} else {
						extenObj.id = extenObj.accountcode;
						Schemas['pbxExtension'].create(extenObj, function(err, inst) {
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
						Schemas['pbxExtension'].update({
							where: {
								id: extenObj.id
							},
							update: extenObj
						}, function(err, inst) {
							cb(err, inst);
						});
					}
				}
			],
			addlocalnum: ["createNew",
				function(cb, results) {
					commfun.addlocalnum(results.createNew.id, 'extension', "", cb);
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



posts.table = function(req, res, next, baseurl) {
	console.log('BODY:', req.body);
	var dbName = req.body['dbName'];
	//查询起始页面，第一页是0
	var iDisplayStart = req.body['iDisplayStart'];
	//每页长度
	var iDisplayLength = req.body['iDisplayLength'];
	if (iDisplayLength == -1)
		iDisplayLength = 10000;
	var iColumns = parseInt(req.body['iColumns']);
	var sColumns = req.body['sColumns'].split(',');

	//处理排序
	var iSortingCols = req.body['iSortingCols'];
	var sOrder = '';
	for (var i = 0; i < iSortingCols; i++) {
		var iSortCol = req.body['iSortCol_' + i];
		var bSortable = req.body['bSortable_' + iSortCol];
		if (bSortable == "true" && sOrder != '') {
			var sSortDir = req.body['sSortDir_' + i];
			sOrder += "," + sColumns[iSortCol] + " " + (sSortDir === 'asc' ? 'asc' : 'desc');
		} else if (bSortable == "true" && sOrder == '') {
			var sSortDir = req.body['sSortDir_' + i];

			sOrder += sColumns[iSortCol] + " " + (sSortDir === 'asc' ? 'asc' : 'desc');
		} else {}
	}
	if (sOrder == null || sOrder == '')
		sOrder = 'id DESC';
	console.log("排序条件:", sOrder);

	//处理查询
	var where = {};
	where.id = {
		neq: ''
	};
	var whereCount = parseInt(req.body['whereCount']);
	for (var i = 0; i < whereCount; i++) {
		var whereCol = req.body['whereCol_' + i];
		var whereWay = req.body['whereWay_' + i];
		var whereValue = req.body['whereValue_' + i];
		if (!whereValue || whereValue == '' || whereValue == -1)
			continue;
		else {
			where[whereCol] = {};
			if (!whereWay || whereWay == '')
				where[whereCol] = whereValue;
			else
				where[whereCol][whereWay] = whereValue;
		}
	}
	console.log("查询条件:", where);

	async.auto({
		count: function(cb) {
			Schemas[dbName].count(where, function(err, counts) {
				cb(err, counts);
			});
		},
		search: function(cb) {
			Schemas[dbName].all({
				where: where,
				order: sOrder,
				skip: iDisplayStart,
				limit: iDisplayLength
			}, function(err, dbs) {
				cb(err, dbs);
			});
		}
	}, function(err, results) {
		if (err)
			res.send({
				error: err
			});
		else {
			var output = {};
			output.iTotalRecords = results.count;
			output.iTotalDisplayRecords = results.count;
			output.sEcho = req.body['sEcho'];
			output.aaData = results.search;
			res.send(output);
		}

	});

}

posts.xls2all = function(req, res, next, baseurl) {

}
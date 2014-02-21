var Schemas = require('../../database/schema').Schemas;
var async = require('async');

var checkFun = {};
checkFun['accountcode'] = function(accountcode, res) {
	if (!accountcode || accountcode == '') {
		res.send({
			"info": "输入的分机号不能为空！",
			"status": "n"
		});
	} else {
		Schemas['PBXExtension'].find(accountcode, function(err, inst) {
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

exports.list = function(req, res) {

	res.render('PBXExtension/list.html', {
		username: '',
		password: '',
		exten: '',
		tip: ''
	});
}

exports.upsert = function(req, res) {
	res.render('PBXExtension/upsert.html', {
		username: '',
		password: '',
		exten: '',
		tip: ''
	});
}

exports.create = function(req, res) {
	var deviceproto = req.query['deviceproto'];
	if (!deviceproto || deviceproto == '')
		deviceproto = 'SIP';
	res.render('PBXExtension/create' + deviceproto + '.html', {
		username: '',
		password: '',
		exten: '',
		tip: ''
	});
}

exports.save = function(req, res) {
	var extenObj = {};
	extenObj.devicestring = '';
	for (var key in req.body) {
		if (/^str\_(\S+)/.test(key)) {
			console.log(RegExp.$1);
			extenObj.devicestring += RegExp.$1 + '=' + req.body[key] + '&';
		} else {
			extenObj[key] = req.body[key];
		}
	}
	extenObj.devicestring += 'secret=' + req.body['password'] + '&';
	extenObj.devicestring = extenObj.devicestring.toString().substring(0,extenObj.devicestring.length-1);

	extenObj.id = extenObj.accountcode;
	extenObj.devicenumber = extenObj.accountcode;


	Schemas['PBXExtension'].create(extenObj, function(err, inst) {
		if (err) {
			res.send({
				success: 'ERROR',
				msg: '保存数据发生异常,请联系管理员！'
			});
		} else {
			res.send({
				success: 'OK',
				msg: '保存成功'
			});
		}
	});


}

exports.checkAjax = function(req, res) {
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



exports.table = function(req, res) {
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

exports.xls2all = function(req, res) {

}
var conf = require('node-conf');
var basedir = conf.load('app').appbase;
var Schemas = require(basedir + '/database/schema').Schemas;
var async = require('async');
var logger = require(basedir + '/lib/logger').logger('web');
//var _=require('lodash');
var fs = require('fs');
var ejs = require('ejs');
var nami = require(basedir + '/asterisk/asmanager').nami,
	AsAction = require("nami").Actions;

var gets = {};
var posts = {};
module.exports = {
	get: gets,
	post: posts
};
//gt > gte >=  lt  < lte <=   inq IN nin NOT IN neq  != like  LIKE
posts.pagination = function(req, res, next) {
	logger.debug('BODY:', req.body);
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
	logger.info("排序条件:", sOrder);

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
	logger.info("查询条件:", where);

	var include = new Array();
	for (var key in Schemas[dbName].relations) {
		include.push(key);
	}
	logger.info("具有的关系:", include);

	async.auto({
		count: function(cb) {
			Schemas[dbName].count(where, function(err, counts) {
				cb(err, counts);
			});
		},
		search: function(cb) {
			logger.info('查询的数据库名称：', dbName);
			Schemas[dbName].all({
				include: include,
				where: where,
				order: sOrder,
				skip: iDisplayStart,
				limit: iDisplayLength
			}, function(err, dbs) {
				cb(err, dbs);
			});
		}
	}, function(err, results) {
		if (err) {
			logger.error(err);
			res.send({
				error: err
			});
		} else {
			var output = {};
			output.iTotalRecords = results.count;
			output.iTotalDisplayRecords = results.count;
			output.sEcho = req.body['sEcho'];
			output.aaData = [];
			for (var i = 0; i < results.search.length; i++) {
				var tempobj = {};
				for (var j = 0; j < sColumns.length; j++) {
					if (results.search[i].__cachedRelations[sColumns[j]] && results.search[i].__cachedRelations[sColumns[j]] !== null) {
						tempobj[sColumns[j]] = results.search[i].__cachedRelations[sColumns[j]];
					} else {
						tempobj[sColumns[j]] = results.search[i][sColumns[j]];
					}
				}
				output.aaData[i] = tempobj;


			}

			/*async.mapSeries(results.search, function(item,callback) {
				var newitem={};
				for(var key in item){
					logger.info(key);
					newitem[key]=item[key];
				}
				//logger.info(item.__cachedRelations['extensions']);
				newitem['extensions'] = item.__cachedRelations['extensions'];
				logger.info(newitem);
				callback(err,newitem);
			}, function(err, results) {
				output.aaData=results;
				logger.info('获取到列表数据：', output);
				res.send(output);
			});*/

			//output.aaData = results.search;
			//logger.info(results.search[0].__cachedRelations);
			logger.info('获取到列表数据：', output);
			res.send(output);
		}

	});

}

posts.sysnconfig = function(req, res, next) {
	var sysnctype = req.body.sysnctype;
	if (sysnctype === "extensync") {
		extensync(res, next);
	} else if (sysnctype === "queuesync") {
		queuesync(res, next);
	} else {
		res.send({
			success: "ERROR",
			msg: "不明确的同步类型~"
		});
	}
}

function extensync(res, next) {
	async.auto({
		getsip: function(cb) {
			Schemas.pbxExtension.all({
				where: {
					deviceproto: 'SIP'
				},
				order: "accountcode asc"
			}, function(err, dbs) {
				cb(err, dbs);
			});
		},
		getiax: function(cb) {
			Schemas.pbxExtension.all({
				where: {
					deviceproto: 'IAX2'
				},
				order: "accountcode asc"
			}, function(err, dbs) {
				cb(err, dbs);
			});
		},
		createsip: ["getsip",
			function(cb, results) {
				tplbuilder(basedir + '/Install/tpl/sip_exten.conf', results.getsip, '/etc/asterisk/sip_exten.conf', cb);
			}
		],
		createiax: ["getiax",
			function(cb, results) {
				tplbuilder(basedir + '/Install/tpl/iax_exten.conf', results.getiax, '/etc/asterisk/iax_exten.conf', cb);
			}
		],
		createhits: ['getsip', 'getiax',
			function(cb, results) {
				var tmparry = [];
				tmparry = tmparry.concat(results.getsip).concat(results.getiax);
				tmparry=[{"exts":tmparry}];
				//tmparry.push({"SIP":results.getsip}).push({"IAX2":results.getiax});
				tplbuilder(basedir + '/Install/tpl/extensions_hints.conf', tmparry, 'd:\\extensions_hints.conf', cb);
			}
		],
		reloadconf: ["createsip", "createiax",
			function(cb, results) {
				asreload(cb);
			}
		]
	}, function(err, results) {
		if (err)
			res.send({
				success: "ERROR",
				msg: "同步失败:" + err
			});

		else
			res.send({
				success: "OK",
				msg: "同步成功！"
			});
	});


}

function queuesync(res, next) {
	async.auto({
		getqueues: function(cb) {
			Schemas.pbxQueue.all({
				order: "id asc"
			}, function(err, dbs) {

				cb(err, dbs);
			});
		},
		create: ["getqueues",
			function(cb, results) {
				async.map(results.getqueues, function(item, callback) {
					var tmp = objcopy(item);
					tmp.members = item.members.split(",");
					callback(null, tmp);
				}, function(err, newdbs) {
					tplbuilder(basedir + '/Install/tpl/queues_list.conf', newdbs, '/etc/asterisk/queues_list.conf', cb);
				});

			}
		],
		reloadconf: ["create",
			function(cb, results) {
				asreload(cb);
			}
		]
	}, function(err, results) {
		if (err)
			res.send({
				success: "ERROR",
				msg: "同步失败:" + err
			});

		else
			res.send({
				success: "OK",
				msg: "同步成功！"
			});
	});
}
/*
通过模板批量生成配置到指定文件
tplfile：模板文件名称及绝对路径
datas：用于替换模板文件的数据，为对象数组
buildfile：生成的配置文件名称及绝对路径
*/

function tplbuilder(tplfile, datas, buildfile, callback) {
	async.auto({
		readtpl: function(cb) {
			fs.readFile(tplfile, function(err, data) {
				if (err) {
					cb(err, null);
				} else {
					cb(null, data.toString());
				}
			});
		},
		tpl2str: ["readtpl",
			function(cb, results) {
				var str = results.readtpl;
				var content = "";
				async.each(datas, function(item, cb1) {
					content += ejs.render(str, item);
					cb1(null);
				}, function(err) {
					cb(err, content);
				});

			}
		],
		write2file: ["tpl2str",
			function(cb, results) {
				var text = results.tpl2str;
				text = text.replace(/\r\n([\s]*\r\n)+/gi, '\r\n');
				text = text.replace(/\n([\s]*\n)+/gi, '\r\n');
				fs.writeFile(buildfile, text, 'utf8', function(err) {
					if (err)
						cb(err);
					else
						cb(null, null);
				}); //fwrite	
			}
		]

	}, function(err, results) {
		callback(err, null);
	});
}

function asreload(callback) {
	var action = new AsAction.Command();
	action.Command = 'core reload';
	nami.send(action, function(response) {
		//console.log(response);
		if (response.response == 'Success' || response.response == "Follows") {
			callback(null, response);
		} else {
			callback(response, response);
		}

	});
}

function objcopy(fromObj) {
	var toObj = {};
	for (var i in fromObj) {
		if (typeof fromObj[i] == "object") {
			toObj[i] = {};
			objcopy(fromObj[i], toObj[i]);
			continue;
		}
		toObj[i] = fromObj[i];
	}
	return toObj;
}
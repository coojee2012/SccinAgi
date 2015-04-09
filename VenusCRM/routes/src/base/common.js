var conf = require('node-conf');
var basedir = Venus.baseDir;
var Schemas = require(basedir + '/database/schema').Schemas;
var async = require('async');
var logger = require(basedir + '/lib/logger').logger('web');
//var _=require('lodash');
var fs = require('fs');
var ejs = require('ejs');
var nami = require(basedir + '/asterisk/asmanager').nami,
	AsAction = require("nami").Actions;
var comfun = require(basedir + '/lib/comfun');

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
			if ((!whereWay || whereWay == '') && whereValue !== '')
				where[whereCol] = whereValue;
			else if ((whereWay === 'between') && whereValue !== '') {
				where[whereCol][whereWay] = whereValue.split(",");
			} else if ((whereWay !== '') && whereValue !== '')
				where[whereCol][whereWay] = whereValue;
			else {

			}
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

				/*	if (results.search[i].__cachedRelations[sColumns[j]] && results.search[i].__cachedRelations[sColumns[j]] !== null) {

						tempobj[sColumns[j]] = results.search[i].__cachedRelations[sColumns[j]];
					} else {*/
						tempobj[sColumns[j]] = results.search[i][sColumns[j]];
					//}
				}
                for(var k=0;k<include.length;k++){
                    if (results.search[i].__cachedRelations[include[k]] && results.search[i].__cachedRelations[include[k]] !== null) {
                        tempobj[include[k]]= results.search[i].__cachedRelations[include[k]];
                    }else{
                        tempobj[include[k]]=null;
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
	} else if (sysnctype === "trunksync") {
		trunksync(res, next);
	} else {
		res.send({
			success: "ERROR",
			msg: "不明确的同步类型~"
		});
	}
}

gets.downsound = function(req, res, next) {
	var file = req.query.file;
	var filename = file.split('/');
	filename = filename[filename.length - 1];
	res.download(basedir + '/public/sounds/' + file, filename, function(err) {
		if (err) {
			console.log(err);
			//next(err);
			// handle error, keep in mind the response may be partially-sent
			// so check res.headerSent
			res.send("您想要的文件地址不存在！");

		} else {}
	});

}

gets.downmonitor = function(req, res, next) {
	var file = req.query.file;
	var filename = file.split('/');
	filename = filename[filename.length - 1];
	res.download(basedir + '/public/monitor/' + file, filename, function(err) {
		if (err) {
			console.log(err);
			//next(err);
			// handle error, keep in mind the response may be partially-sent
			// so check res.headerSent
			res.send("您想要的文件地址不存在！");

		} else {}
	});

}

posts.uploadify = function(req, res, next) {
	// 获得文件的临时路径
	console.log(req.files);
	var tmp_path = req.files.Filedata.path;
	var tmp_name = req.files.Filedata.path.split(/\/|\\\\|\\/);
	tmp_name = tmp_name[tmp_name.length - 1];

	var extname = tmp_name.split(".");
	tmp_name = extname[0];
	extname = extname[extname.length - 1];
	res.send({
		"tmpname": tmp_name,
		"extname": extname,
		"OriginalFileName": req.files.Filedata.originalFilename,
		"tmpdir": basedir + '/public/uploads/'
	});
	/*
   // 指定文件上传后的目录 - 示例为"images"目录。 
    var target_path = basedir+'/public/images/' + req.files.Filedata.name; 
   // 移动文件
    fs.rename(tmp_path, target_path, function(err) {
      if (err) throw err;
      // 删除临时文件夹文件, 
      fs.unlink(tmp_path, function() {
         if (err) throw err;
         res.send('File uploaded to: ' + target_path + ' - ' + req.files.Filedata.size + ' bytes');
      });
    });*/
}

posts.findprocessmode = function(req, res, next) {
	var processmode = req.body["processmode"];
	var results = {};
	if (processmode === 'blacklist') {
		results.name = "黑名单";
		results.data = [{
			id: "",
			trunkname: "全部"
		}];
		res.send(results);
	} else if (processmode === 'diallocal') {
		results.name = "拨打本地";
		results.data = [{
			id: "extension",
			trunkname: "拨打分机"
		}, {
			id: "queue",
			trunkname: "拨打队列"
		}, {
			id: "ivr",
			trunkname: "拨打IVR"
		}];
		res.send(results);
	} else {
		Schemas.pbxTrunk.all({}, function(err, dbs) {
			results.name = "拨打外线";
			results.data = dbs;
			res.send(results);
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
				tmparry = [{
					"exts": tmparry
				}];
				//tmparry.push({"SIP":results.getsip}).push({"IAX2":results.getiax});
				tplbuilder(basedir + '/Install/tpl/extensions_hints.conf', tmparry, '/etc/asterisk/extensions_hints.conf', cb);
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

function trunksync(res, next) {
	async.auto({
		siptrunks: function(cb) {
			Schemas.pbxTrunk.all({
				where: {
					trunkproto: 'SIP'
				},
				order: "cretime asc"
			}, function(err, dbs) {
				cb(err, dbs);
			});
		},
		iaxtrunks: function(cb) {
			Schemas.pbxTrunk.all({
				where: {
					trunkproto: 'IAX2'
				},
				order: "cretime asc"
			}, function(err, dbs) {
				cb(err, dbs);
			});
		},
		pritrunks: function(cb) {
			Schemas.pbxTrunk.all({
				where: {
					trunkproto: 'PRI'
				},
				order: "cretime asc"
			}, function(err, dbs) {
				cb(err, dbs);
			});
		},
		fxotrunks: function(cb) {
			Schemas.pbxTrunk.all({
				where: {
					trunkproto: 'FXO'
				},
				order: "cretime asc"
			}, function(err, dbs) {
				cb(err, dbs);
			});
		},
		createsip: ['siptrunks',
			function(cb, results) {
				async.map(results.siptrunks, function(item, callback) {
					var tmp = objcopy(item);
					tmp = comfun.str2obj(item.args, tmp);
					callback(null, tmp);
				}, function(err, newdbs) {
					tplbuilder(basedir + '/Install/tpl/sip_trunk.conf', newdbs, '/etc/asterisk/sip_trunk.conf', cb);
				});
			}
		],
		createiax: ['iaxtrunks',
			function(cb, results) {
				async.map(results.iaxtrunks, function(item, callback) {
					var tmp = objcopy(item);
					tmp = comfun.str2obj(item.args, tmp);
					callback(null, tmp);
				}, function(err, newdbs) {
					tplbuilder(basedir + '/Install/tpl/iax_trunk.conf', newdbs, '/etc/asterisk/iax_trunk.conf', cb);
				});
			}
		],
		createpri: ['pritrunks',
			function(cb, results) {
				async.map(results.pritrunks, function(item, callback) {
					var tmp = objcopy(item);
					tmp = comfun.str2obj(item.args, tmp);
					callback(null, tmp);
				}, function(err, newdbs) {
					tplbuilder(basedir + '/Install/tpl/dahdi-channels-pri.conf', newdbs, '/etc/asterisk/dahdi-channels-pri.conf', cb);
				});
			}
		],
		createfxo: ['fxotrunks',
			function(cb, results) {
				async.map(results.fxotrunks, function(item, callback) {
					var tmp = objcopy(item);
					tmp = comfun.str2obj(item.args, tmp);
					callback(null, tmp);
				}, function(err, newdbs) {
					tplbuilder(basedir + '/Install/tpl/dahdi-channels-fxs.conf', newdbs, '/etc/asterisk/dahdi-channels-fxs.conf', cb);
				});
			}
		],
		reloadconf: ["createsip", "createiax", "createpri", "createfxo",
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
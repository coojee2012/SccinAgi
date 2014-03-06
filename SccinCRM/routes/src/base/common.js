var conf = require('node-conf');
var basedir = conf.load('app').appbase;
var Schemas = require(basedir+'/database/schema').Schemas;
var async = require('async');
var logger = require(basedir+'/lib/logger').logger('web');

var gets = {};
var posts = {};
module.exports = {
  get: gets,
  post: posts
};

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
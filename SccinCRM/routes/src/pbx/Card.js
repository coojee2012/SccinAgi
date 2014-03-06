var conf = require('node-conf');
var basedir = conf.load('app').appbase;
var Schemas = require(basedir+'/database/schema').Schemas;
var logger=require(basedir+'/lib/logger').logger('web');
var guid = require('guid');
var async = require('async');

var gets = {};
var posts = {};
module.exports = {
	get: gets,
	post: posts
};

//分机列表显示
gets.index = function(req, res,next) {
	res.render('pbx/Card/list.html', {
		baseurl:req.path,
		modename: 'PBXCard'
	});
}

//保存（适用于新增和修改）
posts.save = function(req, res,next) {
	var Obj = {};
	for (var key in req.body) {
		Obj[key] = req.body[key];
	}
	async.auto({
			isHaveCheck: function(cb) {
				Schemas['PBXCard'].findOne({
					where: {
						cardname: Obj.cardname
					}
				}, function(err, inst) {
					cb(err, inst);
				});
			},
			lastLineNumber: function(cb) {
				Schemas['PBXCard'].findOne({
					order: 'line desc'
				}, function(err, inst) {
					cb(err, inst);
				});
			},
			create: ['isHaveCheck', 'lastLineNumber',
				function(cb, results) {

					if (results.isHaveCheck !== null) { //如果存在本函数什么都不做
						cb('已经存在同名的设备，无法添加。', -1);
					} else {
						var hasnum = 0;
						if (results.lastLineNumber && results.lastLineNumber != null)
							hasnum = parseInt(results.lastLineNumber.line);
						console.log('message:', hasnum);
						savedata(Obj, hasnum, function(err, results) {
							cb(err, results);
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
			if (err) {
				console.log(err);
				myjson.success = 'ERROR';
				myjson.msg = '保存数据发生异常,请联系管理员！';
			} else {
				myjson.success = 'OK';
				myjson.msg = '新增成功!';
			}
			res.send(myjson);
		});
}


posts.delete = function(req, res,next) {
	var cardname = req.body['cardname'];
	Schemas['PBXCard'].all({
		where: {
			cardname: cardname
		},
		order: 'line desc'
	}, function(err, dbs) {
		var myjson = {};
		if (err) {
			myjson.success = 'ERROR';
			myjson.msg = '查询数据发生异常,请联系管理员！';
			res.send(myjson);

		} else {
			if (!dbs || dbs.length == 0) {
				myjson.success = 'ERROR';
				myjson.msg = '没有找到需要删除的数据！';
				res.send(myjson);
			} else {

				async.auto({
					deleterows: function(cb) {
						async.each(dbs, function(item, callback) {
							item.destroy(function(err) {
								callback(err, -1);
							});
						}, function(err, results) {
							cb(err, results);
						})
					},
					updateRows: function(cb) {					
						var PBXCard=require('../../modules/src/PBXCard.js');
						logger.info(PBXCard);
						Schemas['PBXCard'].query('update `PBXCard` set `line`=`line`-'+dbs.length+' where `line`>'+dbs[0].line, function(err, result) {

							cb(err, result);
						});
					}

				}, function(err, results) {
					if (err) {
						logger.error(err);
						myjson.success = 'ERROR';
						myjson.msg = '删除数据发生异常,请联系管理员！！';
					} else {
						myjson.success = 'OK';
						myjson.msg = '删除成功！';
					}
					res.send(myjson);

				}); //end async.auto
			}

		}
		
		
	}); //find all
}

function savedata(obj, hasnum, callback) {
	var lines = [];
	var datalines = [];
	var trunkproto = obj.trunkproto;
	var needlines = parseInt(obj.lines);
	if (trunkproto === 'FXO') {
		for (var i = hasnum + 1; i <= needlines + hasnum; i++) {
			lines.push(i);
		}
	} else {
		var dataline = 16 + hasnum;
		if (obj.datalines && obj.datalines != '') {
			dataline = parseInt(obj.datalines) + hasnum;
		}
		//datalines.push(dataline);
		for (var j = hasnum + 1; j <= needlines + hasnum; j++) {
			if (j == dataline) {
				datalines.push(dataline);
				dataline += 31;
			} else {
				lines.push(j);
			}

		}
	}

	async.auto({
		addTline: function(cb) {
			addTline(obj, lines, function(err, results) {
				cb(err, results);
			});
		},
		addDline: function(cb) {
			addDline(obj, datalines, function(err, results) {
				cb(err, results);
			});
		}
	}, function(err, results) {
		callback(err, results);
	});


}

function addTline(obj, lines, callback) {
	async.each(lines, function(item, cb) {
		var newobj = {};
		newobj.line = item;
		newobj.cardname = obj.cardname;
		newobj.driver = obj.driver;
		newobj.trunkproto = obj.trunkproto;
		Schemas['PBXCard'].create(newobj, function(err, inst) {
			cb(err, inst);
		});
	}, function(err, results) {
		callback(err, results);
	});
}

function addDline(obj, datalines, callback) {
	async.each(datalines, function(item, cb) {
		var newobj = {};
		newobj.line = item;
		newobj.cardname = obj.cardname;
		newobj.driver = obj.driver;
		newobj.dataline = '是';
		newobj.trunkproto = obj.trunkproto;
		Schemas['PBXCard'].create(newobj, function(err, inst) {
			cb(err, inst);
		});
	}, function(err, results) {
		callback(err, results);
	});
}
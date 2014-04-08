var conf = require('node-conf');
var basedir = conf.load('app').appbase;
var Schemas = require(basedir + '/database/schema').Schemas;
var logger = require(basedir + '/lib/logger').logger('web');
var comfun = require(basedir + '/lib/comfun');
var guid = require('guid');
var async = require('async');

var gets = {};
var posts = {};
module.exports = {
	get: gets,
	post: posts
};


gets.index = function(req, res, next) {
	var id = req.query.id;
	var text = req.query.text;
	Schemas.pbxIvrActions.find(id, function(err, inst) {
		if (err || inst === null)
			res.send("没有能处理该动作！");
		else {
			var args = comfun.str2obj(inst.args);
			res.render('pbx/ivracts/' + text + '.html', {
				baseurl: req.path,
				id: id,
				args: args
			});
		}
	});


}

posts.getFilename = function(req, res, next) {
	var folder = req.body.folder;
	Schemas.pbxSounds.all({
		where: {
			folder: folder
		}
	}, function(err, dbs) {
		res.send(dbs);
	});
}

posts.getivrnums = function(req, res, next) {
	Schemas.pbxIvrMenmu.all({}, function(err, dbs) {
		res.send(dbs);
	});
}

posts.getivracts = function(req, res, next) {
	var ivrnum = req.body['ivrnum'];
	var include = new Array();
	for (var key in Schemas['pbxIvrActions'].relations) {
		include.push(key);
	}
	Schemas['pbxIvrActions'].all({
		include: include,
		where: {
			ivrnumber: ivrnum
		},
		order: 'ordinal ASC'
	}, function(err, inst) {
		var actionList = new Array();
		for (var i = 0; i < inst.length; i++) {
			var model = {};
			model.ordinal = inst[i].ordinal;
			model.text = inst[i].__cachedRelations.Actmode.modename;
			actionList.push(model);
		}
		res.send(actionList);
	});
}


posts.save = function(req, res, next) {
	var obj = req.body;
	var id = req.body.id;
	var str = comfun.obj2str(obj);
	Schemas.pbxIvrActions.update({
		where: {
			id: id
		},
		update: {
			args: str
		}
	}, function(err, inst) {
		res.send({
			success: 'OK',
			msg: '保存成功！'
		});
	});
}
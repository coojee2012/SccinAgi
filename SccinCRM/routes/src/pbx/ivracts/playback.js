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

gets.acts = function(req, res, next) {
	var ivrnum = req.query.ivrnum;
	res.render('pbx/ivracts/acts.html', {
		baseurl: req.path,
		ivrnum: ivrnum
	});
}
gets.inputs = function(req, res, next) {
	var ivrnum = req.query.ivrnum;
	res.render('pbx/ivracts/inputs.html', {
		baseurl: req.path,
		ivrnum: ivrnum
	});
}

gets.einputs = function(req, res, next) {
	var id = req.query.id;
	var text = req.query.text;
	Schemas.pbxIvrInputs.find(id, function(err, inst) {
		if (err || inst === null)
			res.send("没有该输入！");
		else {
			var args = comfun.str2obj(inst.generalargs);
			var text = "normal";
			if (inst.generaltype === "retry" || inst.generaltype === "timeout" || inst.generaltype === "invalidkey")
				text = inst.generaltype;
			res.render('pbx/inputs/' + text + '.html', {
				baseurl: "/pbx/ivracts/playback",
				inst: inst,
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
	var id = obj.id;
	delete obj.id;
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

posts.saveinput = function(req, res, next) {
	var obj = req.body;
	var id = obj.id;
	var gotoivrnumber = obj.gotoivrnumber;
	var gotoivractid = obj.gotoivractid;
	delete obj.id;
	delete obj.gotoivrnumber;
	delete obj.gotoivractid;

	var str = comfun.obj2str(obj) || "";
	Schemas.pbxIvrInputs.update({
		where: {
			id: id
		},
		update: {
			gotoivrnumber: gotoivrnumber,
			gotoivractid: gotoivractid,
			generalargs: str
		}
	}, function(err, inst) {
		res.send({
			success: 'OK',
			msg: '保存成功！'
		});
	});
}


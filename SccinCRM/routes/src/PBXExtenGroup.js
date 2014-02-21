var Schemas = require('../../database/schema').Schemas;
var async = require('async');
//分机列表显示
exports.list = function(req, res) {

	res.render('PBXExtenGroup/list.html', {
		username: '',
		password: '',
		exten: '',
		tip: ''
	});
}
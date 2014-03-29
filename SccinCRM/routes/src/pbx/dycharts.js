var conf = require('node-conf');
var basedir = conf.load('app').appbase;
var Schemas = require(basedir + '/database/schema').Schemas;
var logger = require(basedir + '/lib/logger').logger('web');
var guid = require('guid');
var async = require('async');

var gets = {};
var posts = {};
module.exports = {
	get: gets,
	post: posts
};

gets.dycharts = function(req, res, next) {
	res.render('pbx/dycharts/dychart.html', {
		layout: 'highstock.html'
	});
}
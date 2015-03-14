var conf = require('node-conf');
var basedir = conf.load('app').appbase;

var Schemas = require(basedir+'/database/schema').Schemas;
var logger = require(basedir+'/lib/logger').logger('web');
var async = require('async');
var crypto = require('crypto');
var _ = require('lodash');

var gets = {};
var posts = {};
gets.index = function(req, res, next) {
	req.session.destroy(function(err) {
		if (err)
			next(err);
		else {
			res.redirect('/login');
		}
	});
}

module.exports = {
	get: gets,
	post: posts
};
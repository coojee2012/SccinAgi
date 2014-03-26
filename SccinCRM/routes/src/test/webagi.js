var conf = require('node-conf');
var basedir = conf.load('app').appbase;
var Schemas = require(basedir+'/database/schema').Schemas;
var guid = require('guid');
var async = require('async');
var gets = {};
var posts = {};
module.exports = {
	get: gets,
	post: posts
};
gets.index = function(req, res) {
	res.send('测试GET');
}
posts.index=function(req,res){
	var a=req.body['a']||'10010';
res.send("status=done&kosm="+a);
}
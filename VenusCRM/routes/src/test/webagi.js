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
	console.error("访问到了这里！");
	res.send({success:true,expertid:"12345678",projectid:"1cf4431a-2fde-4227-8559-c0d595dab7e6",status:1});
}
posts.index=function(req,res){
	var a=req.body['a']||'10010';
res.send({success:true,expertid:"12345678",projectid:"1cf4431a-2fde-4227-8559-c0d595dab7e6",status:1});
}
exports.get = function(req, res){

	res.render('login.html',{layout:false,username:'',password:'',exten:'',tip:''});
}

exports.post = function(req, res){
	var username=req.body['username'] || '';
	var password=req.body['password'] || '';
	var exten=req.body['exten'] || '';
	var Schemas = require('../../database/schema').Schemas;
	
	res.render('login.html',{layout:false,username:username,password:'',exten:exten,tip:''});
}
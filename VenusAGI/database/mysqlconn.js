var mysql=require('mysql');
var conf = require('node-conf');
var mysqlconf= require('../config/mysql.json');//conf.load('mysql');

var connection=mysql.createConnection(mysqlconf);
    connection.connect(function(err){
    	if(err){
    		console.log('数据库连接失败！',err);
    	}else{
    		console.log("数据库连接成功！");
    	}
    });

 

    exports.connection=connection;
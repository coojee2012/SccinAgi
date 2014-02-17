
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes/build');
var user = require('./routes/build/user');
var http = require('http');
var path = require('path');
var conf = require('node-conf');
var log4js = require('log4js');
var nami=require(__dirname+'/asterisk/asmanager').nami;
var conn=require(__dirname+'/database/mysqlconn').connection;
var Schemas = require(__dirname+'/database/schema').Schemas;
var logconf=conf.load('log4js');
log4js.configure(logconf);

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.cookieParser('your secret here'));
app.use(express.session());
app.use(app.router);
app.use(require('stylus').middleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}


app.use(logErrors);
app.use(clientErrorHandler);
app.use(errorHandler);


//通常logErrors用来纪录诸如stderr, loggly, 或者类似服务的错误信息：

function logErrors(err, req, res, next) {
  console.error(err.stack);
  next(err);
}

//clientErrorHandler 定义如下，注意错误非常明确的向后传递了。

function clientErrorHandler(err, req, res, next) {
  if (req.xhr) {
    res.send(500, { error: 'Something blew up!' });
  } else {
    next(err);
  }
}

//下面的errorHandler "捕获所有" 的异常， 定义为:

function errorHandler(err, req, res, next) {
  res.status(500);
  res.render('error', { error: err });
}

var routings = require(__dirname + '/routes/build/routing.js');
for (var i in routings) {
	for (var r in routings[i]) {
		var pf = require(__dirname + routings[i][r].file)[routings[i][r].fn];
		if (routings[i][r].method == 'get') {
			//console.log(routings[i][r].urlreg,pf);
			app.get(routings[i][r].urlreg, pf);
		} else if (routings[i][r].method == 'post')
			app.post(routings[i][r].urlreg, pf);
		else
			app.all(routings[i][r].urlreg, pf);
	}

}

var count=0;
var server=http.createServer(app).listen(app.get('port'), function(){
  console.log('成功启动四川建设网语音拨打服务: ' + app.get('port'));
});

server.maxHeadersCount=0;

server.on('connection',function(){
count++;
 console.log('当前有效连接: ' + count);
});

server.on('error',function(error){
 console.log('发生错误: ', error);
});



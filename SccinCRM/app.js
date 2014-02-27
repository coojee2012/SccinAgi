/**
 * 模块依赖.
 */

var express = require('express');
var partials = require('express-partials');
var routes = require('./routes/build');
var user = require('./routes/build/user');
var http = require('http');
var path = require('path');
var conf = require('node-conf');
var nami = require(__dirname + '/asterisk/asmanager').nami;
var conn = require(__dirname + '/database/mysqlconn').connection;
var Schemas = require(__dirname + '/database/schema').Schemas;
var appconf = conf.load('app');
var SRCFILE = appconf.debug ? 'src' : 'build';

var logger = require('./lib/logger').logger('web');


var app = express();
// 所有环境设置
app.set('port', process.env.PORT || appconf.hostport);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.engine('html', require('ejs').renderFile);


app.use(partials());
app.use(express.favicon());
//app.use(express.logger('web'));
app.use(express.bodyParser({
  uploadDir: './uploads'
}));

app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.cookieParser('your secret here'));
app.use(express.session());

app.use(require('stylus').middleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));


// 开发环境配置
if ('development' == app.get('env')) {
  //app.use(express.errorHandler({ showStack: true, dumpExceptions: true }));
}

// 生产环境配置
if ('production' == app.get('env')) {

}


//记录长时间没有返回结果的访问
app.use(function(req, res, next) {
  setTimeout(function() {
    if (!res.finished) {
      res.end();
      logger.error('访问%s超时，访问方式：%s。', req.url, req.method);
    }
  }, 10000);
  next();
});



//路由处理
app.use(app.router);

var routings = require(__dirname + '/routes/' + SRCFILE + '/routing.js');
for (var i in routings) {
  for (var r in routings[i]) {
    var pf = require(__dirname + '/routes/' + SRCFILE + routings[i][r].file)[routings[i][r].fn];
    if (routings[i][r].method == 'get') {
      app.get(routings[i][r].urlreg, pf);
    } else if (routings[i][r].method == 'post')
      app.post(routings[i][r].urlreg, pf);
    else
      app.all(routings[i][r].urlreg, pf);
  }

}

//错误及异常处理
app.use(logErrors);
app.use(clientErrorHandler);
app.use(errorHandler);


app.locals({
  title: appconf.appname,
  phone: appconf.phone,
  email: appconf.email
});


var count = 0;
var server = http.createServer(app).listen(app.get('port'), function() {
  console.log('成功启动四川建设网语音拨打服务: ' + app.get('port'));
});

server.maxHeadersCount = 0;

server.on('connection', function() {
  count++;
  console.log('当前有效连接: ' + count);
});

server.on('error', function(error) {
  console.log('发生错误: ', error);
});


//通常logErrors用来纪录诸如stderr, loggly, 或者类似服务的错误信息：

function logErrors(err, req, res, next) {
  logger.error(err.stack);
  next(err);
}

//clientErrorHandler 定义如下，注意错误非常明确的向后传递了。

function clientErrorHandler(err, req, res, next) {
  logger.error(err);
  if (req.xhr) {
    res.send(500, {
      error: '服务器发生异常!'
    });
  } else {
    next(err);
  }
}

//下面的errorHandler "捕获所有" 的异常， 定义为:

function errorHandler(err, req, res, next) {
  logger.error(err);
  res.status(500);
  res.render('error', {
    error: err
  });
}
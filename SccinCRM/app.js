/**
 * 模块依赖.
 */
var cluster = require('cluster');
var express = require('express');
var partials = require('express-partials');
var routes = require('./routes/build');
var user = require('./routes/build/user');
var http = require('http');
var path = require('path');
var conf = require('node-conf');
var nami = require(__dirname + '/asterisk/asmanager').nami;
var domainMiddleware = require('domain-middleware');

var JugglingStore = require('connect-jugglingdb')(express);
var schema = require('./database/jdmysql').schema;
var Schemas = require(__dirname + '/database/schema').Schemas;


var appconf = conf.load('app');
var SRCFILE = appconf.debug ? 'src' : 'build';

var logger = require('./lib/logger').logger('web');
var log4js = require('./lib/logger').log4js;


var server = http.createServer();
var app = express();
// 所有环境设置
app.set('port', process.env.PORT || appconf.hostport);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.set('env', appconf.env);


app.engine('html', require('ejs').renderFile);


app.use(partials());
app.use(express.favicon());
//app.use(express.logger('web'));
app.use(log4js.connectLogger(logger, {
  level: log4js.levels.DEBUG,
  format: ':method :url'
}));
app.use(express.bodyParser({
  uploadDir: './uploads'
}));
app.use(require('stylus').middleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

app.use(domainMiddleware({
  server: server,
  killTimeout: 3000,
}));

app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.cookieParser());

app.use(express.session({
  secret: 'keyboard cat',
  store: new JugglingStore(schema, {
    table: 'sessions', // 存session的表名
    maxAge: 1000 * 60 * 60 * 24 * 14 // 默认持续时间：毫秒
  })
}));

/*schema.autoupdate(function(err) {
  if (err) console.error(err);
});*/


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

// 开发环境配置
if ('development' == app.get('env')) {
  logger.info("当前运行于开发环境！");

  app.use(express.errorHandler({
    showStack: true,
    dumpExceptions: true
  }));

}

// 生产环境配置
if ('production' == app.get('env')) {

}

app.use(authentication);

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


server.on('request', app);
server.maxHeadersCount = 0;
server.on('connection', function() {
  count++;
  logger.debug('当前有效连接: ' + count);
});
server.on('error', function(error) {
  logger.error('发生错误: ', error);
});


if (!module.parent) {
server.listen(app.get('port'), function() {
    logger.info('成功启动四川建设网语音拨打服务: ' + app.get('port'));
  })
}

module.exports = server;


process.on('uncaughtException', function(err) {
  logger.error(err);
});



//通常logErrors用来纪录诸如stderr, loggly, 或者类似服务的错误信息：

function logErrors(err, req, res, next) {
  logger.error(err.stack);
  next(err);
}

//clientErrorHandler 定义如下，注意错误非常明确的向后传递了。

function clientErrorHandler(err, req, res, next) {
  //logger.error(err);
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
  //logger.error(err);
  res.status(500);
  res.render('error.html', {
    error: err
  });
}

function authentication(req, res, next) {
  logger.debug(req.url);
  if (!req.session.user && req.url !== '/login') {
    logger.error('session验证失败！')
    req.session.error = '请先登陆';
    return res.redirect('/login');
  }
  next();
}

function notAuthentication(req, res, next) {
  if (req.session.user) {
    req.session.error = '已登陆';
    return res.redirect('/');
  }
  next();
}
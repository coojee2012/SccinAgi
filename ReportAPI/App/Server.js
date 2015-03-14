/**
 * Created by LinYong on 2015-01-16.
 * 一个基于用nodejs编写，采用expressjs框架的http服务器
 * 它是一个稳定的，高效的，健壮的web服务器
 */
'use strict';


var fs = require('fs'),
    path = require('path'),
    util = require('util'),
    http = require('http'),
    domain = require('domain'),
    express = require('express'),
    Q = require('q'),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    session = require('express-session'),
    serverDm = domain.create(),
    log4js = require('log4js'),
    mssqlq = require('mssql-q'),
    format = require('date-format'),
    processPath = path.dirname(process.argv[1]);

//初始化日志记录方式
serverDm.on('error', function (error) {
    delete error.domain;
    console.error("应用程序发生异常：" , error.stack);
});
serverDm.run(function () {
function Server(config) {
    this.conf = config || {
        dir: __dirname + '/logs/',
        port: 18081
    };
    this.connects = 0;
    this.server = null;
    this.app = null;
    this.ready = false;
    this.logger = null;
    this.db = null;
    this.logDiv = "";
    this.init();
};

Server.prototype.CreateServer = function () {
    var self = this;
    var server = http.createServer();

    server.on('request', self.app);
    server.maxHeadersCount = 0;
    server.timeout = 300000;//3秒
    server.on('error', function (error) {
        self.log('服务发生严重错误: ' + error, 'error');
    });
    server.on('close', function () {
        self.log('服务关闭! ', 'info');
        serverDm.exit();
    });
    server.on('timeout', function (socket) {
        socket.destroy();
        self.log('Connection TimeOut!', 'error');
    });
    self.server = server;
}

Server.prototype.CreateApp = function () {
    var self = this;
    var timeout = require('connect-timeout');
    var morgan = require('morgan');
    var app = express();
    // create a write stream (in append mode)
    var accessLogStream = fs.createWriteStream(__dirname + '/logs/access.log', {flags: 'a'})


    app.set('port', self.conf.port || process.env.PORT);
    app.set('views', __dirname + '/views');
    app.set('view engine', 'ejs');
    app.engine('html', require('ejs').renderFile);

    app.use(session({
        saveUninitialized: true,
        resave: true,
        secret: 'say web cat!'
    }));


    app.use(bodyParser.urlencoded({
        extended: true
    }));
    app.use(bodyParser.json());
    app.use(methodOverride());

    app.use(express.static(__dirname + '/public'));
    app.use(timeout(30000));
    app.use(morgan('combined', {stream: accessLogStream}));
    var router = express.Router();
    router.all('*', function (req, res, next) {
        var path = req.path.toLowerCase().replace(/^\//, "").split("/");
        var fileName = path[0] || 'index';
        var fnName = path[1] || 'index';
        console.log("fileName:", fileName, ",fnName:", fnName);
        var file = __dirname + '/router/' + fileName + '.js';
        fs.exists(file, function (exists) {
            if (exists) {
                var router = require(file);
                //req.method === 'POST'
                if (typeof(router[fnName]) === 'function') {
                    router[fnName](req, res, next, self.db, self.logger);
                } else {
                    next("访问的API不存在:" + fnName);
                }
            } else {
                next("访问的文件不存在:" + file);
            }
        });
    });

    //用于捕获异常
    app.use(function (req, res, next) {
        var d = domain.create();
        d.on('error', function(err) {
            next(err);
        });
        //d.add(req);
        //d.add(res);
        d.run(function() {
            next();
        });
    });

    app.use(function(req,res,next){
       res.setHeader("Access-Control-Allow-Origin","*");
        next();
    });

    app.use(router);
    app.use(function(req, res, next){
        if (req.timedout) {
           next('请求超时!');
        };
    });
    //clientErrorHandler：处理XHR请求错误的反馈。注意其他错误非常明确的向后传递了。

    function clientErrorHandler(err, req, res, next) {
        if (req.xhr) {
            self.log(err, 'error');
            res.send(500, {
                error: 'xhr请求发生异常：' + (err.stack || util.inspect(err))
            });
        } else {
            next(err);
        }
    }

//下面的errorHandler "捕获所有" 的异常， 定义为:

    function errorHandler(err, req, res, next) {
        self.log(err, 'error');
        res.status(500);
        res.render('error.html', {
            error:err.stack || util.inspect(err)
        });
    }

    app.use(clientErrorHandler);
    app.use(errorHandler);


    self.app = app;
}

Server.prototype.init = function () {
    var self = this;
    var dbconfig = {
        user: self.conf.dbUser || 'sa',
        password: self.conf.dbPass || '123456Aa',
        server: self.conf.dbServer || '192.168.7.234', // You can use 'localhost\\instance' to connect to named instance
        database: self.conf.dbName || 'bjexpert',
        connectionTimeout: 3000,
        requestTimeout: 15000,
        options: {
            //encrypt: true // Use this if you're on Windows Azure
        }
    };
    self.db = new mssqlq(dbconfig);

    log4js.configure({
        "appenders": [
            {
                "type": "dateFile",
                "category": 'date',
                "filename": self.conf.dir + "/restApi.log",
                "pattern": "-yyyy-MM-dd.log",
                "alwaysIncludePattern": true
            }
        ],
        replaceConsole: false
    });
    self.logger = log4js.getLogger('date');
    self.logger.setLevel('DEBUG');
    self.CreateApp();
    self.CreateServer();

    self.ready = true;

}
Server.prototype.start = function (callback) {
    var self = this;


        if (!self.ready) {
            Q.delay(1000).then(function () {
                self.start();
            });
        } else {
            self.server.listen(self.app.get('port'), function (err) {
                if (err) {

                    self.log('服务启动失败！原因： ' + err, 'error');
                } else {
                    self.logger.info('服务启动成功！监听端口： ' + self.app.get('port'));
                    self.log('程序根目录: ' + process.cwd(), 'info');
                    self.log('服务启动成功！监听端口： ' + self.app.get('port'), 'info');
                }
                if (typeof(callback) === 'function') {
                    callback(err);
                }

            });
        }


}
Server.prototype.stop = function (callback) {
    var self = this;
    self.server.close(callback);
}
Server.prototype.log = function (str, logType) {
    var self = this;
    if (!logType) {
        logType = 'debug';
    }
    self.logger[logType](str);
    str = "[" + format('yyyy-MM-dd hh:mm:ss.SSS', new Date()) + "] [" + logType.toUpperCase() + "] " + str + "\r\n</br>";
    if (!typeof(window) == "undefined" && window) {
        window.$("#log").append(str);
    }
}


function handler(req, res) {
    var app = CreateApp();
    app(req, res);
}

if (!module.parent) {
    var myServer = new Server({
        dir: __dirname + '/logs/',
        port: 18081,
        dbName: 'BjexpertDW'
    });
    myServer.start();
}
module.exports = Server;
//httpServer.start();
});
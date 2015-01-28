/**
 * Created by LinYong on 2015-01-16.
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


Server.prototype.CreateServer = function () {
    var self = this;
    var server = http.createServer();

    server.on('request', self.app);
    server.maxHeadersCount = 0;
    server.timeout = 30000;//3秒
    server.on('error', function (error) {
        self.log('REST API服务发生严重错误: ', 'error');
    });
    server.on('close', function () {
        self.log('REST API服务关闭! ', 'error');
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
    var app = express();
    app.set('port', self.conf.port || process.env.PORT);
    app.use(session({
        secret: 'say web cat!'
    }));

    app.use(bodyParser.urlencoded({
        extended: true
    }));
    app.use(bodyParser.json());
    app.use(methodOverride());
    app.use(express.static('./public'));
    app.use(function (req, res, next) {
        try {
            var path = req.path.toLowerCase().replace(/^\//, "").split("/");
            var fileName = path[0] || 'index';
            var fnName = path[1] || 'index';

            var router = require('./router/' + fileName + '.js');
            //req.method === 'POST'
            if (typeof(router[fnName]) === 'function') {
                router[fnName](req, res, next, self.db, self.logger);
            } else {
                throw new Error("访问的API不存在！");
            }
        } catch (err) {
            res.send({success: "false", error: err});
        }
    });
    self.app = app;
}


function Server(config) {
    this.conf = config || {};
    this.connects = 0;
    this.server = null;
    this.app = null;
    // this.port = conf.port || 18081;
    // this.dir = conf.dir || "D:\\RestApiLogs\\";
    this.ready = false;
    this.logger = null;
    this.db = null;
    this.logDiv =
        // this.dbServer = conf.dbServer;
        //this.dbPort = conf.dbPort;
        // this.dbUser = conf.dbUser;
        // this.dbPass = conf.dbPass;
        // this.dbName = conf.dbName;

        this.init();
};

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
                "filename": self.conf.dir + "\\restApi.log",
                "pattern": "-yyyy-MM-dd",
                "alwaysIncludePattern": true
            }
        ],
        replaceConsole: true
    });
    self.logger = log4js.getLogger('date');
    self.logger.setLevel('DEBUG');
    self.CreateApp();
    self.CreateServer();

    self.ready = true;

    serverDm.on('error', function (error) {
        delete error.domain;
        self.log("应用程序发生异常：" + error, 'error');
    });

}

Server.prototype.start = function (callback) {
    var self = this;
    serverDm.run(function () {
        if (!self.ready) {
            Q.delay(1000).then(function () {
                self.start();
            });
        } else {
            self.server.listen(self.app.get('port'), function (err) {
                if (err) {
                    self.log('REST API启动失败！原因： ' + err, 'error');
                } else {
                    self.log('Current directory: ' + process.cwd(), 'error');
                    self.log('REST API启动成功！监听端口： ' + self.app.get('port'), 'error');
                    if (typeof(callback) === 'function') {
                        callback();
                    }

                }


            });
        }

    });
}
Server.prototype.stop = function (callback) {
    var self = this;
    self.server.close(callback);
}

function handler(req, res) {
    var app = CreateApp();
    app(req, res);
}

Server.prototype.log = function (str, logType) {
    var self = this;
    if(!logType){
        logType='debug';
    }
    self.logger[logType](str);
    str = "[" + format('yyyy-MM-dd hh:mm:ss.SSS', new Date()) + "] [" + logType.toUpperCase() + "] " + str + "\r\n</br>";
    window.$("#log").append(str);
}

module.exports = Server;
//httpServer.start();
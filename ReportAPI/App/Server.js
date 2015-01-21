/**
 * Created by LinYong on 2015-01-16.
 */
'use strict';


var httpServer = (function () {
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
        processPath = path.dirname(process.argv[1]);


    //初始化日志记录方式


    serverDm.on('error', function (error) {
        delete error.domain;
        log("应用程序发生异常：" + error);
    });

    var appConf = {
        port: 18082,
        dir: "D:\\RestApiLogs\\"
    };


    var initConfig = function (db) {
        var deferred = Q.defer();
        // Create table and insert one line
        window.console.log('11111');
        Q.fcall(function(){
            db.transaction(function (tx) {
                tx.executeSql('DROP TABLE IF  EXISTS config');
                tx.executeSql('CREATE TABLE IF NOT EXISTS config (id unique, listenPort,logDir)');
            });
        }).then(function(){
            db.transaction(function (tx) {
                tx.executeSql('SELECT * FROM config', [], function (tx, results, error) {
                    if (error) {
                        deferred.reject(error.toString().red);
                    } else {
                        console.log(results.rows);
                        var len = results.rows.length, i;
                        if (len < 1) {
                            tx.executeSql('INSERT INTO config (id, listenPort,logDir) VALUES (1, "18081","D:\\Bjexpert\\")',function(){
                                return initConfig(db);
                            });

                        } else {
                            window.console.log('222222');
                            deferred.resolve(results.rows.item(0));
                        }
                    }
                });
            });
        });


        return deferred.promise;
    }


    function CreateServer(logger) {
        var server = http.createServer();

        server.on('request', handler);
        server.maxHeadersCount = 0;
        server.timeout = 10000;//3秒
        server.on('error', function (error) {
            log('REST API服务发生严重错误: ' + error,logger.error);
        });
        server.on('close', function () {
            log('REST API服务关闭! ',logger.error);
            serverDm.exit();
        });
        server.on('timeout', function (socket) {
            socket.destroy();
            log('Connection TimeOut!',logger.error);
        });
        return server;
    }

    function CreateApp(logger) {
        var app = express();
        app.set('port', appConf.port || process.env.PORT);
//app.set('views', path.join(__dirname, 'app/dist'));
//app.set('view engine', 'ejs');
//app.set('env', "development" || YuanCRM.conf.appConf.env);
// app.engine('html', require('ejs').renderFile);
//app.use(bodyParser());
        app.use(session({
            secret: 'say web cat!'
        }));

        app.use(bodyParser.urlencoded({
            extended: true
        }));
        app.use(bodyParser.json());

        app.use(methodOverride());

        app.use(function (req, res, next) {

            res.send("aaaaa");
        });
        return app;
    }


    function Server() {
        this.connects = 0;
        this.server = null;
        this.app = null;
        this.db = openDatabase('mydb', '1.0', 'my first database', 2 * 1024 * 1024);
        this.port = 18081;
        this.dir = "D:\\RestApiLogs\\";
        this.ready = false;
        this.logger = null;
        this.init();

    };

    Server.prototype.init = function (callback) {
        var self = this;
        initConfig(self.db).then(function (data) {
            self.port = data.listenPort;
            self.dir = data.logDir;
            window.console.log('11111');
        }).then(function () {
            if (!fs.existsSync(self.dir)) {
                fs.mkdirSync(self.dir);
            }
            console.log(2);
        }).then(function () {
            log4js.configure({
                "appenders": [
                    {
                        "type": "dateFile",
                        "category": 'date',
                        "filename": appConf.dir + "\\restApi.log",
                        "pattern": "-yyyy-MM-dd",
                        "alwaysIncludePattern": true
                    }
                ],
                replaceConsole: true
            });
            self.logger = log4js.getLogger('date');
            self.logger.setLevel('DEBUG');
            console.log(3);
        }).then(function(){
            self.server = CreateServer( self.logger);
            self.app = CreateApp(self.logger);
        }).then(function(){
            self.ready=true;
        }).then(function(){
           // self.start();
        }).catch(function(err){
            console.log(err);
        });


    }

    Server.prototype.start = function (callback) {
        var self = this;
        serverDm.run(function () {
            if(!self.ready){
                Q.delay(1000).then(function(){
                    self.start();
                });
            }else{
                self.server.listen(self.app.get('port'), function (err) {
                    if (err) {
                        log('REST API启动失败！原因： ' + err,self.logger.error);
                    } else {
                        log('Current directory: ' + process.cwd(),self.logger.error);
                        log('REST API启动成功！监听端口： ' + self.app.get('port'),self.logger.error);
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

    function log(str, logger) {
        logger(str);
        str = now() + " " + str + "\r\n</br>";
        window.$("#log").prepend(str);

    }

    function now() {
        var now = new Date()
        var dateStr = now.getFullYear() + "-" + (now.getMonth() + 1) + "-" + now.getDate() + " " + now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds();
        return dateStr;
    }

    return new Server();


})();

//httpServer.start();
/**
 * Created by LinYong on 2015-01-16.
 */
var httpServer=(function() {
    var fs = require('fs'),
        path = require('path'),
        util = require('util'),
        http = require('http'),
        domain = require('domain'),
        express = require('express'),

        bodyParser = require('body-parser'),
        methodOverride = require('method-override'),
        session = require('express-session'),
        serverDm = domain.create(),

        processPath = path.dirname(process.argv[1]);


    serverDm.on('error', function (error) {
        delete error.domain;
        log("应用程序发生异常：" + error);
    });

    var server = http.createServer();
    server.on('request', handler);
    server.maxHeadersCount = 0;
    server.timeout=10000;//3秒
    server.on('error', function (error) {
        log('REST API服务发生严重错误: ' + error);
    });
    server.on('close', function () {
        log('REST API服务关闭! ');
         serverDm.exit();
    });
    server.on('timeout',function(socket){
        socket.destroy();
        log('Connection TimeOut!');
    });

    var app=express();
    app.set('port', 18081 ||  process.env.PORT);
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
    function Server(){
        this.connects=0;
    };
    Server.prototype.start = function (callback) {
        var self=this;
        serverDm.run(function () {
            server.listen(app.get('port'), function (err) {
                if(err){
                    log('REST API启动失败！原因： '+err);
                }else{
                    log('REST API启动成功！监听端口： '+app.get('port'));
                    if(typeof(callback)==='function') {
                        callback();
                    }

                }


            });
        });
    }
    Server.prototype.stop = function (callback) {
        server.close(callback);
    }

    function handler(req, res) {
        app(req,res);
    }

    function log(str) {
        str = ">" + str + "\r\n</br>";
        window.$("#log").append(str);
    }
    return new Server();

})();


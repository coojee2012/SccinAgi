/**
 * Created by LinYong on 2015-01-16.
 */
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
    log("应用程序发生异常："+error);
});

var server=http.createServer();
server.on('request', handler);
server.maxHeadersCount = 0;
server.on('error', function (error) {
    log('WEB服务发生严重错误: '+ error);
});
server.on('close', function () {
    log('WEB服务关闭! ');
});

var domainRun={};

domainRun.start=function(){
    serverDm.run(function(){
        server.listen(80,function(){
           log('REST API启动成功！ ');
        });
    });
}
domainRun.stop=function(){
    server.close();
    serverDm.exit();
}

function handler(req,res){

}

function log(str){
    str=">"+str+"</br>";
    window.$("#log").append(str);
}
exports.domainRun=domainRun;


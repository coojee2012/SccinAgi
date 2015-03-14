/**
 * Created by LinYong on 2015-01-21.
 */
'use strict';
var Q = require('q');
var fs = require('fs');
var a = function () {
    var deferred = Q.defer();
    fs.readdir("c:\\", function (err, data) {
        if (err)
            deferred.reject(err);
        else
            deferred.resolve(data);
    })
    return deferred.promise;
}

var b = function (file) {
    var deferred = Q.defer();
    setTimeout(function(){
        deferred.resolve("时间处理接触！");
    },3000);
    return deferred.promise;


}

a().then(function (data) {
    console.log(data);
    return 222222222;
}).then(b).catch(function (err) {
    console.log(err);
    return 3;
}).finally(function (err, data) {
    console.log("finnally,err:" + err + ",data:" + data);




});

function c(){
    var deferred = Q.defer();
    setTimeout(function(){
        deferred.reject("决绝！");
    },1000);
    return deferred.promise;
}

Q.all([a(),b(444)]).spread(function(a,b){
    console.log("aaaaa"+a+b);
}).done(function(){
    console.log("all done");
});

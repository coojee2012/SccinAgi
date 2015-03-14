/**
 * Created by LinYong on 2015-01-21.
 */
var sqlHelper=require('mssql-q');

var config = {
 user: 'sa',
 password: '123456Aa',
 server: '192.168.7.234', // You can use 'localhost\\instance' to connect to named instance
 database: 'bjexpert',
 connectionTimeout: 3000,
 requestTimeout: 15000,
 options: {
 //encrypt: true // Use this if you're on Windows Azure
 }
 }


 var helper = new sqlHelper(config);

for(var i=0;i<10;i++){
    helper.DataQuery("SELECT TOP 2 * FROM SyncOutToIn ORDER BY CreateTime DESC").then(function (data) {
        console.log("获取到的数据结果:", data);
    }, function (err) {
        throw err;
    }).catch(function (err) {
        console.log("err:", err);
    }).finally(function () {
        //process.exit(0);
    });
}




/*q.delay(1000).then(function (data) {
 return helper.DataQuery("SELECT TOP 2 * FROM SyncOutToIn ORDER BY CreateTime DESC");
 }).then(function (data) {
 console.log("获取到的数据结果:", data);
 }, function (err) {
 throw err;
 }).catch(function (err) {
 console.log("err:", err);
 }).finally(function () {
 process.exit(0);
 });*/



/*helper.connect().then(function (data) {
 console.log("data:" + data);
 return helper.DataQuery("SELECT TOP 2 * FROM SyncOutToIn ORDER BY CreateTime DESC");
 }, function (err) {
 console.log("ERROR:", err);
 throw err;
 }).then(function (data) {
 console.log("获取到的数据结果:", data);
 }, function (err) {
 throw err;
 }).catch(function (err) {
 console.log("err:", err);
 }).finally(function () {
 process.exit(0);
 });*/
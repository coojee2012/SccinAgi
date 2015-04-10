var Connection = require('tedious').Connection;
var Request = require('tedious').Request;
var async = require('async');
var EventEmitter = require('events').EventEmitter;
var util = require("util");
/*
var config = {
  server: '192.168.1.2',
  userName: 'sa',
  password: 'sa'

  ,
  options: {
    debug: {
      packet: true,
      data: true,
      payload: true,
      token: false,
      log: true
    },
    tdsVersion: '7_1',
    database: 'hbposv7'
  }

};
**/


var sql2000 = function(conf) {
  EventEmitter.call(this);
  this.config = conf;
  this.connected = false;
  this.connection = null;
  this.connect(function(msg) {
    console.log('message:',msg);
  });
}

util.inherits(sql2000, EventEmitter);
module.exports = sql2000;

sql2000.prototype.connect = function(callback) {
  var self = this;
  self.connection = new Connection(self.config);
  self.connection.on('connect', function(err) {

    if (err) {
      console.log('连接发生错误：', err);
      callback(err);
    } else {
      self.connected = true;
      request('select top 2 * from  t_rm_vip_info', function(err, dbs) {
        console.log('我的执行结果1', dbs);
      });
      callback('连接成功！');
    }

    //executeStatement();

  });
  self.connection.on('end', function() {
    console.log('Connection closed');
    self.connected = false;
  });
  self.connection.on('debug', function(text) {
    //console.log(text);
  });

}


sql2000.prototype.query = function(sql, callback) {
  var self = this;


  // In SQL Server 2000 you may need: connection.execSqlBatch(request);
  //connection.execSql(request);
  //connection.execSqlBatch(request);
  if (self.connection == null) {
    console.log('还没有连接！');
    self.connect(function() {
      self.connection.execSql(request(sql, callback));
    });
  } else {
    console.log('有连接！');
    self.connection.execSql(request(sql, callback));
  }



}


function request(sql, callback) {
  var results = [];
  //var sql="select top 2 * from  t_rm_vip_info";
  var request = new Request(sql, function(err, rowCount) {
    if (err) {
      console.log(err);
      callback(err, null);
    } else {
      console.log(rowCount + ' rows');
    }

    //self.connection.close();
  });

  request.on('row', function(columns) {
    var row = {};
    columns.forEach(function(column) {
      if (column.value === null) {
        console.log('NULL');
        row[column.metadata.colName] = "";

      } else {
        row[column.metadata.colName] = column.value;
        console.log(column.metadata.colName);
        console.log(column.value);

      }
    });
    results.push(row);
  });

  request.on('done', function(rowCount, more) {
    console.log(rowCount + ' rows returned');
    callback(null, results);
  });
  return request;
}
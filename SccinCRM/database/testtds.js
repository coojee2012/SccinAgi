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


var sql2000 = function(config1) {
  EventEmitter.call(this);
  var config = config1;
  var connected = false;
  var connection = null;
  async.auto({
    connect:function(cb){connect(config,cb);}

  },function(err,resluts){
    var self=this;
    self.connection=resluts;

  });
  //this.connect();
} 

util.inherits(sql2000, EventEmitter);
module.exports=sql2000;

//sql2000.prototype.connect = 

function connect(config,callback) {
  //var self = this;
  var connection = new Connection(config);
  connection.on('connect', function(err) {
    console.log(err);
    
    //self.connected = true;
    callback(null,connection)
    //executeStatement();

  });
  connection.on('end', function() {
    console.log('Connection closed');
    //self.connected = false;
  });
   connection.on('debug', function(text) {
    //console.log(text);
  });

}


sql2000.prototype.query=function(sql, callback) {
  var self = this;
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

  // In SQL Server 2000 you may need: connection.execSqlBatch(request);
  //connection.execSql(request);
  self.connection.execSqlBatch(request);
}



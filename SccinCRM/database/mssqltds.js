var Connection = require('tedious').Connection;
var Request = require('tedious').Request;
var async = require('async');
var MSSQL = function(config) {
  this.config = config;
  this.connected = false;
  this.connection = null;
  this.connect();
};

MSSQL.prototype.connect = function(callback) {
  var self = this;
  console.log('message');
   var connection = new Connection(self.config);

      connection.on('connect', function(err) {
        callback(err,connection);
      });
      connection.on('end', end);
      connection.on('debug', debug); 
}

MSSQL.prototype.exec = function(sql,callback) {
  var self = this;
  sql = sql.toString();
  request = new Request(sql, statementComplete)
  request.on('columnMetadata', columnMetadata);
  request.on('row', function(cloums){
    callback(null,cloums);
  });
  request.on('done', requestDone);
  if(!self.connected){
    self.connect();
  }
  //connection.execSql(request);
  //self.connection.execSqlBatch(request);
}

var config = {
  server: '192.168.1.2',
  userName: 'sa',
  password: 'sa',
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

var mssql = new MSSQL(config);
mssql.exec('select top 2 * from  t_rm_vip_info');



function requestDone(rowCount, more) {
  // console.log(rowCount + ' rows');
}

function statementComplete(err, rowCount) {
  if (err) {
    console.log('Statement failed: ' + err);
  } else {
    console.log(rowCount + ' rows');
  }
}

function end() {
  console.log('Connection closed');
  process.exit(0);
}

function infoError(info) {
  // console.log(info.number + ' : ' + info.message);
}

function debug(message) {
  // console.log(message);
}

function columnMetadata(columnsMetadata) {
  columnsMetadata.forEach(function(column) {
    console.log(column);
  });
}

function row(columns) {
  var values = '';

  columns.forEach(function(column) {
    if (column.value === null) {
      value = 'NULL';
    } else {
      value = column.value;
    }

    values += value + '\t';
  });

  console.log('获取到的结果：', values);
}
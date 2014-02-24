var Connection = require('tedious').Connection;
var Request = require('tedious').Request;
var async=require('async');
var config = {
  server: '192.168.1.2',
  userName: 'sa',
  password: 'sa'
  
  ,options: {
    debug: {
      packet: true,
      data: true,
      payload: true,
      token: false,
      log: true
    },
    tdsVersion:'7_1',
    database:'hbposv7'
  }
  
};

var connection = new Connection(config);

connection.on('connect', function(err) {
    // If no error, then good to go...
    console.log(err);
    executeStatement();

  }
);
connection.on('end', function(){
   console.log('Connection closed');
});
connection.on('debug', function(text) {
    //console.log(text);
  }
);



function executeStatement() {
  request = new Request("select top 2 * from  t_rm_vip_info", function(err, rowCount) {
    if (err) {
      console.log(err);
    } else {
      console.log(rowCount + ' rows');
    }

    connection.close();
  });

  request.on('row', function(columns) {
    columns.forEach(function(column) {
      if (column.value === null) {
        console.log('NULL');
      } else {
        console.log(column.metadata.colName);
        console.log(column.value);
      }
    });
  });

  request.on('done', function(rowCount, more) {
    console.log(rowCount + ' rows returned');
  });

  // In SQL Server 2000 you may need: connection.execSqlBatch(request);
  //connection.execSql(request);
  connection.execSqlBatch(request);
}

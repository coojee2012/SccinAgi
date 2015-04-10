var sql = require('mssql'); 

var config = {
    user: 'sa',
    password: 'sa',
    server: '192.168.1.2',
    database: 'hbposv7',
    options: {
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
}
 // In SQL Server 2000 you may need: connection.execSqlBatch(request);
var connection = new sql.Connection(config, function(err) {
    // ... error checks

    // Query

    var request = new sql.Request(connection); // or: var request = connection.request();
    request.query('select top 20 * from  t_rm_vip_info', function(err, recordset) {
        // ... error checks

        console.dir(recordset);
    });

    // Stored Procedure
/*
    var request = new sql.Request(connection);
    request.input('input_parameter', sql.Int, 10);
    request.output('output_parameter', sql.Int);
    request.execute('procedure_name', function(err, recordsets, returnValue) {
        // ... error checks

        console.dir(recordsets);
    });*/

});

//  <add key="DBConnection" value="user id=sa;Password=sa;data source=192.168.1.2;Max Pool Size=10000;initial catalog=hbposv7"/>

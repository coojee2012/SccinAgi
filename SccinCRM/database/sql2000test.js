var MSSQL=require('./mssqltds.js');
var config = {
  server: '192.168.1.2',
  userName: 'sa',
  password: 'sa',
  options: {
    debug: {
      packet: false,
      data: false,
      payload: false,
      token: false,
      log: false
    },
    tdsVersion: '7_1',
    database: 'hbposv7' //'bjexpert' //
  }

};

var mssql = new MSSQL(config);

mssql.exec('select top 1 * from  t_rm_vip_info', function(err, dbs) {
  console.log('获取到的结果：', dbs);
});

mssql.exec('select top 2 * from  t_rm_vip_info', function(err, dbs) {
  console.log('获取到的结果：', dbs);
});

mssql.exec('select top 3 * from  t_rm_vip_info', function(err, dbs) {
  console.log('获取到的结果：', dbs);
});


//process.exit(1);
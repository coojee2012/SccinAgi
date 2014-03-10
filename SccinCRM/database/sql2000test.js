var MSSQL=require('./mssqltds.js');
var config = {
  server: '127.0.0.1',
  userName: 'sa',
  password: '123',
  options: {
    debug: {
      packet: false,
      data: false,
      payload: false,
      token: false,
      log: false
    },
    tdsVersion: '7_2',
    database: 'hbpos7'//'hbposv7' //'bjexpert' //
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
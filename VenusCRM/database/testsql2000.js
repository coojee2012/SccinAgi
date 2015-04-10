var sql2000=require('./testtds');
var config = {
  server: '127.0.0.1\\SQLEXPRESS',
  userName: 'sa',
  password: '123'

  ,
  options: {
    debug: {
      packet: true,
      data: true,
      payload: true,
      token: false,
      log: true
    },
    tdsVersion: '7_2',
    database: 'hbposv7'
  }

};
var db=new sql2000(config);
/*db.query("select top 2 * from  t_rm_vip_info",function(err,dbs){
console.log('我的执行结果:',dbs);
});*/

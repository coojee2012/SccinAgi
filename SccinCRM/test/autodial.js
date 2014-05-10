var http = require('http');
var https = require('https');
var moment =require('moment');


var d = new Date();
var s = d.getTime();

var datas = {};
datas.CallInfoID = s;
datas.NoticeContent = '专家您好，这里是北京市发改委专家库系统，2013年12月31日在北京天安门有一评标项目,评标时间为1天，确认参加请按1，不参加请按2，重听请按9！';
datas.SureContent = '您已确定参加评标，请携带有效证件于2013年12月31日12点30分前到北京市西城区东街123号海博大厦1308室，参加评标！联系电话010-88878678，联系手机：15308098290.';
datas.QueryContent = '查询信息。';
datas.ProjMoveID = moment().format('YYYYMMDD-HHmm');
datas.Phones = '13269298234';
datas.KeyNum = '1|2|9';//确认参加评标/不参加/重听

datas = JSON.stringify(datas);
console.log(datas);

var options = {
  host: '61.135.238.158',
  hostname: '61.135.238.158',
  port: 443,
  path: 'https://61.135.238.158/base/asami/autodial',
  headers: {
    "Content-Type": 'application/json',
   // "Content-Length": datas.length,
    "User-Agent":"BjExpert",
     'User-key': 'BjExpert'
  },
  rejectUnauthorized:false,
  method: 'POST'
};

var req = https.request(options, function(res) {
  console.log('STATUS: ' + res.statusCode);
  console.log('HEADERS: ' + JSON.stringify(res.headers));
  res.setEncoding('utf8');
  res.on('data', function(chunk) {
    console.log('BODY: ' + chunk);
  });
    res.on("end",function(){
    console.log("请求完成！");
  });
});

req.on('error', function(e) {
  console.log('problem with request: ' + e);
});

req.write(datas + '\n');
req.end();
var http = require('http');


var d = new Date();
var s = d.getTime();

var datas = {};
datas.CallInfoID = s;
datas.NoticeContent = '专家您好，这里是北京市发改委专家库系统，2013年12月31日在北京天安门有一评标项目。';
datas.SureContent = '您已确定参加评标，请携带有效证件于2013年12月31日12点30分前到。';
datas.QueryContent = '查询信息';
datas.Phones = '8001';
datas.KeyNum = '1|2|9';//确认参加评标/不参加/重听

datas = JSON.stringify(datas);
console.log(datas);

var options = {
  host: '192.168.0.114',
  hostname: '192.168.0.114',
  port: 3001,
  path: '/base/asami/autodial',
  headers: {
    "Content-Type": 'application/json',
   // "Content-Length": datas.length,
    "User-Agent":"BjExpert",
     'User-key': 'BjExpert'
  },
  method: 'POST'
};

var req = http.request(options, function(res) {
  console.log('STATUS: ' + res.statusCode);
  console.log('HEADERS: ' + JSON.stringify(res.headers));
  res.setEncoding('utf8');
  res.on('data', function(chunk) {
    console.log('BODY: ' + chunk);
  });
});

req.on('error', function(e) {
  console.log('problem with request: ' + e.message);
});

req.write(datas + '\n');
req.end();
var ng = require('nodegrass');
var async = require('async');
var postUrl = "http://192.168.0.114:3001/PBXExtension/save";
var getUrl = "http://192.168.0.114:3001/PBXExtension";
  postUrl = "http://192.168.0.114:83/selectdb/orderchart?tjtype=4";
  getUrl = "http://192.168.0.114:83/chart/ordercharts";
//postUrl = "http://125.64.11.94/ExpertInfo/ExpertRegister/Register";
//getUrl = "http://125.64.11.94/ExpertInfo/ExpertRegister/Register";

var myid = -1;
process.on('exit', function(code) {
	var runtimes = process.uptime();
	console.log('线程' + myid + '运行用时:', runtimes, '秒');
	console.log('线程' + myid + '退出状态:', code);
});

process.on('message', function(m) {
	myid = m.item;
	console.log('线程', myid, '获取到主进程发送的消息。');
});

process.send('我是线程！');

async.auto({
	testPost: function(cb) {
		dotest('post', postUrl, 100, function(err, result) {
			cb(err, result);
		});
	},
	testGet: function(cb) {
		dotest('get', getUrl, 100, function(err, result) {
			cb(err, result);
		});
	}
}, function(err, results) {
	console.log('POST测试结果，如下，', results.testPost.errcouts, '错误内容：', results.testPost.data);
	console.log('GET测试结果，如下，', results.testGet.errcouts, '错误内容：', results.testGet.data);
	process.exit();
});


function dotest(proto, url, totals, callback) {
	var errCounts = 0;
	var errData = {};

	var each = [];
	for (var i = 0; i < totals; i++) {
		each.push(i);
	}

	async.each(each, function(item, cb) {
		ng[proto](url, function(data, status, headers) {
			if (status === 800) {
				console.log('地址不存在，或访问超时');
				errCounts++;
				errData['count'] = errCounts;
				errData['data'] = data;
				console.log(data);
				process.send({success:false,method:proto,status:800,data:data});
				cb(null, errData);
			} else if (status !== 200) {
				console.log('RES结果如下：',status);
				errCounts++;
				errData['count'] = errCounts;
				errData['data'] = data;
				console.log(data);
				process.send({success:false,method:proto,status:status,data:data});
				cb(null, errData);
			} else {
				cb(null, errData);
			}
		});
	}, function(err, results) {
		callback(err, {
			errcouts: '总共累积错误：' + errCounts,
			data: errData
		});
	});

}

/*	for (var i = 0; i < 1000; i++) {
			ng.post("http://192.168.0.114:3001/PBXExtension/save", function(data, status, headers) {
				var accessToken = JSON.parse(data);
	var err = null;
	if (accessToken.error) {
		err = accessToken;
	};
	console.log(err, accessToken);
				if (status !== 200)
					console.log(data);
			});
		}*/
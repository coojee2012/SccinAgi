var childProcess = require('child_process');
var async = require('async');

var maxChilds = 50;
var each = [];
for (var i = 0; i < maxChilds; i++) {
	each.push(i);
}
var errcounts=0;
var jieguo={};

async.each(each, function(item, callback) {
	var child = childProcess.fork('./child.js');
	console.log('线程', item, '已开启');
	child.on('message', function(m) {
		if(typeof(m)==='object' && !m.success){
			jieguo[errcounts]={method:m.method,status:m.status,data:m.data};
			errcounts++;
		}else{
		console.log('子线程'+item+'返回信息:', m);	
		}	
	});

	child.send({
		item: item
	});

	child.on('exit', function(code, signal) {
		callback(null, {
			code: code,
			signal: signal
		});
		console.log('线程' + item + '退出状态:', code);
	});
}, function(err, results) {
	console.log('所有线程处理完毕！');
	process.exit();
});

process.on('exit', function(code) {
	console.log('总计失败次数：',errcounts);
	console.log('失败详细情况：',jieguo);
	var runtimes = process.uptime();
	console.log('主程序运行用时:', runtimes, '秒');
	console.log('主程序退出状态:', code);
});
var Schema = require('jugglingdb').Schema;
var conf = require('node-conf');
var mysqlconfig = conf.load('jdmysql');
var schema = new Schema('mysql', mysqlconfig);

schema.on('connected', function() {
	console.log('数据库连接成功！');
	schema.isActual(function(err, actual) {
		if (!actual) {
			schema.autoupdate(function(err) {
				console.log('更新表！');
			});
		} else {
			console.log('所有的表是最新的！');
		}
	});



});

schema.on('log', function(msg, duration) {
	//console.log('log');
});

schema.on("error", function(err) {
	// 如果是连接断开，自动重新连接
	if (err.code === 'PROTOCOL_CONNECTION_LOST') {
		console.log("连接断开,尝试自动自动重新连接......");
		schema.connect(function(err) {
			if (err)
				console.log("数据库重新连接失败:", err);
			else
				console.log("数据库重新连接成功！");
		});
	} else {
		console.error('数据库连接异常：', err.stack || err);
	}
});


exports.schema = schema;
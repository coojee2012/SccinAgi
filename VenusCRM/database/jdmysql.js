var Schema = require('jugglingdb').Schema;
var conf = require('node-conf');
var mysqlconfig=conf.load('jdmysql');
var schema = new Schema('mysql', mysqlconfig);

schema.on('connected', function() {
	console.log('数据库连接成功！');
});

schema.on('log', function(msg, duration) {
	//console.log('log');
});

schema.setMaxListeners(0);

schema.client.on("error", function(err) {
	// 如果是连接断开，自动重新连接
	if (err.code === 'PROTOCOL_CONNECTION_LOST') {
		schema.connect(function(err){
			console.log("数据库连接:",err);
		});
	} else {
		console.error(err.stack || err);
	}
});

exports.schema = schema;
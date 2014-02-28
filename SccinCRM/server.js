var http = require('http');
var cluster = require('cluster');
var logger = require('./lib/logger').logger('web');
var os = require('os');
// 获取CPU 的数量
var numCPUs = os.cpus().length;
var workers = {};
var count = 0;
// 当主进程被终止时，关闭所有工作进程
process.on('SIGTERM', function() {
	logger.info('主进程死亡！');
	for (var pid in workers) {
		process.kill(pid);
	}

	process.exit(0);

});

process.on('exit', function() {
	logger.error('服务器发生异常，导致退出！');
});


if (cluster.isMaster) {
	logger.info(' MASTER ' + "启动主进程...");
	for (var i = 0; i < numCPUs; i++) {
		var worker = cluster.fork();
		workers[worker.pid] = worker;

		worker.on('error', function(err) {
			logger.error(err);
		});

		worker.on('exit', function(code, signal) {
			if (signal) {
				logger.info("worker " + worker.pid + " was killed by signal: " + signal);
			} else if (code !== 0) {
				logger.info("worker " + worker.pid + " exited with error code: " + code);
			} else {
				logger.info("worker success!");
			}
		});

		
	}

	cluster.on('fork', function(worker) {
		logger.info(' MASTER ' + 'fork: worker' + worker.id);
	});

	cluster.on('online', function(worker) {
		logger.info(' MASTER ' + 'online: worker' + worker.id);
	});

	cluster.on('listening', function(worker, address) {
		logger.info(' MASTER ' + 'listening: worker' + worker.id + ',pid:' + worker.process.pid + ', Address:' + address.address + ":" + address.port);
	});

	cluster.on('disconnect', function(worker) {
		logger.info(' MASTER ' + 'disconnect: worker' + worker.id);
	});


	cluster.on('exit', function(worker, code, signal) {
		logger.info(' MASTER ' + 'exit worker' + worker.id + ' died');
		var exitCode = worker.process.exitCode;
		logger.info(' MASTER ' + 'worker ' + worker.process.pid + ' died (' + exitCode + '). restarting...');
		delete workers[worker.pid];
		worker = cluster.fork();
		workers[worker.pid] = worker;
		worker.on('exit', function(code, signal) {
			if (signal) {
				logger.info("worker was killed by signal: " + signal);
			} else if (code !== 0) {
				logger.info("worker exited with error code: " + code);
			} else {
				logger.info("worker success!");
			}
		});

	});
} else if (cluster.isWorker) {
	logger.info(' WORKER ' + "start worker ..." + cluster.worker.id);
	process.on('message', function(msg) {
		logger.info(' WORKER ' + msg);
		process.send(' WORKER worker' + cluster.worker.id + ' received!');
	});
	
	process.on('error',function(err){
		logger.err(' WORKER ERROR' , err);
	});

	process.on('uncaughtException', function(err){
		logger.err(' WORKER ERROR' , err);
	});

	/*// 工作进程分支，启动服务器
	var app = require('./app');
	var server = http.createServer(app).listen(app.get('port'), function() {
		logger.info('成功启动四川建设网语音拨打服务: ' + app.get('port'));
	});
	server.maxHeadersCount = 0;
	server.on('connection', function() {
		count++;
		logger.debug('当前有效连接: ' + count);
	});
	server.on('error', function(error) {
		logger.error('发生错误: ', error);
	});*/

var server = require('./app');
server.listen('3001', function() {
    logger.info('成功启动四川建设网语音拨打服务!');
  });

} else {
	logger.error('启动发生意外！');
}
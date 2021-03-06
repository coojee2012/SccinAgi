#!/usr/local/bin/node  -e
/**
强悍的NODE WEB服务器
根据CPU的个数开启响应数量的子进程多并发异步服务
可以负载均衡
**/
'use strict';
var http = require('http');
var cluster = require('cluster');
var logger = require('./lib/logger').logger('web');
var os = require('os');
var appconf = require('./config/app.json');// conf.load('app');
var SRCFILE = appconf.debug ? '.js' : '.min.js';
// 获取CPU 的数量
//var numCPUs = os.cpus().length;

var numCPUs = 1;
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

process.on('SIGBREAK',function(){
	console.log('SIGBREAK');
});

/*process.on('SIGHUP',function(){
	logger.info('窗口被关闭了！');
	for (var pid in workers) {
		process.kill(pid);
	}
	process.exit(0);
});*/
 

process.on('exit', function() {
	logger.error('服务器发生异常，导致退出！');
});


if (cluster.isMaster) {
	logger.info(' 主进程-> ' + "启动主进程...");
	var count = 0; //访问次数计数
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
		//worker.send('111111');//向子进程发送消息
		//监听进程发送的消息！
		worker.on('message', function(msg) {
			if (msg && typeof(msg) === 'object' && msg.count) {
				count++;
				//logger.info('当前服务器总访问次数：' + count);
			}
		});

	}

	cluster.on('fork', function(worker) {
		logger.info(' 主进程-> ' + '创建子进程:' + worker.id);
	});
	cluster.on('online', function(worker) {
		logger.info(' 主进程-> ' + '子进程:' + worker.id + '已经创建成功！');
	});

	cluster.on('listening', function(worker, address) {
		logger.info(' 主进程-> ' + '正在监听子进程: ' + worker.id + ',pid:' + worker.process.pid + ',监听地址:' + address.address + ",监听端口:" + address.port);
	});

	cluster.on('disconnect', function(worker) {
		logger.info(' 主进程-> ' + '子进程:' + worker.id + '断开！');
	});

	cluster.on('exit', function(worker, code, signal) {
		logger.info(' 主进程-> ' + '子进程:' + worker.id + ' 退出！');
		var exitCode = worker.process.exitCode;
		logger.info(' 主进程-> ' + '子进程: ' + worker.process.pid + ' 退出错误码 (' + exitCode + '). 重启中...');
		delete workers[worker.pid];
		worker = cluster.fork();
		workers[worker.pid] = worker;
		worker.on('exit', function(code, signal) {
			if (signal) {
				logger.info("子进程被信号终极: " + signal);
			} else if (code !== 0) {
				logger.info("退出错误码: " + code);
			} else {
				logger.info("子进程启动成功!");
			}
		});

	});

/*	var normal = require('child_process').fork(__dirname+'/Wetnurse'+SRCFILE);
	normal.on('exit',function(code,signal){
    logger.info('奶妈程序退出了：'+code);
	});
	normal.on('error',function(err){
    logger.error('奶妈程序发生异常：'+err);
	});*/

} else if (cluster.isWorker) {
	logger.info(' 子进程-> ' + "启动子进程 ..." + cluster.worker.id);
	process.on('message', function(msg) {
		logger.info(' 子进程-> ' + msg);
		process.send(' 子进程-> 子进程：' + cluster.worker.id + ' 获取到主进程的消息!');
	});

	process.on('error', function(err) {
		logger.error(' 子进程-> ERROR:', err);
	});

	process.on('uncaughtException', function(err) {
		logger.error(' 子进程-> uncaughtException:', err);
	});

	var server = require('./app'+SRCFILE);
	var count = 0;
	server.on('connection', function() {
		count++;
		//logger.info('当前子进程：' + cluster.worker.id + '。访问次数: ' + count);
		process.send({
			count: true
		});
	});
	server.listen(appconf.hostport, function() {
		logger.info('成功启动四川建设网语音拨打服务!');
	});

} else {
	logger.error('启动发生意外！');
}

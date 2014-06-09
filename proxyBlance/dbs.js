var httpProxy = require('http-proxy');
var http = require('http');

var addresses = ['ws://localhost:3306', 'ws://localhost:3306'];

httpProxy.createServer({
	target: 'ws://localhost:3306',
	ws: true
}).listen(8014);
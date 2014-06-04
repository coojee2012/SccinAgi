var https = require('https'),
	fs = require('fs');
var http = require('http');
var httpProxy = require('http-proxy');

var options = {};

var proxy = httpProxy.createProxyServer();
proxy.on('error', function(e) {
console.log("ERROR:",e);
});

/*http.createServer(function(req, res) {
proxy.web(req, res, { target: 'http://www.baidu.com' }, function(e) { 
console.log('CALLBACK:',e);
});
}).listen(8021);*/

var addresses = [{
	host: 'https://127.0.0.1',
	port: 3001
}, {
	host: 'https://127.0.0.1',
	port: 3001
}];
addresses =['https://127.0.0.1:3001','https://127.0.0.1:3001'];



var httpsOpts = {
	key: fs.readFileSync(__dirname + '/PCA/server.key'),
	cert: fs.readFileSync(__dirname + '/PCA/server.crt')
};

var proxies = addresses.map(function (target) {
  return new httpProxy.createProxyServer({
  	ssl:httpsOpts,
    target: target,
    secure: false
  });
});


function nextProxy() {
  var proxy = proxies.shift();
  proxies.push(proxy);
  return proxy;
}



/*https.createServer(httpsOpts, function(req, res) {
	//
	// On each request, get the first location from the list...
	//
	var target=addresses.shift();
	var opts = {
		ssl:httpsOpts,
		target: target,
		//target:'https://127.0.0.1:3001',
		secure: false
	};

	//
	// ...then proxy to the server whose 'turn' it is...
	//
	console.log('balancing request to: ', target);
	proxy.web(req, res, opts);

	//
	// ...and then the server you just used becomes the last item in the list.
	//
	addresses.push(target);
}).listen(8021);*/


var server = https.createServer(httpsOpts,function (req, res) {    
  nextProxy().web(req, res);
});

server.on('upgrade',function(req,res){
  nextProxy().web(req, res);
});


server.listen(8021);
// Rinse; repeat; enjoy.
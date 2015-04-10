var Nami=require(__dirname+"/lib/nami.js").Nami;
<<<<<<< HEAD:VenusAGI/asterisk/asmanager.js
var conf = require('node-conf');
var nami = new Nami(conf.load('asterisk'));
=======
var nami = new Nami({
    "host": "192.168.2.88",
    "port": 5038,
    "username": "admin",
    "secret": "admin"
});
>>>>>>> c355e8cb21156479da7aae1a9aeb69e52dfdad3b:VenusLib/ami/asmanager.js
nami.on('namiEvent', function (event) {
	//console.log(event);
});
nami.on('namiEventDial', function (event) {	
});
nami.on('namiEventVarSet', function (event) { 	
});
nami.on('namiEventHangup', function (event) {	
});
nami.on('error', function (error) {	
console.log(error);
});
nami.open();
exports.nami=nami;

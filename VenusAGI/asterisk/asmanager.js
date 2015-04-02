var Nami=require("lib/nami.js").Nami;
var conf = require('node-conf');
var nami = new Nami(conf.load('asterisk'));
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
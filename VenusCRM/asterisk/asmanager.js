var Nami=require("nami").Nami;
var conf = require('../config/asterisk.json');
var nami = new Nami(conf);
nami.on('namiEvent', function (event) {
	//console.log(event);
});
nami.on('namiEventDial', function (event) {	
});
nami.on('namiEventVarSet', function (event) { 	
});
nami.on('namiEventHangup', function (event) {	
});
nami.open();
exports.nami=nami;
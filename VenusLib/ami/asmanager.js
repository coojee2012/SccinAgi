var Nami=require(__dirname+"/lib/nami.js").Nami;
var nami = new Nami({
    "host": "192.168.2.88",
    "port": 5038,
    "username": "admin",
    "secret": "admin"
});
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

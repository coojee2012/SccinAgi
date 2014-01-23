var Schema = require('jugglingdb').Schema;
var conf = require('node-conf');
var mysqlconfig=conf.load('jdmysql');
var schema = new Schema('mysql', mysqlconfig);

schema.on('connected', function() {
	//console.log('connected');
})
schema.on('log', function(msg, duration) {
	//console.log('log');
})
exports.schema = schema;
var Schema = require('jugglingdb').Schema;
var conf = require('node-conf');
var mysqlconfig=conf.load('jdmysql');
var schema = new Schema('mysql', mysqlconfig);

schema.automigrate(function(){
	console.log('创建表！');
});

schema.isActual(function(err, actual) {
    if (!actual) {
        schema.autoupdate(function(err){
        	console.log('更新表！');
        });
    }
});
exports.schema = schema;
var fs = require('fs');
var schema = require('./jdmysql').schema;
var dirname = __dirname;
var conf = require('node-conf');
var appconf=conf.load('app');
var SRCFILE=appconf.debug?'src':'build';
var path = dirname + '/../modules/'+SRCFILE+'/';
var guid = require('guid');
var Schemas = {};

var files = fs.readdirSync(path);

//console.log(files);
for (var i in files) {
    var file = path + files[i];
    //console.log(file);
    var mod = require(file);
    //console.log(mod);
    Schemas[mod.Name] = mod;
}


if(appconf.debug){
/*schema.automigrate(function() {
    console.log('创建表');

});*/
}

schema.isActual(function(err, actual) {
    if (!actual) {
        schema.autoupdate(function(err) {
            console.log('更新表！');
        });
    }
});

exports.Schemas = Schemas;
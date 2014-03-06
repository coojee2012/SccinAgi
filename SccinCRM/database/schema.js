var fs = require('fs');
var schema = require('./jdmysql').schema;
var dirname = __dirname;
var conf = require('node-conf');
var appconf = conf.load('app');
var SRCFILE = appconf.debug ? 'src' : 'build';
var path = require('path');
var dbdir = dirname + '/../modules/' + SRCFILE + '/';
var guid = require('guid');
var async=require('async');
var Schemas = {};

worker(dbdir, function() {
    console.log('我的工作完成了');
/*    if (appconf.debug) {
    schema.automigrate(function() {
        console.log('创建表');

    });
}*/

schema.isActual(function(err, actual) {
    if (!actual) {
        schema.autoupdate(function(err) {
            console.log('更新表！');
        });
    }
});

exports.Schemas = Schemas;

});




function worker(dir, callback) {
    var files = fs.readdirSync(dir);
    //console.log(files);
    async.each(files, function(filepath, cb) {
        filepath=dir + "\\" +filepath;
        //console.log('========',filepath);
        fs.stat(filepath, function(err, stats) {
            if (stats.isFile()) {
                var filename = path.basename(filepath, '.js');
                var parentDir = path.dirname(filepath);
                var parentDirname = path.basename(path.dirname(filepath));
                var thisFilename = path.basename(__filename, '.js');
                if (filename != thisFilename && filename.indexOf(parentDirname) < 0) {
                    var mod = require(filepath);
                    Schemas[mod.Name] = mod;
                    cb(null);
                }
            } else if (stats.isDirectory()) {
                worker(filepath, cb);
            } else {
                cb('err');
                logger.error("unknow type of file");
            }
        });
    }, function(err) {
        callback();
    });
}


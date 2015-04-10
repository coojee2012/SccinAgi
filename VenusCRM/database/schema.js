var schema = require('./jdmysql').schema;
var conf = require('node-conf');
var appconf = conf.load('app');
var SRCFILE = appconf.debug ? '.js' : '.min.js';
var Schemas = require( '../modules/DBModules'+SRCFILE).Dbs;
exports.Schemas = Schemas;
/*function worker(dir, callback) {
    var files = fs.readdirSync(dir);
    //console.log(files);
    async.each(files, function(filepath, cb) {
        filepath = dir + "\\" + filepath;
        //console.log('========',filepath);
        fs.stat(filepath, function(err, stats) {
            if (stats.isFile()) {
                var filename = path.basename(filepath, '.js');
                var parentDir = path.dirname(filepath);
                var parentDirname = path.basename(path.dirname(filepath));
                var thisFilename = path.basename(__filename, '.js');
                if (filename != thisFilename && filename.indexOf(parentDirname) < 0) {
                    var mod = require(filepath);
                    Schemas.prototype[mod.Name] = mod;
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
}*/
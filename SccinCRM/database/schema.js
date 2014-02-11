var fs = require('fs');
var schema = require('./jdmysql').schema;
var dirname = __dirname;
var path = dirname + '/../modules/';
var guid = require('guid');
var Schemas = {};

var files = fs.readdirSync(path);

console.log(files);
for (var i in files) {
    var file = path + files[i];
    console.log(file);
    var mod = require(file);
    console.log(mod);
    Schemas[mod.Name] = mod;
}



schema.automigrate(function() {
    console.log('创建表');
    Schemas['CallRecords'].create({
        id: guid.create(),
        ProjExpertID: "ProjExpertID"
    }, function(err, callrecord) {
        Schemas['VoiceContent'].create({
            Contents: '111',
            id: guid.create(),
            callrecord: callrecord
        }, function(err, v) {
            console.log(v);
        });
    });



});

schema.isActual(function(err, actual) {
    if (!actual) {
        schema.autoupdate(function(err) {
            console.log('更新表！');
        });
    }
});

exports.Schemas = Schemas;
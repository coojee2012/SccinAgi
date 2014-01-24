var fs=require('fs');
var schema = require('./jdmysql').schema;
var dirname=__dirname;
var path=dirname+'/../modules/';
var guid=require('guid');
var Schemas={};

var files=fs.readdirSync(path);

//console.log(files);
for(var i in files){
var file=path+files[i];
//console.log(file);
var mod=require(file);
//console.log(mod);
Schemas[mod.Name]=mod;
}	


exports.Schemas = Schemas;



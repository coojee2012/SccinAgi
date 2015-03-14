var schema = require('./jdmysql').schema;
var conf = require('node-conf');
var appconf = conf.load('app');
var SRCFILE = appconf.debug ? '.js' : '.min.js';
var Schemas = require( '../modules/DBModules'+SRCFILE).Dbs;
exports.Schemas = Schemas;
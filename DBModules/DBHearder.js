var Schema = require('jugglingdb').Schema;
var moment = require('moment');
var guid = require('guid');
var conf = require('node-conf');
var basedir =  require('../config/app.json').appbase;//conf.load('app').appbase;
var schema = require('../database/jdmysql').schema;
var Dbs={};


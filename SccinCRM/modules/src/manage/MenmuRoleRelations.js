var Schema = require('jugglingdb').Schema;
var moment = require('moment');
var guid = require('guid');
var conf = require('node-conf');
var basedir = conf.load('app').appbase;
var schema = require(basedir+'/database/jdmysql').schema;

var manageMenmuRoleRelations=schema.define('manageMenmuRoleRelations',{
	id:{type:String,length:100,default:function(){return guid.create();}},
	roleId:   {type:String,length:100},
	menmuID:  {type:String,length:100},
	crtTime:   {type: Date, default: function () { return moment().format("YYYY-MM-DD HH:mm:ss"); }}
});

manageMenmuRoleRelations.Name='manageMenmuRoleRelations';
schema.models.manageMenmuRoleRelations;
module.exports = manageMenmuRoleRelations;
/*var Schema = require('jugglingdb').Schema;
var moment = require('moment');
var guid = require('guid');
var conf = require('node-conf');
var basedir = conf.load('app').appbase;
var schema = require(basedir+'/database/jdmysql').schema;*/

var pbxExtenGroupRelations=schema.define('pbxExtenGroupRelations',{
	id:{type:String,length:100,default:function(){return guid.create();}},		
	groupid:   {type:Number},
	extenid:   {type:String,length:50}	
});


pbxExtenGroupRelations.Name='pbxExtenGroupRelations';
schema.models.pbxExtenGroupRelations;
exports.pbxExtenGroupRelations = pbxExtenGroupRelations;
Dbs.pbxExtenGroupRelations = pbxExtenGroupRelations;
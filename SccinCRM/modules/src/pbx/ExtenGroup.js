/*var Schema = require('jugglingdb').Schema;
var moment = require('moment');
var guid = require('guid');
var conf = require('node-conf');
var basedir = conf.load('app').appbase;
var schema = require(basedir+'/database/jdmysql').schema;
var pbxExtenGroupRelations=require('./ExtenGroupRelations');*/

var pbxExtenGroup=schema.define('pbxExtenGroup',{
	id:{type:String,length:100,default:function(){return guid.create();}},	
	groupname:   {type:String,length:50},
	memo:   {type:String,length:100},
	cretime:   {type: String,length:50, default: function () { return moment().format("YYYY-MM-DD HH:mm:ss"); }}
});


pbxExtenGroup.hasMany(pbxExtenGroupRelations,{as:'extensions',foreignKey:'groupid'});
pbxExtenGroup.Name='pbxExtenGroup';
schema.models.pbxExtenGroup;
exports.pbxExtenGroup = pbxExtenGroup;

Dbs.pbxExtenGroup=pbxExtenGroup;
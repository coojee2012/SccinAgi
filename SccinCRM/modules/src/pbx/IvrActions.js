var Schema = require('jugglingdb').Schema;
var moment = require('moment');
var guid = require('guid');
var conf = require('node-conf');
var basedir = conf.load('app').appbase;
var schema = require(basedir+'/database/jdmysql').schema;
var Actmode=require('./IvrActMode');
var pbxIvrActions=schema.define('pbxIvrActions',{
	id:{type:String,length:100,default:function(){return guid.create();}},
	ivrnumber:  {type:String,length:50},
	ordinal:   {type:Number,default:function(){return 0;}},
	actmode:   {type:String,length:50,default:function(){return '1';}},
	args:   {type:String,length:256}
});

pbxIvrActions.belongsTo(Actmode, {as: 'Actmode', foreignKey: 'actmode'});

pbxIvrActions.Name='pbxIvrActions';
schema.models.pbxIvrActions;
module.exports = pbxIvrActions;
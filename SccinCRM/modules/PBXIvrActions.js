var Schema = require('jugglingdb').Schema;
var moment = require('moment');
var guid = require('guid');
var schema = require('../database/jdmysql').schema;
var Actmode=require('./PBXIvrActMode');
var PBXIvrActions=schema.define('PBXIvrActions',{
	id:{type:String,length:100,default:function(){return guid.create();}},
	ivrnumber:  {type:String,length:50},
	ordinal:   {type:Number,default:function(){return 1;}},
	actmode:   {type:String,length:50,default:function(){return '1';}},
	args:   {type:String,length:256}
});

PBXIvrActions.belongsTo(Actmode, {as: 'Actmode', foreignKey: 'actmode'});

PBXIvrActions.Name='PBXIvrActions';
schema.models.PBXIvrActions;
module.exports = PBXIvrActions;
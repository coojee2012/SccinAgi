var Schema = require('jugglingdb').Schema;
var moment = require('moment');
var guid = require('guid');
var schema = require('../../database/jdmysql').schema;
var PBXExtenGroupRelations=require('./PBXExtenGroupRelations');

var PBXExtenGroup=schema.define('PBXExtenGroup',{
	id:{type:String,length:100,default:function(){return guid.create();}},	
	groupname:   {type:String,length:50},
	memo:   {type:String,length:100},
	cretime:   {type: String,length:50, default: function () { return moment().format("YYYY-MM-DD HH:mm:ss"); }}
});


PBXExtenGroup.hasMany(PBXExtenGroupRelations,{as:'extensions',foreignKey:'groupid'});
PBXExtenGroup.Name='PBXExtenGroup';
schema.models.PBXExtenGroup;
module.exports = PBXExtenGroup;
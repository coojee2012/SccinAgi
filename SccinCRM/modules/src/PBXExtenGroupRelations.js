var Schema = require('jugglingdb').Schema;
var moment = require('moment');
var guid = require('guid');
var schema = require('../../database/jdmysql').schema;

var PBXExtenGroupRelations=schema.define('PBXExtenGroupRelations',{
	id:{type:String,length:100,default:function(){return guid.create();}},		
	groupid:   {type:Number},
	extenid:   {type:String,length:50}	
});


PBXExtenGroupRelations.Name='PBXExtenGroupRelations';
schema.models.PBXExtenGroupRelations;
module.exports = PBXExtenGroupRelations;
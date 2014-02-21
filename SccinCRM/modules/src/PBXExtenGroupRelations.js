var Schema = require('jugglingdb').Schema;
var moment = require('moment');
var guid = require('guid');
var schema = require('../../database/jdmysql').schema;

var PBXExtenGroupRelations=schema.define('PBXExtenGroupRelations',{
	id:   {type:Number},//分机分组ID		
	groupid:   {type:String,length:50},//注册密码
	extenid:   {type:String,length:50}	
});


PBXExtenGroupRelations.Name='PBXExtenGroupRelations';
schema.models.PBXExtenGroupRelations;
module.exports = PBXExtenGroupRelations;
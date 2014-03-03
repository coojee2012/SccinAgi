var Schema = require('jugglingdb').Schema;
var moment = require('moment');
var guid = require('guid');
var schema = require('../../database/jdmysql').schema;

var CRMMenmuRoleRelations=schema.define('CRMMenmuRoleRelations',{
	id:{type:String,length:100,default:function(){return guid.create();}},
	roleId:   {type:String,length:100},
	menmuID:  {type:String,length:100},
	crtTime:   {type: Date, default: function () { return moment().format("YYYY-MM-DD HH:mm:ss"); }}
});

CRMMenmuRoleRelations.Name='CRMMenmuRoleRelations';
schema.models.CRMMenmuRoleRelations;
module.exports = CRMMenmuRoleRelations;
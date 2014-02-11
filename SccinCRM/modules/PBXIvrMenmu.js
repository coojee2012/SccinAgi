var Schema = require('jugglingdb').Schema;
var moment = require('moment');
var schema = require('../database/jdmysql').schema;
var Actions=require('./PBXIvrActions');
var Inputs=require('./PBXIvrInputs');

var PBXIvrMenmu=schema.define('PBXIvrMenmu',{
	ivrname:   {type:String,length:50},
	description:   {type:String,length:150},
	cretime:   {type: String, length: 50,default: function () { return moment().format("YYYY-MM-DD HH:mm:ss");}},
	isreadonly:   {type:Number,default: function () {return 0;}}
});

PBXIvrMenmu.hasMany(Actions,{as:'actions',foreignKey:'ivrnumber'});
PBXIvrMenmu.hasMany(Inputs,{as:'inputs',foreignKey:'ivrnumber'});

PBXIvrMenmu.Name='PBXIvrMenmu';
schema.models.PBXIvrMenmu;
module.exports = PBXIvrMenmu;
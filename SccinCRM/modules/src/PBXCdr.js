var Schema = require('jugglingdb').Schema;
var moment = require('moment');
var schema = require('../../database/jdmysql').schema;
var PBXCdr=schema.define('PBXCdr',{
    caller:   {type:String,length:50},
	called:   {type:String,length:50},
	accountcode:   {type:String,length:50},
	startime:{type:String,length:100,default: function () { return moment().format("YYYY-MM-DD HH:mm:ss"); }},
	lastapptime:  {type:String,length:100,default: function () { return ''; }},//上次应用模块发生的时间
	endtime:  {type:String,length:100,default: function () { return ''; }},//线路挂断时间
	routerline:   {type:Number},
	lastapp:    {type:String,length:50},
	answerstatus:    {type:String,length:50}
});
PBXCdr.Name='PBXCdr';
schema.models.PBXCdr;
module.exports = PBXCdr;
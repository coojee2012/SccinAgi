var Schema = require('jugglingdb').Schema;
var moment = require('moment');
var conf = require('node-conf');
var basedir = conf.load('app').appbase;
var schema = require(basedir+'/database/jdmysql').schema;
var pbxCdr=schema.define('pbxCdr',{
    caller:   {type:String,length:50},
	called:   {type:String,length:50},
	accountcode:   {type:String,length:50},
	srcchannel:{type:String,length:100},
	deschannel:{type:String,length:100},
	uniqueid:{type:String,length:50},
	threadid:{type:String,length:50},
	context:{type:String,length:50},
	agitype:{type:String,length:20},
	alive:{type:String,length:10,default: function () { return 'yes'; }},
	startime:{type:String,length:100,default: function () { return moment().format("YYYY-MM-DD HH:mm:ss"); }},
	lastapptime:  {type:String,length:100,default: function () { return ''; }},//上次应用模块发生的时间
	endtime:  {type:String,length:100,default: function () { return ''; }},//线路挂断时间
	routerline:   {type:String,length:10},
	lastapp:    {type:String,length:50},
	answerstatus:    {type:String,length:50}
});
pbxCdr.Name='pbxCdr';
schema.models.pbxCdr;
module.exports = pbxCdr;
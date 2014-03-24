var pbxCallProcees=schema.define('pbxCallProcees',{
	id:{type:String,length:100,default:function(){return guid.create();}},
	callsession:{type:String,length:100},
	callernumber:   {type:String,length:50},
	callednumber:   {type:String,length:50},
	processname:{type:String,length:50},
	passargs:   {type:String,length:50},
	doneresults:   {type:String,length:50},
	routerline:   {type: String, length:10},
	cretime:   {type: String,length:50, default: function () {return moment().format("YYYY-MM-DD HH:mm:ss"); }},
	
});
pbxCallProcees.Name='pbxCallProcees';
schema.models.pbxCallProcees;
exports.pbxCallProcees = pbxCallProcees;

Dbs.pbxCallProcees=pbxCallProcees;
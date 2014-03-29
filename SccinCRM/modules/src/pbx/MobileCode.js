var pbxMobileCode=schema.define('pbxMobileCode',{
	id:{type:String,length:100,default:function(){return guid.create();}},
	haoduan:{type:String,length:10},
	number7:   {type:String,length:20},
	server:   {type:String,length:50},
	sheng:{type:String,length:50},
	shi:   {type:String,length:50},
	quhao:   {type:String,length:50},
	youbian:   {type: String, length:20}	
});
pbxMobileCode.Name='pbxMobileCode';
schema.models.pbxMobileCode;
exports.pbxMobileCode = pbxMobileCode;

Dbs.pbxMobileCode=pbxMobileCode;
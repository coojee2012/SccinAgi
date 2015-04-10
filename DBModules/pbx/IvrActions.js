var pbxIvrActions=schema.define('pbxIvrActions',{
	id:{type:String,length:100,default:function(){return guid.create();}},
	ivrnumber:  {type:String,length:50},
	ordinal:   {type:Number,default:function(){return 0;}},
	actmode:   {type:String,length:50,default:function(){return '1';}},
	args:   {type:String,length:500}
});

pbxIvrActions.belongsTo(pbxIvrActMode, {as: 'Actmode', foreignKey: 'actmode'});

pbxIvrActions.Name='pbxIvrActions';
schema.models.pbxIvrActions;

exports.pbxIvrActions = pbxIvrActions;
Dbs.pbxIvrActions = pbxIvrActions;
var pbxIvrMenmu=schema.define('pbxIvrMenmu',{
	ivrname:   {type:String,length:50},
	description:   {type:String,length:150},
	cretime:   {type: String, length: 50,default: function () { return moment().format("YYYY-MM-DD HH:mm:ss");}},
	isreadonly:   {type:String,length: 10,default: function () {return '否';}}
});

pbxIvrMenmu.hasMany(pbxIvrActions,{as:'actions',foreignKey:'ivrnumber'});
pbxIvrMenmu.hasMany(pbxIvrInputs,{as:'inputs',foreignKey:'ivrnumber'});

pbxIvrMenmu.Name='pbxIvrMenmu';
schema.models.pbxIvrMenmu;
exports.pbxIvrMenmu = pbxIvrMenmu;
Dbs.pbxIvrMenmu = pbxIvrMenmu;
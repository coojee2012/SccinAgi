/**
黑名单
**/
var pbxBlackList=schema.define('pbxBlackList',{
	memo:{type:String,length:50,default: function () { return ''; }},//添加成黑名单的原因
	cretime: {type:String,length:100,default: function () { return moment().format("YYYY-MM-DD HH:mm:ss"); }}
});
pbxBlackList.Name='pbxBlackList';
schema.models.pbxBlackList;
exports.pbxBlackList = pbxBlackList;
Dbs.pbxBlackList=pbxBlackList;
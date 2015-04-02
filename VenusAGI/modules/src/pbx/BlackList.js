/**
黑名单
**/
var pbxBlacList=schema.define('pbxBlacList',{
	memo:{type:String,length:50,default: function () { return ''; }},//添加成黑名单的原因
	cretime: {type:String,length:100,default: function () { return moment().format("YYYY-MM-DD HH:mm:ss"); }}
});
pbxBlacList.Name='pbxBlacList';
schema.models.pbxBlacList;
exports.pbxBlacList = pbxBlacList;

Dbs.pbxBlacList=pbxBlacList;
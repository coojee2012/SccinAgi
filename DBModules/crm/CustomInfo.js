var crmCustomInfo= schema.define('crmCustomInfo', {
    customName:{type: String, length: 50},//项目编号
    position:{type: String, length: 50},
    sex:{type:String,length:10,default: '男'},
    birthday:{type: String, length: 50},
    phones:{type: String, length: 50},
    customMemo:{type: String, length: 200,default:''},
    customAddr:{type: String, length: 100},
    companyId:   { type: String, length: 50,default:"" },//公司编号
    createTime:  { type: String, length: 50,default: function () { return moment().format("YYYY-MM-DD HH:mm:ss"); } }//操作时间
});
crmCustomInfo.belongsTo(crmCompanyInfo, {as: 'company', foreignKey: 'companyId'});
crmCustomInfo.Name='crmCustomInfo';



schema.models.crmCustomInfo;


exports.crmCustomInfo = crmCustomInfo;
Dbs.crmCustomInfo = crmCustomInfo;
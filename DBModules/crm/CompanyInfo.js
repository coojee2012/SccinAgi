var crmCompanyInfo= schema.define('crmCompanyInfo', {
    companyName:{type: String, length: 100},//公司名称
    companyAddr:{type:String,length:200,default:''},
    telphones:{type: String, length: 50,default:''},
    url:{type: String, length: 50,default:''},
    companyMemo:{type: String, length: 200,default:''},
    createTime:  { type: String, length: 50,default: function () { return moment().format("YYYY-MM-DD HH:mm:ss"); } }//操作时间
});

crmCompanyInfo.Name='crmCompanyInfo';



schema.models.crmCompanyInfo;


exports.crmCompanyInfo = crmCompanyInfo;
Dbs.crmCompanyInfo = crmCompanyInfo;
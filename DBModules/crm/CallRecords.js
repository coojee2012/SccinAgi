var crmCallRecords = schema.define('crmCallRecords', {
    companyId: {type: String, length: 50},//企业编号
    customId: {type: String, length: 50},//客户编号
    userId: {type: Number, default: 0},//用户编号
    poptype:{type: String, length: 10,default:'呼入'},//呼叫方向
    callNumber:{type: Number, default:''},
    recordType:{type: String, length: 10},
    record:{type: String, length: 500},
    createTime: {
        type: String, length: 50, default: function () {
            return moment().format("YYYY-MM-DD HH:mm:ss");
        }
    }//操作时间
});
crmCallRecords.belongsTo(crmCompanyInfo, {as: 'company', foreignKey: 'companyId'});
crmCallRecords.belongsTo(crmCustomInfo, {as: 'custom', foreignKey: 'customId'});
crmCallRecords.belongsTo(manageUserInfo, {as: 'user', foreignKey: 'userId'});
crmCallRecords.Name = 'crmCallRecords';


schema.models.crmCallRecords;


exports.crmCallRecords = crmCallRecords;
Dbs.crmCallRecords = crmCallRecords;
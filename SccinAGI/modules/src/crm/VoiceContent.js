var crmVoiceContent=schema.define('crmVoiceContent',{
    NoticeContents:     {type: Schema.Text},
    SureContents:     {type: Schema.Text},
    QueryContents:     {type: Schema.Text},
    State:   {type: Number,default:0 } //0:新插入数据，1：合成中,2：合成完成
});
crmVoiceContent.Name='crmVoiceContent';
schema.models.crmVoiceContent;
exports.crmVoiceContent = crmVoiceContent;
Dbs.crmVoiceContent = crmVoiceContent;
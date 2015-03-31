/*! 路由处理程序 2015-03-31 */
"use strict";var guid=require("guid"),async=require("async"),_=require("lodash"),conf=require("node-conf"),basedir=conf.load("app").appbase,Schemas=require(basedir+"/database/schema").Schemas,logger=require(basedir+"/lib/logger").logger("web"),util=require("util"),gets={},posts={};module.exports={get:gets,post:posts};var checkFun={};gets.index=function(a,b,c,d){var e=a.query.caller,f=a.query.called,g={};g.sessionid=a.query.callid,g.poptype=a.query.poptype,async.auto({getCustom:function(a){Schemas.crmCustomInfo.findOne({where:{phones:{like:"%"+e+"%"}}},function(b,c){a(b,c)})},getCompany:["getCustom",function(a,b){var c={};c=b.getCustom?{id:b.getCustom.companyId}:{telphones:{like:"%"+e+"%"}},Schemas.crmCompanyInfo.findOne({where:c},function(b,c){a(b,c)})}],getCompanyCustoms:["getCompany",function(a,b){!b.getCustom&&b.getCompany?Schemas.crmCustomInfo.all({where:{companyId:b.getCompany.id}},function(b,c){a(b,c)}):a(null,[])}],getRecords:["getCompany",function(a,b){b.getCompany?Schemas.crmCallRecords.all({where:{companyId:b.getCompany.id},order:"createTime DESC"},function(b,c){a(b,c)}):a(null,null)}]},function(a,h){a?c(a):b.render("crm/screenPop/index.html",{baseurl:d,caller:e,called:f,callinfo:g,custom:h.getCustom||{phones:e},company:h.getCompany||{},records:h.getRecords||[],companyCustom:h.getCompanyCustoms||[]})})},posts.save=function(a,b){var c={},d={};c.id=a.body.customId,c.customName=a.body.customName,c.position=a.body.position||"",c.sex=a.body.sex,c.phones=a.body.phones||"",c.customMemo=a.body.customMemo||"",d.id=a.body.companyId,d.companyName=a.body.companyName||a.body.customName||"",d.companyAddr=a.body.companyAddr||"",d.telphones=a.body.telphones||"",async.auto({isHaveCheckCompany:function(a){Schemas.crmCompanyInfo.findOne({where:{id:d.id}},function(b,c){a(b,c)})},createNewCompany:["isHaveCheckCompany",function(a,b){null!==b.isHaveCheckCompany?a(null,-1):(d.id=guid.create(),c.companyId=d.id,Schemas.crmCompanyInfo.create(d,function(b,c){a(b,c)}))}],updateOldCompany:["isHaveCheckCompany",function(a,b){null===b.isHaveCheckCompany?a(null,-1):(c.companyId=d.id,Schemas.crmCompanyInfo.update({where:{id:d.id},update:d},function(b,c){a(b,c)}))}],isHaveCheckCustom:["createNewCompany","updateOldCompany",function(a){Schemas.crmCustomInfo.findOne({where:{id:c.id}},function(b,c){a(b,c)})}],createNewCustom:["isHaveCheckCustom",function(a,b){null!==b.isHaveCheckCustom?a(null,-1):(c.id=guid.create(),Schemas.crmCustomInfo.create(c,function(b,c){a(b,c)}))}],updateOldCustom:["isHaveCheckCustom",function(a,b){null===b.isHaveCheckCustom?a(null,-1):Schemas.crmCustomInfo.update({where:{id:c.id},update:c},function(b,c){a(b,c)})}]},function(a){b.send(a?{success:"ERROR",msg:a.code||a}:{success:"OK",customId:c.id,companyId:d.id,msg:"保存成功"})})},posts.saveRecords=function(a,b){var c={};for(var d in a.body)c[d]=a.body[d];async.auto({isHaveCheck:function(a){c.record&&""!==c.record?Schemas.crmCallRecords.find(c.id,function(b,c){a(b,c)}):a("话务记录内容不能为空",-1)},createNew:["isHaveCheck",function(a,b){null!==b.isHaveCheck?a(null,-1):Schemas.crmCallRecords.create(c,function(b,c){a(b,c)})}],updateOld:["isHaveCheck",function(a,b){null===b.isHaveCheck?a(null,-1):Schemas.crmCallRecords.update({where:{id:c.id},update:c},function(b,c){a(b,c)})}]},function(a,c){var d={success:"",id:"",msg:""};-1!==c.createNew?c.createNew.isValid(function(a){a?(d.success="OK",d.msg="新增成功!",d.id=c.createNew.id):(d.success="ERROR",d.msg="服务器感知到你提交的数据非法，不予受理！")}):-1!==c.updateOld?(d.success="OK",d.msg="修改成功!",d.id=c.updateOld.id):a&&(console.log(a),d.success="ERROR",d.msg="保存数据发生异常,请联系管理员！"),b.send(d)})};
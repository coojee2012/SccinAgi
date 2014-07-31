/*! 路由处理程序 2014-07-28 */
function delsthes(a,b){async.each(a,function(a,b){a.destroy(function(a){b(a?a:null)})},function(a){b(a)})}function orderactions(a,b){var c=0;async.whilst(function(){return c<a.length},function(b){c++,Schemas.pbxIvrActions.update({where:{id:a[c-1]},update:{ordinal:c}},function(a,c){b(a,c)})},function(a){b(a)})}var guid=require("guid"),async=require("async"),_=require("lodash"),conf=require("node-conf"),basedir=conf.load("app").appbase,Schemas=require(basedir+"/database/schema").Schemas,logger=require(basedir+"/lib/logger").logger("web"),commfun=require(basedir+"/lib/comfun"),gets={},posts={};module.exports={get:gets,post:posts};var checkFun={};checkFun.id=function(a,b){a&&""!=a?Schemas.pbxIvrMenmu.findOne({where:{id:a}},function(a,c){b.send(a?{info:"后台验证发生错误！",status:"n"}:null!=c?{info:"已经存在！",status:"n"}:{info:"验证通过！",status:"y"})}):b.send({info:"输入不能为空！",status:"n"})},posts.checkAjax=function(a,b){var c=a.body.param,d=a.body.name;checkFun[d](c,b)},gets.index=function(a,b,c,d){b.render("."+d+"/list.html",{baseurl:d,modename:"pbxIvrMenmu"})},gets.create=function(a,b,c,d){b.render("."+d+"/create.html",{baseurl:d,modename:"pbxIvrMenmu"})},gets.edit=function(a,b,c,d){var e=a.query.id;async.auto({findUser:function(a){Schemas.pbxIvrMenmu.find(e,function(b,c){b||null==c?a("IVR不存在！",c):a(b,c)})}},function(a,c){b.render("."+d+"/edit.html",{baseurl:d,inst:c.findUser})})},gets.ivrtree=function(a,b,c,d){var e=a.query.id;async.auto({findAction:function(a){var b=new Array;for(var c in Schemas.pbxIvrActions.relations)b.push(c);Schemas.pbxIvrActions.all({include:b,where:{ivrnumber:e},order:"ordinal ASC"},function(b,c){for(var d=new Array,e=0;e<c.length;e++){var f={};f.id=c[e].id,f.text=c[e].__cachedRelations.Actmode.modename,f.icon=c[e].__cachedRelations.Actmode.iconame,d.push(f)}console.log(d),a(b,d)})},findMenu:function(a){Schemas.pbxIvrMenmu.find(e,function(b,c){b||null==c?a("IVR不存在！",c):a(b,c)})},getActmodes:function(a){Schemas.pbxIvrActMode.all({order:"id ASC"},function(b,c){a(b,c)})},findInputs:function(a){Schemas.pbxIvrInputs.all({where:{ivrnumber:e},order:["general ASC","inputnum ASC"]},function(b,c){a(b,c)})}},function(a,c){b.render("."+d+"/ivrtree.html",{layout:!1,baseurl:d,modename:"pbxIvrMenmu",inst:c.findAction,actmods:c.getActmodes,inputs:c.findInputs,menuInst:c.findMenu})})},posts.reorder=function(a,b){var c=a.body.neworders.split(",");orderactions(c,function(a){b.send(a?{success:"ERROR",msg:"排序失败！"}:{success:"OK",msg:"排序成功！"})})},posts.addaction=function(a,b){var c=a.body.modeid,d=a.body.ivrnum;async.auto({count:function(a){Schemas.pbxIvrActions.count({ivrnumber:d},function(b,c){console.log(c),a(b,c)})},create:["count",function(a,b){var e={ivrnumber:d,ordinal:b.count+1,actmode:""+c,args:""};Schemas.pbxIvrActions.create(e,function(b,c){a(b,c)})}]},function(a,c){b.send(a?{success:"ERROR",id:"",msg:a}:{success:"OK",id:c.create.id})})},posts.delaction=function(a,b){var c=a.body.ids.split(","),d=a.body.ivrnum;c.length>0?async.auto({find:function(a){Schemas.pbxIvrActions.all({where:{id:{inq:c},ivrnumber:d}},function(b,c){a(b,c)})},del:["find",function(a,b){delsthes(b.find,a)}],findtwo:["del",function(a){Schemas.pbxIvrActions.all({where:{ivrnumber:d},order:"ordinal asc"},function(b,c){a(b,_.map(c,function(a){return a.id}))})}],order:["findtwo",function(a,b){orderactions(b.findtwo,a)}]},function(a){b.send(a?{success:"ERROR",msg:"删除发生错误:"+a}:{success:"OK",msg:"删除成功！"})}):b.send({success:"ERROR",msg:"没有什么需要删除的！"})},posts.delinput=function(a,b){var c=a.body.ids.split(","),d=a.body.ivrnum;c.length>0?async.auto({find:function(a){Schemas.pbxIvrInputs.all({where:{id:{inq:c},ivrnumber:d}},function(b,c){a(b,c)})},del:["find",function(a,b){delsthes(b.find,a)}]},function(a){b.send(a?{success:"ERROR",msg:"删除发生错误:"+a}:{success:"OK",msg:"删除成功！"})}):b.send({success:"ERROR",msg:"没有什么需要删除的！"})},posts.save=function(a,b){var c={};for(var d in a.body)c[d]=a.body[d];async.auto({isHaveCheck:function(a){c.id&&""!==c.id?Schemas.pbxIvrMenmu.find(c.id,function(b,c){a(b,c)}):a("IVR号码不能为空",-1)},createNew:["isHaveCheck",function(a,b){null!==b.isHaveCheck?a(null,-1):Schemas.pbxIvrMenmu.create(c,function(b,c){a(b,c)})}],updateOld:["isHaveCheck",function(a,b){null===b.isHaveCheck?a(null,-1):Schemas.pbxIvrMenmu.update({where:{id:c.id},update:c},function(b,c){a(b,c)})}],defaultinputs:["createNew",function(a,b){if(-1===b.createNew)a(null,-1);else{var d=[{ivrnumber:c.id,inputnum:"101",generaltype:"timeout",general:1},{ivrnumber:c.id,inputnum:"102",generaltype:"invalidkey",general:1},{ivrnumber:c.id,inputnum:"103",generaltype:"retry",general:1}];async.forEach(d,function(a,b){Schemas.pbxIvrInputs.create(a,function(a,c){b(a,c)})},function(b,c){a(b,c)})}}],addlocalnum:["createNew",function(a,b){commfun.addlocalnum(b.createNew.id,"ivr",1,a)}]},function(a,d){var e={success:"",id:"",msg:""};-1!==d.createNew?d.createNew.isValid(function(a){a?(e.success="OK",e.msg="新增成功!",e.id=d.createNew.id):(e.success="ERROR",e.msg="服务器感知到你提交的数据非法，不予受理！")}):-1!==d.updateOld?(e.success="OK",e.msg="修改成功!",e.id=c.id):a&&(console.log(a),e.success="ERROR",e.msg="保存数据发生异常,请联系管理员！"),b.send(e)})},posts.delete=function(a,b){var c=a.body.id;async.auto({findivrmenmu:function(a){Schemas.pbxIvrMenmu.find(c,function(b,c){b||null===c?a("查找IVR发生错误！",null):"是"===c.isreadonly?a("系统只读，不能被删除！",null):a(null,c)})},delmenmu:["findivrmenmu",function(a,b){b.findivrmenmu.destroy(function(b){a(b,null)})}],findivractions:["delmenmu",function(a){Schemas.pbxIvrActions.all({where:{ivrnumber:c}},function(b,c){a(b,c)})}],findivrinputs:["delmenmu",function(a){Schemas.pbxIvrInputs.all({where:{ivrnumber:c}},function(b,c){a(b,c)})}],delactions:["findivractions",function(a,b){delsthes(b.findivractions,a)}],delinputs:["findivrinputs",function(a,b){delsthes(b.findivrinputs,a)}],dellocalnum:["delmenmu",function(a){commfun.dellocalnum(c,a)}]},function(a){var c={};a?(c.success="ERROR",c.msg="查询数据发生异常,请联系管理员！"):(c.success="OK",c.msg="删除成功！"),b.send(c)})},posts.addinput=function(a,b){var c=a.body.ivrnum,d=a.body.keynum;async.auto({check:function(a){Schemas.pbxIvrInputs.all({where:{ivrnumber:c,inputnum:d}},function(b,c){b?a("数据库查询发生异常！",null):c.length>0?a("已经存在同样的按键！",null):a(null,null)})},add:["check",function(a){Schemas.pbxIvrInputs.create({ivrnumber:c,inputnum:d,generaltype:"1"},function(b,c){a(b,c)})}]},function(a,c){b.send(a?{success:"ERROR",id:"",msg:a}:{success:"OK",id:c.add.id,msg:"保存成功！"})})};
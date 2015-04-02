/*! 路由处理程序 2015-03-31 */
var conf=require("node-conf"),basedir=conf.load("app").appbase,Schemas=require(basedir+"/database/schema").Schemas,logger=require(basedir+"/lib/logger").logger("web"),comfun=require(basedir+"/lib/comfun"),guid=require("guid"),async=require("async"),gets={},posts={};module.exports={get:gets,post:posts},gets.index=function(a,b){var c=a.query.id,d=a.query.text,e={"主叫变换":"changecaller","发起录音":"recording","录制数字字符":"recorddigits","拨打号码":"dialnumber","播放语音":"playback","播放录音":"playrecord","播放音调":"playtone","数字方式读出":"playdigits","检查号码归属地":"checkarea","检测日期":"checkdate","等待几秒":"waiteamoment","读出数字字符":"saynumber","读出日期时间":"saydatetime","跳转到语音信箱":"gotovoicemail","跳转到IVR菜单":"gotoivr","通道阀":"maxchannel","AGI扩展接口":"agiexten","WEB交互接口":"webchange","变量判断":"varcheck","挂机":"hangupcall"};Schemas.pbxIvrActions.find(c,function(f,g){if(f||null===g)b.send("没有能处理该动作！");else{var h=comfun.str2obj(g.args);logger.debug("IVR动作参数:",h),b.render("pbx/ivracts/"+e[d]+".html",{baseurl:a.path,id:c,args:h})}})},gets.acts=function(a,b){var c=a.query.ivrnum;b.render("pbx/ivracts/acts.html",{baseurl:a.path,ivrnum:c})},gets.inputs=function(a,b){var c=a.query.ivrnum;b.render("pbx/ivracts/inputs.html",{baseurl:a.path,ivrnum:c})},gets.einputs=function(a,b){{var c=a.query.id;a.query.text}Schemas.pbxIvrInputs.find(c,function(a,c){if(logger.debug(c),a||null===c)b.send("没有该输入！");else{var d=comfun.str2obj(c.generalargs),e="normal";("retry"===c.generaltype||"timeout"===c.generaltype||"invalidkey"===c.generaltype)&&(e=c.generaltype),b.render("pbx/inputs/"+e+".html",{baseurl:"/pbx/ivracts/playback",inst:c,args:d})}})},posts.getFilename=function(a,b){var c=a.body.folder;Schemas.pbxSounds.all({where:{folder:c}},function(a,c){b.send(c)})},posts.getivrnums=function(a,b){Schemas.pbxIvrMenmu.all({},function(a,c){b.send(c)})},posts.getivracts=function(a,b){var c=a.body.ivrnum,d=new Array;for(var e in Schemas.pbxIvrActions.relations)d.push(e);Schemas.pbxIvrActions.all({include:d,where:{ivrnumber:c},order:"ordinal ASC"},function(a,c){for(var d=new Array,e=0;e<c.length;e++){var f={};f.id=c[e].id,f.ordinal=c[e].ordinal,f.text=c[e].__cachedRelations.Actmode.modename,d.push(f)}b.send(d)})},posts.save=function(a,b){var c=a.body,d=c.id;delete c.id;var e=comfun.obj2str(c);Schemas.pbxIvrActions.update({where:{id:d},update:{args:e}},function(){b.send({success:"OK",msg:"保存成功！"})})},posts.saveinput=function(a,b){var c=a.body,d=c.id,e=c.gotoivrnumber,f=c.gotoivractid;delete c.id,delete c.gotoivrnumber,delete c.gotoivractid;var g=comfun.obj2str(c)||"";Schemas.pbxIvrInputs.update({where:{id:d},update:{gotoivrnumber:e,gotoivractid:f,generalargs:g}},function(){b.send({success:"OK",msg:"保存成功！"})})};
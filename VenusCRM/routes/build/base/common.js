/*! 路由处理程序 2015-04-10 */
function extensync(a,b){async.auto({getsip:function(a){Schemas.pbxExtension.all({where:{deviceproto:"SIP"},order:"accountcode asc"},function(b,c){a(b,c)})},getiax:function(a){Schemas.pbxExtension.all({where:{deviceproto:"IAX2"},order:"accountcode asc"},function(b,c){a(b,c)})},createsip:["getsip",function(a,b){tplbuilder(basedir+"/Install/tpl/sip_exten.conf",b.getsip,"/etc/asterisk/sip_exten.conf",a)}],createiax:["getiax",function(a,b){tplbuilder(basedir+"/Install/tpl/iax_exten.conf",b.getiax,"/etc/asterisk/iax_exten.conf",a)}],createhits:["getsip","getiax",function(a,b){var c=[];c=c.concat(b.getsip).concat(b.getiax),c=[{exts:c}],tplbuilder(basedir+"/Install/tpl/extensions_hints.conf",c,"/etc/asterisk/extensions_hints.conf",a)}],reloadconf:["createsip","createiax",function(a,b){asreload(a)}]},function(b,c){a.send(b?{success:"ERROR",msg:"同步失败:"+b}:{success:"OK",msg:"同步成功！"})})}function queuesync(a,b){async.auto({getqueues:function(a){Schemas.pbxQueue.all({order:"id asc"},function(b,c){a(b,c)})},create:["getqueues",function(a,b){async.map(b.getqueues,function(a,b){var c=objcopy(a);c.members=a.members.split(","),b(null,c)},function(b,c){tplbuilder(basedir+"/Install/tpl/queues_list.conf",c,"/etc/asterisk/queues_list.conf",a)})}],reloadconf:["create",function(a,b){asreload(a)}]},function(b,c){a.send(b?{success:"ERROR",msg:"同步失败:"+b}:{success:"OK",msg:"同步成功！"})})}function trunksync(a,b){async.auto({siptrunks:function(a){Schemas.pbxTrunk.all({where:{trunkproto:"SIP"},order:"cretime asc"},function(b,c){a(b,c)})},iaxtrunks:function(a){Schemas.pbxTrunk.all({where:{trunkproto:"IAX2"},order:"cretime asc"},function(b,c){a(b,c)})},pritrunks:function(a){Schemas.pbxTrunk.all({where:{trunkproto:"PRI"},order:"cretime asc"},function(b,c){a(b,c)})},fxotrunks:function(a){Schemas.pbxTrunk.all({where:{trunkproto:"FXO"},order:"cretime asc"},function(b,c){a(b,c)})},createsip:["siptrunks",function(a,b){async.map(b.siptrunks,function(a,b){var c=objcopy(a);c=comfun.str2obj(a.args,c),b(null,c)},function(b,c){tplbuilder(basedir+"/Install/tpl/sip_trunk.conf",c,"/etc/asterisk/sip_trunk.conf",a)})}],createiax:["iaxtrunks",function(a,b){async.map(b.iaxtrunks,function(a,b){var c=objcopy(a);c=comfun.str2obj(a.args,c),b(null,c)},function(b,c){tplbuilder(basedir+"/Install/tpl/iax_trunk.conf",c,"/etc/asterisk/iax_trunk.conf",a)})}],createpri:["pritrunks",function(a,b){async.map(b.pritrunks,function(a,b){var c=objcopy(a);c=comfun.str2obj(a.args,c),b(null,c)},function(b,c){tplbuilder(basedir+"/Install/tpl/dahdi-channels-pri.conf",c,"/etc/asterisk/dahdi-channels-pri.conf",a)})}],createfxo:["fxotrunks",function(a,b){async.map(b.fxotrunks,function(a,b){var c=objcopy(a);c=comfun.str2obj(a.args,c),b(null,c)},function(b,c){tplbuilder(basedir+"/Install/tpl/dahdi-channels-fxs.conf",c,"/etc/asterisk/dahdi-channels-fxs.conf",a)})}],reloadconf:["createsip","createiax","createpri","createfxo",function(a,b){asreload(a)}]},function(b,c){a.send(b?{success:"ERROR",msg:"同步失败:"+b}:{success:"OK",msg:"同步成功！"})})}function tplbuilder(a,b,c,d){async.auto({readtpl:function(b){fs.readFile(a,function(a,c){a?b(a,null):b(null,c.toString())})},tpl2str:["readtpl",function(a,c){var d=c.readtpl,e="";async.each(b,function(a,b){e+=ejs.render(d,a),b(null)},function(b){a(b,e)})}],write2file:["tpl2str",function(a,b){var d=b.tpl2str;d=d.replace(/\r\n([\s]*\r\n)+/gi,"\r\n"),d=d.replace(/\n([\s]*\n)+/gi,"\r\n"),fs.writeFile(c,d,"utf8",function(b){b?a(b):a(null,null)})}]},function(a,b){d(a,null)})}function asreload(a){var b=new AsAction.Command;b.Command="core reload",nami.send(b,function(b){"Success"==b.response||"Follows"==b.response?a(null,b):a(b,b)})}function objcopy(a){var b={};for(var c in a)"object"!=typeof a[c]?b[c]=a[c]:(b[c]={},objcopy(a[c],b[c]));return b}var conf=require("node-conf"),basedir=Venus.baseDir,Schemas=require(basedir+"/database/schema").Schemas,async=require("async"),logger=require(basedir+"/lib/logger").logger("web"),fs=require("fs"),ejs=require("ejs"),nami=require(basedir+"/asterisk/asmanager").nami,AsAction=require("nami").Actions,comfun=require(basedir+"/lib/comfun"),gets={},posts={};module.exports={get:gets,post:posts},posts.pagination=function(a,b,c){logger.debug("BODY:",a.body);var d=a.body.dbName,e=a.body.iDisplayStart,f=a.body.iDisplayLength;-1==f&&(f=1e4);for(var g=(parseInt(a.body.iColumns),a.body.sColumns.split(",")),h=a.body.iSortingCols,i="",j=0;h>j;j++){var k=a.body["iSortCol_"+j],l=a.body["bSortable_"+k];if("true"==l&&""!=i){var m=a.body["sSortDir_"+j];i+=","+g[k]+" "+("asc"===m?"asc":"desc")}else if("true"==l&&""==i){var m=a.body["sSortDir_"+j];i+=g[k]+" "+("asc"===m?"asc":"desc")}}(null==i||""==i)&&(i="id DESC"),logger.info("排序条件:",i);var n={};n.id={neq:""};for(var o=parseInt(a.body.whereCount),j=0;o>j;j++){var p=a.body["whereCol_"+j],q=a.body["whereWay_"+j],r=a.body["whereValue_"+j];r&&""!=r&&-1!=r&&(n[p]={},q&&""!=q||""===r?"between"===q&&""!==r?n[p][q]=r.split(","):""!==q&&""!==r&&(n[p][q]=r):n[p]=r)}logger.info("查询条件:",n);var s=new Array;for(var t in Schemas[d].relations)s.push(t);logger.info("具有的关系:",s),async.auto({count:function(a){Schemas[d].count(n,function(b,c){a(b,c)})},search:function(a){logger.info("查询的数据库名称：",d),Schemas[d].all({include:s,where:n,order:i,skip:e,limit:f},function(b,c){a(b,c)})}},function(c,d){if(c)logger.error(c),b.send({error:c});else{var e={};e.iTotalRecords=d.count,e.iTotalDisplayRecords=d.count,e.sEcho=a.body.sEcho,e.aaData=[];for(var f=0;f<d.search.length;f++){for(var h={},i=0;i<g.length;i++)h[g[i]]=d.search[f][g[i]];for(var j=0;j<s.length;j++)h[s[j]]=d.search[f].__cachedRelations[s[j]]&&null!==d.search[f].__cachedRelations[s[j]]?d.search[f].__cachedRelations[s[j]]:null;e.aaData[f]=h}logger.info("获取到列表数据：",e),b.send(e)}})},posts.sysnconfig=function(a,b,c){var d=a.body.sysnctype;"extensync"===d?extensync(b,c):"queuesync"===d?queuesync(b,c):"trunksync"===d?trunksync(b,c):b.send({success:"ERROR",msg:"不明确的同步类型~"})},gets.downsound=function(a,b,c){var d=a.query.file,e=d.split("/");e=e[e.length-1],b.download(basedir+"/public/sounds/"+d,e,function(a){a&&(console.log(a),b.send("您想要的文件地址不存在！"))})},gets.downmonitor=function(a,b,c){var d=a.query.file,e=d.split("/");e=e[e.length-1],b.download(basedir+"/public/monitor/"+d,e,function(a){a&&(console.log(a),b.send("您想要的文件地址不存在！"))})},posts.uploadify=function(a,b,c){console.log(a.files);var d=(a.files.Filedata.path,a.files.Filedata.path.split(/\/|\\\\|\\/));d=d[d.length-1];var e=d.split(".");d=e[0],e=e[e.length-1],b.send({tmpname:d,extname:e,OriginalFileName:a.files.Filedata.originalFilename,tmpdir:basedir+"/public/uploads/"})},posts.findprocessmode=function(a,b,c){var d=a.body.processmode,e={};"blacklist"===d?(e.name="黑名单",e.data=[{id:"",trunkname:"全部"}],b.send(e)):"diallocal"===d?(e.name="拨打本地",e.data=[{id:"extension",trunkname:"拨打分机"},{id:"queue",trunkname:"拨打队列"},{id:"ivr",trunkname:"拨打IVR"}],b.send(e)):Schemas.pbxTrunk.all({},function(a,c){e.name="拨打外线",e.data=c,b.send(e)})};
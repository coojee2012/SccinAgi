/*! 路由处理程序 2014-04-23 */
function extensync(a){async.auto({getsip:function(a){Schemas.pbxExtension.all({where:{deviceproto:"SIP"},order:"accountcode asc"},function(b,c){a(b,c)})},getiax:function(a){Schemas.pbxExtension.all({where:{deviceproto:"IAX2"},order:"accountcode asc"},function(b,c){a(b,c)})},createsip:["getsip",function(a,b){tplbuilder(basedir+"/Install/tpl/sip_exten.conf",b.getsip,"/etc/asterisk/sip_exten.conf",a)}],createiax:["getiax",function(a,b){tplbuilder(basedir+"/Install/tpl/iax_exten.conf",b.getiax,"/etc/asterisk/iax_exten.conf",a)}],createhits:["getsip","getiax",function(a,b){var c=[];c=c.concat(b.getsip).concat(b.getiax),c=[{exts:c}],tplbuilder(basedir+"/Install/tpl/extensions_hints.conf",c,"/etc/asterisk/extensions_hints.conf",a)}],reloadconf:["createsip","createiax",function(a){asreload(a)}]},function(b){a.send(b?{success:"ERROR",msg:"同步失败:"+b}:{success:"OK",msg:"同步成功！"})})}function queuesync(a){async.auto({getqueues:function(a){Schemas.pbxQueue.all({order:"id asc"},function(b,c){a(b,c)})},create:["getqueues",function(a,b){async.map(b.getqueues,function(a,b){var c=objcopy(a);c.members=a.members.split(","),b(null,c)},function(b,c){tplbuilder(basedir+"/Install/tpl/queues_list.conf",c,"/etc/asterisk/queues_list.conf",a)})}],reloadconf:["create",function(a){asreload(a)}]},function(b){a.send(b?{success:"ERROR",msg:"同步失败:"+b}:{success:"OK",msg:"同步成功！"})})}function trunksync(a){async.auto({siptrunks:function(a){Schemas.pbxTrunk.all({where:{trunkproto:"SIP"},order:"cretime asc"},function(b,c){a(b,c)})},iaxtrunks:function(a){Schemas.pbxTrunk.all({where:{trunkproto:"IAX2"},order:"cretime asc"},function(b,c){a(b,c)})},pritrunks:function(a){Schemas.pbxTrunk.all({where:{trunkproto:"PRI"},order:"cretime asc"},function(b,c){a(b,c)})},fxotrunks:function(a){Schemas.pbxTrunk.all({where:{trunkproto:"FXO"},order:"cretime asc"},function(b,c){a(b,c)})},createsip:["siptrunks",function(a,b){async.map(b.siptrunks,function(a,b){var c=objcopy(a);c=comfun.str2obj(a.args,c),b(null,c)},function(b,c){tplbuilder(basedir+"/Install/tpl/sip_trunk.conf",c,"/etc/asterisk/sip_trunk.conf",a)})}],createiax:["iaxtrunks",function(a,b){async.map(b.iaxtrunks,function(a,b){var c=objcopy(a);c=comfun.str2obj(a.args,c),b(null,c)},function(b,c){tplbuilder(basedir+"/Install/tpl/iax_trunk.conf",c,"/etc/asterisk/iax_trunk.conf",a)})}],createpri:["pritrunks",function(a,b){async.map(b.pritrunks,function(a,b){var c=objcopy(a);c=comfun.str2obj(a.args,c),b(null,c)},function(b,c){tplbuilder(basedir+"/Install/tpl/dahdi-channels-pri.conf",c,"/etc/asterisk/dahdi-channels-pri.conf",a)})}],createfxo:["fxotrunks",function(a,b){async.map(b.fxotrunks,function(a,b){var c=objcopy(a);c=comfun.str2obj(a.args,c),b(null,c)},function(b,c){tplbuilder(basedir+"/Install/tpl/dahdi-channels-fxs.conf",c,"/etc/asterisk/dahdi-channels-fxs.conf",a)})}],reloadconf:["createsip","createiax","createpri","createfxo",function(a){asreload(a)}]},function(b){a.send(b?{success:"ERROR",msg:"同步失败:"+b}:{success:"OK",msg:"同步成功！"})})}function tplbuilder(a,b,c,d){async.auto({readtpl:function(b){fs.readFile(a,function(a,c){a?b(a,null):b(null,c.toString())})},tpl2str:["readtpl",function(a,c){var d=c.readtpl,e="";async.each(b,function(a,b){e+=ejs.render(d,a),b(null)},function(b){a(b,e)})}],write2file:["tpl2str",function(a,b){var d=b.tpl2str;d=d.replace(/\r\n([\s]*\r\n)+/gi,"\r\n"),d=d.replace(/\n([\s]*\n)+/gi,"\r\n"),fs.writeFile(c,d,"utf8",function(b){b?a(b):a(null,null)})}]},function(a){d(a,null)})}function asreload(a){var b=new AsAction.Command;b.Command="core reload",nami.send(b,function(b){"Success"==b.response||"Follows"==b.response?a(null,b):a(b,b)})}function objcopy(a){var b={};for(var c in a)"object"!=typeof a[c]?b[c]=a[c]:(b[c]={},objcopy(a[c],b[c]));return b}var conf=require("node-conf"),basedir=conf.load("app").appbase,Schemas=require(basedir+"/database/schema").Schemas,async=require("async"),logger=require(basedir+"/lib/logger").logger("web"),fs=require("fs"),ejs=require("ejs"),nami=require(basedir+"/asterisk/asmanager").nami,AsAction=require("nami").Actions,comfun=require(basedir+"/lib/comfun"),gets={},posts={};module.exports={get:gets,post:posts},posts.pagination=function(a,b){logger.debug("BODY:",a.body);var c=a.body.dbName,d=a.body.iDisplayStart,e=a.body.iDisplayLength;-1==e&&(e=1e4);for(var f=(parseInt(a.body.iColumns),a.body.sColumns.split(",")),g=a.body.iSortingCols,h="",i=0;g>i;i++){var j=a.body["iSortCol_"+i],k=a.body["bSortable_"+j];if("true"==k&&""!=h){var l=a.body["sSortDir_"+i];h+=","+f[j]+" "+("asc"===l?"asc":"desc")}else if("true"==k&&""==h){var l=a.body["sSortDir_"+i];h+=f[j]+" "+("asc"===l?"asc":"desc")}}(null==h||""==h)&&(h="id DESC"),logger.info("排序条件:",h);var m={};m.id={neq:""};for(var n=parseInt(a.body.whereCount),i=0;n>i;i++){var o=a.body["whereCol_"+i],p=a.body["whereWay_"+i],q=a.body["whereValue_"+i];q&&""!=q&&-1!=q&&(m[o]={},p&&""!=p?m[o][p]=q:m[o]=q)}logger.info("查询条件:",m);var r=new Array;for(var s in Schemas[c].relations)r.push(s);logger.info("具有的关系:",r),async.auto({count:function(a){Schemas[c].count(m,function(b,c){a(b,c)})},search:function(a){logger.info("查询的数据库名称：",c),Schemas[c].all({include:r,where:m,order:h,skip:d,limit:e},function(b,c){a(b,c)})}},function(c,d){if(c)logger.error(c),b.send({error:c});else{var e={};e.iTotalRecords=d.count,e.iTotalDisplayRecords=d.count,e.sEcho=a.body.sEcho,e.aaData=[];for(var g=0;g<d.search.length;g++){for(var h={},i=0;i<f.length;i++)h[f[i]]=d.search[g].__cachedRelations[f[i]]&&null!==d.search[g].__cachedRelations[f[i]]?d.search[g].__cachedRelations[f[i]]:d.search[g][f[i]];e.aaData[g]=h}logger.info("获取到列表数据：",e),b.send(e)}})},posts.sysnconfig=function(a,b,c){var d=a.body.sysnctype;"extensync"===d?extensync(b,c):"queuesync"===d?queuesync(b,c):"trunksync"===d?trunksync(b,c):b.send({success:"ERROR",msg:"不明确的同步类型~"})},posts.downsound=function(a,b,c){var d=a.body.file,e=d.split("/");e=e[e.length-1],b.download(basedir+"/public/sounds/"+d,e,function(a){a&&(console.log(a),c(a))})};
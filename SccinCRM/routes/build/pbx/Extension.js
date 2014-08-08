/*! 路由处理程序 2014-08-08 */
var conf=require("node-conf"),basedir=conf.load("app").appbase,Schemas=require(basedir+"/database/schema").Schemas,async=require("async"),logger=require(basedir+"/lib/logger").logger("web"),commfun=require(basedir+"/lib/comfun"),gets={},posts={};module.exports={get:gets,post:posts};var checkFun={};checkFun.accountcode=function(a,b){a&&""!=a?Schemas.pbxExtension.find(a,function(a,c){b.send(a?{info:"后台验证发生错误！",status:"n"}:null!=c?{info:"分机已经存在！",status:"n"}:{info:"验证通过！",status:"y"})}):b.send({info:"输入的分机号不能为空！",status:"n"})},gets.index=function(a,b,c,d){b.render("pbx/Extension/list.html",{baseurl:d})},gets.upsert=function(a,b,c,d){b.render("pbx/Extension/upsert.html",{baseurl:d})},gets.create=function(a,b,c,d){var e=a.query.deviceproto;e&&""!=e||(e="SIP"),b.render("pbx/Extension/create.html",{baseurl:d,deviceproto:e,partv:"partv"+e+".html"})},gets.edit=function(a,b,c,d){var e=a.query.id;Schemas.pbxExtension.find(e,function(a,c){a?b.redirect(500,"/err/500"):null!=c?b.render("pbx/Extension/edit.html",{baseurl:d,inst:c,partv:"partv"+c.deviceproto+".html"}):b.redirect(404,"/err/404")})},posts.delete=function(a,b){var c=a.body.id;Schemas.pbxExtension.find(c,function(a,d){var e={};a?(e.success="ERROR",e.msg="查询数据发生异常,请联系管理员！",b.send(e)):d?d.destroy(function(a){a?(e.success="ERROR",e.msg="删除数据发生异常,请联系管理员！！",b.send(e)):commfun.dellocalnum(c,function(a){a?(e.success="ERROR",e.msg="删除分机本地号码发生异常,请联系管理员！！",b.send(e)):(e.success="OK",e.msg="删除成功！",b.send(e))})}):(e.success="ERROR",e.msg="没有找到需要删除的数据！",b.send(e))})},posts.save=function(a,b){var c={};c.devicestring="";for(var d in a.body)if(/^str\_(\S+)/.test(d)){var e=RegExp.$1;console.log(e),c.devicestring+=e+"="+a.body[d]+"&"}else c[d]=a.body[d];c.devicestring+="secret="+a.body.password+"&",c.devicestring=c.devicestring.toString().substring(0,c.devicestring.length-1),c.devicenumber=c.accountcode,async.auto({isHaveCheck:function(a){Schemas.pbxExtension.find(c.id,function(b,c){a(b,c)})},createNew:["isHaveCheck",function(a,b){null!==b.isHaveCheck?a(null,-1):(c.id=c.accountcode,Schemas.pbxExtension.create(c,function(b,c){a(b,c)}))}],updateOld:["isHaveCheck",function(a,b){null===b.isHaveCheck?a(null,-1):Schemas.pbxExtension.update({where:{id:c.id},update:c},function(b,c){a(b,c)})}],addlocalnum:["createNew",function(a,b){commfun.addlocalnum(b.createNew.id,"extension","",a)}]},function(a,c){var d={success:"",id:"",msg:""};-1!==c.createNew?c.createNew.isValid(function(a){a?(d.success="OK",d.msg="新增成功!",d.id=c.createNew.id):(d.success="ERROR",d.msg="服务器感知到你提交的数据非法，不予受理！")}):-1!==c.updateOld?(d.success="OK",d.msg="修改成功!",d.id=c.updateOld.id):a&&(console.log(a),d.success="ERROR",d.msg="保存数据发生异常,请联系管理员！"),b.send(d)})},posts.checkAjax=function(a,b){var c=a.body.param,d=a.body.name;checkFun[d](c,b)},posts.table=function(a,b){console.log("BODY:",a.body);var c=a.body.dbName,d=a.body.iDisplayStart,e=a.body.iDisplayLength;-1==e&&(e=1e4);for(var f=(parseInt(a.body.iColumns),a.body.sColumns.split(",")),g=a.body.iSortingCols,h="",i=0;g>i;i++){var j=a.body["iSortCol_"+i],k=a.body["bSortable_"+j];if("true"==k&&""!=h){var l=a.body["sSortDir_"+i];h+=","+f[j]+" "+("asc"===l?"asc":"desc")}else if("true"==k&&""==h){var l=a.body["sSortDir_"+i];h+=f[j]+" "+("asc"===l?"asc":"desc")}}(null==h||""==h)&&(h="id DESC"),console.log("排序条件:",h);var m={};m.id={neq:""};for(var n=parseInt(a.body.whereCount),i=0;n>i;i++){var o=a.body["whereCol_"+i],p=a.body["whereWay_"+i],q=a.body["whereValue_"+i];q&&""!=q&&-1!=q&&(m[o]={},p&&""!=p?m[o][p]=q:m[o]=q)}console.log("查询条件:",m),async.auto({count:function(a){Schemas[c].count(m,function(b,c){a(b,c)})},search:function(a){Schemas[c].all({where:m,order:h,skip:d,limit:e},function(b,c){a(b,c)})}},function(c,d){if(c)b.send({error:c});else{var e={};e.iTotalRecords=d.count,e.iTotalDisplayRecords=d.count,e.sEcho=a.body.sEcho,e.aaData=d.search,b.send(e)}})},posts.xls2all=function(){};
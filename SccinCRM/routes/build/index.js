/*! 路由处理程序 2014-04-11 */
var conf=require("node-conf"),basedir=conf.load("app").appbase,Schemas=require(basedir+"/database/schema").Schemas,logger=require(basedir+"/lib/logger").logger("web"),async=require("async"),util=require("util"),crypto=require("crypto"),gets={},posts={};gets.index=function(a,b,c){logger.debug(a.session);var d=a.session.user,e=a.session.exten,f=a.session.department,g=a.session.role;a.session.user&&a.session.exten&&a.session.role?async.auto({getRoleMenmus:function(a){var b=new Array;for(var c in Schemas.manageUserRole.relations)b.push(c);logger.info("具有的关系:",b),"0"===g.id?a(null,"*"):Schemas.manageUserRole.findOne({include:b,where:{id:g.id}},function(b,c){logger.info(c),a(b,c.__cachedRelations.users)})},getMenmus:["getRoleMenmus",function(a,b){var c={};util.isArray(b.getRoleMenmus)||(c.id={neq:""}),Schemas.manageMenmus.all({include:[],where:c},function(b,c){a(b,c)})}],setMenmus:["getMenmus",function(a,b){var c={},d={};if(c.starmenmu_grsz={title:"个人设置",url:"/UserManager/EditSelf",winWidth:600,winHeight:400,apptype:"appwin",postdata:{}},c.starmenmu_syzn={title:"使用指南",url:"/RoleAdmin/Index",winWidth:1100,winHeight:650,apptype:"appwin",postdata:{}},c.starmenmu_gywm={title:"关于我们",url:"http://zjk.sccin.com/zhinan.html",winWidth:1100,winHeight:650,apptype:"appwin",postdata:{}},c.starmenmu_tcxt={title:"退出系统",url:"/Login/Index",winWidth:1100,winHeight:650,apptype:"loginout",postdata:{}},b.getMenmus.length>0)for(var e=0;e<b.getMenmus.length;e++)7===b.getMenmus[e].mgID?c["sub_item_xtsz_"+b.getMenmus[e].id]={title:b.getMenmus[e].menName,url:b.getMenmus[e].menURL,apptype:"appwin",postdata:{}}:8===b.getMenmus[e].mgID?c["sub_item_pbx_"+b.getMenmus[e].id]={title:b.getMenmus[e].menName,url:b.getMenmus[e].menURL,apptype:"appwin",postdata:{}}:d["menmu_"+b.getMenmus[e].id]={title:b.getMenmus[e].menName,url:b.getMenmus[e].menURL};a(null,{startmenmus:c,menmus:d})}]},function(a,h){a?c(a):b.render("index.html",{layout:!1,user:{id:d.id,name:d.uName},department:{id:f.id,name:f.depName},role:{id:g.id,name:g.roleName,isAgent:g.isAgent},exten:{number:e.id,proto:e.deviceproto},umenmus:h.getMenmus,menmus:util.inspect(h.setMenmus.startmenmus),startmenmus:util.inspect(h.setMenmus.startmenmus)})}):b.redirect("/login")},posts.index=function(){},module.exports={get:gets,post:posts};
/*! 路由处理程序 2014-04-30 */
function authentication(a,b,c){var d=new Array;for(var e in Schemas.manageUserInfo.relations)d.push(e);logger.debug("具有的关系:",d);try{Schemas.manageUserInfo.findOne({include:d,where:{uLogin:a,uPass:b}},function(a,b){a?(logger.error(a),c("登陆服务器发生异常，请联系管理员！",null)):null===b?c("用户名或密码错误，请重试！",null):c(null,b)})}catch(f){logger.error(f),c("登陆服务器发生异常，请联系管理员！",null)}}function setsession(a,b,c,d){if(null===a)d("传入非法用户！",null);else try{c.session.user=a,c.session.department=a.__cachedRelations.department,c.session.role=a.__cachedRelations.role,c.session.exten=b,d(null,c.session)}catch(e){logger.error(e),d("登陆服务器发生异常，请联系管理员！",null)}}function findexten(a,b){Schemas.pbxExtension.find(a,function(a,c){a?b("查找分机发生异常!",null):null===c?b("系统不存在该分机号!",null):b(null,c)})}var conf=require("node-conf"),basedir=conf.load("app").appbase,Schemas=require(basedir+"/database/schema").Schemas,logger=require(basedir+"/lib/logger").logger("web"),async=require("async"),crypto=require("crypto"),_=require("lodash"),gets={},posts={};gets.index=function(a,b){b.render("login.html",{layout:!1,username:"",password:"",exten:"",tip:""})},posts.index=function(a,b){var c=a.body.username||"",d=a.body.password||"",e=a.body.exten||"",f=crypto.createHash("md5"),g=f.update(d).digest("hex").toUpperCase();async.auto({authentication:function(a){authentication(c,g,a)},findUseExten:["authentication",function(a,b){""===e&&(e=b.authentication.uExten),findexten(e,a)}],setsession:["findUseExten",function(b,c){setsession(c.authentication,c.findUseExten,a,b)}]},function(a){a?b.render("login.html",{layout:!1,username:c,password:"",exten:e,tip:a}):b.redirect("/")})},module.exports={get:gets,post:posts};
/*! 路由处理程序 2014-10-16 */
function savedata(a,b,c){var d=[],e=[],f=a.trunkproto,g=parseInt(a.lines);if("FXO"===f)for(var h=b+1;g+b>=h;h++)d.push(h);else{var i=16+b;a.datalines&&""!=a.datalines&&(i=parseInt(a.datalines)+b);for(var j=b+1;g+b>=j;j++)j==i?(e.push(i),i+=31):d.push(j)}async.auto({addTline:function(b){addTline(a,d,function(a,c){b(a,c)})},addDline:function(b){addDline(a,e,function(a,c){b(a,c)})}},function(a,b){c(a,b)})}function addTline(a,b,c){async.each(b,function(b,c){var d={};d.line=b,d.cardname=a.cardname,d.driver=a.driver,d.trunkproto=a.trunkproto,Schemas.pbxCard.create(d,function(a,b){c(a,b)})},function(a,b){c(a,b)})}function addDline(a,b,c){async.each(b,function(b,c){var d={};d.line=b,d.cardname=a.cardname,d.driver=a.driver,d.dataline="是",d.trunkproto=a.trunkproto,Schemas.pbxCard.create(d,function(a,b){c(a,b)})},function(a,b){c(a,b)})}var conf=require("node-conf"),basedir=conf.load("app").appbase,Schemas=require(basedir+"/database/schema").Schemas,logger=require(basedir+"/lib/logger").logger("web"),guid=require("guid"),async=require("async"),gets={},posts={};module.exports={get:gets,post:posts},gets.index=function(a,b){b.render("pbx/Card/list.html",{baseurl:a.path,modename:"pbxCard"})},posts.save=function(a,b){var c={};for(var d in a.body)c[d]=a.body[d];async.auto({isHaveCheck:function(a){Schemas.pbxCard.findOne({where:{cardname:c.cardname}},function(b,c){a(b,c)})},lastLineNumber:function(a){Schemas.pbxCard.findOne({order:"line desc"},function(b,c){a(b,c)})},create:["isHaveCheck","lastLineNumber",function(a,b){if(null!==b.isHaveCheck)a("已经存在同名的设备，无法添加。",-1);else{var d=0;b.lastLineNumber&&null!=b.lastLineNumber&&(d=parseInt(b.lastLineNumber.line)),console.log("message:",d),savedata(c,d,function(b,c){a(b,c)})}}]},function(a){var c={success:"",id:"",msg:""};a?(console.log(a),c.success="ERROR",c.msg="保存数据发生异常,请联系管理员！"):(c.success="OK",c.msg="新增成功!"),b.send(c)})},posts.delete=function(a,b){var c=a.body.cardname;Schemas.pbxCard.all({where:{cardname:c},order:"line desc"},function(a,c){var d={};a?(d.success="ERROR",d.msg="查询数据发生异常,请联系管理员！",b.send(d)):c&&0!=c.length?async.auto({deleterows:function(a){async.each(c,function(a,b){a.destroy(function(a){b(a,-1)})},function(b,c){a(b,c)})},updateRows:function(a){Schemas.pbxCard.query("update `pbxCard` set `line`=`line`-"+c.length+" where `line`>"+c[0].line,function(b,c){a(b,c)})}},function(a){a?(logger.error(a),d.success="ERROR",d.msg="删除数据发生异常,请联系管理员！！"):(d.success="OK",d.msg="删除成功！"),b.send(d)}):(d.success="ERROR",d.msg="没有找到需要删除的数据！",b.send(d))})};
/*! 路由处理程序 2015-03-31 */
function mkdirs(a,b,c,d){("function"==typeof b||void 0===b)&&(c=b,b=511&~process.umask()),d||(d=null);var e=c||function(){};"string"==typeof b&&(b=parseInt(b,8)),a=path.resolve(a),fs.mkdir(a,b,function(c){if(!c)return d=d||a,e(null,d);switch(c.code){case"ENOENT":mkdirs(path.dirname(a),b,function(c,d){c?e(c,d):mkdirs(a,b,e,d)});break;default:fs.stat(a,function(a,b){a||!b.isDirectory()?e(c,d):e(null,d)})}})}function copyFile(a,b,c){async.waterfall([function(a){fs.exists(b,function(b){b?a(null,!1):a(null,!0)})},function(a,c){a?mkdirs(path.dirname(b),c):c(null,!0)},function(c,d){var e=fs.createReadStream(a),f=fs.createWriteStream(path.join(path.dirname(b),path.basename(a)));e.pipe(f),e.on("end",function(){f.end(),d(null)}),e.on("error",function(a){console.log("error occur in reads"),d(!0,a)})}],c)}function _ccoutTask(a,b,c){async.waterfall([function(b){fs.stat(a,b)},function(d,e){d.isFile()?(c.addFile(a,b),e(null,[])):d.isDirectory()&&fs.readdir(a,e)},function(d,e){if(d.length)for(var f=0;f<d.length;f++)_ccoutTask(path.join(a,d[f]),path.join(b,d[f]),c.increase());e(null)}],c)}function ccoutTask(a,b,c){function d(a){f--,(a||0>=f)&&c(a,e)}var e=[],f=1;d.increase=function(){return f++,d},d.addFile=function(a,b){e.push({file:a,dir:b})},_ccoutTask(a,b,d)}function copyDir(a,b,c){c||(c=function(){}),async.waterfall([function(b){fs.exists(a,function(c){c?b(null,!0):(console.log(a+" not exists"),b(!0))})},function(b,c){fs.stat(a,c)},function(c,d){c.isFile()?copyFile(a,b,function(a){a?d(!0):d(null,[])}):c.isDirectory()&&ccoutTask(a,b,d)},function(a,b){async.mapLimit(a,10,function(a,b){copyFile(a.file,a.dir,b)},b)}],c)}var conf=require("node-conf"),basedir=conf.load("app").appbase,Schemas=require(basedir+"/database/schema").Schemas,guid=require("guid"),async=require("async"),logger=require(basedir+"/lib/logger").logger("web"),_=require("lodash"),fs=require("fs"),dirname=__dirname,path=require("path"),ejs=require("ejs"),asconfdir="/etc/asterisk/",dahcondir="/etc/dahdi/",gets={},posts={},commfun=require(basedir+"/lib/comfun");module.exports={get:gets,post:posts};var AsyncConfig={};AsyncConfig.sip_exten=function(){},AsyncConfig.sip_trunk=function(){async.auto({backfile:function(a){copyFile("filename",asconfdir+"back/",a)},gettrunks:function(){},gettpl:function(){},render:["gettpl",function(){}],savefile:["backfile","render",function(){}],restartAs:["savefile",function(){}]},function(){})},AsyncConfig.iax_exten=function(){},AsyncConfig.iax2_exten=function(){},AsyncConfig.iax2_trunk=function(){},AsyncConfig.iax2_trunk=function(){},AsyncConfig.queues_list=function(){},AsyncConfig.chan_dahdi=function(){},AsyncConfig.dahdi_channels=function(){},posts.asynconfig=function(a,b){var c=a.body.asynctype;_.isFunction(AsyncConfig[c])?AsyncConfig[c](function(){}):b.send({success:!1,msg:""})};
/*! 路由处理程序 2014-05-05 */
var conf=require("node-conf"),basedir=conf.load("app").appbase,Schemas=require(basedir+"/database/schema").Schemas,logger=require(basedir+"/lib/logger").logger("web"),guid=require("guid"),async=require("async"),nhe=require("node-highcharts-exporter"),gets={},posts={};module.exports={get:gets,post:posts},gets.dycharts=function(a,b){b.render("pbx/dycharts/dychart.html",{layout:"highstock.html"})},posts.exportpic=function(a,b){var c=require("path").dirname(require.main.filename)+"/exported_charts";nhe.config.set("processingDir",c);var d=a.body;nhe.exportChart(d,function(a,c){a?b.send(a):b.download(c.filePath,function(){})})};
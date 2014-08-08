/*! 路由处理程序 2014-08-08 */
var conf=require("node-conf"),basedir=conf.load("app").appbase,Schemas=require(basedir+"/database/schema").Schemas,logger=require(basedir+"/lib/logger").logger("web"),guid=require("guid"),async=require("async"),nhe=require("node-highcharts-exporter"),moment=require("moment"),util=require("util"),gets={},posts={};module.exports={get:gets,post:posts},gets.dycharts=function(a,b){b.render("pbx/dycharts/dychart.html",{layout:"highstock.html"})},gets.agentCalls=function(a,b){b.render("pbx/dycharts/agentCalls.html",{layout:"highchart.html"})},posts.chartDone=function(a,b,c){var d=a.body.iswork||"days",e=a.body.charttype||"calltimes",f=a.body.dept||"",g=a.body.timefrom||"",h=a.body.timeto||"",i=a.body.searchtype||"tablelist";async.auto({findUser:function(a){var b={};b.depId=f&&""!=f?f:{neq:""},Schemas.manageUserInfo.all({where:b},function(b,c){b?a(b,null):c.length<1?a("没有找到用户信息。",null):a(null,c)})},findAccount:["findUser",function(a,b){var c=[],d=[];async.each(b.findUser,function(a,b){c.push(a.uExten),d.push(a.uName),b()},function(){logger.debug(c,d),a(null,{extens:c,unames:d})})}],findDbs:["findAccount",function(a,b){if("days"===d){""===g&&""===h?(g=moment().format("YYYY-MM-DD")+" 00:00:00",h=moment().format("YYYY-MM-DD")+" 23:59:59"):""===g&&""!==h?(g=h+" 00:00:00",h+=" 23:59:59"):""!==g&&""===h?(g+=" 00:00:00",h=g+" 23:59:59"):(g+=" 00:00:00",h+=" 23:59:59");var c=" sum(time_to_sec(timediff(endtime,startime))) as lhvly ",f=b.findAccount.extens.join(",");"calltimes"===e&&(c=" sum(1) as lhvly ");var i="select accountcode,routerline,"+c+",DATE_FORMAT(startime,'%Y-%m-%\\d') as tag from pbxCdr ";i+=" where accountcode in ("+f+") and startime >= '"+g+"' and startime<='"+h+"' ",i+=" group by accountcode,routerline,DATE_FORMAT(startime,'%Y-%m-%\\d') ",i+=" order by DATE_FORMAT(startime,'%Y-%m-%\\d') asc ",Schemas.manageUserInfo.query(i,function(c,d){if(c)a(c,d);else{for(var e={},f=0;f<=d.length;f++){for(var g={},h=0;h<b.findAccount.extens.length;h++)g[b.findAccount.extens[h]]={},g[b.findAccount.extens[h]]["呼入"]=0,g[b.findAccount.extens[h]]["呼出"]=0;if(g["总计"]={},g["总计"]["呼入"]=0,g["总计"]["呼出"]=0,f==d.length)e["总计"]=g;else{if("object"==typeof e[d[f].tag])continue;e[d[f].tag]=g}}async.eachSeries(d,function(a,b){e[a.tag][a.accountcode][a.routerline]=a.lhvly,e[a.tag]["总计"][a.routerline]+=a.lhvly,e["总计"][a.accountcode][a.routerline]+=a.lhvly,e["总计"]["总计"][a.routerline]+=a.lhvly,b()},function(){logger.debug(e),a(null,e)})}})}else if("week"===d){""===g&&""===h?(g=moment().format("YYYY-MM-DD")+" 00:00:00",h=moment().format("YYYY-MM-DD")+" 23:59:59"):""===g&&""!==h?(g=h+" 00:00:00",h+=" 23:59:59"):""!==g&&""===h?(g+=" 00:00:00",h=g+" 23:59:59"):(g+=" 00:00:00",h+=" 23:59:59");var c=" sum(time_to_sec(timediff(endtime,startime))) as lhvly ",f=b.findAccount.extens.join(",");"calltimes"===e&&(c=" sum(1) as lhvly ");var i="select accountcode,routerline,"+c+",WEEKDAY(date(startime)) as tag from pbxCdr ";i+=" where accountcode in ("+f+") and startime >= '"+g+"' and startime<='"+h+"' ",i+=" group by accountcode,routerline,WEEKDAY(date(startime))  ",i+=" order by WEEKDAY(date(startime))  asc ",Schemas.manageUserInfo.query(i,function(c,d){if(c)a(c,d);else{for(var e={},f=["星期一","星期二","星期三","星期四","星期五","星期六","星期日","总计"],g=0;g<f.length;g++){for(var h={},i=0;i<b.findAccount.extens.length;i++)h[b.findAccount.extens[i]]={},h[b.findAccount.extens[i]]["呼入"]=0,h[b.findAccount.extens[i]]["呼出"]=0;h["总计"]={},h["总计"]["呼入"]=0,h["总计"]["呼出"]=0,e[f[g]]=h}async.eachSeries(d,function(a,b){e[f[a.tag]][a.accountcode][a.routerline]=a.lhvly,e[f[a.tag]]["总计"][a.routerline]+=a.lhvly,e["总计"][a.accountcode][a.routerline]+=a.lhvly,e["总计"]["总计"][a.routerline]+=a.lhvly,b()},function(){logger.debug(e),a(null,e)})}})}else if("month"===d){""===g&&""===h?(g=moment().format("YYYY-MM")+"-01 00:00:00",h=moment().format("YYYY-MM")+"-31 23:59:59"):""===g&&""!==h?(g=h+"-01 00:00:00",h+="-31 23:59:59"):""!==g&&""===h?(g+="-01 00:00:00",h=g+"-31 23:59:59"):(g+="-01 00:00:00",h+="-31 23:59:59");var c=" sum(time_to_sec(timediff(endtime,startime))) as lhvly ",f=b.findAccount.extens.join(",");"calltimes"===e&&(c=" sum(1) as lhvly ");var i="select accountcode,routerline,"+c+",MONTH(date(startime)) as tag from pbxCdr ";i+=" where accountcode in ("+f+") and startime >= '"+g+"' and startime<='"+h+"' ",i+=" group by accountcode,routerline,MONTH(date(startime))  ",i+=" order by MONTH(date(startime))  asc ",Schemas.manageUserInfo.query(i,function(c,d){if(c)a(c,d);else{for(var e={},f=["空","一月","二月","三月","四月","五月","六月","七月","八月","九月","十月","十一月","十二月","总计"],g=1;g<f.length;g++){for(var h={},i=0;i<b.findAccount.extens.length;i++)h[b.findAccount.extens[i]]={},h[b.findAccount.extens[i]]["呼入"]=0,h[b.findAccount.extens[i]]["呼出"]=0;h["总计"]={},h["总计"]["呼入"]=0,h["总计"]["呼出"]=0,e[f[g]]=h}async.eachSeries(d,function(a,b){e[f[a.tag]][a.accountcode][a.routerline]=a.lhvly,e[f[a.tag]]["总计"][a.routerline]+=a.lhvly,e["总计"][a.accountcode][a.routerline]+=a.lhvly,e["总计"]["总计"][a.routerline]+=a.lhvly,b()},function(){logger.debug(e),a(null,e)})}})}else if("jidu"===d){""===g&&""===h?(g=moment().format("YYYY-MM")+"-01 00:00:00",h=moment().format("YYYY-MM")+"-31 23:59:59"):""===g&&""!==h?(g=h+"-01 00:00:00",h+="-31 23:59:59"):""!==g&&""===h?(g+="-01 00:00:00",h=g+"-31 23:59:59"):(g+="-01 00:00:00",h+="-31 23:59:59");var c=" sum(time_to_sec(timediff(endtime,startime))) as lhvly ",f=b.findAccount.extens.join(",");"calltimes"===e&&(c=" sum(1) as lhvly ");var i="select accountcode,routerline,"+c+",QUARTER(date(startime)) as tag from pbxCdr ";i+=" where accountcode in ("+f+") and startime >= '"+g+"' and startime<='"+h+"' ",i+=" group by accountcode,routerline,QUARTER(date(startime))  ",i+=" order by QUARTER(date(startime))  asc ",Schemas.manageUserInfo.query(i,function(c,d){if(c)a(c,d);else{for(var e={},f=["空","第一季度","第二季度","第三季度","第四季度","总计"],g=1;g<f.length;g++){for(var h={},i=0;i<b.findAccount.extens.length;i++)h[b.findAccount.extens[i]]={},h[b.findAccount.extens[i]]["呼入"]=0,h[b.findAccount.extens[i]]["呼出"]=0;h["总计"]={},h["总计"]["呼入"]=0,h["总计"]["呼出"]=0,e[f[g]]=h}async.eachSeries(d,function(a,b){e[f[a.tag]][a.accountcode][a.routerline]=a.lhvly,e[f[a.tag]]["总计"][a.routerline]+=a.lhvly,e["总计"][a.accountcode][a.routerline]+=a.lhvly,e["总计"]["总计"][a.routerline]+=a.lhvly,b()},function(){logger.debug(e),a(null,e)})}})}else{""===g&&""===h?(g=moment().format("YYYY")+"-01-01 00:00:00",h=moment().format("YYYY")+"-12-31 23:59:59"):""===g&&""!==h?(g=h+"-01-01 00:00:00",h+="-12-31 23:59:59"):""!==g&&""===h?(g+="-01-01 00:00:00",h=g+"-12-31 23:59:59"):(g+="-01-01 00:00:00",h+="-12-31 23:59:59");var c=" sum(time_to_sec(timediff(endtime,startime))) as lhvly ",f=b.findAccount.extens.join(",");"calltimes"===e&&(c=" sum(1) as lhvly ");var i="select accountcode,routerline,"+c+",YEAR(date(startime)) as tag from pbxCdr ";i+=" where accountcode in ("+f+") and startime >= '"+g+"' and startime<='"+h+"' ",i+=" group by accountcode,routerline,YEAR(date(startime))  ",i+=" order by YEAR(date(startime))  asc ",Schemas.manageUserInfo.query(i,function(c,d){if(c)a(c,d);else{for(var e={},f=0;f<=d.length;f++){for(var g={},h=0;h<b.findAccount.extens.length;h++)g[b.findAccount.extens[h]]={},g[b.findAccount.extens[h]]["呼入"]=0,g[b.findAccount.extens[h]]["呼出"]=0;if(g["总计"]={},g["总计"]["呼入"]=0,g["总计"]["呼出"]=0,f==d.length)e["总计"]=g;else{if("object"==typeof e[d[f].tag])continue;e[d[f].tag]=g}}async.eachSeries(d,function(a,b){e[a.tag][a.accountcode][a.routerline]=a.lhvly,e[a.tag]["总计"][a.routerline]+=a.lhvly,e["总计"][a.accountcode][a.routerline]+=a.lhvly,e["总计"]["总计"][a.routerline]+=a.lhvly,b()},function(){logger.debug(e),a(null,e)})}})}}]},function(a,d){if(a)c(a);else if("tablelist"===i)b.partial("pbx/dycharts/tablelist.html",{userinfo:d.findAccount,datas:d.findDbs});else if("zzcart"===i){var f=["#B23AEE","#B0C4DE","#9F79EE","#98F5FF","#8B7D7B","#8B1A1A","#708090","#CD8500","#CDC673","#CDC9A5","#EDEDED","#EED2EE","#FF3E96","#698B22","#6959CD","#00CD66"],j="统计时间从"+g.split(/\s+/)[0]+"至"+h.split(/\s+/)[0],k="";for(var l in d.findDbs)k+='"'+l+'",';k=k.replace(/\,$/,"");var m="",n="",o=0;for(var p in d.findAccount.unames){var q="",r="";for(var l in d.findDbs)q+=d.findDbs[l][d.findAccount.extens[o]]["呼入"]+",",r+=d.findDbs[l][d.findAccount.extens[o]]["呼出"]+",";q=q.replace(/\,$/,""),r=r.replace(/\,$/,""),m+='{"name": "'+d.findAccount.unames[p]+'-呼入",',m+='"color": "'+f[o]+'",',m+='"data":['+q+'],"pointPadding": 0.3,"pointPlacement": "on"},',n+='{"name": "'+d.findAccount.unames[p]+'-呼出",',n+='"color": "'+f[f.length-1-o]+'",',n+=' "data":['+r+'],"pointPadding": 0.3,"pointPlacement": "on","yAxis": 1},',o++}var q="",r="";for(var l in d.findDbs)q+=d.findDbs[l]["总计"]["呼入"]+",",r+=d.findDbs[l]["总计"]["呼出"]+",";q=q.replace(/\,$/,""),r=r.replace(/\,$/,""),m+='{"name": "总计-呼入",',m+='"color": "#C1CDC1",',m+='"data":['+q+'],"pointPadding": 0.3,"pointPlacement": "on"},',n+='{"name": "总计-呼出",',n+='"color": "#BDB76B",',n+=' "data":['+r+'],"pointPadding": 0.3,"pointPlacement": "on","yAxis": 1},',n=n.replace(/\,$/,"");var s=m+n;b.partial("pbx/dycharts/zzchart.html",{title:j,categories:k,series:s})}else if("bzcart"===i){var j="统计时间从"+g.split(/\s+/)[0]+"至"+h.split(/\s+/)[0],q=d.findDbs["总计"]["总计"]["呼入"],r=d.findDbs["总计"]["总计"]["呼出"],t="秒";"calltimes"===e&&(t="次");var u="呼入："+q+t+",呼出:"+r+t,v=q+r;0==v?(q=.5,r=.5):(q/=v,r=1-q),b.partial("pbx/dycharts/bzchart.html",{title:j,subtitle:u,callin:q,callout:r})}})},posts.exportpic=function(a,b){var c=require("path").dirname(require.main.filename)+"/exported_charts";nhe.config.set("processingDir",c);var d=a.body;nhe.exportChart(d,function(a,c){a?b.send(a):b.download(c.filePath,function(){})})};
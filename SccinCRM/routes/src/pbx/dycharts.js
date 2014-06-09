var conf = require('node-conf');
var basedir = conf.load('app').appbase;
var Schemas = require(basedir + '/database/schema').Schemas;
var logger = require(basedir + '/lib/logger').logger('web');
var guid = require('guid');
var async = require('async');
var nhe = require('node-highcharts-exporter');
var moment = require('moment');
var util = require('util');

var gets = {};
var posts = {};
module.exports = {
    get: gets,
    post: posts
};

gets.dycharts = function(req, res, next) {
    res.render('pbx/dycharts/dychart.html', {
        layout: 'highstock.html'
    });
}

gets.agentCalls = function(req, res, next) {
    res.render('pbx/dycharts/agentCalls.html', {
        layout: 'highchart.html'
    });
}

//统计
posts.chartDone = function(req, res, next) {

    var iswork = req.body['iswork'] || 'days';
    var charttype = req.body['charttype'] || 'calltimes';
    var dept = req.body['dept'] || '';
    var timefrom = req.body['timefrom'] || '';
    var timeto = req.body['timeto'] || '';
    var searchtype = req.body['searchtype'] || 'tablelist';

    async.auto({
        findUser: function(cb) {
            var where = {};
            if (dept && dept != "") {
                where.depId = dept;
            } else {
                where.depId = {
                    "neq": ""
                };
            }
            Schemas.manageUserInfo.all({
                where: where
            }, function(err, dbs) {
                if (err)
                    cb(err, null);
                else if (dbs.length < 1)
                    cb("没有找到用户信息。", null);
                else
                    cb(null, dbs);
            });
        },
        findAccount: ['findUser',
            function(cb, results) {
                var extens = [];
                var unames = [];
                async.each(results.findUser, function(item, callback) {
                    extens.push(item.uExten);
                    unames.push(item.uName);
                    callback();
                }, function(err) {
                    logger.debug(extens, unames);
                    cb(null, {
                        extens: extens,
                        unames: unames
                    });
                });
            }
        ],
        findDbs: ["findAccount",
            function(cb, results) {
                //select accountcode,routerline,sum(time_to_sec(timediff(endtime,startime))) as usetime from pbxCdr where accountcode in('8001','8002','8003','8004') group by accountcode,routerline;
                //select accountcode,routerline,sum(time_to_sec(timediff(endtime,startime))) as usetime,DATE_FORMAT(endtime,'%Y-%m-%d') from pbxCdr where accountcode in('8001','8002','8003','8004') group by accountcode,routerline,DATE_FORMAT(endtime,'%Y-%m-%d') order by DATE_FORMAT(endtime,'%Y-%m-%d') asc;0
                //按日期范围统计
                if (iswork === "days") {
                    if (timefrom === '' && timeto === '') {
                        timefrom = moment().format("YYYY-MM-DD") + " 00:00:00";
                        timeto = moment().format("YYYY-MM-DD") + " 23:59:59";
                    } else if (timefrom === '' && timeto !== '') {
                        timefrom = timeto + " 00:00:00";
                        timeto = timeto + " 23:59:59";
                    } else if (timefrom !== '' && timeto === '') {
                        timefrom = timefrom + " 00:00:00";
                        timeto = timefrom + " 23:59:59";
                    } else {
                        timefrom = timefrom + " 00:00:00";
                        timeto = timeto + " 23:59:59";
                    }

                    var tjtype = " sum(time_to_sec(timediff(endtime,startime))) as lhvly ";
                    var accounts = results.findAccount.extens.join(",");
                    if (charttype === 'calltimes')
                        tjtype = " sum(1) as lhvly ";
                    var sql = "select accountcode,routerline," + tjtype + ",DATE_FORMAT(startime,'%Y-%m-%\\d') as tag from pbxCdr ";
                    sql += " where accountcode in (" + accounts + ") and startime >= '" + timefrom + "' and startime<='" + timeto + "' ";
                    sql += " group by accountcode,routerline,DATE_FORMAT(startime,'%Y-%m-%\\d') ";
                    sql += " order by DATE_FORMAT(startime,'%Y-%m-%\\d') asc ";



                    Schemas.manageUserInfo.query(sql, function(err, dbs) {
                        if (err)
                            cb(err, dbs);
                        else {
                            var datas = {};
                            for (var i = 0; i <= dbs.length; i++) {
                                var tmp = {};
                                for (var j = 0; j < results.findAccount.extens.length; j++) {
                                    tmp[results.findAccount.extens[j]] = {}
                                    tmp[results.findAccount.extens[j]]["呼入"] = 0;
                                    tmp[results.findAccount.extens[j]]["呼出"] = 0;
                                }
                                tmp["总计"] = {};
                                tmp["总计"]["呼入"] = 0;
                                tmp["总计"]["呼出"] = 0;


                                if (i == dbs.length)
                                    datas["总计"] = tmp;
                                else if (typeof(datas[dbs[i].tag]) === 'object') {
                                    continue;
                                } else {
                                    datas[dbs[i].tag] = tmp;
                                }


                            }

                            async.eachSeries(dbs, function(item, callback) {
                                datas[item.tag][item.accountcode][item.routerline] = item.lhvly;
                                datas[item.tag]["总计"][item.routerline] += item.lhvly;
                                datas["总计"][item.accountcode][item.routerline] += item.lhvly;
                                datas["总计"]["总计"][item.routerline] += item.lhvly;
                                callback();

                            }, function(err) {
                                logger.debug(datas);
                                cb(null, datas);
                            });
                        }
                    });
                }
                //按周统计
                else if (iswork === "week") {
                    if (timefrom === '' && timeto === '') {
                        timefrom = moment().format("YYYY-MM-DD") + " 00:00:00";
                        timeto = moment().format("YYYY-MM-DD") + " 23:59:59";
                    } else if (timefrom === '' && timeto !== '') {
                        timefrom = timeto + " 00:00:00";
                        timeto = timeto + " 23:59:59";
                    } else if (timefrom !== '' && timeto === '') {
                        timefrom = timefrom + " 00:00:00";
                        timeto = timefrom + " 23:59:59";
                    } else {
                        timefrom = timefrom + " 00:00:00";
                        timeto = timeto + " 23:59:59";
                    }

                    var tjtype = " sum(time_to_sec(timediff(endtime,startime))) as lhvly ";
                    var accounts = results.findAccount.extens.join(",");
                    if (charttype === 'calltimes')
                        tjtype = " sum(1) as lhvly ";
                    var sql = "select accountcode,routerline," + tjtype + ",WEEKDAY(date(startime)) as tag from pbxCdr ";
                    sql += " where accountcode in (" + accounts + ") and startime >= '" + timefrom + "' and startime<='" + timeto + "' ";
                    sql += " group by accountcode,routerline,WEEKDAY(date(startime))  ";
                    sql += " order by WEEKDAY(date(startime))  asc ";
                    Schemas.manageUserInfo.query(sql, function(err, dbs) {
                        if (err)
                            cb(err, dbs);
                        else {
                            var datas = {};
                            var weekcn = ['星期一', '星期二', '星期三', '星期四', '星期五', '星期六', '星期日', '总计'];
                            for (var i = 0; i < weekcn.length; i++) {
                                var tmp = {};
                                for (var j = 0; j < results.findAccount.extens.length; j++) {
                                    tmp[results.findAccount.extens[j]] = {}
                                    tmp[results.findAccount.extens[j]]["呼入"] = 0;
                                    tmp[results.findAccount.extens[j]]["呼出"] = 0;
                                }
                                tmp["总计"] = {};
                                tmp["总计"]["呼入"] = 0;
                                tmp["总计"]["呼出"] = 0;
                                datas[weekcn[i]] = tmp;
                            }

                            async.eachSeries(dbs, function(item, callback) {
                                datas[weekcn[item.tag]][item.accountcode][item.routerline] = item.lhvly;
                                datas[weekcn[item.tag]]["总计"][item.routerline] += item.lhvly;
                                datas["总计"][item.accountcode][item.routerline] += item.lhvly;
                                datas["总计"]["总计"][item.routerline] += item.lhvly;
                                callback();

                            }, function(err) {
                                logger.debug(datas);
                                cb(null, datas);
                            });

                        }
                    });

                }
                //按月统计
                else if (iswork === "month") {
                    if (timefrom === '' && timeto === '') {
                        timefrom = moment().format("YYYY-MM") + "-01 00:00:00";
                        timeto = moment().format("YYYY-MM") + "-31 23:59:59";
                    } else if (timefrom === '' && timeto !== '') {
                        timefrom = timeto + "-01 00:00:00";
                        timeto = timeto + "-31 23:59:59";
                    } else if (timefrom !== '' && timeto === '') {
                        timefrom = timefrom + "-01 00:00:00";
                        timeto = timefrom + "-31 23:59:59";
                    } else {
                        timefrom = timefrom + "-01 00:00:00";
                        timeto = timeto + "-31 23:59:59";
                    }

                    var tjtype = " sum(time_to_sec(timediff(endtime,startime))) as lhvly ";
                    var accounts = results.findAccount.extens.join(",");
                    if (charttype === 'calltimes')
                        tjtype = " sum(1) as lhvly ";
                    var sql = "select accountcode,routerline," + tjtype + ",MONTH(date(startime)) as tag from pbxCdr ";
                    sql += " where accountcode in (" + accounts + ") and startime >= '" + timefrom + "' and startime<='" + timeto + "' ";
                    sql += " group by accountcode,routerline,MONTH(date(startime))  ";
                    sql += " order by MONTH(date(startime))  asc ";
                    Schemas.manageUserInfo.query(sql, function(err, dbs) {
                        if (err)
                            cb(err, dbs);
                        else {
                            var datas = {};
                            var months = ["空", '一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月', '总计'];
                            for (var i = 1; i < months.length; i++) {
                                var tmp = {};
                                for (var j = 0; j < results.findAccount.extens.length; j++) {
                                    tmp[results.findAccount.extens[j]] = {}
                                    tmp[results.findAccount.extens[j]]["呼入"] = 0;
                                    tmp[results.findAccount.extens[j]]["呼出"] = 0;
                                }
                                tmp["总计"] = {};
                                tmp["总计"]["呼入"] = 0;
                                tmp["总计"]["呼出"] = 0;
                                datas[months[i]] = tmp;
                            }

                            async.eachSeries(dbs, function(item, callback) {
                                datas[months[item.tag]][item.accountcode][item.routerline] = item.lhvly;
                                datas[months[item.tag]]["总计"][item.routerline] += item.lhvly;
                                datas["总计"][item.accountcode][item.routerline] += item.lhvly;
                                datas["总计"]["总计"][item.routerline] += item.lhvly;
                                callback();

                            }, function(err) {
                                logger.debug(datas);
                                cb(null, datas);
                            });

                        }
                    });
                } else if (iswork === "jidu") {
                    if (timefrom === '' && timeto === '') {
                        timefrom = moment().format("YYYY-MM") + "-01 00:00:00";
                        timeto = moment().format("YYYY-MM") + "-31 23:59:59";
                    } else if (timefrom === '' && timeto !== '') {
                        timefrom = timeto + "-01 00:00:00";
                        timeto = timeto + "-31 23:59:59";
                    } else if (timefrom !== '' && timeto === '') {
                        timefrom = timefrom + "-01 00:00:00";
                        timeto = timefrom + "-31 23:59:59";
                    } else {
                        timefrom = timefrom + "-01 00:00:00";
                        timeto = timeto + "-31 23:59:59";
                    }

                    var tjtype = " sum(time_to_sec(timediff(endtime,startime))) as lhvly ";
                    var accounts = results.findAccount.extens.join(",");
                    if (charttype === 'calltimes')
                        tjtype = " sum(1) as lhvly ";
                    var sql = "select accountcode,routerline," + tjtype + ",QUARTER(date(startime)) as tag from pbxCdr ";
                    sql += " where accountcode in (" + accounts + ") and startime >= '" + timefrom + "' and startime<='" + timeto + "' ";
                    sql += " group by accountcode,routerline,QUARTER(date(startime))  ";
                    sql += " order by QUARTER(date(startime))  asc ";
                    Schemas.manageUserInfo.query(sql, function(err, dbs) {
                        if (err)
                            cb(err, dbs);
                        else {
                            var datas = {};
                            var weekcn = ["空", '第一季度', '第二季度', '第三季度', '第四季度', '总计'];
                            for (var i = 1; i < weekcn.length; i++) {
                                var tmp = {};
                                for (var j = 0; j < results.findAccount.extens.length; j++) {
                                    tmp[results.findAccount.extens[j]] = {}
                                    tmp[results.findAccount.extens[j]]["呼入"] = 0;
                                    tmp[results.findAccount.extens[j]]["呼出"] = 0;
                                }
                                tmp["总计"] = {};
                                tmp["总计"]["呼入"] = 0;
                                tmp["总计"]["呼出"] = 0;
                                datas[weekcn[i]] = tmp;
                            }

                            async.eachSeries(dbs, function(item, callback) {
                                datas[weekcn[item.tag]][item.accountcode][item.routerline] = item.lhvly;
                                datas[weekcn[item.tag]]["总计"][item.routerline] += item.lhvly;
                                datas["总计"][item.accountcode][item.routerline] += item.lhvly;
                                datas["总计"]["总计"][item.routerline] += item.lhvly;
                                callback();

                            }, function(err) {
                                logger.debug(datas);
                                cb(null, datas);
                            });

                        }
                    });
                }
                //统计年份   
                else {
                    if (timefrom === '' && timeto === '') {
                        timefrom = moment().format("YYYY") + "-01-01 00:00:00";
                        timeto = moment().format("YYYY") + "-12-31 23:59:59";
                    } else if (timefrom === '' && timeto !== '') {
                        timefrom = timeto + "-01-01 00:00:00";
                        timeto = timeto + "-12-31 23:59:59";
                    } else if (timefrom !== '' && timeto === '') {
                        timefrom = timefrom + "-01-01 00:00:00";
                        timeto = timefrom + "-12-31 23:59:59";
                    } else {
                        timefrom = timefrom + "-01-01 00:00:00";
                        timeto = timeto + "-12-31 23:59:59";
                    }


                    var tjtype = " sum(time_to_sec(timediff(endtime,startime))) as lhvly ";
                    var accounts = results.findAccount.extens.join(",");
                    if (charttype === 'calltimes')
                        tjtype = " sum(1) as lhvly ";
                    var sql = "select accountcode,routerline," + tjtype + ",YEAR(date(startime)) as tag from pbxCdr ";
                    sql += " where accountcode in (" + accounts + ") and startime >= '" + timefrom + "' and startime<='" + timeto + "' ";
                    sql += " group by accountcode,routerline,YEAR(date(startime))  ";
                    sql += " order by YEAR(date(startime))  asc ";
                    Schemas.manageUserInfo.query(sql, function(err, dbs) {
                        if (err)
                            cb(err, dbs);
                        else {
                            var datas = {};
                            for (var i = 0; i <= dbs.length; i++) {
                                var tmp = {};
                                for (var j = 0; j < results.findAccount.extens.length; j++) {
                                    tmp[results.findAccount.extens[j]] = {}
                                    tmp[results.findAccount.extens[j]]["呼入"] = 0;
                                    tmp[results.findAccount.extens[j]]["呼出"] = 0;
                                }
                                tmp["总计"] = {};
                                tmp["总计"]["呼入"] = 0;
                                tmp["总计"]["呼出"] = 0;


                                if (i == dbs.length)
                                    datas["总计"] = tmp;
                                else if (typeof(datas[dbs[i].tag]) === 'object') {
                                    continue;
                                } else {
                                    datas[dbs[i].tag] = tmp;
                                }


                            }

                            async.eachSeries(dbs, function(item, callback) {
                                datas[item.tag][item.accountcode][item.routerline] = item.lhvly;
                                datas[item.tag]["总计"][item.routerline] += item.lhvly;
                                datas["总计"][item.accountcode][item.routerline] += item.lhvly;
                                datas["总计"]["总计"][item.routerline] += item.lhvly;
                                callback();

                            }, function(err) {
                                logger.debug(datas);
                                cb(null, datas);
                            });

                        }
                    });
                }
            }
        ]


    }, function(err, results) {
        if (err)
            next(err)
        else {
            //列表方式统计
            if (searchtype === "tablelist") {
                res.partial('pbx/dycharts/tablelist.html', {
                    userinfo: results.findAccount,
                    datas: results.findDbs
                });
            }
            //按柱状图统计
            else if (searchtype === "zzcart") {
                var colors = ["#B23AEE", "#B0C4DE", "#9F79EE", "#98F5FF",
                    "#8B7D7B", "#8B1A1A", "#708090", "#CD8500", "#CDC673", "#CDC9A5", "#EDEDED",
                    "#EED2EE", "#FF3E96", "#698B22", "#6959CD", "#00CD66"
                ];
                var title = "统计时间从" + timefrom.split(/\s+/)[0] + "至" + timeto.split(/\s+/)[0];
                var categories = "";
                for (var db in results.findDbs) {
                    categories += '"' + db + '"' + ',';
                }
                categories = categories.replace(/\,$/, "");

                var seriesA = "";
                var seriesB = "";

                var ucount = 0;
                for (var item in results.findAccount.unames) {
                    var callin = "";
                    var callout = "";
                    for (var db in results.findDbs) {
                        callin += results.findDbs[db][results.findAccount.extens[ucount]]["呼入"] + ",";
                        callout += results.findDbs[db][results.findAccount.extens[ucount]]["呼出"] + ",";
                    }
                    callin = callin.replace(/\,$/, "");
                    callout = callout.replace(/\,$/, "");
                    seriesA += '{"name": "' + results.findAccount.unames[item] + '-呼入",';
                    seriesA += '"color": "' + colors[ucount] + '",';
                    seriesA += '"data":[' + callin + '],"pointPadding": 0.3,"pointPlacement": "on"' + '},';
                    seriesB += '{"name": "' + results.findAccount.unames[item] + '-呼出",';
                    seriesB += '"color": "' + colors[colors.length - 1 - ucount] + '",';
                    seriesB += ' "data":[' + callout + '],"pointPadding": 0.3,"pointPlacement": "on"' + ',"yAxis": 1},';
                    ucount++;
                }
                var callin = "";
                var callout = "";
                for (var db in results.findDbs) {
                    callin += results.findDbs[db]['总计']["呼入"] + ",";
                    callout += results.findDbs[db]['总计']["呼出"] + ",";
                }
                callin = callin.replace(/\,$/, "");
                callout = callout.replace(/\,$/, "");
                seriesA += '{"name": "' + '总计-呼入",';
                seriesA += '"color": "#C1CDC1",';
                seriesA += '"data":[' + callin + '],"pointPadding": 0.3,"pointPlacement": "on"' + '},';
                seriesB += '{"name": "' + '总计-呼出",';
                seriesB += '"color": "#BDB76B",';
                seriesB += ' "data":[' + callout + '],"pointPadding": 0.3,"pointPlacement": "on"' + ',"yAxis": 1},';

                //seriesA = seriesA.replace(/\,$/, "");
                seriesB = seriesB.replace(/\,$/, "");
                var series = seriesA + seriesB;

                res.partial('pbx/dycharts/zzchart.html', {
                    title: title,
                    categories: categories,
                    series: series
                });
            }
            //按饼状图统计
            else if (searchtype === "bzcart") {
                var title = "统计时间从" + timefrom.split(/\s+/)[0] + "至" + timeto.split(/\s+/)[0];

                var callin = results.findDbs['总计']['总计']["呼入"];
                var callout = results.findDbs['总计']['总计']["呼出"];
                var danwei = "秒";
                if (charttype === 'calltimes')
                    danwei = "次";
                var subtitle = "呼入：" + callin + danwei + ",呼出:" + callout + danwei;
                var all = callin + callout;
                if (all == 0) {
                    callin = 0.50;
                    callout = 0.50;
                } else {
                    callin = callin / all;
                    callout = 1 - callin;
                }

                res.partial('pbx/dycharts/bzchart.html', {
                    title: title,
                    subtitle: subtitle,
                    callin: callin,
                    callout: callout
                });
            }
            //错误
            else {

            }
        }

    });

}



posts.exportpic = function(req, res, next) {
    var customExportPath = require('path').dirname(require.main.filename) + '/exported_charts';
    nhe.config.set('processingDir', customExportPath);
    var highchartsExportRequest = req.body;
    nhe.exportChart(highchartsExportRequest, function(error, exportedChartInfo) {
        if (error) { // Send an error response
            res.send(error);
        } else { // Send the file back to client
            res.download(exportedChartInfo.filePath, function() {
                // Optional, remove the directory used for intermediate
                // exporting steps
                // rmdir(exportedChartInfo.parentDir, function(err){});
            });
        }
    });
}
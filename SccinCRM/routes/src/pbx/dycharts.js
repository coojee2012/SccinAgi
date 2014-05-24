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

posts.tablelist = function(req, res, next) {

    var iswork = req.body['iswork'] || 'days';
    var charttype = req.body['charttype'] || 'calltimes';
    var dept = req.body['dept'] || '';
    var timefrom = req.body['timefrom'] || '';
    var timeto = req.body['timeto'] || '';
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
                    if (err || dbs.length < 1)
                        cb("获取用户信息发生错误!", null);
                    else
                        cb(err, dbs);
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
                        console.log(extens, unames);
                        cb(null, {
                            extens: extens,
                            unames: unames
                        });
                    });
                }
            ],
            findDbs: ["findAccount",
                function(cb, results) {
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
                                tmp["总计"]={};
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

                                /*   if (!(typeof(datas[item.tag]) === 'object')) {
                                    //console.log(item.tag);
                                    datas[item.tag] = {};
                                }


                                if (!(typeof(datas[item.tag][item.accountcode]) === 'object')) {
                                    //console.log(item.accountcode);
                                    datas[item.tag][item.accountcode] = {};
                                }

                                if (!(typeof(datas["总计"][item.accountcode]) === 'object')) {
                                    //console.log(item.accountcode);
                                    datas["总计"][item.accountcode] = {};
                                }
*/


                                datas[item.tag][item.accountcode][item.routerline] = item.lhvly;
                                datas[item.tag]["总计"][item.routerline] += item.lhvly;
                                datas["总计"][item.accountcode][item.routerline] += item.lhvly;
                                datas["总计"]["总计"][item.routerline] += item.lhvly;
                                callback();

                            }, function(err) {
                                console.log(datas);
                                cb(null, datas);
                            });
                        }
                    });
                }
            ]


        }, function(err, results) {
            if (err)
                next(err)
            else
                res.partial('pbx/dycharts/tablelist.html', {
                    userinfo: results.findAccount,
                    datas: results.findDbs
                });
        });
    } else {

        res.partial('pbx/dycharts/tablelist.html');
    }



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
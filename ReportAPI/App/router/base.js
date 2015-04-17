/**
 * Created by LinYong on 2015-02-28.
 */


function getcsv(req, res, next, db, logger) {
    var iconv = require('iconv-lite');
    var data = req.body['csv'] || "没有数据";
    var str = iconv.encode(data, 'gbk');
    var filename = req.body['filename'] || 'DefaultFileName';
    res.setHeader("Content-type", "application/csv;charset=gbk");
    //res.setHeader("Content-type","application/octet-stream");
    res.setHeader("Content-Disposition", "attachment;filename=\"" + filename + ".csv\"");
    res.send(str);
}

function exporter(req, res, next, db, logger) {
    var query = null;
    var rmdir = require('rimraf');
    if (req.method === 'POST') {
        query = req.body;
    }
    if (req.method === 'GET') {
        query = req.query;
    }
    // res.send(query);
    //var nhe = require('node-highcharts-exporter');
    var nhe = require('highcharts-exporter');
    var customExportPath = require('path').dirname(require.main.filename) + '/exported_charts';
    nhe.config.set('processingDir', customExportPath);
    var highChartsExportRequest = query;

    nhe.exportChart(highChartsExportRequest, function (error, exportedChartInfo) {
        if (error) { // Send an error response
            console.log(error);
            logger.error(error);
            res.status(500).send(error);
        }
        else { // Send the file back to client
            res.download(exportedChartInfo.filePath, function () {
                // Optional, remove the directory used for intermediate
                // exporting steps
                rmdir(exportedChartInfo.parentDir, function (err) {
                });
            });
        }
    });


}

function getReportDate(req, res, next, db, logger) {
    var date = new Date();
    date.setDate(date.getDate() - 1);
    var month = (date.getMonth() + 1) < 10 ? '0' + (date.getMonth() + 1) : (date.getMonth() + 1);
    var day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
    var str = '数据截至' + date.getFullYear() + '年' + month + '月' + day + '日';
    res.send({"success":true,"date":str});
}

module.exports = {
    exporter: exporter,
    getreportdate:getReportDate,
    getcsv: getcsv
}
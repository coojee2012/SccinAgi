var conf = require('node-conf');
var basedir = conf.load('app').appbase;
var Schemas = require(basedir + '/database/schema').Schemas;
var logger = require(basedir + '/lib/logger').logger('web');
var guid = require('guid');
var async = require('async');
var nhe   = require('node-highcharts-exporter');

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


posts.exportpic=function(req,res,next){
var customExportPath = require('path').dirname(require.main.filename) + '/exported_charts';
nhe.config.set('processingDir', customExportPath);
var highchartsExportRequest = req.body;
    nhe.exportChart(highchartsExportRequest, function(error, exportedChartInfo){
        if(error){ // Send an error response
            res.send(error);
        }
        else{ // Send the file back to client
            res.download(exportedChartInfo.filePath, function(){
                // Optional, remove the directory used for intermediate
                // exporting steps
               // rmdir(exportedChartInfo.parentDir, function(err){});
            });
        }
    });
}
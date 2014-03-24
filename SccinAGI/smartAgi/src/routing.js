var async = require('async');
var fs=require('fs');
var AsAction = require("nami").Actions;
var moment = require('moment');
var guid = require('guid');
var conf = require('node-conf').load('fastagi');
var routing = function(v) {
  this.context = v.context;
  this.schemas = v.Schemas;
  this.agiconf = v.agiconf;
  this.nami = v.nami;
  this.args = v.args;
  this.logger = v.logger;
  this.vars = v.vars;
  this.sessionnum = guid.create();
  this.ivrlevel = 0;
  this.transferlevel = 0; //防止呼叫转移死循环
  this.lastinputkey = '';
  this.routerline='';
  this.activevar = {}; //用户存储用户输入的临时变量
};

var commonfun={};
module.exports = routing;

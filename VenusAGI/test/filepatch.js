/**
 * Created by LinYong on 2015-04-09.
 */
global.basedir=__dirname;
var test=require('./lib/pathTest/index');
console.log('dirname in main :'+__dirname);
console.log('process.execPath in main :'+process.execPath);
console.log('process.cwd in main:'+process.cwd());

test.path();

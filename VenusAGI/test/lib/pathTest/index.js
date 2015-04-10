/**
 * Created by LinYong on 2015-04-09.
 */
var test = {
    init: 0,
    waiting: 2,
    path:function(){
        console.log('dirname in module :'+__dirname);
        console.log('process.execPath in module :'+process.execPath);
        console.log('process.cwd in module:'+process.cwd());
        console.log('basedir in module:'+basedir)
    }
};

module.exports = test;
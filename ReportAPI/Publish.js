/**
 * test
 * Created by LinYong on 2015-01-16.
 */
var NwBuilder = require('node-webkit-builder');
var nw = new NwBuilder({
    files: './App/**/**', // use the glob format
    platforms: ['win64'],
    buildDir:'./build',
    cacheDir:'./cache',
    buildType:function(){
        return this.appVersion;
    },
    forceDownload:false
});

//Log stuff you want

nw.on('log',  console.log);

// Build returns a promise
nw.build().then(function () {
    console.log('all done!');
}).catch(function (error) {
    console.error(error);
});

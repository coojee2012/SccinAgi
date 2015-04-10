var conf = require('node-conf');
var basedir = Venus.baseDir;
var logger = require(basedir+'/lib/logger').logger('web');
/*
 * GET home page.
 */
var gets = {};
var posts = {};
module.exports = {
  get: gets,
  post: posts
};



posts.get = function(req, res,next){
	var spawn = require('child_process').spawn;
    //free  = spawn('dir');

/*    // 捕获标准输出并将其打印到控制台
free.stdout.on('data', function (data) {
    console.log('标准输出：\n' + data);
    res.render('index', { title: 'Express'+data });
});

// 捕获标准错误输出并将其打印到控制台
free.stderr.on('data', function (data) {
    console.log('标准错误输出：\n' + data);
    res.render('index', { title: 'Express'+data });
});

// 注册子进程关闭事件
free.on('exit', function (code, signal) {
    console.log('子进程已退出，代码：' + code);
     res.render('index', { title: 'Express'+code });
});

// 注册子进程关闭事件
free.on('error', function (err) {
    console.log('子进程已退出，代码：' + err);
     res.render('index', { title: 'Express'+err });
});*/

var exec = require('child_process').exec,
    last = exec('/usr/bin/java -jar /var/lib/asterisk/agi-bin/VoiceTest_fat.jar 11',function(error, stdout, stderr){
      if(error){
        res.send('执行错误：'+error);
      
      }else{
        res.send('程序输出：'+stdout);
  }
  });

last.stdout.on('data', function (data) {
    console.log('标准输出：' + data);
});

last.on('exit', function (code) {
    console.log('子进程已关闭，代码：' + code);
});

 
};

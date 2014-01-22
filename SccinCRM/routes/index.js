
/*
 * GET home page.
 */



exports.get = function(req, res){
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
    last = exec('dir',function(error, stdout, stderr){
    res.render('index', { title: 'Express'+stdout });
  });

last.stdout.on('data', function (data) {
    console.log('标准输出：' + data);
    //res.render('index', { title: 'Express'+data });
});

last.on('exit', function (code) {
    console.log('子进程已关闭，代码：' + code);
      //res.render('index', { title: 'Express'+code });
});

 
};

exports.post = function(req, res){
  res.render('index', { title: 'Express' });
};
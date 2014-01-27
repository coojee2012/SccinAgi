var Readable = require('readable-stream');
var EventEmitter = require('events').EventEmitter;
var state = require('./state');
var ENDLINE="\n";
var Context = function(stream) {
  EventEmitter.call(this);
  //console.log(stream);
  this.stream = new Readable();
  this.stream.wrap(stream);
  this.state = state.init;
  this.msg = "";
  var self = this;
  this.stream.on('readable', function() {
    //always keep the 'leftover' part of the message
    console.log("触发读取数据:",self.state);
    self.msg = self.read();
  });
   this.stream.on('writeable', function() {
    console.log("触发了写数据");
  });
  this.msg = this.read();
  this.variables = {};
  this.pending = null;
  this.stream.on('error', this.emit.bind(this, 'error'));
  this.stream.on('close', this.emit.bind(this, 'close'));
};

require('util').inherits(Context, EventEmitter);

Context.prototype.read = function() {
  var buffer = this.stream.read();
  if(!buffer) return this.msg;
  this.msg += buffer.toString('utf8');

  if(this.state === state.init) {
    if(this.msg.indexOf('\n\n') < 0) return this.msg; //we don't have whole message
    this.readVariables(this.msg);
  } 
  else if(this.state === state.waiting) {
    var self=this;
    //console.log(self.msg,self.state);
    if(this.msg.indexOf('\n') < 0) return this.msg; //we don't have whole message
    this.readResponse(this.msg);
  }
  return "";
};

//获取AGI访问参数
Context.prototype.readVariables = function(msg) {

  var lines = msg.split('\n');
  for(var i = 0; i < lines.length; i++) {
    var line = lines[i];
    var split = line.split(':')
    var name = split[0];
    var value = split[1];
    this.variables[name] = (value||'').trim();
  }
  this.emit('variables', this.variables);
  this.setState(state.waiting);
  return "";
};

//获取AGI返回参数
Context.prototype.readResponse = function(msg) {

  var lines = msg.split('\n');
  for(var i = 0; i < lines.length; i++) {
    //console.log("触发了response",lines[i]);
    this.readResponseLine(lines[i]);
  }
  return "";
};
//序列化AGI返回参数
Context.prototype.readResponseLine = function(line) {
  //console.log(line);
  if(!line) return;
  var parsed = /^(\d{3})(?: result=)(.*)/.exec(line);
  if(!parsed) {
    return this.emit('hangup',this);//coojee添加this，用于挂机事件传入变量
  }
  var response = {
    code: parseInt(parsed[1]),
    result: parsed[2]
  };

  //our last command had a pending callback
  if(this.pending) {
    var pending = this.pending;
    this.pending = null;
    pending(null, response);
  }
  this.emit('response', response);
}

Context.prototype.setState = function(state) {
  this.state = state;
};

Context.prototype.send = function(msg, cb) {
  this.pending = cb;
  this.stream.write(msg);
};

Context.prototype.exec = function() {
  var args = Array.prototype.slice.call(arguments, 0);
  //console.log(args);
  var cmd=args.shift();
  var last = args.pop();
  if(typeof last !== 'function') {
    args.push(last);
    last = function() { }
  }
  this.send('EXEC ' +cmd+' '+ args.join(',') + '\n', last);
};

Context.prototype.getVariable = function(name, cb) {
  this.send('GET VARIABLE ' + name + '\n', cb || function() { });
};

Context.prototype.streamFile = function(filename, acceptDigits, cb) {
  if(typeof acceptDigits === 'function') {
    cb = acceptDigits;
    acceptDigits = "1234567890#*";
  }
  this.send('STREAM FILE "' + filename + '" "' + acceptDigits + '"\n', cb);
};

Context.prototype.waitForDigit = function(timeout, cb) {
  if(typeof timeout === 'function') {
    cb = timeout;
    //default to 2 second timeout
    timeout = 5000;
  }
  this.send('WAIT FOR DIGIT ' + timeout + '\n', cb);
};

Context.prototype.hangup = function(cb) {
  this.send('HANGUP'+ENDLINE, cb);
};

//应答呼叫
Context.prototype.answer=function(cb){
  this.send('ANSWER'+ENDLINE,cb);
}

//结束本次AGI会话
Context.prototype.end = function() {
  this.stream.end();
};

//通过exec扩展的一些函数

//filename 语音文件地址如果是多个语音文件用&符号连接如：file1&file2
//skip: Do not play if not answered
//noanswer: Playback without answering, otherwise the channel will
//be answered before the sound is played.

Context.prototype.Playback=function(filename,option,cb) {
  if(typeof(option)==='function'){
    cb=option;
    option='skip';
  }
  this.exec('Playback',filename,option,cb);
}
//bong放背景音
//filenames  - 播放的语音文件名称，可以通过&号连接不同的文件
//options - 播放选项
//s - 如果线路没有被应答将直接跳过，此时应用程序立即返回.
//n - 在播放前不应答.
//m - 接收到按键时打断播放.
//langoverride - 显示的指定播放的语言.
//context - 退出时,该应用程序将使用一个拨扩展
//cb - 回掉函数
Context.prototype.BackGround=function(filename,option,cb) {
  this.exec('BackGround',filename,option,cb);
}

//获取按键
//filename - 语音文件名称
//timeout - 按键超时，默认是10秒
//maxdigits - 获取获取到的最大按键数，最小默认为1
Context.prototype.GetData=function(filename,timeout,maxdigits,cb) {
  if(typeof timeout === 'function') {
    cb = timeout;
    //default to 2 second timeout
    timeout = 1200;
  }
  if(typeof maxdigits === 'function') {
    cb = maxdigits;
    //default to 2 second timeout
    maxdigits = 1;
  }
  this.send('GET DATA '+filename+' '+timeout+' '+maxdigits+ENDLINE,cb);
}

Context.prototype.NOOP=function(msg,cb){
  this.send('NOOP '+msg+ENDLINE,cb);
}


//读出按键
//number - 给定的按键
//escape - 忽略的按键
Context.prototype.SayDigits=function(number,escape,cb){
  if(typeof escape === 'function') {
    cb = escape;
    //default to 2 second timeout
    escape = "";
  }
  this.send('SAY DIGITS '+number+' '+ escape ,cb);
}



Context.prototype.GetChannelStatus=function(channelname,cb){
  if(typeof channelname === 'function') {
    cb = channelname;
    //default to 2 second timeout
    channelname = "";
  }
  this.send('CHANNEL STATUS '+channelname,cb);
}

Context.prototype.SetVariable=function(variablename,variablevalue,cb){
  this.send('SET VARIABLE '+variablename+' '+variablevalue,cb);
}

Context.prototype.Dial=function(number,timeout,options,cb){
 if(typeof timeout === 'function') {
    cb = timeout;
    //default to 2 second timeout
    timeout = 30;
    options = 'tr';
  }
  if(typeof options === 'function') {
    cb = options;
    //default to 2 second timeout
    options = 'tr';
  }

  this.exec('Dial',number,timeout,options,cb);
}


Context.prototype.Originate=function(channel,type,args,cb){
 
  this.exec('Originate',channel,type,args,cb);
}
module.exports = Context;

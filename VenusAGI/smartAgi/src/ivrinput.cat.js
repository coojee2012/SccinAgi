//响应IVR按键
routing.prototype.ivrinput = function(key, inputs, callback) {
  var self = this;
  var context = self.context;
  var schemas = self.schemas;
  var nami = self.nami;
  var logger = self.logger;
  var args = self.args;
  var vars = self.vars;
  if (key === '-1')
    callback('获取按键时一方挂机', -1);

  var getinput = null;

  self.lastinputkey = key;

  for (var i in inputs) {
    if (inputs[i].inputnum === key) {
      getinput = inputs[i];
      break;
    }
  }

  if (getinput !== null) {
    logger.debug("找到对应的按键流程：", getinput);
    self.ivr(getinput.gotoivrnumber, getinput.gotoivractid, function(err, result) {
      if (err)
        logger.debug("上层IVR返回了异常：", err);
      callback(err, result);
    });
  } else {
    logger.debug("没有找到按键:", key);
    if (key === 'timeout') {
      context.Playback('b_timeout', function(err, response) {
        callback(null, 0);
      });
    } else {
      context.Playback('b_error', function(err, response) {
        callback(null, 0);
      });
    }

  }
}
//当前通道达到预先设定的阀值，播放友情提示并记录到未接来电
routing.prototype.channelMax = function(callback) {
  async.auto({}, function(err, resluts) {
    callback(err, resluts);
  })
}

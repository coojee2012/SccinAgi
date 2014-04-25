//默认触发处理
routing.prototype.dodefault = function(context, vars) {
  var self = this;
  var context = self.context;
  var schemas = self.schemas;
  var nami = self.nami;
  var logger = self.logger;
  var args = self.args;
  var vars = self.vars;
  
  context.hangup(function(err, rep) {
    console.log("Hangup success:", rep);
    context.end();
  });

};
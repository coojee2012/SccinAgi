/**
 * Created by LinYong on 2014/10/16.
 */
routing.prototype.voiceNoticeCallback = function() {
    var self = this;
    var context = self.context;
    var schemas = self.schemas;
    var nami = self.nami;
    var logger = self.logger;
    var args = self.args;
    var vars = self.vars;

    context.Playback('/home/share/' + args.fileID + '-api', function(err, response) {
        if(err){
            context.hangup(function(err, response) {});
        }else{
            context.end();
        }

    });
}
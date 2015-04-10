'use strict';
var tts = require('./lib/tts').tts;
process.argv.forEach(function (val, index, array) {
    console.log(index + ': ' + val);
});
var content=process.argv[2];
tts.synth('testmix.wav', content, function(state, msg) {
							
							if (state === 'true') {
								console.log("合成成功！");
							} else {
								console.error("合成失败！");						
							}
});
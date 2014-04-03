var binding=require('binding');
var tts=new binding.TTSObject({
"server":"192.168.7.144",
"format":0,
"speed":-300,
"volume":0,
"tone":-200,
"digit":0,
"prompt":false
});
exports.tts=tts;
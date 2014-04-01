var assert = require('assert');
var binding = require('./build/Release/binding');
var obj = new binding.TTSObject(10);
setInterval(function(){
console.time('100-elements');
obj.synth("test1.wav","我就是个大厦波啊！我就是个大厦波啊！我就是个大厦波啊！我就是个大厦波啊！我就是个大厦波啊！我就是个大厦波啊",
	function(status,msg){
console.log(status,msg);
console.time('100-elements');
	}) ; // 11
},3000);
/*console.log( obj.plusOne() ); // 11
console.log( obj.plusOne() ); // 12
console.log( obj.plusOne() ); // 13
console.log( obj.synth('test1.wav','我就是个大厦波啊！') ); // 11
console.log( obj.synth('test2.wav','我是个大傻笨啊嘛？') ); // 12
console.log( obj.synth('test3.wav','都说我是个大萨博啊！') ); // 13*/



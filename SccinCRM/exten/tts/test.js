var assert = require('assert');
var binding = require('./build/Release/binding');
var obj = new binding.TTSObject(10);
console.log( obj.plusOne() ); // 11
console.log( obj.plusOne() ); // 12
console.log( obj.plusOne() ); // 13
console.log( obj.plusOne2() ); // 11
console.log( obj.plusOne2() ); // 12
console.log( obj.plusOne2() ); // 13


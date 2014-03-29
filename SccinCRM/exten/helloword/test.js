var assert = require('assert');
var binding = require('./build/Release/binding');
assert.equal('world', binding.hello());
console.log('binding.hello() =', binding.hello());
console.log('max:',binding.max());
console.log('max:',binding.max(1,2));
console.log('max:',binding.max(1,2,3));

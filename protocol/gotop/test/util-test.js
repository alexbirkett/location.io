var util = require('../util');

var assert = require('assert');

var testFormatLongitude = function() {
	assert.equal(util.formatLongitude(-1.234), "001140240W");
	assert.equal(util.formatLongitude(45.563), "045334680E");
};

var testFormatLatitude = function() {
	assert.equal(util.formatLatitude(89.8), "89480000N");
	assert.equal(util.formatLatitude(-12.744), "12443840S");
};

testFormatLongitude();
testFormatLatitude();

console.log("done");

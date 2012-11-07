var util = require('../util');

var assert = require('assert');

var testFormatLongitude = function() {
	assert.equal(util.formatLongitude(-1.234), "0011402W");
	assert.equal(util.formatLongitude(45.563), "0453347E");
};

var testFormatLatitude = function() {
	assert.equal(util.formatLatitude(89.8), "894800N");
	assert.equal(util.formatLatitude(-12.744), "124438S");
};

testFormatLongitude();
testFormatLatitude();

console.log("done");

var util = require('../util');

var assert = require('assert');

var testFormatLongitude = function() {
	// -001°14.07960
	assert.equal(util.formatLongitude(-1.23466), "0011408W");
	// 045°33.78000'
	assert.equal(util.formatLongitude(45.563), "0453378E");
};

var testFormatLatitude = function() {
	assert.equal(util.formatLatitude(89.8), "894800N");
	// 12°44.64000
	assert.equal(util.formatLatitude(-12.744), "124464S");
};

testFormatLongitude();
testFormatLatitude();

console.log("done");

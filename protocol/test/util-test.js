var util = require('../util');

var assert = require('assert');

var testParseTimeInterval = function() {
	
	
	var seconds = util.parseTimeInterval('1s');
	
	assert.equal(seconds, 1);
	
	var seconds = util.parseTimeInterval('30S');
	
	assert.equal(seconds, 30);
	
	var seconds = util.parseTimeInterval('1m');
	
	assert.equal(seconds, 60);
	
	var seconds = util.parseTimeInterval('2M');
	
	assert.equal(seconds, 120);
	
	var seconds = util.parseTimeInterval('1H');
	
	assert.equal(seconds, 3600);
	

	var seconds = util.parseTimeInterval('2h');
	
	assert.equal(seconds, 7200);
	
};

testParseTimeInterval();

console.log('done');

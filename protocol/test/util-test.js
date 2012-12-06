var util = require('../util');

var assert = require('assert');
var vows = require('vows');

vows.describe('buffer').addBatch({
    'handles 1s': {
        topic: function() {
        	return util.parseTimeInterval('1s');
        },
        'should be 1': function (seconds) {
    		 assert.equal(seconds, 1);
        }
    },
    'handles 30s': {
        topic: function() {
        	return util.parseTimeInterval('30S');
        },
        'should be 30': function (seconds) {
          assert.equal(seconds, 30);
        }
    },
    'handles 1m': {
        topic: function() {
        	return util.parseTimeInterval('1m');
        },
        'should be 60': function (seconds) {
          	assert.equal(seconds, 60);
        }
    },
    'handles 2M': {
        topic: function() {
        	return util.parseTimeInterval('2M');
        },
        'should be 30': function (seconds) {
          	assert.equal(seconds, 120);
        }
    },
    'handles 1H': {
        topic: function() {
        	return util.parseTimeInterval('1H');
        },
        'should be 3600': function (seconds) {
          	assert.equal(seconds, 3600);
        }
    },
     'handles 2H': {
        topic: function() {
        	return  util.parseTimeInterval('2h');
        },
        'should be 7200': function (seconds) {
          	assert.equal(seconds, 7200);
        }
    }
}).export(module); // Export the Suite


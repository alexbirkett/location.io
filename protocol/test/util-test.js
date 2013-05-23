var util = require('../util');

var assert = require('assert');
var vows = require('vows');

process.on('uncaughtException', function(err) {
  console.log('Caught exception: ' + err.stack);
});

vows.describe('utils').addBatch({
	'parseTimeInterval' : {
		'handles 1s' : {
			topic : function() {
				return util.parseTimeInterval('1s');
			},
			'should be 1' : function(seconds) {
				assert.equal(seconds, 1);
			}
		},
		'handles 30s' : {
			topic : function() {
				return util.parseTimeInterval('30S');
			},
			'should be 30' : function(seconds) {
				assert.equal(seconds, 30);
			}
		},
		'handles 1m' : {
			topic : function() {
				return util.parseTimeInterval('1m');
			},
			'should be 60' : function(seconds) {
				assert.equal(seconds, 60);
			}
		},
		'handles 2M' : {
			topic : function() {
				return util.parseTimeInterval('2M');
			},
			'should be 30' : function(seconds) {
				assert.equal(seconds, 120);
			}
		},
		'handles 1H' : {
			topic : function() {
				return util.parseTimeInterval('1H');
			},
			'should be 3600' : function(seconds) {
				assert.equal(seconds, 3600);
			}
		},
		'handles 2H' : {
			topic : function() {
				return util.parseTimeInterval('2h');
			},
			'should be 7200' : function(seconds) {
				assert.equal(seconds, 7200);
			}
		}
	},
	'bufferIndexOf' : {
        'search for first occurrence of 1' : {
            topic : function() {
                //buffer, searchOctet, fromIndex, skipHits
                return util.bufferIndexOf(new Buffer("00000100"), "1".charCodeAt(0));
            },
            'should at index 5' : function(index) {
                assert.equal(index, 5);
            }
        },
        'search for first occurrence of 1 stating at index 2' : {
            topic : function() {
                //buffer, searchOctet, fromIndex, skipHits
                return util.bufferIndexOf(new Buffer("01000100"), "1".charCodeAt(0), 2);
            },
            'should at index 5' : function(index) {
                assert.equal(index, 5);
            }
        },
        'skip two occurrences of 1 stating at index 0' : {
            topic : function() {
                //buffer, searchOctet, fromIndex, skipHits
                return util.bufferIndexOf(new Buffer("01010100"), "1".charCodeAt(0), 0, 2);
            },
            'should at index 5' : function(index) {
                assert.equal(index, 5);
            }
        },
        'search for string that does not exist' : {
            topic : function() {
                //buffer, searchOctet, fromIndex, skipHits
                return util.bufferIndexOf(new Buffer("01010100"), "3".charCodeAt(0), 0, 2);
            },
            'should return -1' : function(index) {
                assert.equal(index, -1);
            }
        }
    },
    'calculateNemaChecksum' : {
        'calculates know checksum' : {
            topic : function() {
                return util.calculateNemaChecksum(new Buffer('GSC,011412000010789,M4(R0=420,R1=40,R2=44)'));
            },
            'should be 71': function(checksum) {
                assert.equal(checksum, '71');
            }
        },
        'test with checksum less than 0x10' : {
            topic : function() {
                return util.calculateNemaChecksum(new Buffer([0x1]));
            },
            'should be 71': function(checksum) {
                assert.equal(checksum, '01');
            }
        },
        'test with checksum between than 0x10 and 0x20' : {
            topic : function() {
                return util.calculateNemaChecksum(new Buffer([0x15]));
            },
            'should be 71': function(checksum) {
                assert.equal(checksum, '15');
            }
        }
    }
}).export(module);
// Export the Suite


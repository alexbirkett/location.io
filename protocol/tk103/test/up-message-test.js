var assert = require('assert');
var vows = require('vows');
var async = require('async');
var LocationIo = require('../../../index.js');
var forEach = require('async-foreach').forEach;
var TrackerSimulator = require('../../../test/tracker-simulator.js');

var nextPort = 3141;
var addTimeout = require("addTimeout");

var sendData = function(data, callback, numberOfBytesToWaitFor, sliceLength) {
    var port = nextPort++;
	var locationIo = new LocationIo();
	var trackerSimulator = new TrackerSimulator();
	var returnObject = {};
	
	var waitForMessage = function(callback) {
	    if (returnObject.message) {
	        process.nextTick(callback);
	    } else {
	        returnObject.callback = callback;
	    }
	};
	locationIo.createServer(port, function(eventType, id, message) {
			if (eventType == 'message') {
				returnObject.message = message;
				if (returnObject.callback) {
				    returnObject.callback();
				}
					
			} else if (eventType == 'error') {
			   console.log('error creating server');
			   sendData(data, callback, numberOfBytesToWaitFor, sliceLength);
			} else if (eventType == 'server-up') {
				async.series([
			   		function(callback)	{
						trackerSimulator.connect({host: 'localhost', port: port}, callback);
		   			},
		    		function(callback) {
			    		trackerSimulator.sendMessage(data, 0, 50, sliceLength, callback);
		    		},
		    		function(callback) {
		    		    trackerSimulator.waitForData(numberOfBytesToWaitFor, addTimeout(2000, callback, undefined, 'waitfordata'));
		    		},
		    		function(callback) {
		    		    waitForMessage(callback);
		    		}
		           ],
		           function(err, data) {
				       var dataReceivedByClient = data[2];
				       callback(err, returnObject.message, dataReceivedByClient);
				       trackerSimulator.destroy();
                       locationIo.close(); 
		      	});
		  }
	});	
};
          
var createTests = function(sliceLength) {
    
    return {
       'handles login message (from dog tracker)': {
            topic: function() {
            	var DOG_TRACKER_LOGIN = "(013500001112BP05000013500001112120903A5956.1894N01046.9892E006.0160134061.9600000000L00000000)";
            	sendData(DOG_TRACKER_LOGIN, this.callback, 18, sliceLength);
    			
            },
            'should not fail with error': function (err, message, returnedData) {
                assert.isNull(err);
            },
            'should be a login message': function (err, message, returnedData) {
    			assert.equal(message.type, 'loginMessage');
            },
            'should send ACK from server to client': function (err, message, returnedData) {
                assert.equal("(013500001112AP05)", returnedData);
            }
        },
        'handles login message': {
            topic: function() {
                var MESSAGE = "(013612345678BP05000013612345678080524A2232.9806N11404.9355E000.1101241323.8700000000L000450AC)"; 
                sendData(MESSAGE, this.callback, 18, sliceLength);    
            },
            'should not fail with error': function (err, message, returnedData) {
                assert.isNull(err);
            },
            'should be a login message': function (err, message, returnedData) {
                assert.equal(message.type, 'loginMessage');
            },
            'message should contain a location': function (err, message, returnedData) {
                assert.notEqual(message.location, undefined);
            },
            'should send ACK from server to client': function (err, message, returnedData) {
                assert.equal(returnedData, "(013612345678AP05)");
            }
        },
        'handles handshake signal message': {
            topic: function() {
                var MESSAGE = "(013612345678BP00000013612345678HSO)"; 
                sendData(MESSAGE, this.callback, 21, sliceLength);       
            },
            'should not fail with error': function (err, message, returnedData) {
                assert.isNull(err);
            },
            'should be handshake signal message': function (err, message, returnedData) {
               assert.equal(message.type, 'handshakeSignalMessage');
            },
            'should have serial number': function (err, message, returnedData) {
               assert.equal(message.serialNumber, "000013612345678");
               assert.equal(message.trackerId, "013612345678");
            },
            'should send ACK from server to client': function (err, message, returnedData) {
               assert.equal(returnedData, "(013612345678AP01HSO)");
            }
        },
        'handles alarm message': {
            topic: function() {
               var MESSAGE = "(013612345678BO012061830A2934.0133N10627.2544E040.0080331309.6200000000L000770AD)";
               sendData(MESSAGE, this.callback, 19, sliceLength);
                
            },
            'should not fail with error': function (err, message, returnedData) {
                assert.isNull(err);
            },
            'should be alarm message': function (err, message, returnedData) {
                assert.equal(message.type, 'alarmMessage');
                assert.notEqual(message.location, undefined);       
            },
            'message should contain a location': function (err, message, returnedData) {
                assert.notEqual(message.location, undefined);
            },
            'alarm type should be SOS': function (err, message, returnedData) {
                assert.equal(message.alarmType, 'sos');
            },
            'should send ACK from server to client': function (err, message, returnedData) {
               assert.equal(returnedData, "(013612345678AS012)");
            }
        },
        'handles locationUpdate': {
            topic: function() {
               var MESSAGE = "(013612345678BR00080612A2232.9828N11404.9297E000.0022828000.0000000000L000230AA)";
               sendData(MESSAGE, this.callback, 0, sliceLength);
            },
            'should not fail with error': function (err, message, returnedData) {
                assert.isNull(err);
            },
            'should be locationUpdate message': function (err, message) {
                assert.equal(message.type, 'locationUpdate');
            },
            'message should contain a location': function (err, message, returnedData) {
                assert.notEqual(message.location, undefined);
            },
            'should not ACK from server to client': function (err, message, returnedData) {
              assert.isUndefined(returnedData);
            }
        },
        'handles updatesEnding': {
            topic: function() {
               var MESSAGE = "(013612345678BR02080612A2232.9828N11404.9297E000.0022828000.0000000000L000230AA)";
               sendData(MESSAGE, this.callback, 0, sliceLength);        
            },
            'should not fail with error': function (err, message, returnedData) {
                assert.isNull(err);
            },
            'should be updatesEnding message': function (err, message) {
                assert.equal(message.type, 'updatesEnding');
            },
            'message should contain a location': function (err, message, returnedData) {
                assert.notEqual(message.location, undefined);
            },
            'should not ACK from server to client': function (err, message, returnedData) {
              assert.isUndefined(returnedData);
            }
        }
    };

}

var suite = vows.describe('up-message-tests');

var test = {};
test.topic = function() {
        return i;
    }
    test.result = function(err) {
        console.log(err);
    }
    
var tests = {};
for (var i = 0; i < 150; i ++) {
    tests['test with slice length ' + i] = createTests(i + 1);
}

suite.addBatch(tests);
    
suite.export(module); // Export the Suite


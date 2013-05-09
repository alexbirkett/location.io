var assert = require('assert');
var vows = require('vows');
var parseMessage = require('../gps-message-parser.js'); 

process.on('uncaughtException', function(err) {
  console.log('Caught exception: ' + err.stack);
});

vows.describe('watch-message-parser-test').addBatch({
    'handles message': {
        topic: function() {
            return parseMessage("01047.4327,E,5955.9316,N,000.01,236");
        },
        'latitude should be 59.93219333333333': function (parsedMessage) {
           assert.equal(parsedMessage.latitude, 59.93219333333333);
        },
        'longitude should be should be 59.93219333333333': function (parsedMessage) {
           assert.equal(parsedMessage.longitude,  10.790545);
        },
        'speed should be should be 0.01': function (parsedMessage) {
           assert.equal(parsedMessage.speed,  0.01);
        },
        'altitude should be 236': function (parsedMessage) {
           assert.equal(parsedMessage.altitude,  236);
        }
    },
    'handles empty message': {
        topic: function() {
           return parseMessage(",,,,,");
        },
        'should not throw exception': function (result) {
            assert.isFalse(result instanceof Error);
        }
    }
  
}).export(module); // Export the Suite
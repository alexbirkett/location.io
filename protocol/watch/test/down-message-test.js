var assert = require('assert');
var vows = require('vows');
var testHelper = require('../../test/test-helper.js');

var nextPort = 3141;

process.on('uncaughtException', function (err) {
    console.log('Caught exception: ' + err.stack);
});

var AUT_MESSAGE = "#356823033087326#alexwatch#0#0000#AUT#1#V#01047.4399,E,5955.9426,N,000.01,296#080513#110641##";

var getNextPort = function () {
    return nextPort++;
};

var testDownMessage = function () {
    var args = [getNextPort, AUT_MESSAGE, undefined];
    args = args.concat(Array.prototype.slice.call(arguments, 0));
    testHelper.testDownMessage.apply(this, args);
};

vows.describe('watch down-message-tests').addBatch({
    'test locateOneTime': {
        'test with valid params': {
            topic: function () {
                var params = {
                    password: "0000"
                };
                testDownMessage('locateOneTime', params, 11, undefined, this.callback);
            },
            'should not fail with error': function (err, downMessageReceivedByTracker) {
                assert.isNull(err);
            },
            'message should be received by tracker': function (err, downMessageReceivedByTracker) {
                assert.equal(downMessageReceivedByTracker, "#806#0000##");
            }
        },
        'test with invalid password (too long) valid params': {
            topic: function () {
                var params = {
                    password: "12345"
                };
                testDownMessage('locateOneTime', params, 11, undefined, this.callback);
            },
            'should fail with error': function (err, downMessageReceivedByTracker) {
                assert.isNotNull(err);
            }
        },
        'test with invalid password (too short) valid params': {
            topic: function () {
                var params = {
                    password: "123"
                };
                testDownMessage('locateOneTime', params, 11, undefined, this.callback);
            },
            'should fail with error': function (err, downMessageReceivedByTracker) {
                assert.isNotNull(err);
            }
        },
        'test with invalid password (not numerical) valid params': {
            topic: function () {
                var params = {
                    password: "abcd"
                };
                testDownMessage('locateOneTime', params, 11, undefined, this.callback);
            },
            'should fail with error': function (err, downMessageReceivedByTracker) {
                assert.isNotNull(err);
            }
        }
    }
}).export(module);

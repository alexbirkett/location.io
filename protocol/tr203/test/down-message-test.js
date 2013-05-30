var assert = require('assert');
var vows = require('vows');
var testHelper = require('../../test/test-helper.js');

var nextPort = 3141;

process.on('uncaughtException', function (err) {
    console.log('Caught exception: ' + err.stack);
});

var AUT_MESSAGE = "GSr,011412000010789,3,3,01,,1,020404,114953,E13413.0810,N53652.4793,0,0.00,0,21,0.0,37*50!";

var getNextPort = function () {
    return nextPort++;
};

var testDownMessage = function () {
    var args = [getNextPort, AUT_MESSAGE, undefined];
    args = args.concat(Array.prototype.slice.call(arguments, 0));
    testHelper.testDownMessage.apply(this, args);
};

vows.describe('tr203 down-message-tests').addBatch({
    'test locateOneTime': {
        'test with valid params': {
            topic: function () {
                var params = {
                    'interval': '5m'
                };
                testDownMessage('setOnLineMode', params, 39, undefined, this.callback);
            },
            'should not fail with error': function (err, downMessageReceivedByTracker) {
                assert.isNull(err);
            },
            'message should be received by tracker': function (err, downMessageReceivedByTracker) {
                assert.equal(downMessageReceivedByTracker, 'GSC,011412000010789,M3(Q0=300,Q2=02)*07!');
            }
        }
    }
}).export(module);

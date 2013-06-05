var assert = require('assert');
var vows = require('vows');
var testHelper = require('../../test/test-helper.js');

process.on('uncaughtException', function (err) {
    console.log('Caught exception: ' + err.stack);
});

var nextPort = 2999;

var getNextPort = function () {
    return nextPort++;
};

var testUpMessage = function () {
    var args = [getNextPort];
    args = args.concat(Array.prototype.slice.call(arguments, 0));
    testHelper.testUpMessage.apply(this, args);
};

var createTests = function (sliceLength) {

    return {
        'handles update message UK': {
            topic: function () {
                var UPDATE_MESSAGE = 'GSr,011412000840185,3,3,01,,1,020404,114953,E13413.0810,N53652.4793,0,0.00,0,21,0.0,37*57!';
                testUpMessage(UPDATE_MESSAGE, 0, sliceLength, this.callback);

            },
            'should not fail with error': function (err, message, returnedData) {
                assert.ifError(err);
            }
        },
        'handles update message NO': {
            topic: function () {
                var UPDATE_MESSAGE = 'GSr,011412000840185,3,3,81,,1,230513,181442,E01044.1742,N5954.7801,109,0.13,0,3,0.0,18*5c!';
                testUpMessage(UPDATE_MESSAGE, 0, sliceLength, this.callback);
            },
            'should not fail with error': function (err, message, returnedData) {
                assert.ifError(err);
            },
            'longitude is 10.736236666666667': function (err, message, returnedData) {
                assert.equal(message.location.longitude, 10.736236666666667);
            },
            'latitude is 59.913001666666666': function (err, message, returnedData) {
                assert.equal(message.location.latitude, 59.913001666666666);
            }
        },
        'handles parses timestamp': {
            topic: function () {
                var UPDATE_MESSAGE = 'GSr,011412000840185,3,3,01,,1,050613,124138,E01044.2048,N5954.7858,0,0.00,0,0,0.0,74*55!';
                testUpMessage(UPDATE_MESSAGE, 0, sliceLength, this.callback);
            },
            'should not fail with error': function (err, message, returnedData) {
                assert.ifError(err);
            },
            'timestamp is 1370436098372': function (err, message, returnedData) {
                assert.equal(message.location.timestamp.getTime(), 1370436098000);
            }
        }
    };

};

var suite = vows.describe('tr203 up-message-tests');

var tests = {};
for (var i = 1; i < 150; i++) {
    tests['test with slice length ' + i] = createTests(i);
}

suite.addBatch(tests);

suite.export(module); // Export the Suite


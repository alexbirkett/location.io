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

var sendData = function () {
    var args = [getNextPort];
    args = args.concat(Array.prototype.slice.call(arguments, 0));
    testHelper.testUpMessage.apply(this, args);
};

var createTests = function (sliceLength) {

    return {
        'handles aut update message': {
            topic: function () {
                var MESSAGE = "#356823033087326#alexwatch#0#0000#AUT#1#V#01047.4399,E,5955.9426,N,000.01,296#080513#110641##";
                sendData(MESSAGE, 0, sliceLength, this.callback);

            },
            'should not fail with error': function (err, message, returnedData) {
                assert.isNull(err);
            },
            'should be a login message': function (err, message, returnedData) {
                assert.equal(message.type, 'loginMessage');
            }
        },
        'handles aut update with no user name': {
            topic: function () {
                var MESSAGE = "#356823033087326##0#0000#AUT#1#V#01047.4447,E,5955.9397,N,000.01,0#080513#104140##";
                sendData(MESSAGE, 0, sliceLength, this.callback);
            },
            'should not fail with error': function (err, message, returnedData) {
                assert.isNull(err);
            },
            'should be a login message': function (err, message, returnedData) {
                assert.equal(message.type, 'loginMessage');
            }
        },
        'handles aut update with no GPS': {
            topic: function () {
                var MESSAGE = "#356823033087326##0#0000#AUT#1#0EDDD9F0#,,,,,####";
                sendData(MESSAGE, 0, sliceLength, this.callback);
            },
            'should not fail with error': function (err, message, returnedData) {
                assert.isNull(err);
            },
            'should be a login message': function (err, message, returnedData) {
                assert.equal(message.type, 'loginMessage');
            }
        },
        'handles SOS message': {
            topic: function () {
                var MESSAGE = "#356823033087326#alexwatch#0#0000#SOS#1#0EDDD9EF#01047.4327,E,5955.9316,N,000.01,236#080513#111644##";
                sendData(MESSAGE, 0, sliceLength, this.callback);
            },
            'should not fail with error': function (err, message, returnedData) {
                assert.isNull(err);
            },
            'should be a login message': function (err, message, returnedData) {
                assert.equal(message.type, 'sosMessage');
            }
        }
    };

};

var suite = vows.describe('watch up-message-tests');

var tests = {};
for (var i = 1; i < 150; i++) {
    tests['test with slice length ' + i] = createTests(i);
}

suite.addBatch(tests);

suite.export(module); // Export the Suite


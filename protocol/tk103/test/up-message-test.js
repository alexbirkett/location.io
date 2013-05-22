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
        'handles login message (from dog tracker)': {
            topic: function () {
                var DOG_TRACKER_LOGIN = "(013500001112BP05000013500001112120903A5956.1894N01046.9892E006.0160134061.9600000000L00000000)";
                sendData(DOG_TRACKER_LOGIN, 18, sliceLength, this.callback);

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
            topic: function () {
                var MESSAGE = "(013612345678BP05000013612345678080524A2232.9806N11404.9355E000.1101241323.8700000000L000450AC)";
                sendData(MESSAGE, 18, sliceLength, this.callback);
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
            topic: function () {
                var MESSAGE = "(013612345678BP00000013612345678HSO)";
                sendData(MESSAGE, 21, sliceLength, this.callback);
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
            topic: function () {
                var MESSAGE = "(013612345678BO012061830A2934.0133N10627.2544E040.0080331309.6200000000L000770AD)";
                sendData(MESSAGE, 19, sliceLength, this.callback);

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
            topic: function () {
                var MESSAGE = "(013612345678BR00080612A2232.9828N11404.9297E000.0022828000.0000000000L000230AA)";
                sendData(MESSAGE, 0, sliceLength, this.callback);
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
            topic: function () {
                var MESSAGE = "(013612345678BR02080612A2232.9828N11404.9297E000.0022828000.0000000000L000230AA)";
                sendData(MESSAGE, 0, sliceLength, this.callback);
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

};

var suite = vows.describe('up-message-tests');

var tests = {};
for (var i = 1; i < 150; i++) {
    tests['test with slice length ' + i] = createTests(i);
}

suite.addBatch(tests);

suite.export(module); // Export the Suite


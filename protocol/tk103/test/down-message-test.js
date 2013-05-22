var assert = require('assert');
var vows = require('vows');
var testHelper = require('../../test/test-helper.js');
var nextPort = 3141;

process.on('uncaughtException', function (err) {
    console.log('Caught exception: ' + err.stack);
});

var LOGIN_MESSAGE = "(013612345678BP05000013612345678080524A2232.9806N11404.9355E000.1101241323.8700000000L000450AC)";
var EXPECTED_LOGIN_RESPONSE = "(013612345678AP05)";

var getNextPort = function () {
    return nextPort++;
};

var testDownMessage = function () {
    var args = [getNextPort, LOGIN_MESSAGE, EXPECTED_LOGIN_RESPONSE];
    args = args.concat(Array.prototype.slice.call(arguments, 0));
    testHelper.testDownMessage.apply(this, args);
};

vows.describe('tk103 down-message-tests').addBatch({
    'test configureUpdateInterval': {
        topic: function () {
            var params = {'enabled': true, 'interval': '20s', 'duration': '36m' };
            testDownMessage("configureUpdateInterval", params, 26, "(013612345678BS0800050014)", this.callback);
        },
        'should not fail with error': function (err, downMessageReceivedByTracker, parsedAckRecievedByServer) {
            assert.isNull(err);
        },
        'message should be received by tracker': function (err, downMessageReceivedByTracker) {
            assert.equal("(013612345678AR0000140024)", downMessageReceivedByTracker);
        },
        'ack should be received by server': function (err, downMessageReceivedByTracker, parsedAckRecievedByServer) {
            assert.equal('013612345678', parsedAckRecievedByServer.trackerId);
        }
    },
    'test requestLocation': {
        topic: function () {
            testDownMessage("requestLocation", {}, 18, "(013612345678BP04080525A2934.0133N10627.2544E000.0141830309.6200000000L00000023)", this.callback);
        },
        'should not fail with error': function (err, downMessageReceivedByTracker, parsedAckRecievedByServer) {
            assert.isNull(err);
        },
        'message should be received by tracker': function (err, downMessageReceivedByTracker) {
            assert.equal("(013612345678AP00)", downMessageReceivedByTracker);
        },
        'ack should be received by server': function (err, downMessageReceivedByTracker, parsedAckRecievedByServer) {
            assert.equal('013612345678', parsedAckRecievedByServer.trackerId);
        },
        'ack should contain location': function (err, downMessageReceivedByTracker, parsedAckRecievedByServer) {
            assert.isObject(parsedAckRecievedByServer.location);
        }
    },
    'test configureSpeedAlert': {
        topic: function () {
            testDownMessage("configureSpeedAlert", {'minSpeed': 30, 'maxSpeed': 50}, 26, "(013612345678BP12H0501L030)", this.callback);
        },
        'should not fail with error': function (err, downMessageReceivedByTracker, parsedAckRecievedByServer) {
            assert.isNull(err);
        },
        'message should be received by tracker': function (err, downMessageReceivedByTracker) {
            assert.equal("(013612345678AP12H050L030)", downMessageReceivedByTracker);
        },
        'ack should be received by server': function (err, downMessageReceivedByTracker, parsedAckRecievedByServer) {
            assert.equal('013612345678', parsedAckRecievedByServer.trackerId);
            // todo fix min max speed parsing
        }
    },
    'test configureSwitch0 (enable)': {
        topic: function () {
            testDownMessage("configureSwitch0", {'enabled': true }, 19, "(013612345678BV001)", this.callback);
        },
        'should not fail with error': function (err, downMessageReceivedByTracker, parsedAckRecievedByServer) {
            assert.isNull(err);
        },
        'message should be received by tracker': function (err, downMessageReceivedByTracker) {
            assert.equal("(013612345678AV001)", downMessageReceivedByTracker);
        },
        'ack should be received by server': function (err, downMessageReceivedByTracker, parsedAckRecievedByServer) {
            assert.equal('013612345678', parsedAckRecievedByServer.trackerId);
        },
        'switch is enabled in ack': function (err, downMessageReceivedByTracker, parsedAckRecievedByServer) {
            assert.isTrue(parsedAckRecievedByServer.enabled);
        }
    },
    'test configureSwitch0 (disable)': {
        topic: function () {
            testDownMessage("configureSwitch0", {'enabled': false }, 19, "(013612345678BV00)", this.callback);
        },
        'should not fail with error': function (err, downMessageReceivedByTracker, parsedAckRecievedByServer) {
            assert.isNull(err);
        },
        'message should be received by tracker': function (err, downMessageReceivedByTracker) {
            assert.equal("(013612345678AV000)", downMessageReceivedByTracker);
        },
        'ack should be received by server': function (err, downMessageReceivedByTracker, parsedAckRecievedByServer) {
            assert.equal('013612345678', parsedAckRecievedByServer.trackerId);
        },
        'switch is enabled in ack': function (err, downMessageReceivedByTracker, parsedAckRecievedByServer) {
            assert.isFalse(parsedAckRecievedByServer.enabled);
        }
    },
    'test configureSwitch1 (enable)': {
        topic: function () {
            testDownMessage("configureSwitch1", {'enabled': true }, 19, "(013612345678BV011)", this.callback);
        },
        'should not fail with error': function (err, downMessageReceivedByTracker, parsedAckRecievedByServer) {
            assert.isNull(err);
        },
        'message should be received by tracker': function (err, downMessageReceivedByTracker) {
            assert.equal("(013612345678AV011)", downMessageReceivedByTracker);
        },
        'ack should be received by server': function (err, downMessageReceivedByTracker, parsedAckRecievedByServer) {
            assert.equal('013612345678', parsedAckRecievedByServer.trackerId);
        },
        'switch is enabled in ack': function (err, downMessageReceivedByTracker, parsedAckRecievedByServer) {
            assert.isTrue(parsedAckRecievedByServer.enabled);
        }
    },
    'test configureSwitch1 (disable)': {
        topic: function () {
            testDownMessage("configureSwitch1", {'enabled': false }, 19, "(013612345678BV010)", this.callback);
        },
        'should not fail with error': function (err, downMessageReceivedByTracker, parsedAckRecievedByServer) {
            assert.isNull(err);
        },
        'message should be received by tracker': function (err, downMessageReceivedByTracker) {
            assert.equal("(013612345678AV010)", downMessageReceivedByTracker);
        },
        'ack should be received by server': function (err, downMessageReceivedByTracker, parsedAckRecievedByServer) {
            assert.equal('013612345678', parsedAckRecievedByServer.trackerId);
        },
        'switch is enabled in ack': function (err, downMessageReceivedByTracker, parsedAckRecievedByServer) {
            assert.isFalse(parsedAckRecievedByServer.enabled);
        }
    },
    'test restart': {
        topic: function () {
            testDownMessage("restartDevice", { }, 18, "(013612345678BT00)", this.callback);
        },
        'should not fail with error': function (err, downMessageReceivedByTracker, parsedAckRecievedByServer) {
            assert.isNull(err);
        },
        'message should be received by tracker': function (err, downMessageReceivedByTracker) {
            assert.equal("(013612345678AT00)", downMessageReceivedByTracker);
        },
        'ack should be received by server': function (err, downMessageReceivedByTracker, parsedAckRecievedByServer) {
            assert.equal('013612345678', parsedAckRecievedByServer.trackerId);
        }
    },
    'test configureUpdateIntervalWhenAccOpen': {
        topic: function () {
            testDownMessage("configureUpdateIntervalWhenAccOpen", { interval: '20s' }, 22, "(013612345678BR05)", this.callback);
        },
        'should not fail with error': function (err, downMessageReceivedByTracker, parsedAckRecievedByServer) {
            assert.isNull(err);
        },
        'message should be received by tracker': function (err, downMessageReceivedByTracker) {
            assert.equal("(013612345678AR050014)", downMessageReceivedByTracker);
        },
        'ack should be received by server': function (err, downMessageReceivedByTracker, parsedAckRecievedByServer) {
            assert.equal('013612345678', parsedAckRecievedByServer.trackerId);
        }
    },
    'test configureUpdateIntervalWhenAccClosed': {
        topic: function () {
            testDownMessage("configureUpdateIntervalWhenAccClosed", { interval: '1m' }, 22, "(013612345678BR06)", this.callback);
        },
        'should not fail with error': function (err, downMessageReceivedByTracker, parsedAckRecievedByServer) {
            assert.isNull(err);
        },
        'message should be received by tracker': function (err, downMessageReceivedByTracker) {
            assert.equal("(013612345678AR06003C)", downMessageReceivedByTracker);
        },
        'ack should be received by server': function (err, downMessageReceivedByTracker, parsedAckRecievedByServer) {
            assert.equal('013612345678', parsedAckRecievedByServer.trackerId);
        }
    },
    'test configureGeofence': {
        topic: function () {
            var params = {
                trackerId: "013612345678",
                maxLongitude: 113.919583,
                minLongitude: 112.553867,
                maxLatitude: 22.7742,
                minLatitude: 22.7553,
                enabled: true
            };
            testDownMessage("configureGeofence", params, 61, "(013612345678BU0001)", this.callback);
        },
        'should not fail with error': function (err, downMessageReceivedByTracker, parsedAckRecievedByServer) {
            assert.isNull(err);
        },
        'message should be received by tracker': function (err, downMessageReceivedByTracker) {
            assert.equal("(013612345678AX051,N,2245.318,2246.452,E,11233.232,11355.175)", downMessageReceivedByTracker);
        },
        'ack should be received by server': function (err, downMessageReceivedByTracker, parsedAckRecievedByServer) {
            assert.equal('013612345678', parsedAckRecievedByServer.trackerId);
        }
    }
}).export(module);

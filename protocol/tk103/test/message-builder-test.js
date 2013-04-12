var assert = require('assert');

var messageBuilder = require('../message-builder');
var vows = require('vows');

var constants = require('../constants');

vows.describe('tk103-message-builder-tests').addBatch({
    'test configure update interval (updates enabled)' : {
        topic : function() {
            return messageBuilder.messages.configureUpdateInterval({
                enabled : true,
                interval : '20s',
                duration : '36m',
                trackerId : "013612345678"
            });
        },
        'should be specified string' : function(message) {
            assert.equal(message, "(013612345678AR0000140024)");
        }
    },
    'test configure update interval (updates disabled)' : {
        topic : function() {
            return messageBuilder.messages.configureUpdateInterval({
                enabled : false,
                interval : '20s',
                duration : '36m',
                trackerId : "013612345678"
            });
        },
        'should be specified string' : function(message) {
            assert.equal(message, "(013612345678AR0000000000)");
        }
    }
}).export(module);
// Export the Suite

var testAnswerAlarmMessage = function() {
    var message = buildCommand(constants.commands.ANSWER_ALARM_MESSAGE, {
        alarmType : "sos",
        trackerId : "013612345678"
    });
    // example from protocol document 1.5
    assert.equal(message, "(013612345678AS012)");
}
var testOneTimeEquiryMessage = function() {
    var message = buildCommand(constants.commands.ONE_TIME_ENQUIRY_MESSAGE, {
        trackerId : "013612345678"
    });
    assert.equal(message, "(013612345678AP00)");
}
var testSettingVehicleHighAndLowLimitSpeed = function() {
    var message = buildCommand(constants.commands.SETTING_VEHICLE_HIGH_AND_LOW_LIMIT_SPEED, {
        trackerId : "013612345678",
        maxSpeed : 50,
        minSpeed : 30
    });
    assert.equal(message, "(013612345678AP12H050L030)");
}
var testCircuitControlSignal = function() {
    var message = buildCommand(constants.commands.CIRCUIT_CONTROL_SIGNAL, {
        trackerId : "013612345678",
        enabled : false
    });
    assert.equal(message, "(013612345678AV000)");
}
var testOilControlSingle = function() {
    var message = buildCommand(constants.commands.OIL_CONTROL_SINGLE, {
        trackerId : "013612345678",
        enabled : false
    });
    assert.equal(message, "(013612345678AV010)");
}
var testControlTheRestartedMessageOfTheDevice = function() {
    var message = buildCommand(constants.commands.CONTROL_THE_RESTARTED_MESSAGE_OF_THE_DEVICE, {
        trackerId : "013612345678"
    });
    assert.equal(message, "(013612345678AT00)");
}
var testSetAccOpenSendingDataIntervals = function() {
    var message = buildCommand(constants.commands.SET_ACC_OPEN_SENDING_DATA_INTERVALS, {
        trackerId : "013612345678",
        interval : "20s"
    });
    assert.equal(message, "(013612345678AR050014)");
}
var testSetAccCloseSendingDataIntervals = function() {
    var message = buildCommand(constants.commands.SET_ACC_CLOSE_SENDING_DATA_INTERVALS, {
        trackerId : "013612345678",
        interval : "1m"
    });
    assert.equal(message, "(013612345678AR06003C)");
}
var testSettingGeoFenceMessage = function() {
    var message = buildCommand(constants.commands.SETTING_GEO_FENCE_MESSAGE, {
        trackerId : "013612345678",
        maxLongitude : 113.919583,
        minLongitude : 112.553867,
        maxLatitude : 22.7742,
        minLatitude : 22.7553,
        enabled : true
    });
    assert.equal(message, "(013612345678AX051,N,2245.318,2246.452,E,11233.232,11355.175)");
}
/*testAnswerHandshakeSignalMessage();
 testDeviceLoginResponseMessage();
 testsameTimeContinuesFeedbackConfigure();
 testAnswerAlarmMessage();
 testOneTimeEquiryMessage();
 testSettingVehicleHighAndLowLimitSpeed();
 testCircuitControlSignal();
 testOilControlSingle();
 testControlTheRestartedMessageOfTheDevice();
 testSetAccOpenSendingDataIntervals();
 testSetAccCloseSendingDataIntervals();
 testSettingGeoFenceMessage();*/
console.log("done");

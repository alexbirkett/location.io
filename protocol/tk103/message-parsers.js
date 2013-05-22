var parseGpsMessage = require('./gps-message-parser');

var gpsMessageOnlyParse = function (message, frame) {
    frame.location = parseGpsMessage(message);
};

var alarmTypes = {
    '0': 'vehiclePowerOff',
    '1': 'accident',
    '2': 'sos',
    '3': 'vehicleAntiTheftAndAlarming',
    '4': 'lowSpeedAlert',
    '5': 'overSpeedAlert',
    '6': 'geoFence',
    '7': 'movementAlert'
};

module.exports = {
    messages: {
        handshakeSignalMessage: function (message, frame) {
            var handshakeSignalMessagePattern = /(.*)HSO/;
            var matchArray = handshakeSignalMessagePattern.exec(message);
            frame.serialNumber = matchArray[1];
        },
        alarmMessage: function (message, frame) {
            var alarmMessagePattern = /(.)(.*)/;
            var matchArray = alarmMessagePattern.exec(message);
            frame.alarmType = alarmTypes[matchArray[1]];
            frame.location = parseGpsMessage(matchArray[2]);
        },
        loginMessage: function (message, frame) {
            var loginMessagePattern = /(.{15})(.*)/;
            var matchArray = loginMessagePattern.exec(message);
            frame.terminalId = matchArray[1];
            frame.location = parseGpsMessage(matchArray[2]);
        },
        locationUpdate: function (message, frame) {
            gpsMessageOnlyParse(message, frame);
        }
    },
    acks: {
        configureUpdateInterval: function (message) {
            var regEx = /(.{4})(.{2})(.{2})/;

            var frame = {};
            var matchArray = regEx.exec(message);

            frame.seconds = matchArray[1];
            frame.hours = matchArray[2];
            frame.minutes = matchArray[3];
            return frame;
        },
        requestLocation: function (message, frame) {
            gpsMessageOnlyParse(message, frame);
        },
        configureSpeedAlert: function (message, frame) {
            var responseToSetUpVehicleMaxAndMinSpeedMessagePattern = /H(.*)L(.*)/;
            var matchArray = responseToSetUpVehicleMaxAndMinSpeedMessagePattern.exec(message);
            // this is guesswork, the document does not specify what H and L are.
            frame.maxSpeed = matchArray[1];
            frame.minSpeed = matchArray[2];
        },
        updatesEnding: function (message, frame) {
            gpsMessageOnlyParse(message, frame);
        },
        configureSwitch0: function (message, frame) {
            frame.enabled = (message == '1');
        },
        configureSwitch1: function (message, frame) {
            frame.enabled = (message == '1');
        },
        restartDevice: function (message, frame) {
            // no implementation requred
        },
        configureUpdateIntervalWhenAccOpen: function (message, frame) {
            // no implementation requred
        },
        configureUpdateIntervalWhenAccClosed: function (message, frame) {
            console.log('configureUpdateIntervalWhenAccClosed ack parse not implemented');
            console.log(message);
        },
        configureGeofence: function (message, frame) {
            var geoFenceMessageTypes = {
                '0': 'cancelOutsideFence',
                '1': 'outsideFence',
                '2': 'insideFence'
            };
            frame.geoFenceResponseType = geoFenceMessageTypes[message[0]];
        }
    }
};

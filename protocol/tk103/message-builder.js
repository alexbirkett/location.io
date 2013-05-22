var util = require('../util');

var api = require('./api');

var buildSimpleCommand = function (messageValue, command) {
    return "(" + messageValue.trackerId + command + ")";
};

var buildsetAccSendingDataIntervals = function (messageValue, commandId) {
    var time = util.getTimeIntervalAsFourHexDigits(util.parseTimeInterval(messageValue.interval));
    return buildSimpleCommand(messageValue, commandId + time);
};

var alarmTypes = {
    'vehiclePowerOff': '0',
    'accident': '1',
    'sos': '2',
    'vehicleAlarm': '3',
    'underSpeed': '4',
    'overSpeed': '5',
    'geoFence': '6',
    'movement': '7'
};

var messages = {
    configureUpdateInterval: function (messageValue) {
        var intervalInSeconds = messageValue.enabled ? util.parseTimeInterval(messageValue.interval) : 0;
        var durationInSeconds = messageValue.enabled ? util.parseTimeInterval(messageValue.duration) : 0;
        var durationHours = util.prependZeros(Math.floor(durationInSeconds / 3600).toString(16), 2).toUpperCase();
        var durationMinutes = util.prependZeros(Math.floor(durationInSeconds / 60).toString(16), 2).toUpperCase();
        var message = "(" + messageValue.trackerId + "AR00" + util.getTimeIntervalAsFourHexDigits(intervalInSeconds) + durationHours + durationMinutes + ")";
        console.log(message);
        return message;
    },
    requestLocation: function (messageValue) {
        return buildSimpleCommand(messageValue, "AP00");
    },
    configureSpeedAlert: function (messageValue) {
        if (messageValue.maxSpeed > 999) {
            throw new Error("max speed must be less than 999 km/h");
        }

        if (messageValue.minSpeed > 999) {
            throw new Error("min speed must be less than 999 km/h");
        }
        return "(" + messageValue.trackerId + "AP12H" + util.prependZeros(messageValue.maxSpeed, 3) + "L" + util.prependZeros(messageValue.minSpeed, 3) + ")";
    },
    configureSwitch0: function (messageValue) {
        return buildSimpleCommand(messageValue, "AV00" + (messageValue.enabled ? "1" : "0"));
    },
    configureSwitch1: function (messageValue) {
        return buildSimpleCommand(messageValue, "AV01" + (messageValue.enabled ? "1" : "0"));
    },
    restartDevice: function (messageValue) {
        return buildSimpleCommand(messageValue, "AT00");
    },
    configureUpdateIntervalWhenAccOpen: function (messageValue) {
        return buildsetAccSendingDataIntervals(messageValue, "AR05");
    },
    configureUpdateIntervalWhenAccClosed: function (messageValue) {
        return buildsetAccSendingDataIntervals(messageValue, "AR06");
    },
    configureGeofence: function (messageValue) {
        var formatLatLng = function (latlng) {
            return latlng.degrees + latlng.minutes;
        };

        var parsedMaxLongitude = util.parseLongitudeMinDec(messageValue.maxLongitude, 3);
        var parsedMinLongitude = util.parseLongitudeMinDec(messageValue.minLongitude, 3);
        var parsedMaxLatitude = util.parseLatitudeMinDec(messageValue.maxLatitude, 3);
        var parsedMinLatitude = util.parseLatitudeMinDec(messageValue.minLatitude, 3);

        var messageBody = (messageValue.enabled ? "1" : "0") + ',' + parsedMaxLatitude.hemisphere + "," + formatLatLng(parsedMinLatitude) + "," + formatLatLng(parsedMaxLatitude) + "," + parsedMinLongitude.hemisphere + "," +formatLatLng(parsedMinLongitude) + "," + formatLatLng(parsedMaxLongitude);
        return buildSimpleCommand(messageValue, "AX05" + messageBody);
    }
};

var acks = {
    handshakeSignalMessage: function (messageValue) {
        return buildSimpleCommand(messageValue, "AP01HSO");
    },
    loginMessage: function (messageValue) {
        return buildSimpleCommand(messageValue, "AP05");
    },
    alarmMessage: function (messageValue) {
        var alarmType = alarmTypes[messageValue.alarmType];
        if (alarmType === undefined) {
            throw new Error("unknown alarm type");
        }
        return "(" + messageValue.trackerId + "AS01" + alarmType + ")";
    }
};

module.exports.buildMessage = function (messageName, parameters) {
    var builder = messages[messageName];

    if (builder === undefined) {
        throw "no command builder defined for message " + messageName;
    }
    var message = builder(parameters);
    return message;
};

module.exports.buildAck = function (message) {
    if (message.type !== undefined) {
        var builder = acks[message.type];
        if (builder !== undefined) {
            var ack = builder(message);
            return ack;
        }
    }
};

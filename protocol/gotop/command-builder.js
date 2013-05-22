var capabilities = require('./api');
var util = require('../util');

var buildCommand = function (commandName, commandParameters) {
    return messageBuilders[commandName](commandParameters);
};

var messageBuilders = {};

var formatLatitude = function (stringToParse) {
    var parsedLatitude = util.parseLatitude(stringToParse);
    var latitude = parsedLatitude.degrees + parsedLatitude.minutes + parsedLatitude.seconds + parsedLatitude.secondsFraction + parsedLatitude.hemisphere;
    return latitude;
};

var formatLongitude = function (stringToParse) {
    var parsedLongitude = util.parseLongitude(stringToParse);
    var longitude = parsedLongitude.degrees + parsedLongitude.minutes + parsedLongitude.seconds + parsedLongitude.secondsFraction + parsedLongitude.hemisphere;
    return longitude;
};

messageBuilders.setAuthorizedNumber = function (messageValue) {
    return ":" + messageValue.password + "A" + messageValue.index + "," + messageValue.authorizedNumber + "#";
};

messageBuilders.deleteAuthorizedNumber = function (messageValue) {
    return ":" + messageValue.password + "A" + messageValue.index + ",D#";
};

messageBuilders.locateOneTime = function (messageValue) {
    return ":" + messageValue.password + "F#";
};

messageBuilders.setContinuousTracking = function (messageValue) {
    var interval = messageValue.interval;
    var result = /^([0-9]{1,3})(s)?(m)?(h)?$/i.exec(interval);

    var unit;
    var intervalInt;
    if (result[2] !== undefined) {
        intervalInt = parseInt(result[1], 10);
        if (intervalInt > 255) {
            throw Error("second value out of range (must be less than or equal to 255)");
        }
        unit = "S";
    }
    if (result[3] !== undefined) {
        intervalInt = parseInt(result[1], 10);
        if (intervalInt > 255) {
            throw Error("minute value out of range (must be less than or equal to 255)");
        }
        unit = "M";
    }
    if (result[4] !== undefined) {
        intervalInt = parseInt(result[1], 10);
        if (intervalInt > 90) {
            throw Error("minute value out of range (must be less than or equal to 90)");
        }
        unit = "H";
    }
    var message = ":" + messageValue.password + "M" + (messageValue.enabled ? 1 : 0) + "," + util.prependZeros(intervalInt, 3) + unit + "#";
    return message;
};

messageBuilders.setSpeedingAlarm = function (messageValue) {
    // :123456J1,080#
    return ":" + messageValue.password + "J" + (messageValue.enabled ? 1 : 0) + "," + util.prependZeros(messageValue.speed, 3) + "#";
};

messageBuilders.setGeoFence = function (messageValue) {

    return ":" + messageValue.password +
        "I" + messageValue.index +
        "," + (messageValue.enabled ? 1 : 0) +
        "," + (messageValue.exit ? 1 : 0) +
        "," + formatLatitude(messageValue.maxLatitude) +
        formatLongitude(messageValue.minLongitude) +
        formatLatitude(messageValue.minLatitude) +
        formatLongitude(messageValue.maxLongitude) + "#";
};

messageBuilders.setTimeZone = function (messageValue) {
    return ":" + messageValue.password + "L" + messageValue.timeZone + "#";
};

messageBuilders.setLowBatteryAlarm = function (messageValue) {
    return ":" + messageValue.password + "N" + (messageValue.enabled ? 1 : 0) + "," + messageValue.percentage + "#";
};

messageBuilders.setPassword = function (messageValue) {
    return ":" + messageValue.password + "H" + messageValue.newPassword + "#";
};

messageBuilders.setAcc = function (messageValue) {
    return ":" + messageValue.password + "T" + (messageValue.enabled ? 1 : 0) + "#";
};

messageBuilders.setListenMode = function (messageValue) {
    return ":" + messageValue.password + "U" + (messageValue.enabled ? 1 : 0) + "#";
};

messageBuilders.setApnAndServer = function (messageValue) {
    return ":" + messageValue.password + "C" + messageValue.apn + "," + messageValue.ipAddress + ":" + messageValue.port + "#";
};

messageBuilders.setApnUserNameAndPassword = function (messageValue) {
    return ":" + messageValue.password + "O" + messageValue.apnUserName + "," + messageValue.apnPassword + "#";
};

module.exports = buildCommand;
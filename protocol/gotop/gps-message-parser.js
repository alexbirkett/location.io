// V,DATE:120903,TIME:160649,LAT:59.9326566N,LOT:010.7875033E,Speed:005.5,X-X-X-X-82-10,000,24202-0324-0E26

var executeParseFunctionAndCatchException = require('../util').executeParseFunctionAndCatchException;

var latPattern = /^LAT:(\d{2}.\d*)(N|S)$/i;

function parseLatitude(latString) {

    var elements = latPattern.exec(latString);

    latitude = parseFloat(elements[1]);
    var hemisphere = elements[2];
    if (hemisphere == 'S') {
        latitude = -latitude;
    } else if (hemisphere != 'N') {
        throw "invalid hemisphere";
    }
    return latitude;
}

var lngPattern = /^LOT:(\d{3}.\d*)(E|W)$/i;

function parseLongitude(lngString) {
    var elements = lngPattern.exec(lngString);

    longitude = parseFloat(elements[1]);
    var hemisphere = elements[2];
    if (hemisphere == 'W') {
        longitude = -longitude;
    } else if (hemisphere != 'E') {
        throw "invalid hemisphere";
    }
    return longitude;
}

function parseAvailablility(available) {
    if (available == 'A') {
        return true;
    } else if (available == 'V') {
        return false;
    } else {
        throw "availablilty parse failed";
    }
}

var datePattern = /^DATE:(\d{2})(\d{2})(\d{2})$/i;
var timePattern = /^TIME:(\d{2})(\d{2})(\d{2})$/i;

function parseDate(dateString, timeString) {
    var date = new Date(0);

    var dateElements = datePattern.exec(dateString);

    date.setUTCFullYear("20" + dateElements[1]);
    date.setUTCMonth(dateElements[2] - 1);
    date.setUTCDate(dateElements[3]);

    var timeElements = timePattern.exec(timeString);


    date.setUTCHours(timeElements[1]);
    date.setUTCMinutes(timeElements[2]);
    date.setUTCSeconds(timeElements[3]);

    return date;
}


var speedPattern = /^SPEED:(\d{3}.\d)$/i;

function parseSpeed(speedString) {
    var speedElements = speedPattern.exec(speedString);
    return parseFloat(speedElements[1]);
}

// A-B-C-XX-YY
// X-X-X-X-82-10
function parseStatus(status) {
    var object = {};
    var elements = status.split('-');
    object.batteryLife = parseInt(elements[elements.length - 2], 10);
    object.gsmSignal = parseInt(elements[elements.length - 1], 10);
    return object;
}

// 24202-0ED9-D93B

var networkPattern = /^(\d{3})(\d{2})-([0-9A-F]*)-([0-9A-F]*)$/;
function parseNetwork(networkString) {
    var elements = networkPattern.exec(networkString);
    var object = {};
    object.countryCode = parseInt(elements[1], 10);
    object.networkCode = parseInt(elements[2], 10);
    object.locationAreaCode = parseInt(elements[3], 16);
    object.cellId = parseInt(elements[4], 16);
    return object;
}

var parseMessage = function (message) {
    var elements = message.split(',');
    var object = {};

    object.available = executeParseFunctionAndCatchException(parseAvailablility, elements[0], message);

    object.timestamp = executeParseFunctionAndCatchException(parseDate, [elements[1], elements[2]], message);

    object.latitude = executeParseFunctionAndCatchException(parseLatitude, elements[3], message);
    object.longitude = executeParseFunctionAndCatchException(parseLongitude, elements[4], message);
    object.speed = executeParseFunctionAndCatchException(parseSpeed, elements[5], message);
    object.status = executeParseFunctionAndCatchException(parseStatus, elements[6], message);
    object.network = executeParseFunctionAndCatchException(parseNetwork, elements[8], message);
    return object;
};

module.exports = parseMessage;
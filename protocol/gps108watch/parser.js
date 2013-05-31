var parseGpsMessage = require('./gps-message-parser');
var util = require('../util');

var lookupMessage = require('./message-types');

var executeParseFunctionAndCatchException = util.executeParseFunctionAndCatchException;

var POUND_CHARACTER_CODE = "#".charCodeAt(0);
var messageLength = function (buffer) {

    var result = -1;
    if (buffer.length > 0) {
        if (buffer[0] != POUND_CHARACTER_CODE) {
            throw "message must start with #";
        }

        var index = util.bufferIndexOf(buffer, POUND_CHARACTER_CODE, 1, 9);

        if (index > 0) {
            index++;
            if (buffer.length > index) {
                if (buffer[index] == POUND_CHARACTER_CODE) {
                    result = index + 1;
                } else {
                    throw "message must end with ##";
                }
            }
        }
    }

    return result;
};

var parseMessage = function (buffer) {
    var message = {};
    var startIndex = 1;
    var endIndex;

    var readNextValue = function () {
        endIndex = util.bufferIndexOf(buffer, POUND_CHARACTER_CODE, startIndex);
        var string = buffer.toString('UTF8', startIndex, endIndex);
        startIndex = endIndex + 1;
        return string;
    };

    message.imei = readNextValue();
    message.userName = readNextValue();
    message.condition = readNextValue();
    message.password = readNextValue();
    message.rawType = readNextValue();
    message.type = lookupMessage(message.rawType);
    message.number = readNextValue();
    message.validity = readNextValue();
    var location = readNextValue();
    message.location = parseGpsMessage(location);
    message.networkOne = readNextValue();
    message.networkTwo = readNextValue();
    message.trackerId = message.userName + message.imei;

    return message;
};

var findFrameAndParseMessage = function (buffer, callback) {
    var error = null;
    var message;

    var bufferToReturn = buffer;

    try {
        var length = messageLength(buffer);
        if (length > 0) {
            message = parseMessage(buffer);
            bufferToReturn = buffer.slice(length);
        }
    } catch (e) {
        error = e;
    }

    setImmediate(function () {
        callback(error, message, bufferToReturn);
    });
};

module.exports = findFrameAndParseMessage;

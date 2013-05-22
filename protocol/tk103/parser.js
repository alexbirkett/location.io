var executeParseFunctionAndCatchException = require('../util').executeParseFunctionAndCatchException;

var lookupMessage = require('./message-types');
var messageParsers = require('./message-parsers');

function parseMessage(message) {
    // we can't use regex here because we need to be able to pass the message body as a buffer to the parse function
    var frame = {};

    var trackerIdlength = 0;
    while (message.readInt8(trackerIdlength) != 66 && trackerIdlength < message.length) { // 66 is B
        trackerIdlength++;
    }
    frame.trackerId = message.slice(1, trackerIdlength) + "";

    var messageCode = message.slice(trackerIdlength + 1, trackerIdlength + 4);
    frame.type = lookupMessage(messageCode);

    var parseFunction;
    if (frame.type !== undefined) {
        parseFunction = messageParsers.messages[frame.type];
        if (parseFunction === undefined) {
            parseFunction = messageParsers.acks[frame.type];
        }
    }

    if (parseFunction !== undefined) {
        var messageBody = message.slice(trackerIdlength + 4);
        executeParseFunctionAndCatchException(parseFunction, [messageBody, frame], message);
    }

    return frame;
}

var findFrameAndParseMessage = function (buffer, callback) {
    // pass back the buffer if we can't parse the message yet
    var messageStartIndex = -1;
    var message;
    var bufferToReturn = buffer;
    var error = null;
    try {
        if (buffer.length > 0 && buffer.readUInt8(0) == 40) {
            for (var i = 1; i < buffer.length; i++) {
                var charValue = buffer.readUInt8(i);

                if (charValue == 41) {
                    message = parseMessage(buffer.slice(messageStartIndex + 1, i));
                    bufferToReturn = buffer.slice(i + 1);
                    break;
                }
            }
        } else {
            error = "incompatible protocol";
        }
    } catch (e) {

    }

    setImmediate(function () {
        callback(error, message, bufferToReturn);
    });

};

module.exports = findFrameAndParseMessage;

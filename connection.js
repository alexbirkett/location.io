
require('smarter-buffer');
var util = require('./protocol/util');
var parse = require('./parse')._parse;

module.exports.attachSocket = function (self, socket, protocolModules, callback) {
    self.protocolModules = protocolModules;
    self.upMessagesCallbacks = {};

    socket.setKeepAlive(true, 30000);

    var setAndEmittIdIfrequired = function (message) {

        if (!self.id) {
            self.id = message.trackerId;
            callback('tracker-connected', self.id, self.protocolModuleName);
        }
    };

    var boundParseFunction = parse.bind(self);

    socket.on('data', function (data) {
        bufferAndHandleData(self, data, handleData, boundParseFunction, function (message) {
            setAndEmittIdIfrequired(message);
            callback('message', self.id, message);

            sendAck(self.protocolModule, socket, message, function (err) {

            });

            if (self.upMessagesCallbacks[message.type] !== undefined) {
                self.upMessagesCallbacks[message.type](null);
            }
            self.upMessagesCallbacks[message.type] = undefined;

        });
    });

    socket.on('close', function (data) {
        callback('tracker-disconnected', self.id);
    });

    socket.on('error', function (err) {
        console.log('socket error occured ' + err);
    });
};


var bufferAndHandleData = function (self, data, handleDataFunction, parseFunction, handleMessageFunction) {
    self.dataBuffer = Buffer.smarterConcat([self.dataBuffer, data]);
    if (!self.handlingData) {
        handleDataFunction(self, parseFunction, handleMessageFunction);
    }
};

module.exports._bufferAndHandleData = bufferAndHandleData;

var handleData = function (self, parseFunction, handleMessageFunction, callback) {

    if (self.handlingData) {
        throw "already handling data";
    }

    var doCallCallback = function () {
        if (typeof (callback) == "function") {
            callback(null);
        }
    };

    var handleParseComplete = function (err, message, data) {

        // more data was added while we were parsing or unconsumed data has been passed back
        var moreParsingRequired = self.dataBuffer || (message && data.length > 0);

        self.dataBuffer = Buffer.smarterConcat([data, self.dataBuffer]);

        if (message) {
            handleMessageFunction(message);
        }

        if (moreParsingRequired) {
            kickOffParse();
        } else {
            self.handlingData = false;
            doCallCallback();
        }
    };


    var kickOffParse = function () {
        self.handlingData = true;
        var dataToParse = self.dataBuffer;
        self.dataBuffer = undefined;
        parseFunction(dataToParse, handleParseComplete);
    };


    if (!self.handlingData) {
        kickOffParse();
    }
};

module.exports._handleData = handleData;


module.exports._parse = parse;

var sendAck = function (module, socket, message, callback) {
    var ack;

    if (module.buildAck !== undefined) {
        ack = module.buildAck(message);
    }

    if (ack !== undefined) {
        socket.write(ack, function (err) {
            callback(err);
        });
    }
};

module.exports.sendMessage = function (self, socket, messageName, commandParameters, callback) {
    console.log('sending message ' + messageName);
    commandParameters.trackerId = self.id;
    console.log(commandParameters);
    var module = self.protocolModule;
    try {
        util.assertValidMessage(messageName, commandParameters, module.api);
        var message = module.buildMessage(messageName, commandParameters);
        console.log('sending to tracker: ' + message);
        socket.write(message, function (err) {
            //@TODO no guarantee that protocols that don't require up messages to be ACKed also don't require down messages to be acked.
            if (err || module.buildAck === undefined) {
                callback(err);
            } else {
                self.upMessagesCallbacks[messageName] = callback;
            }
        });


    } catch (e) {
        console.log("build message failed " + e);
        setImmediate(function () {
            callback(e + "");
        });
    }
};


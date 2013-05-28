var vows = require('vows'), assert = require('assert');

var connection = require('../connection');

process.on('uncaughtException', function (err) {
    console.log('Caught exception: ' + err.stack);
});

var getSimpleParser = function (meta, synchronous) {

    meta.parseCallCount = 0;

    var parse = function (data, callback) {
        var doParse = function () {
            meta.parseCallCount++;

            var dataToPassBack = data;

            var dataLength = 0;
            for (var i = 0; i < data.length; i++) {
                if (data.readUInt8(i) == 0x20) {
                    dataLength = i;
                    break;
                }
            }

            var message = null;

            if (dataLength > 0) {
                message = data.toString('utf8', 0, i);
                dataToPassBack = data.slice(dataLength + 1);
            }

            callback(null, message, dataToPassBack);

        };
        if (synchronous) {
            doParse();
        } else {
            process.nextTick(doParse);
        }
    };
    return parse;
};


var getTestSimpleParserContext = function (sync) {
    return {
        topic: function () {
            var meta = {};
            var parse = getSimpleParser(meta, sync);
            var buffer = new Buffer("hello ");
            parse(buffer, this.callback);

        },
        'should not return error': function (err, message, dataToPassBack, protocolModules) {
            assert.isNull(err);
        },
        'should return message hello': function (err, message, dataToPassBack, protocolModules) {
            assert.equal(message, "hello");
        },
        'should not pass back any data': function (err, message, dataToPassBack, protocolModules) {
            assert.equal(dataToPassBack.length, 0);
        }
    };
};

var getPassedBackUnconsumedDataContext = function (sync) {
    return {
        topic: function () {
            var self = {};
            self.dataBuffer = new Buffer("in good faith i_will_not_get_sent_back_because_im_not_followed_by_a_space");

            var meta = {};
            var testCaseCallback = this.callback;

            meta.handleMessageCallCount = 0;
            meta.messagesHandled = [];

            var handleMessage = function (message) {
                meta.messagesHandled[meta.handleMessageCallCount] = message;
                meta.handleMessageCallCount++;
            };

            var handleDataDoneCallback = function () {
                testCaseCallback(self, meta);
            };

            connection._handleData(self, getSimpleParser(meta, sync), handleMessage, handleDataDoneCallback);
        },
        'should pass back messages and left overdata': function (self, meta) {
            assert.equal(self.dataBuffer + '', 'i_will_not_get_sent_back_because_im_not_followed_by_a_space');
            assert.isFalse(self.handlingData);
            assert.equal(meta.handleMessageCallCount, 3);
            assert.equal(meta.messagesHandled[0], "in");
            assert.equal(meta.messagesHandled[1], "good");
            assert.equal(meta.messagesHandled[2], "faith");
            assert.equal(meta.parseCallCount, 4);
        }
    };
};

var getHandlesIncrementalDataContext = function (sync) {
    return {
        topic: function () {
            var self = {};
            self.dataBuffer = new Buffer("in good");

            process.nextTick(function () {
                self.dataBuffer = new Buffer(" faith i_will_not_get_sent_back_because_im_not_followed_by_a_space");
            });
            var meta = {};
            var testCaseCallback = this.callback;

            meta.handleMessageCallCount = 0;
            meta.messagesHandled = [];

            var handleMessage = function (message) {
                meta.messagesHandled[meta.handleMessageCallCount] = message;
                meta.handleMessageCallCount++;
            };

            var handleDataDoneCallback = function () {
                testCaseCallback(self, meta);
            };

            connection._handleData(self, getSimpleParser(meta, sync), handleMessage, handleDataDoneCallback);
        },
        'should pass back messages and unconsumed data': function (self, meta) {
            console.log(self);
            console.log(meta);
            //assert.equal(self.dataBuffer + '', 'i_will_not_get_sent_back_because_im_not_followed_by_a_space');
            assert.isFalse(self.handlingData);
            assert.equal(meta.handleMessageCallCount, 3);
            assert.equal(meta.messagesHandled[0], "in");
            assert.equal(meta.messagesHandled[1], "good");
            assert.equal(meta.messagesHandled[2], "faith");
            assert.equal(meta.parseCallCount, 4);
        }
    };
};


var getHandlesIncompleteMessageContext = function (sync) {
    return {
        topic: function () {
            var self = {};
            self.dataBuffer = new Buffer("wont_get_parsed_on_first_pass_because_not_followed_by_space");

            process.nextTick(function () {
                self.dataBuffer = new Buffer(" will_get_parsed_on_second_pass_because_followed_by_space ");
            });
            var meta = {};
            var testCaseCallback = this.callback;

            meta.handleMessageCallCount = 0;
            meta.messagesHandled = [];

            var handleMessage = function (message) {
                meta.messagesHandled[meta.handleMessageCallCount] = message;
                meta.handleMessageCallCount++;
            };

            var handleDataDoneCallback = function () {
                testCaseCallback(self, meta);
            };

            connection._handleData(self, getSimpleParser(meta, sync), handleMessage, handleDataDoneCallback);
        },
        'should pass back two messages after three rounds of parsing': function (self, meta) {
            assert.equal(self.dataBuffer.length, 0);
            assert.isFalse(self.handlingData);
            assert.equal(meta.handleMessageCallCount, 2);
            assert.equal(meta.messagesHandled[0], "wont_get_parsed_on_first_pass_because_not_followed_by_space");
            assert.equal(meta.messagesHandled[1], "will_get_parsed_on_second_pass_because_followed_by_space");
            assert.equal(meta.parseCallCount, 3);
        }
    };
};

vows.describe('parse.handleData').addBatch({
    //'test simple parser sync': getTestSimpleParserContext(true),
    'test simple parser async': getTestSimpleParserContext(false),
    'handleData passes back unconsumed data sync': getPassedBackUnconsumedDataContext(false),
    //'handleData passes back unconsumed data async' : getPassedBackUnconsumedDataContext(true),
    'handleData handles incremental data sync': getHandlesIncrementalDataContext(false),
    //'handleData handles incremental data async' : getHandlesIncrementalDataContext(true),
    'handleData handles data when incomplete message is sent to parser sync': getHandlesIncompleteMessageContext(false),
    //'handleData handles data when incomplete message is sent to parser async' : getHandlesIncompleteMessageContext(true),
    'bufferAndHandleData handlesData when not already handling data': {
        topic: function () {
            var meta = {};
            meta.self = {};
            meta.self.handlingData = false;

            meta.self.dataBuffer = new Buffer('hello');

            var data = Buffer(' world');

            var handleData = function (self, parseFunction, handleMessageFunction) {
                meta.handleData = {};
                meta.handleData.self = self;
                meta.handleData.parseFunction = parseFunction;
                meta.handleData.handleMessageFunction = handleMessageFunction;
            };
            connection._bufferAndHandleData(meta.self, data, handleData, "parseFunction", "handleMessageFunction");
            return meta;

        },
        'should handleData': function (meta) {
            assert.equal(meta.handleData.self, meta.self);
            assert.equal(meta.handleData.parseFunction, "parseFunction");
            assert.equal(meta.handleData.handleMessageFunction, "handleMessageFunction");
            assert.equal(meta.self.dataBuffer + '', "hello world");
        }
    },
    'bufferAndHandleData only buffers when already handling data': {
        topic: function () {
            var meta = {};
            meta.self = {};
            meta.self.handlingData = true;

            meta.self.dataBuffer = new Buffer('hello');

            var data = Buffer(' world');

            meta.handleDataCalled = false;

            var handleData = function (self, parseFunction, handleMessageFunction) {
                meta.handleDataCalled = true;
            };

            connection._bufferAndHandleData(meta.self, data, handleData, "parseFunction", "handleMessageFunction");
            return meta;

        },
        'should not handleData': function (meta) {
            assert.isFalse(meta.handleDataCalled);
            assert.equal(meta.self.dataBuffer + '', "hello world");
        }
    }
}).export(module);
// Export the Suite
var vows = require('vows'), assert = require('assert');

var parse = require('../parse');

process.on('uncaughtException', function (err) {
    console.log('Caught exception: ' + err.stack);
});

vows.describe('parse.parse').addBatch({
    'parse with three modules, the last one of which returns a message': {
        topic: function () {
            var connection = {};
            connection.protocolModules = {
                'broken': {
                    parseMessage: function (buffer, callback) {
                        process.nextTick(function () {
                            callback("error", null, buffer);
                        });
                    }
                },
                'workingOne': {
                    parseMessage: function (buffer, callback) {
                        process.nextTick(function () {
                            callback(null, null, buffer);
                        });
                    }
                },
                'workingTwo': {
                    parseMessage: function (buffer, callback) {
                        process.nextTick(function () {
                            callback(null, "message", new Buffer(2));
                        });
                    }
                }};

            var parseFunction = parse._parse.bind(connection);

            parseFunction(new Buffer(0), this.callback);
        },
        'should not return error': function (err, message, data) {
            assert.ifError(err);
        },
        'should return message': function (err, message, data) {
            assert.equal(message, "message");
        },
        'should data length should be 2': function (err, message, data) {
            assert.equal(data.length, 2);
        }
    },
    'parse with two modules, the last one of which returns a message': {
        topic: function () {
            var connection = {};
            connection.protocolModules = {

                'broken': {
                    parseMessage: function (buffer, callback) {
                        process.nextTick(function () {
                            callback("error", null, buffer);
                        });
                    }
                },
                'workingOne': {
                    parseMessage: function (buffer, callback) {
                        process.nextTick(function () {
                            callback(null, "message", new Buffer(2));
                        });
                    }
                }
            };

            var parseFunction = parse._parse.bind(connection);

            parseFunction(new Buffer(0), this.callback);
        },
        'should not return error': function (err, message, data) {
            assert.ifError(err);
        },
        'should return message': function (err, message, data) {
            assert.equal(message, "message");
        },
        'should data length should be 2': function (err, message, data) {
            assert.equal(data.length, 2);
        }
    },
    'parse with one module that returns a error and none that return a message': {
        topic: function () {
            var connection = {};


            connection.protocolModules = {

                'moduleThatReturnsErrror': {
                    parseMessage: function (buffer, callback) {
                        process.nextTick(function () {
                            callback("error", null, null);
                        });
                    }
                },
                'candidateOne': {
                    parseMessage: function (buffer, callback) {
                        process.nextTick(function () {
                            callback(null, null, null);
                        });
                    }
                },
                'candidateTwo': {
                    parseMessage: function (buffer, callback) {
                        process.nextTick(function () {
                            callback(null, null, null);
                        });
                    }
                }
            };

            var parseFunction = parse._parse.bind(connection);

            parseFunction(new Buffer(7), this.callback);
        },
        'should not return error': function (err, message, data) {
            assert.ifError(err);
        },
        'should not return a message': function (err, message, data) {
            assert.isUndefined(message); // no message was sent back
        },
        'should data length should be 7': function (err, message, data) {
            assert.equal(data.length, 7);
        },
        'candidateOne should be in candidate array': function (err, message, data, self) {
            assert.include(self.candidateModules, 'candidateOne');
        },
        'candidateTwo should be in candidate array': function (err, message, data, self) {
            assert.include(self.candidateModules, 'candidateTwo');
        },
        'moduleThatReturnsErrror should not in candidate array': function (err, message, data, self) {
            assert.isUndefined(self.candidateModules.moduleThatReturnsErrror);
        }
    },
    'parse when first module returns a message': {
        topic: function () {
            var connection = {};

            connection.protocolModules = {

                'moduleThatReturnsAMessage': {
                    parseMessage: function (buffer, callback) {
                        process.nextTick(function () {
                            callback(null, 'message', buffer);
                        });
                    }
                },
                'candidateOne': {
                    parseMessage: function (buffer, callback) {
                        process.nextTick(function () {
                            callback(null, null, buffer);
                        });
                    }
                },
                'candidateTwo': {
                    parseMessage: function (buffer, callback) {
                        process.nextTick(function () {
                            callback(null, null, null);
                        });
                    }
                }
            };

            var parseFunction = parse._parse.bind(connection);

            parseFunction(new Buffer(7), this.callback);
        },
        'should not return error': function (err, message, data) {
            assert.ifError(err);
        },
        'should return a message': function (err, message, data) {
            assert.isNotNull(message); // no message was sent back
        },
        'should data length should be 7': function (err, message, data) {
            assert.equal(data.length, 7);
        },
        'candidate array should be undefined': function (err, message, data, self) {
            assert.isUndefined(self.candidateModules);
        },
        'protocolModuleName name should be moduleThatReturnsAMessage': function (err, message, data, self) {
            assert.equal(self.protocolModuleName, 'moduleThatReturnsAMessage');
        },
        'protocolModule should be defined': function (err, message, data, self) {
            assert.isDefined(self.protocolModule);
        }
    },
    'parse when first module throws an exception a message': {
        topic: function () {
            var connection = {};


            connection.protocolModules = {

                'moduleThatThrowsException': {
                    parseMessage: function (buffer, callback) {
                        throw "error";
                    }
                },
                'candidateOne': {
                    parseMessage: function (buffer, callback) {
                        process.nextTick(function () {
                            callback(null, null, buffer);
                        });
                    }
                }
            };


            var parseFunction = parse._parse.bind(connection);

            parseFunction(new Buffer(7), this.callback);
        },
        'should not return error': function (err, message, data) {
            assert.ifError(err);
        },
        'should not return a message': function (err, message, data) {
            assert.isUndefined(message); // no message was sent back
        },
        'should data length should be 7': function (err, message, data) {
            assert.equal(data.length, 7);
        },
        'candidateOne should be in candidate array': function (err, message, data, self) {
            assert.include(self.candidateModules, 'candidateOne');
        },
        'moduleThatThrowsException should not in candidate array': function (err, message, data, self) {
            assert.isUndefined(self.candidateModules.moduleThatThrowsException);
        }
    },
    'parse when first module callsback syncrhonously': {
        topic: function () {
            var connection = {};

            connection.protocolModules = {

                'moduleThatCallsBackSynchronously': {
                    parseMessage: function (buffer, callback) {
                        callback(null, "message", buffer);
                    }
                },
                'candidateOne': {
                    parseMessage: function (buffer, callback) {
                        process.nextTick(function () {
                            callback(null, null, buffer);
                        });
                    }
                }
            };


            var parseFunction = parse._parse.bind(connection);

            parseFunction(new Buffer(2), this.callback);
        },
        'should not return error': function (err, message, data) {
            assert.ifError(err);
        },
        'should return message': function (err, message, data) {
            assert.equal(message, "message");
        },
        'should data length should be 2': function (err, message, data) {
            assert.equal(data.length, 2);
        }
    },
    'parse when parse function does not callback': {
        topic: function () {
            var connection = {};

            connection.protocolModules = {

                'doesNotCallback': {
                    parseMessage: function (buffer, callback) {
                        // do nothing
                    }
                }
            };

            var parseFunction = parse._parse.bind(connection);

            parseFunction(new Buffer(2), this.callback);
        },
        'should not return message': function (err, message, data) {
            assert.isUndefined(message);
        },
        'doesNotCallback should not be in candidate array': function (err, message, data, self) {
            assert.isUndefined(self.candidateModules.doesNotCallback);
        }
    },
    'parse when parse function calls back after timeout': {
        topic: function () {
            var connection = {};

            connection.protocolModules = {

                'callsBackAfterTimeOut': {
                    parseMessage: function (buffer, callback) {
                        setTimeout(function () {
                            callback(null, "message", buffer);
                        }, 1500);
                    }
                }
            };

            var parseFunction = parse._parse.bind(connection);

            parseFunction(new Buffer(2), this.callback);
        },
        'should not return message': function (err, message, data) {
            assert.isUndefined(message);
        }
    },
    'parse when one module does not return a message and another times out': {
        topic: function () {
            var connection = {};

            connection.protocolModules = {

                'doesNotCallBack': {
                    parseMessage: function (buffer, callback) {
                        // do nothing
                    }
                },
                'candidate': {
                    parseMessage: function (buffer, callback) {
                        process.nextTick(function () {
                            callback(null, null, buffer);
                        });
                    }
                }
            };


            var parseFunction = parse._parse.bind(connection);
            parseFunction(new Buffer(2), this.callback);
        },
        'should not return error': function (err, message, data) {
            assert.ifError(err);
        },
        'should not return a message': function (err, message, data) {
            assert.isUndefined(message);
        },
        'should data length should be 2': function (err, message, data) {
            assert.equal(data.length, 2);
        }
    },
    'parse when one module times out and another does not return a message': {
        topic: function () {
            var connection = {};

            connection.protocolModules = {

                'candidate': {
                    parseMessage: function (buffer, callback) {
                        process.nextTick(function () {
                            callback(null, null, buffer);
                        });
                    }
                },
                'doesNotCallBack': {
                    parseMessage: function (buffer, callback) {
                        // do nothing
                    }
                }
            };

            var parseFunction = parse._parse.bind(connection);

            parseFunction(new Buffer(2), this.callback);
        },
        'should not return error': function (err, message, data) {
            assert.ifError(err);
        },
        'should not return a message': function (err, message, data) {
            assert.isUndefined(message);
        },
        'should data length should be 2': function (err, message, data) {
            assert.equal(data.length, 2);
        }
    }
}).export(module);
// Export the Suite
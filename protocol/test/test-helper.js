var async = require('async');
var LocationIo = require('../../index.js');
var async = require('async');
var TrackerSimulator = require('tracker-simulator');
var addTimeout = require("addTimeout");

var testDownMessage = function(port, loginMessage, expectedLoginResponse, messageName, parameters, expectedDownMessageLength, downMessageAck, callback) {

    var locationIo = new LocationIo();
    var trackerSimulator = new TrackerSimulator();
     
    async.waterfall([
        function(callback) {
            locationIo.createServer(port, callback);
        },
        function(callback) {
            trackerSimulator.connect({host: 'localhost', port: port}, addTimeout(20000, callback, undefined, 'connect'));
        },
        function(callback) {
            async.parallel([
                function(callback) {
                    trackerSimulator.sendMessage(loginMessage, 0, 50, 150, addTimeout(20000, callback, undefined, 'send login message'));
                },
                function(callback) {
                    locationIo.once('tracker-connected', addTimeout(20000, callback.bind(locationIo, null), undefined, 'tracker-connected'));
                },
                function(callback) {
                    if (expectedLoginResponse) {
                        trackerSimulator.waitForData(expectedLoginResponse.length, addTimeout(20000, callback, 'wait for login response'));                     
                    } else {
                        process.nextTick(callback);
                    }
                }
            ], callback);
            
        },
        function(results, callback) {
            var loginResponse = results[2];
            if (loginResponse != expectedLoginResponse) {
                callback('unexpected login response');
            } else {
                var trackerId = results[1][0];
                async.parallel([
                    function(callback) {
                        locationIo.sendMessage(trackerId, messageName, parameters, callback);
                    },
                    function(callback) {
                        locationIo.once('message',addTimeout(5000, callback.bind(locationIo, null), undefined, 'message'));
                    },
                    function(callback) {
                        async.series([
                            function(callback) {
                                trackerSimulator.waitForData(expectedDownMessageLength, addTimeout(20000, callback, undefined, 'waitfordata'));
                            },
                            function(callback) {
                                trackerSimulator.sendMessage(downMessageAck, 0, 50, 150, addTimeout(20000, callback, undefined, 'sendack'))
                            }
                        ], callback);   
                    }
                ], callback);  
            }  
        }
        ], function(err, results) {
           if (err) {
               callback(err);
           } else {
              var downMessageReceivedByTracker = results[2][0] + '';
              var parsedAckRecievedByServer = results[1][1]; 
              callback(err, downMessageReceivedByTracker, parsedAckRecievedByServer);
           }

           trackerSimulator.destroy();
           locationIo.close(); 
    }); 
};


var testUpMessage = function(port, data, numberOfBytesToWaitFor, sliceLength, callback) {
    var locationIo = new LocationIo();
    var trackerSimulator = new TrackerSimulator();

    async.series([
        function(callback) {
            locationIo.createServer(port, callback);
        },
        function(callback) {
            trackerSimulator.connect({
                host : 'localhost',
                port : port
            }, callback);
        },
        function(callback) {
            console.log('connected');
            async.parallel([
                function(callback) {
                    locationIo.once('message',addTimeout(5000, callback.bind(locationIo, null), undefined, 'message'));
                },
                function(callback) {
                    locationIo.once('tracker-connected',addTimeout(5000, callback.bind(locationIo, null), undefined, 'tracker-connected'));
                },
                function(callback) {
                    trackerSimulator.sendMessage(data, 0, 50, sliceLength, addTimeout(20000, callback, undefined, 'sendmessage'));
                },
                function(callback) {
                    trackerSimulator.waitForData(numberOfBytesToWaitFor, addTimeout(20000, callback, undefined, 'waitfordata'));
                },
            ],
            callback);
        },
        ], function(err, data) {
            if (err) {
                callback(err);
            } else {
                var dataReceivedByClient = data[2][3];
                
                if (Buffer.isBuffer(dataReceivedByClient)) {
                    dataReceivedByClient = dataReceivedByClient.toString();
                }
                var message = data[2][0][1]; 
                var protocol = data[2][1][1];
                callback(err, message, dataReceivedByClient, protocol);
            }

            trackerSimulator.destroy();
            locationIo.close();
        });
};

exports.testUpMessage = function(getPortFunction, data, numberOfBytesToWaitFor, sliceLength, callback) {
    var callTestUpMessage = function() {
        var port = getPortFunction();
        testUpMessage(port, data, numberOfBytesToWaitFor, sliceLength, handleAddrInUseCallback);
    };
    
    var handleAddrInUseCallback = function(err) {
       if (err && err.code == 'EADDRINUSE') {
           callTestUpMessage();
       } else {
           callback.apply(this, arguments);
       }
    };   
    
    callTestUpMessage();
}

exports.testDownMessage = function(getPortFunction, loginMessage, expectedLoginResponse, messageName, parameters, expectedDownMessageLength, downMessageAck, callback) {
    var callTestDownMessage = function() {
        var port = getPortFunction();
        testDownMessage(port, loginMessage, expectedLoginResponse, messageName, parameters, expectedDownMessageLength, downMessageAck, handleAddrInUseCallback);
    };
    
    var handleAddrInUseCallback = function(err) {
       if (err && err.code == 'EADDRINUSE') {
           callTestDownMessage();
       } else {
           callback.apply(this, arguments);
       }
    };   
    
    callTestDownMessage();
}



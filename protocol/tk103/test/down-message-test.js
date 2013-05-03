var assert = require('assert');
var vows = require('vows');
var async = require('async');
var LocationIo = require('../../../index.js');
var forEach = require('async-foreach').forEach;
var TrackerSimulator = require('tracker-simulator');
var ewait = require('ewait');

var nextPort = 3141;
var addTimeout = require("addTimeout");

var LOGIN_MESSAGE = "(013612345678BP05000013612345678080524A2232.9806N11404.9355E000.1101241323.8700000000L000450AC)"; 
var EXPECTED_LOGIN_RESPONSE = "(013612345678AP05)";
       
process.on('uncaughtException', function(err) {
  console.log('Caught exception: ' + err.stack);
});
 
var testDownMessage = function(messageName, parameters, expectedDownMessageLength, downMessageAck, callback) {
    var port = nextPort++;
    var locationIo = new LocationIo();
    var trackerSimulator = new TrackerSimulator();
        
    locationIo.createServer(port);
    
    var locationIoEmitter = [locationIo];
    
    async.waterfall([
        function(callback) {
            trackerSimulator.connect({host: 'localhost', port: port}, addTimeout(2000, callback, undefined, 'connect'));
        },
        function(callback) {
            async.parallel([
                function(callback) {
                    trackerSimulator.sendMessage(LOGIN_MESSAGE, 0, 50, 150, addTimeout(2000, callback, undefined, 'send login message'));
                },
                function(callback) {
                    ewait.waitForAll(locationIoEmitter, callback, 2000, 'tracker-connected');
                },
                function(callback) {
                    trackerSimulator.waitForData(EXPECTED_LOGIN_RESPONSE.length, addTimeout(1500, callback, 'wait for login response')); 
                }
            ], callback);
            
        },
        function(results, callback) {
            var loginResponse = results[2];
            if (loginResponse != EXPECTED_LOGIN_RESPONSE) {
                callback('unexpected login response');
            } else {
                var trackerId = results[1][0];
                async.parallel([
                    function(callback) {
                        locationIo.sendMessage(trackerId, messageName, parameters, callback);
                    },
                    function(callback) {
                        ewait.waitForAll(locationIoEmitter, callback, 2000, 'message');
                    },
                    function(callback) {
                        async.series([
                            function(callback) {
                                trackerSimulator.waitForData(expectedDownMessageLength, addTimeout(2000, callback, undefined, 'waitfordata'));
                            },
                            function(callback) {
                                trackerSimulator.sendMessage(downMessageAck, 0, 50, 150, addTimeout(2000, callback, undefined, 'sendack'))
                            }
                        ], callback);   
                    }
                ], callback);  
            }  
        }
        ], function(err, results) {
           var downMessageReceivedByTracker = results[2][0] + '';
           var parsedAckRecievedByServer = results[1][1];
           callback(err, downMessageReceivedByTracker, parsedAckRecievedByServer);
           trackerSimulator.destroy();
           locationIo.close(); 
    }); 
};

vows.describe('tk103 down-message-tests').addBatch({
     'test configureUpdateInterval': {
            topic: function() {
                var params = {'enabled':true,'interval': '20s', 'duration': '36m' }
                testDownMessage( "configureUpdateInterval", params, 26, "(013612345678BS0800050014)", this.callback);  
            },
            'should not fail with error': function (err, downMessageReceivedByTracker, parsedAckRecievedByServer) {
                assert.isNull(err);
            },
            'message should be received by tracker': function(err, downMessageReceivedByTracker) {
                assert.equal("(013612345678AR0000140024)", downMessageReceivedByTracker);
            },
            'ack should be received by server': function(err, downMessageReceivedByTracker, parsedAckRecievedByServer) {
                assert.equal('013612345678', parsedAckRecievedByServer.trackerId);
            },
            
      },
      'test requestLocation': {
            topic: function() {
                testDownMessage("requestLocation", {}, 18, "(013612345678BP04080525A2934.0133N10627.2544E000.0141830309.6200000000L00000023)", this.callback);  
            },
            'should not fail with error': function (err, downMessageReceivedByTracker, parsedAckRecievedByServer) {
               assert.isNull(err);
            },
            'message should be received by tracker': function(err, downMessageReceivedByTracker) {
               assert.equal("(013612345678AP00)", downMessageReceivedByTracker);
            },
            'ack should be received by server': function(err, downMessageReceivedByTracker, parsedAckRecievedByServer) {
               assert.equal('013612345678', parsedAckRecievedByServer.trackerId);
            },
            'ack should contain location': function(err, downMessageReceivedByTracker, parsedAckRecievedByServer) {
                assert.isObject(parsedAckRecievedByServer.location);
            }    
      },
      'test configureSpeedAlert': {
            topic: function() {
                testDownMessage("configureSpeedAlert", {'minSpeed': 30, 'maxSpeed' : 50}, 26, "(013612345678BP12H0501L030)", this.callback);  
            },
            'should not fail with error': function (err, downMessageReceivedByTracker, parsedAckRecievedByServer) {
               assert.isNull(err);
            },
            'message should be received by tracker': function(err, downMessageReceivedByTracker) {
               assert.equal("(013612345678AP12H050L030)", downMessageReceivedByTracker);
            },
            'ack should be received by server': function(err, downMessageReceivedByTracker, parsedAckRecievedByServer) {
               assert.equal('013612345678', parsedAckRecievedByServer.trackerId);
               // todo fix min max speed parsing
            }   
      },
      'test configureSwitch0 (enable)': {
            topic: function() {
                testDownMessage("configureSwitch0", {'enabled': true }, 19, "(013612345678BV001)", this.callback);  
            },
            'should not fail with error': function (err, downMessageReceivedByTracker, parsedAckRecievedByServer) {
               assert.isNull(err);
            },
            'message should be received by tracker': function(err, downMessageReceivedByTracker) {
               assert.equal("(013612345678AV001)", downMessageReceivedByTracker);
            },
            'ack should be received by server': function(err, downMessageReceivedByTracker, parsedAckRecievedByServer) {
               assert.equal('013612345678', parsedAckRecievedByServer.trackerId);
            },
            'switch is enabled in ack' :  function(err, downMessageReceivedByTracker, parsedAckRecievedByServer) {
                assert.isTrue(parsedAckRecievedByServer.enabled);
            } 
      },
      'test configureSwitch0 (disable)': {
            topic: function() {
                testDownMessage("configureSwitch0", {'enabled': false }, 19, "(013612345678BV00)", this.callback);  
            },
            'should not fail with error': function (err, downMessageReceivedByTracker, parsedAckRecievedByServer) {
               assert.isNull(err);
            },
            'message should be received by tracker': function(err, downMessageReceivedByTracker) {
               assert.equal("(013612345678AV000)", downMessageReceivedByTracker);
            },
            'ack should be received by server': function(err, downMessageReceivedByTracker, parsedAckRecievedByServer) {
               assert.equal('013612345678', parsedAckRecievedByServer.trackerId);
            },
            'switch is enabled in ack' :  function(err, downMessageReceivedByTracker, parsedAckRecievedByServer) {
                assert.isFalse(parsedAckRecievedByServer.enabled);
            } 
      },
      'test configureSwitch1 (enable)': {
            topic: function() {
                testDownMessage("configureSwitch1", {'enabled': true }, 19, "(013612345678BV011)", this.callback);  
            },
            'should not fail with error': function (err, downMessageReceivedByTracker, parsedAckRecievedByServer) {
               assert.isNull(err);
            },
            'message should be received by tracker': function(err, downMessageReceivedByTracker) {
               assert.equal("(013612345678AV011)", downMessageReceivedByTracker);
            },
            'ack should be received by server': function(err, downMessageReceivedByTracker, parsedAckRecievedByServer) {
               assert.equal('013612345678', parsedAckRecievedByServer.trackerId);
            },
            'switch is enabled in ack' :  function(err, downMessageReceivedByTracker, parsedAckRecievedByServer) {
                assert.isTrue(parsedAckRecievedByServer.enabled);
            } 
      },
      'test configureSwitch1 (disable)': {
            topic: function() {
                testDownMessage("configureSwitch1", {'enabled': false }, 19, "(013612345678BV010)", this.callback);  
            },
            'should not fail with error': function (err, downMessageReceivedByTracker, parsedAckRecievedByServer) {
               assert.isNull(err);
            },
            'message should be received by tracker': function(err, downMessageReceivedByTracker) {
               assert.equal("(013612345678AV010)", downMessageReceivedByTracker);
            },
            'ack should be received by server': function(err, downMessageReceivedByTracker, parsedAckRecievedByServer) {
               assert.equal('013612345678', parsedAckRecievedByServer.trackerId);
            },
            'switch is enabled in ack' :  function(err, downMessageReceivedByTracker, parsedAckRecievedByServer) {
                assert.isFalse(parsedAckRecievedByServer.enabled);
            } 
      },
      'test restart': {
            topic: function() {
                testDownMessage("restartDevice", { }, 18, "(013612345678BT00)", this.callback);  
            },
            'should not fail with error': function (err, downMessageReceivedByTracker, parsedAckRecievedByServer) {
               assert.isNull(err);
            },
            'message should be received by tracker': function(err, downMessageReceivedByTracker) {
               assert.equal("(013612345678AT00)", downMessageReceivedByTracker);
            },
            'ack should be received by server': function(err, downMessageReceivedByTracker, parsedAckRecievedByServer) {
               assert.equal('013612345678', parsedAckRecievedByServer.trackerId);
            } 
      }, 
      'test configureUpdateIntervalWhenAccOpen': {
            topic: function() {
                testDownMessage("configureUpdateIntervalWhenAccOpen", { interval:'20s' }, 22, "(013612345678BR05)", this.callback);  
            },
            'should not fail with error': function (err, downMessageReceivedByTracker, parsedAckRecievedByServer) {
               assert.isNull(err);
            },
            'message should be received by tracker': function(err, downMessageReceivedByTracker) {
               assert.equal("(013612345678AR050014)", downMessageReceivedByTracker);
            },
            'ack should be received by server': function(err, downMessageReceivedByTracker, parsedAckRecievedByServer) {
               assert.equal('013612345678', parsedAckRecievedByServer.trackerId);
            } 
      },
     'test configureUpdateIntervalWhenAccClosed': {
            topic: function() {
                testDownMessage("configureUpdateIntervalWhenAccClosed", { interval:'1m' }, 22, "(013612345678BR06)", this.callback);  
            },
            'should not fail with error': function (err, downMessageReceivedByTracker, parsedAckRecievedByServer) {
               assert.isNull(err);
            },
            'message should be received by tracker': function(err, downMessageReceivedByTracker) {
               assert.equal("(013612345678AR06003C)", downMessageReceivedByTracker);
            },
            'ack should be received by server': function(err, downMessageReceivedByTracker, parsedAckRecievedByServer) {
               assert.equal('013612345678', parsedAckRecievedByServer.trackerId);
            } 
      },
      'test configureGeofence': {
            topic: function() {
                var params = {
                    trackerId : "013612345678",
                    maxLongitude : 113.919583,
                    minLongitude : 112.553867,
                    maxLatitude : 22.7742,
                    minLatitude : 22.7553,
                    enabled : true
                };
                testDownMessage("configureGeofence", params, 61, "(013612345678BU0001)", this.callback);  
            },
            'should not fail with error': function (err, downMessageReceivedByTracker, parsedAckRecievedByServer) {
               assert.isNull(err);
            },
            'message should be received by tracker': function(err, downMessageReceivedByTracker) {
               assert.equal("(013612345678AX051,N,2245.318,2246.452,E,11233.232,11355.175)", downMessageReceivedByTracker);
            },
            'ack should be received by server': function(err, downMessageReceivedByTracker, parsedAckRecievedByServer) {
               assert.equal('013612345678', parsedAckRecievedByServer.trackerId);
            } 
      }
}).export(module);


function testAnswerToSettingGeoFenceMessagesMessages() {
    // this example is homemade, not from the protocol document
    var MESSAGE = new Buffer("");
    var message = parse(MESSAGE).message;
    assert.equal(message.type, constants.messages.ANSWER_THE_SETTING_GEO_FENCE_MESSAGE);
}

function testObtainTheTerminalLocationMessage() {
    var MESSAGE = new Buffer("(013632782450BR03080525A2934.0133N10627.2544E000.0141830309.6200000000L200300C6)");
    var message = parse(MESSAGE).message;
    assert.equal(message.type, 'obtainTheTerminalLocationMessage');
    assert.notEqual(message.location, undefined);
}

function testResponseToMonitoringCommands() {
    var MESSAGE = new Buffer("(013632782450BS20)");
    var message = parse(MESSAGE).message;
    assert.equal(message.type, 'responseToMonitoringCommands');
}

function testAnswerToSettingUpTheTerminalIPAddressAndPort() {
    var MESSAGE = new Buffer("(013632782450BP02)");
    var message = parse(MESSAGE).message;
    assert.equal(message.type, 'answerToSettingUpTheTerminalIPAddressAndPort');
}

function testAnswerToSettingAPNMessage() {
    var MESSAGE = new Buffer("(013632782450BP03)");
    var message = parse(MESSAGE).message;
    assert.equal(message.type, 'answerToSettingAPNMessage');
}

function testResponseToReadingTheTerminalVersionMessage() {
    var MESSAGE = new Buffer("(013632782450BP01GPS518,DEC,22,2008)");
    var message = parse(MESSAGE).message;
    assert.equal(message.type, 'responseToReadingTheTerminalVersionMessage');
    assert.equal(message.terminalVersion, "GPS518,DEC,22,2008");
}


function testResponseToCancelingAllAlarmMessages() {
    var MESSAGE = new Buffer("(013632782450BS21)");
    var message = parse(MESSAGE).message;
    assert.equal(message.type, 'responseToCancelingAllAlarmMessages');
}

function testAnswerToClearingMileageMessages() {
    var MESSAGE = new Buffer("(013632782450BS04)");
    var message = parse(MESSAGE).message;
    assert.equal(message.type, 'answerToClearingMileageMessages');
}

function testAnswerToStartingTheUpgradeMessages() {
    var MESSAGE = new Buffer("(013632782450BS05)");
    var message = parse(MESSAGE).message;
    assert.equal(message.type, 'answerToStartingTheUpgradeMessages');
}

function testAnswerToInitializeMileageMessage() {
    var MESSAGE = new Buffer("(013632782450BS06)");
    var message = parse(MESSAGE).message;
    assert.equal(message.type, 'answerToInitializeMileageMessage');
}

function testAnswerToCenterSendsShortMessagesToThedispatchingScreen() {
    var MESSAGE = new Buffer("(013632782450BS23)");
    var message = parse(MESSAGE).message;
    assert.equal(message.type, 'answerToCenterSendsShortMessagesToThedispatchingScreen');
}

function dispatchScreenSendsAShortMessageToTheCenter() {
    var MESSAGE = new Buffer("(013632782450BS23)");
    var message = parse(MESSAGE).message;
    assert.equal(message.type, 'dispatchScreenSendsAShortMessageToTheCenter');
}

function testDispatchScreenSendsAShortMessageToTheCenter() {
    var MESSAGE = new Buffer.concat([new Buffer("(013612345678BR04"), new Buffer("30005300680065006E007A00680065006E00200048006F006E0067007900750061006E0020005800790074006F006E0067", "hex"),new Buffer(")")]);
    var message = parse(MESSAGE).message;
    assert.equal(message.type, 'dispatchScreenSendsAShortMessageToTheCenter');
}

function testResponseToCenterSendAnInstantMessageToTheAdvertisingScreen() {
    var MESSAGE = new Buffer("(013632782450BS09)");
    var message = parse(MESSAGE).message;
    assert.equal(message.type, 'responseToCenterSendAnInstantMessageToTheAdvertisingScreen');
}

function testCompensationDataReturnMessages() {
    var MESSAGE = new Buffer("(013632782450BR01080612A2232.9828N11404.9297E000.0022828000.0000000000L000230)");
    var message = parse(MESSAGE).message;
    assert.equal(message.type, 'compensationDataReturnMessages');
}

function testAnswerToDownloadingGroupNumbers() {
    var MESSAGE = new Buffer("(013632782450BP162)");
    var message = parse(MESSAGE).message;
    assert.equal(message.type, 'answerToDownloadingGroupNumbers');
    assert.equal(message.status, 'success');
}

function testAnswerToCancelingGroupNumbers() {
    var MESSAGE = new Buffer("(013632782450BP172)");
    var message = parse(MESSAGE).message;
    assert.equal(message.type, 'answerToCancelingGroupNumbers');
    assert.equal(message.status, 'success');
}

function testUploadGroupNumbers() {
    // todo
}

function testAlarmForDataOffsetAndMessagesReturn() {
    var MESSAGE = new Buffer("(013632782450BO022080524A2934.0133N10627.2544E040.0061830309.6200000000L000770EF)");
    var message = parse(MESSAGE).message;
    assert.equal(message.type, 'alarmForDataOffsetAndMessagesReturn');
    assert.equal(message.alarmType, 'sos');
    assert.notEqual(message.location, undefined);
}
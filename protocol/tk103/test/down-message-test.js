var assert = require('assert');
var vows = require('vows');
var async = require('async');
var LocationIo = require('../../../index.js');
var forEach = require('async-foreach').forEach;
var TrackerSimulator = require('../../../test/tracker-simulator.js');


var nextPort = 3141;
var addTimeout = require("addTimeout");

var LOGIN_MESSAGE = "(013612345678BP05000013612345678080524A2232.9806N11404.9355E000.1101241323.8700000000L000450AC)"; 
var EXPECTED_LOGIN_RESPONSE = "(013612345678AP05)";
        
var testDownMessage = function(messageName, parameters, expectedDownMessageLength, downMessageAck, callback) {
    var port = nextPort++;
    var locationIo = new LocationIo();
    var trackerSimulator = new TrackerSimulator();
    
    var connectedTracker = {};
    
    var returnObject = {};
        
    var sendMessageCallback = function() {

 
    };
    
    locationIo.createServer(port, function(eventType, id, message) {
            if (eventType == 'tracker-connected') {
                connectedTracker.id = id;
            }
            if (eventType == 'message') { 
                returnObject.parsedAck = message;    
            } else if (eventType == 'server-up') {
                async.series([
                    function(callback)  {
                        trackerSimulator.connect({host: 'localhost', port: port}, callback);
                    },
                    function(callback) {
                        trackerSimulator.sendMessage(LOGIN_MESSAGE, 0, 50, 150, callback);
                    },
                    function(callback) {
                         trackerSimulator.waitForData(EXPECTED_LOGIN_RESPONSE.length, addTimeout(1500, callback));
                    },
                    function(callback) {      
                        locationIo.sendCommand(connectedTracker.id, messageName, parameters, callback);
                        
                        trackerSimulator.waitForData(expectedDownMessageLength, addTimeout(1500, function(err, data) {
                            returnObject.downMessageReceivedByTracker = data;
                            trackerSimulator.sendMessage(downMessageAck, 0, 50, 150, function() {});
                        }));
         
                    }
                   ],
                   function(err, data) {
                       var actualLoginResponse = data[2];
                       if (actualLoginResponse != EXPECTED_LOGIN_RESPONSE) {
                           throw "error logging in";
                       }
                       callback(err, returnObject.downMessageReceivedByTracker, returnObject.parsedAck);
                       trackerSimulator.destroy();
                       locationIo.close(); 

                });
          }
    }); 
};



vows.describe('connection.parse').addBatch({
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
                testDownMessage("requestLocation", {}, 2, "(013612345678BP04080525A2934.0133N10627.2544E000.0141830309.6200000000L00000023)", this.callback);  
            },
            'should not fail with error': function (err, downMessageReceivedByTracker, parsedAckRecievedByServer) {
                assert.isNull(err);
            },
            'message should be received by tracker': function(err, downMessageReceivedByTracker) {
               console.log("message received by tracker " + downMessageReceivedByTracker);
               assert.equal("(013612345678AP00)", downMessageReceivedByTracker);
            },
            'ack should be received by server': function(err, downMessageReceivedByTracker, parsedAckRecievedByServer) {
               assert.equal('013612345678', parsedAckRecievedByServer.trackerId);
               console.log(parsedAckRecievedByServer);
            },
            'ack should contain location': function(err, downMessageReceivedByTracker, parsedAckRecievedByServer) {
                assert.isNotNull(parsedAckRecievedByServer.location);
            }
            
      }
}).export(module);

function testResponseToSetUpVehicleMaxAndMinSpeed() {
    var MESSAGE = new Buffer("(013612345678BP12H0501L030)");
    var message = parse(MESSAGE).message;
    assert.equal(message.type, constants.messages.SETUP_THE_SPEED_OF_THE_CAR);
}

function testResponseToCircuitControl() {
    // this example is homemade, not from the protocol document
    var MESSAGE = new Buffer("(013612345678BV001)");
    var message = parse(MESSAGE).message;
    assert.equal(message.type, constants.messages.CONTROL_CIRCUIT);
}

function testResponseToOilControl() {
    // this example is homemade, not from the protocol document
    var MESSAGE = new Buffer("(013612345678BV011)");
    var message = parse(MESSAGE).message;
    assert.equal(message.type, constants.messages.CONTROL_OIL);
}


function testAnswerTheRestartedMessageOfTheDevice() {
// this example is homemade, not from the protocol document
    var MESSAGE = new Buffer("(013612345678BT00)");
    var message = parse(MESSAGE).message;
    assert.equal(message.type, constants.messages.ANSWER_THE_RESTARTED_MESSAGE_OF_THE_DEVICE);
}

function testAnswerTheSettingACCOpenSendingDataIntervals() {
// this example is homemade, not from the protocol document
    var MESSAGE = new Buffer("(013612345678BR05)");
    var message = parse(MESSAGE).message;
    assert.equal(message.type, constants.messages.ANSWER_THE_SETTING_ACC_OPEN_SENDING_DATA_INTERVALS);
}


function testAnswerTheSettingAccCloseSendingDataIntervals() {
// this example is homemade, not from the protocol document
    var MESSAGE = new Buffer("(013612345678BR06)");
    var message = parse(MESSAGE).message;
    assert.equal(message.type, constants.messages.ANSWER_THE_SETTING_ACC_CLOSE_SENDING_DATA_INTERVALS);
}

function testAnswerToSettingGeoFenceMessagesMessages() {
    // this example is homemade, not from the protocol document
    var MESSAGE = new Buffer("(013612345678BU0001)");
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
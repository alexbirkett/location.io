
var assert = require('assert');
var vows = require('vows');
var async = require('async');
var LocationIo = require('../../../index.js');
var forEach = require('async-foreach').forEach;
var TrackerSimulator = require('../../../test/tracker-simulator.js');

var nextPort = 3141;


//tk103.parseMessage("(013632782450BP05000013632782450110601V5955.5002N01034.4865E000.020184973.73000000000L000086C0)");

//tk103.parseMessage("(013500001111BP05000013500001111090215V0000.0000N00000.0000E000.0000144000.0000000000L000000)");

//tk103.parseMessage("(013500001111BP05000013500001111120903V5954.7918N01044.1389E000.0135036208.5800000000L000000)");


//console.log(parse(new Buffer(DOG_TRACKER_LOGIN)));


var DOG_TRACKER_ISOCHRONOUS_FOR_CONTINUES_FEEDBACK_MESSAGE = "(013500001112BR00120903A5955.9535N01047.4548E000.0160957000.0000000000L00000000)";

//parse(new Buffer(DOG_TRACKER_ISOCHRONOUS_FOR_CONTINUES_FEEDBACK_MESSAGE));

var ALARM_MESSAGE = "(012345678901BO012110601V5955.9527N01047.4330E000.023100734.62000000000L000000)";
//console.log(parse(new Buffer(ALARM_MESSAGE)));

var sendData = function(data, callback) {
    var port = nextPort++;
	var locationIo = new LocationIo();
	var trackerSimulator = new TrackerSimulator();
	locationIo.createServer(port, function(eventType, id, message) {
			console.log('event type ' + eventType);
			if (eventType == 'message') {
				locationIo.close(function() {
					console.log('calling back');
					callback(id, message);
				});		
			} else if (eventType == 'server-up') {
				async.series([
			   		function(callback)	{
						trackerSimulator.connect({host: 'localhost', port: port}, callback);
		   			},
		    		function(callback) {
		    			console.log('sending message');
			    		trackerSimulator.sendMessage(data, 1000, 50, 100, callback);
		    		}
		           ],
		           function(err) {
				    console.log('error ' + err);
				        trackerSimulator.destroy();
		      	});
		  }
	});	
};

vows.describe('tk103-parser-messages').addBatch({
   'handles login message (from dog tracker)': {
        topic: function() {
        	var DOG_TRACKER_LOGIN = "(013500001112BP05000013500001112120903A5956.1894N01046.9892E006.0160134061.9600000000L00000000)";
        	sendData(DOG_TRACKER_LOGIN, this.callback);
			
        },
        'should be a login message': function (id, message) {
			console.log(message);
			assert.equal(message.type, 'loginMessage');
        }
    },
    'handles login message': {
        topic: function() {
            var MESSAGE = "(013612345678BP05000013612345678080524A2232.9806N11404.9355E000.1101241323.8700000000L000450AC)"; 
            sendData(MESSAGE, this.callback);    
        },
        'should be a login message': function (id, message) {
            console.log(message);
            assert.equal(message.type, 'loginMessage');
            assert.notEqual(message.location, undefined);
        }
    },
    'handles handshake signal message': {
        topic: function() {
            var MESSAGE = "(013612345678BP00000013612345678HSO)"; 
            sendData(MESSAGE, this.callback);
            
        },
        'should be handshake signal message': function (id, message) {
           assert.equal(message.type, 'handshakeSignalMessage');
           assert.equal(message.serialNumber, "000013612345678");
           assert.equal(message.trackerId, "013612345678");
        }
    },
    'handles alarm message': {
        topic: function() {
           var MESSAGE = "(013612345678BO012061830A2934.0133N10627.2544E040.0080331309.6200000000L000770AD)";
           sendData(MESSAGE, this.callback);
            
        },
        'should be handshake alarm message': function (id, message) {
            assert.equal(message.type, 'alarmMessage');
            assert.equal(message.alarmType, 'sos');
            assert.notEqual(message.location, undefined);
        }
    },
    'handles locationUpdate': {
        topic: function() {
           var MESSAGE = "(013612345678BR00080612A2232.9828N11404.9297E000.0022828000.0000000000L000230AA)";
           sendData(MESSAGE, this.callback);
            
        },
        'should be locationUpdate message': function (id, message) {
            assert.equal(message.type, 'locationUpdate');
            assert.notEqual(message.location, undefined);
        }
    },
    'handles updatesEnding': {
        topic: function() {
           var MESSAGE = "(013612345678BR02080612A2232.9828N11404.9297E000.0022828000.0000000000L000230AA)";
           sendData(MESSAGE, this.callback);        
        },
        'should be updatesEnding message': function (id, message) {
            assert.equal(message.type, 'updatesEnding');
            assert.notEqual(message.location, undefined);
        }
    },
    
  
}).export(module); // Export the Suite



/*
 *    'handles configureUpdateInterval': {
        topic: function() {
            var MESSAGE = "(013612345678BS0800050014)";
            sendData(MESSAGE, this.callback);
            
        },
        'should be configureUpdateInterval': function (id, message) {
            assert.equal(message.type, 'configureUpdateInterval');    
        }
    },
 */

function testAnswerToMessageOfCallingTheRoll() {
    var MESSAGE = new Buffer("(013612345678BP04080525A2934.0133N10627.2544E000.0141830309.6200000000L00000023)");
    var message = parse(MESSAGE).message;
    assert.equal(message.type, constants.messages.ANSWER_CALLING_MESSAGE);
    assert.notEqual(message.location, undefined);
    //console.log(message);
}

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

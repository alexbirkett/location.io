var parseGpsMessage = require('./gps-message-parser');

var executeParseFunctionAndCatchException = require('../util').executeParseFunctionAndCatchException;

// Constants names are taken 'as is' from the "GPS Tracker Communication Protocol v1.6 document"


var alarmTypes = {
	'0':'vehiclePowerOff',
	'1':'accident',
	'2':'sos',
	'3':'vehicleAntiTheftAndAlarming',
	'4':'lowSpeedAlert',
	'5':'geoFence',
	'6':'overSpeedAlert',
	'7':'movementAlert'
};

var alarmMessagePattern = /(.)(.*)/;

var parseAlarmMessage = function(message, frame) {
	console.log('alarmMessage ');
	console.log(message);
	var matchArray = alarmMessagePattern.exec(message);
	console.log('alarmType ' + matchArray[1]);
	frame.alarmType = alarmTypes[matchArray[1]];
	frame.location = parseGpsMessage(matchArray[2]);
};

var gpsMessageOnlyParse = function(message, frame) {
	frame.location = parseGpsMessage(message);
};

var responseToSetUpVehicleMaxAndMinSpeedMessagePattern = /H(.*)L(.*)/;

var responseToSetUpVehicleMaxAndMinSpeedParse = function(message, frame) {
	console.log('responseToSetUpVehicleMaxAndMinSpeedParse');
	console.log(message);
	var matchArray = responseToSetUpVehicleMaxAndMinSpeedMessagePattern.exec(message);
	// this is guesswork, the document does not specify what H and L are.
	frame.maxSpeed = matchArray[1];
	frame.minSpeed = matchArray[2];
};

var responseToCircuitControlParse = function(message, frame) {
	frame.circuitOpen = message[0] = '1';
};

var responseToOilControlParse = function(message, frame) {
	frame.oilOpen = message[0] = '1';
};

var geoFenceMessageTypes = {
	'0':'cancelOutsideFence',
	'1':'outsideFence',
	'2':'insideFence'
}
var answerToSettingGeoFenceMessagesMessages = function(message, frame) {
	frame.geoFenceResponseType = geoFenceMessageTypes[message[0]];
};

var responseToReadingTheTerminalVersionMessage = function(message, frame) {
	frame.terminalVersion = message;
};

var dispatchScreenSendsAShortMessageToTheCenterParse = function(message, frame) {
	var length = message.readUInt16LE(0);
	frame.message = message.slice(2);
	//console.log("length " + length + "message length " + frame.message.length);
};

var notImplemented = function() {

};

var answerToSettingGeoFenceMessagesMessagesTypes = {
	'1':'type',
	'2':'success',
	'3':'fail'
};

var answerToGroupNumbersParse = function(message, frame) {
	console.log('answerToDownloadingGroupNumbersParse');
	frame.status = answerToSettingGeoFenceMessagesMessagesTypes[message];
};

var uploadGroupNumbersParse = function(message, frame) {
	// todo
}
var messageTypes = {
	'O01': ['alarmMessage', parseAlarmMessage, 'AS01'],
	'P04': ['answerToMessageOfCallingTheRoll', gpsMessageOnlyParse],
	'R00': ['isochronousAndContinuesFeedbackMessage', gpsMessageOnlyParse],
	'R02': ['continuouslyPassingBackEndingMessage', gpsMessageOnlyParse],
	'P12': ['setVehicleMaxAndMinSpeedResponse', responseToSetUpVehicleMaxAndMinSpeedParse],
	'V00': ['setCircuitControlResponse', responseToCircuitControlParse],
	'V01': ['setOilControlResponse', responseToOilControlParse],
	'T00': ['answerToTheRestartedMessageOfTheDevice'],
	'R05': ['answerToSettingACCOpenDataIntervals'],
	'R06': ['answerToSettingACCCloseSendingDataIntervals'],
	'U00': ['answerToSettingGeoFenceMessagesMessages', answerToSettingGeoFenceMessagesMessages],
	'R03': ['obtainTheTerminalLocationMessage', gpsMessageOnlyParse, 'AR03'],
	'S20': ['responseToMonitoringCommands'],
	'P02': ['answerToSettingUpTheTerminalIPAddressAndPort'],
	'P03': ['answerToSettingAPNMessage'],
	'P01': ['responseToReadingTheTerminalVersionMessage', responseToReadingTheTerminalVersionMessage],
	'S21': ['responseToCancelingAllAlarmMessages'], 
	'S04': ['answerToClearingMileageMessages'],
	'S05': ['answerToStartingTheUpgradeMessages'],
	'S06': ['answerToInitializeMileageMessage'],
	'S23': ['answerToCenterSendsShortMessagesToThedispatchingScreen'],
	'R04': ['dispatchScreenSendsAShortMessageToTheCenter', dispatchScreenSendsAShortMessageToTheCenterParse, 'AS07'],
	'S09': ['responseToCenterSendAnInstantMessageToTheAdvertisingScreen'],
	'R01': ['compensationDataReturnMessages', gpsMessageOnlyParse],
	'Y01': ['answerToRequestPhotoTakingMessages', notImplemented],
	'Y02': ['sendThePictureDataPacketsMessages', notImplemented],
	'P16': ['answerToDownloadingGroupNumbers', answerToGroupNumbersParse],
	'P17': ['answerToCancelingGroupNumbers', answerToGroupNumbersParse],
	'P18': ['uploadGroupNumbers',uploadGroupNumbersParse, 'AP19'],
	'O02': ['alarmForDataOffsetAndMessagesReturn', parseAlarmMessage],
	'P00': 'handshakeSignalMessage',
	'P00': 'setIPAddressAndPortResponse'
};

var lookupMessageType = function(code) {
	return messageTypes[code];
};

//var answerDeviceLoginResponsePattern = /(\d+)(\d{6}[AV].+)/;

function parseMessage(message) {
	// we can't use regex here because we need to be able to pass the message body as a buffer to the parse function
	var frame = {};
	
	var trackerIdlength = 0;
	while(message.readInt8(trackerIdlength) != 66) { // 66 is B
		trackerIdlength++;
	}
	frame.trackerId = message.slice(0, trackerIdlength);
	console.log('tracker id ' + frame.trackerId);

	var messageCode = message.slice(trackerIdlength + 1, trackerIdlength + 4);
	console.log('message code ' + messageCode);
	var messageType = executeParseFunctionAndCatchException(lookupMessageType, messageCode, message);
	
	frame.type = messageType[0];
	var parseFunction = messageType[1];
	
	if (parseFunction != undefined) {
		var messageBody = message.slice(trackerIdlength + 4);
		console.log('message body ' + messageBody);
		executeParseFunctionAndCatchException(parseFunction, [messageBody, frame], message);
	}
	
	return frame;
}


var findFrameAndParseMessage = function(buffer) {
	var returnObject = {};
	returnObject.buffer = buffer;
	// pass back the buffer if we can't parse the message yet
	var messageStartIndex = -1;

	for (var i = 0; i < buffer.length; i++) {

		var charValue = buffer.readUInt8(i)

		if (charValue == 41) {
			returnObject.message = parseMessage(buffer.slice(messageStartIndex + 1, i));
			returnObject.buffer = buffer.slice(i + 1);
			break;
		} else if (charValue == 40) {
			messageStartIndex = i;
		}
	}
	return returnObject;

}


module.exports = findFrameAndParseMessage;

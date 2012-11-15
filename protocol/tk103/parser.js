var parseGpsMessage = require('./gps-message-parser');
var constants = require('./constants');

var executeParseFunctionAndCatchException = require('../util').executeParseFunctionAndCatchException;

var handshakeSignalMessagePattern = /(.*)HSO/;

var parseHandshakeSignalMessage = function(message, frame) {
	var matchArray = handshakeSignalMessagePattern.exec(message);
	frame.serialNumber = matchArray[1];
};

var loginMessagePattern = /(.{12})(.*)/;
var parseLoginMessage = function(message, frame) {
	var matchArray = loginMessagePattern.exec(message);
	frame.serialNumber = matchArray[1];
	frame.location = parseGpsMessage(matchArray[2]);
};

var responseToSetUpPassingBackTheIsochronalAndContinuousMessagePattern = /(.{4})(.{2})(.{2})/;
var parseResponseToSetUpPassingBackTheIsochronalAndContinuousMessage = function(message, frame) {
	var matchArray = responseToSetUpPassingBackTheIsochronalAndContinuousMessagePattern.exec(message);
	
	frame.seconds = matchArray[1];
	frame.hours = matchArray[2];
	frame.minutes = matchArray[3];
};


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
	var matchArray = alarmMessagePattern.exec(message);
	frame.alarmType = alarmTypes[matchArray[1]];
	frame.location = parseGpsMessage(matchArray[2]);
};

var gpsMessageOnlyParse = function(message, frame) {
	frame.location = parseGpsMessage(message);
};

var responseToSetUpVehicleMaxAndMinSpeedMessagePattern = /H(.*)L(.*)/;

var responseToSetUpVehicleMaxAndMinSpeedParse = function(message, frame) {
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
};

var notImplemented = function() {

};

var answerToSettingGeoFenceMessagesMessagesTypes = {
	'1':'type',
	'2':'success',
	'3':'fail'
};

var answerToGroupNumbersParse = function(message, frame) {
	frame.status = answerToSettingGeoFenceMessagesMessagesTypes[message];
};

var uploadGroupNumbersParse = function(message, frame) {
	// todo
};

var messageTypes = {
	'P00' :[constants.messages.HANDSHAKE_SIGNAL_MESSAGE, 
	        parseHandshakeSignalMessage, 
	        constants.commands.ANSWER_HANDSHAKE_SIGNAL_MESSAGE],
	'P05': [constants.messages.LOGIN_MESSAGE,
	        parseLoginMessage,
	        constants.commands.DEVICE_LOGIN_RESPONSE_MESSAGE],
	'S08': [constants.messages.CONTINUOUS_ANSWER_SETTING_ISOCHRONOUS_FEEDBACK_MESSAGE,
	        parseResponseToSetUpPassingBackTheIsochronalAndContinuousMessage ],
	'O01': [constants.messages.ALARM_MESSAGE,
	        parseAlarmMessage, 
	        constants.commands.ANSWER_ALARM_MESSAGE],
	'P04': [constants.messages.ANSWER_CALLING_MESSAGE,
	        gpsMessageOnlyParse],
	'R00': [constants.messages.ISOCHRONOUS_FOR_CONTINUES_FEEDBACK_MESSAGE,
	        gpsMessageOnlyParse],
	'R02': [constants.messages.CONTINUES_FEEDBACK_ENDING_MESSAGE,
	        gpsMessageOnlyParse],
	'P12': [constants.messages.SETUP_THE_SPEED_OF_THE_CAR, responseToSetUpVehicleMaxAndMinSpeedParse],
	'V00': [constants.messages.CONTROL_CIRCUIT, responseToCircuitControlParse],
	'V01': [constants.messages.CONTROL_OIL, responseToOilControlParse],
	'T00': [constants.messages.ANSWER_THE_RESTARTED_MESSAGE_OF_THE_DEVICE],
	'R05': [constants.messages.ANSWER_THE_SETTING_ACC_OPEN_SENDING_DATA_INTERVALS],
	'R06': [constants.messages.ANSWER_THE_SETTING_ACC_CLOSE_SENDING_DATA_INTERVALS],
	'U00': [constants.messages.ANSWER_THE_SETTING_GEO_FENCE_MESSAGE, answerToSettingGeoFenceMessagesMessages],
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
	'O02': ['alarmForDataOffsetAndMessagesReturn', parseAlarmMessage]
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

	var messageCode = message.slice(trackerIdlength + 1, trackerIdlength + 4);
	var messageType = executeParseFunctionAndCatchException(lookupMessageType, messageCode, message);
	
	frame.type = messageType[0];
	var parseFunction = messageType[1];
	
	if (parseFunction != undefined) {
		var messageBody = message.slice(trackerIdlength + 4);
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

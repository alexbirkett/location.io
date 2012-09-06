var gpsMessageParser = require('./tk103gpsMessage');

// Constants names are taken 'as is' from the "GPS Tracker Communication Protocol v1.6 document"

// Alarm message
var ALARM_MESSAGE = "O01";

// Device status message
var HANDSHAKE_SIGNAL_MESSAGE = "P00";
var ANSWER_DEVICE_PARAMETER_CONFIGURED_MESSAGE = "P02";
var ANSWER_DEVICE_OPERATE_STATUS_MESSAGE = "P03";
var ANSWER_CALLING_MESSAGE = "P04";
var ANSWER_DEVICE_LOGIN_RESPONSE = "P05";
var ANSWER_VEHICLE_HIGH_AND_LOW_SPEED_LIMIT = "P12";
var MESSAGE_FOR_GETTING_CUSTOMER_SUCCESSFULLY_TAXI = "P07";

// Vehicle positioning message
var ISOCHRONOUS_FOR_CONTINUES_FEEDBACK_MESSAGE = "R00";
var ISOMETRY_CONTINOUS_FEEDBACK_MESSAGE = "R01";
var CONTINUES_FEEDBACK_ENDING_MESSSAGE = "R02";
var ANSWER_THE_SETTING_AC_OPEN_SENDING_DATA_TRANSMITING_INTERVALS = "R05";
var ANSWER_THE_SETTING_ACC_OPEN_SENDING_DATA_TRANSMITING_INTERVALS = "R06";

// Answer message
var ANSWER_ATTEMPERED_MESSAGE = "S04";
var ANSWER_READING_CALLED_CONFIGURING_NUMBER = "S05";
var ANSWER_CALLE_CONFIGURINGNUMBER = "S06";
var ANSWER_SETTING_ISOCHRONOUSFEEDBACK_MESSAGE = "S08";
var ANSWER_SETTING_ISOMETRY_FEEDBACK_MESSAGE = "S09";
var ANSWER_RESPONSE_CALLING_MESSAGE_TAXI = "S20";
var ANSWER_CALLING_MESSAGE_TAXI = "S21";
var ANSWER_NAVIGATION_MESSAGE = "S23";

// Group unspecified
var ANSWER_THE_RESTARTED_MESSAGE_OF_THE_DEVICE = "T00";
var ANSWER_THE_SETTING_GEO_FENCE_MESSAGE = "U00";

// Answer control sign
var ANSWER_CIRCUIT_CONTROl = "V00";
var ANSWER_OIL_CONTROL = "V01";
var ANSWER_ENQUIRING_OF_ONE_KEY_SETTING = "V02";

var messageTypePattern = /^\((\d+)B([a-zA-Z]{1}\d{2})(.+)\)$/;

function parseFrame(message) {
	var matchArray = messageTypePattern.exec(message);
	if (matchArray.length < 4) {
		throw new "could not parse frame";
	}
	var frame = new Object();
	frame.serialNumber = matchArray[1];
	frame.type = matchArray[2];
	frame.messageBody = matchArray[3];
	return frame;
}

var answerDeviceLoginResponsePattern = /(\d+)(\d{6}[AV].+)/;

var parseAnswerDeviceLoginResponse = function(message) {
	
	var matchArray = answerDeviceLoginResponsePattern.exec(message);
	var object = new Object();
	
	object.terminalId = matchArray[1];
	object.gpsMessage = gpsMessageParser.parseMessage(matchArray[2]);

	return object;
};

var parseIsochronousForContinuesFeedbackMessage = function (message) {
	var object = new Object();
	object.gpsMessage = gpsMessageParser.parseMessage(message);
	object.type = "isochronous_for_continues_feedback_message";
	return object;
};

var parseAlarmMessage = function (message) {
	var object = new Object();

	object.gpsMessage = gpsMessageParser.parseMessage(message);
	object.type = "alam_message";
	return object;
};


function getMessageParser(messageType) {
	switch (messageType) {
	case ALARM_MESSAGE:
		return parseAlarmMessage;
	case ANSWER_DEVICE_LOGIN_RESPONSE:
		return parseAnswerDeviceLoginResponse;
	case ISOCHRONOUS_FOR_CONTINUES_FEEDBACK_MESSAGE:
		return parseIsochronousForContinuesFeedbackMessage;
	default:
		throw "unsupported message type " + messageType; 
	}
}

exports.parseMessage = function(message) {
	console.log(message);

	var parsedFrame = parseFrame(message);

	var object = new Object();
	
	object.message = getMessageParser(parsedFrame.type)(parsedFrame.messageBody);
	object.serialNumber = parsedFrame.serialNumber;
	object.rawData = message;

	console.log('parsed frame');
	console.log(object);
};

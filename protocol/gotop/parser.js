
var parseGpsMessage = require('./gps-message-parser');
var executeParseFunctionAndCatchException = require('./util').executeParseFunctionAndCatchException;

var lookupCommandResponseType = function(rawMessageType) {
	var messageType;
	
	switch(rawMessageType) {
		case 'A':
			messageType = 'setAuthorizedNumberResponse';
			break;
		case 'F' :
			messageType = 'oneTimeLocate';
			break;
		case 'T':
			messageType = 'setContinuousTrackingResponse';
			break;
		case 'J':
			messageType = 'setSpeedingAlarmResponse';
			break;
		case 'I':
			messageType = 'setGeoFenceResponse';
			break;
		case 'L':
			messageType = 'setTimeZoneResponse';
			break;
		case 'N':
			messageType = 'setLowBatteryAlarmResponse';
			break;
		case 'H':
			messageType = 'setModifyPasswordResponse';
			break;
		case 'T':
			messageType = 'setAccResponse';
			break;
		case 'U':
			messageType = 'setListenModeResponse';
			break;
		case 'C':
			messageType = 'setApnAndServerResponse';
			break;
		case 'O':
			messageType = 'setApnUserNameAndPassword';
			break;
		case 'X':
			messageType = 'heartBeat';
			break;
		case 'ERROR!':
			messageType = 'error'
			break;
		}
		return messageType;
};

var lookupAlarmType = function(rawMessageType) {
	var messageType;
	
	switch(rawMessageType) {
		case 'A':
			messageType = 'sosAlarm';
			break;
		case 'B':
			messageType = 'geoAlarm'
			break;
		case 'C':
			messageType = 'speedingAlarm'
			break;
		case 'D':
			messageType = 'lowBatteryAlarm'
			break;
		}
		return messageType;
}


var messageTypePattern = /([a-zA-Z]{3})-(.)(.)?/;
	
var parseMessageType = function(type) {
	var result = messageTypePattern.exec(type);
	if (result == null) {
		result = 'error'; // error message (!ERROR) is not parsed by messageTypePattern
	} else if (result[1] == 'CMD') {
		result  = lookupCommandResponseType(result[2]);
	} else if (result[1] == 'ALM') {
		result = lookupAlarmType(result[2]);
	} 
	return result;
}


var framePattern = /^#([^,]+),([^,]+),?(.*)#$/;

parseMessage = function(message) {
	var matchArray = framePattern.exec(message);
	var frame = new Object();
	if (matchArray != null) {
		frame.serialNumber = matchArray[1];
		frame.type = executeParseFunctionAndCatchException(parseMessageType,matchArray[2], message);
		if ( matchArray[3] != "") {
			frame.location = executeParseFunctionAndCatchException(parseGpsMessage, matchArray[3], message);	
		}	
	}
	return frame;
};

module.exports = parseMessage;
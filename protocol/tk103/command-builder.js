var capabilities = require('./api');
var util = require('../util');
var constants = require('./constants');

var buildCommand = function(commandName, commandParameters) {	
	util.assertValidCommand(commandName, commandParameters, capabilities);
	return messageBuilders[commandName](commandParameters);
};

var messageBuilders = {};

var buildSimpleCommand = function(messageValue, command) {
	return "(" + messageValue.trackerId + command + ")";
}

messageBuilders[constants.commands.ANSWER_HANDSHAKE_SIGNAL_MESSAGE] = function(messageValue) {
	return buildSimpleCommand(messageValue, "AP01HSO");
};

messageBuilders[constants.commands.DEVICE_LOGIN_RESPONSE_MESSAGE] = function(messageValue) {
	return buildSimpleCommand(messageValue, "AP05");
};


var getTimeIntervalAsFourHexDigits = function(interval) {
	if (interval > 0xFFFF) {
		throw new Error('max interval is ' + 0xFFFF)
	}
	return util.prependZeros(interval.toString(16), 4).toUpperCase();
};

messageBuilders[constants.commands.SAME_TIME_CONTINUES_FEEDBACK_CONFIGURE] = function(messageValue) {
	var intervalInSeconds = messageValue.enabled ? util.parseTimeInterval(messageValue.interval) : 0;
	var durationInSeconds = messageValue.enabled ? util.parseTimeInterval(messageValue.duration) : 0;  
	var durationHours = util.prependZeros(Math.floor(durationInSeconds / 3600).toString(16), 2).toUpperCase();
	var durationMinutes = util.prependZeros(Math.floor(durationInSeconds / 60).toString(16), 2).toUpperCase();
	return "(" + messageValue.trackerId + "AR00" + getTimeIntervalAsFourHexDigits(intervalInSeconds) + durationHours + durationMinutes + ")";
};

var alarmTypes = {
	'vehiclePowerOff':'0',
	'accident':'1',
	'sos':'2',
	'vehicleAlarm':'3',
	'underSpeed':'4',
	'overSpeed':'5',
	'geoFence': '6',
	'movement':'7'
}

messageBuilders[constants.commands.ANSWER_ALARM_MESSAGE] = function(messageValue) {
	var alarmType = alarmTypes[messageValue.alarmType];
	if (alarmType == undefined) {
		throw new Error("unknown alarm type");
	}
	return "(" + messageValue.trackerId + "AS01" + alarmType + ")";
};

messageBuilders[constants.commands.ONE_TIME_ENQUIRY_MESSAGE] = function(messageValue) {
	return buildSimpleCommand(messageValue, "AP00");
};

messageBuilders[constants.commands.SETTING_VEHICLE_HIGH_AND_LOW_LIMIT_SPEED] = function(messageValue) {
	if (messageValue.maxSpeed > 999) {
		throw new Error("max speed must be less than 999 km/h");
	}
	
	if (messageValue.minSpeed > 999) {
		throw new Error("min speed must be less than 999 km/h");
	}
	
	return "(" + messageValue.trackerId + "AP12H" + util.prependZeros(messageValue.maxSpeed, 3) + "L" +  util.prependZeros(messageValue.minSpeed, 3) + ")";
};

messageBuilders[constants.commands.CIRCUIT_CONTROL_SIGNAL] = function(messageValue) {
	return buildSimpleCommand(messageValue, "AV00" + (messageValue.enabled ? "1" : "0") );	
};

messageBuilders[constants.commands.OIL_CONTROL_SINGLE] = function(messageValue) {
	return buildSimpleCommand(messageValue, "AV01" + (messageValue.enabled ? "1" : "0"));
};

messageBuilders[constants.commands.CONTROL_THE_RESTARTED_MESSAGE_OF_THE_DEVICE] = function(messageValue) {
	return buildSimpleCommand(messageValue, "AT00");
};

var buildsetAccSendingDataIntervals = function(messageValue, commandId) {
	var time = getTimeIntervalAsFourHexDigits(util.parseTimeInterval(messageValue.interval));
	return buildSimpleCommand(messageValue, commandId + time);
}
messageBuilders[constants.commands.SET_ACC_OPEN_SENDING_DATA_INTERVALS] = function(messageValue) {
	return buildsetAccSendingDataIntervals(messageValue, "AR05");
};

messageBuilders[constants.commands.SET_ACC_CLOSE_SENDING_DATA_INTERVALS] = function(messageValue) {
	return buildsetAccSendingDataIntervals(messageValue, "AR06");
};

var formatLatLng = function(latlng) {
	return latlng.degrees + latlng.minutes;
};

messageBuilders[constants.commands.SETTING_GEO_FENCE_MESSAGE] = function(messageValue) {
	
	var parsedMaxLongitude = util.parseLongitudeMinDec(messageValue.maxLongitude, 3);
	var parsedMinLongitude = util.parseLongitudeMinDec(messageValue.minLongitude, 3);
	var parsedMaxLatitude = util.parseLatitudeMinDec(messageValue.maxLatitude, 3);
	var parsedMinLatitude = util.parseLatitudeMinDec(messageValue.minLatitude, 3);
	
	var messageBody = (messageValue.enabled ? "1" : "0") + ',' 
	                + parsedMaxLatitude.hemisphere + "," +
	            	+ formatLatLng(parsedMinLatitude) + ","
	            	+ formatLatLng(parsedMaxLatitude) + ","
	            	+ parsedMinLongitude.hemisphere + "," +
	            	+ formatLatLng(parsedMinLongitude) + ","
	            	+ formatLatLng(parsedMaxLongitude);
	return buildSimpleCommand(messageValue, "AX05" +  messageBody);
};


module.exports = buildCommand;
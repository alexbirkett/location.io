var capabilities = require('./capabilities').capabilities;
var util = require('./util');

var assertValidCommand = function(commandName, commandValue) {
	var command = capabilities.commands[commandName];
	for (var parameter in command.parameters) {
		var regexp = new RegExp(command.parameters[parameter].pattern);
		var parameterValue = commandValue[parameter];
		var match = regexp.test(parameterValue);
		if (!match) {
			var message = "parameterValue " + parameterValue + " does not match expression " + command.parameters[parameter].pattern;
			throw new Error(message);
		}
	}
}

var buildCommand = function(commandName, commandValue) {	
	assertValidCommand(commandName, commandValue);
	return messageBuilders[commandName](commandValue);
};

var messageBuilders = {};

messageBuilders.setAuthorizedNumber = function(messageValue) {
	return ":" + messageValue.password + "A" + messageValue.index + "," + messageValue.authorizedNumber + "#";
}
messageBuilders.deleteAuthorizedNumber = function(messageValue) {
	return ":" + messageValue.password + "A" + messageValue.index + ",D#";
}
messageBuilders.locateOneTime = function(messageValue) {
	return ":" + messageValue.password + "F#";
}

messageBuilders.setContinuousTracking = function(messageValue) {
	var interval = messageValue.interval;
	var result = /^([0-9]{1,3})(s)?(m)?(h)?$/i.exec(interval);
	
	var unit;
	var intervalInt;
	if (result[2] != undefined) {
		intervalInt = parseInt(result[1], 10);
		if (intervalInt > 255) {
			throw Error("second value out of range (must be less than or equal to 255)");
		}
		unit = "S";
	}
	if (result[3] != undefined) {
		intervalInt = parseInt(result[1], 10);
		if (intervalInt > 255) {
			throw Error("minute value out of range (must be less than or equal to 255)");
		}
		unit = "M";
	}
	if (result[4] != undefined) {
		intervalInt = parseInt(result[1], 10);
		if (intervalInt > 90) {
			throw Error("minute value out of range (must be less than or equal to 90)");
		}
		unit = "H";
	}
	var message = ":" + messageValue.password + "M" + (messageValue.enabled ? 1 : 0) + "," +  util.prependZeros(intervalInt, 3) + unit + "#";
	return message;
}

messageBuilders.setSpeedingAlarm = function(messageValue) {
	// :123456J1,080#
	return ":" + messageValue.password + "J" +  (messageValue.enabled ? 1 : 0) + "," + util.prependZeros(messageValue.speed, 3) + "#";
}

messageBuilders.setGeoFence  = function(messageValue) {

// ":123456I1,1,1,51113525N009125670E50241115N011011173E#"
//  :123456Ix,y,z, aabbccddefffgghhiijkkllmmnnepppqqrrssj#

 return ":" + messageValue.password + 
        "I" + messageValue.index +
        "," + (messageValue.enabled ? 1 : 0) + 
        "," + (messageValue.exit ? 1 : 0) + 
        "," + util.formatLatitude(messageValue.maxLatitude)
            + util.formatLongitude(messageValue.minLongitude)
            + util.formatLatitude(messageValue.minLatitude)
            + util.formatLongitude(messageValue.maxLongitude) + "#";
}


module.exports = buildCommand;
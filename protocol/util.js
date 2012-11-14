

var prependZeros = function(number, desiredStringLength){
    var numberAsString = number + "";
    var numberOfZerosToPrepend = desiredStringLength - numberAsString.length;
    if (numberOfZerosToPrepend < 0) {
    	throw new Error("number too big");
    }
    
    for (var i = 0; i < numberOfZerosToPrepend; i++) {
    	numberAsString = "0" + numberAsString;
    }
    return numberAsString;
};

exports.prependZeros = prependZeros;

var parseLatLng = function(latlng) {
	return  /^(-)?([0-9]*)\.([0-9]*)$/i.exec(latlng + "");
};

var calculteMinutesAndSeconds = function(val) {
	var returnValue = {};
	var minutes = (val * 60);
	returnValue.minutes = Math.floor(minutes); // round 
	var seconds = (minutes - returnValue.minutes) * 60;
	returnValue.seconds = Math.floor(seconds);
	returnValue.secondsFraction = ((seconds - returnValue.seconds).toFixed(2) + "").substr(2);
	return returnValue;
};

var getLongitudeHemisphere = function(positiveNumber) {
	if (positiveNumber) {
		return "E";
	} else {
		return "W";
	}
};

var getLatitudeHemisphere = function(positiveNumber) {
	if (positiveNumber) {
		return "N";
	} else {
		return "S";
	}
};


exports.parseLongitude = function(longitude) {
	var parsedLongitude = {};
	var result = parseLatLng(longitude);
	parsedLongitude.degrees = prependZeros(result[2], 3);
	var minutesAndSeconds = calculteMinutesAndSeconds(parseFloat("0." + result[3]));
	parsedLongitude.minutes = prependZeros(minutesAndSeconds.minutes, 2);
	parsedLongitude.seconds = prependZeros(minutesAndSeconds.seconds, 2);
	parsedLongitude.secondsFraction = prependZeros(minutesAndSeconds.secondsFraction, 2);
	var isPositiveNumber = result[1] == undefined;
	parsedLongitude.hemisphere = getLongitudeHemisphere(isPositiveNumber);
	//var longitude = degrees + minutes + seconds + secondsFraction + getLongitudeHemisphere(isPositiveNumber);
	return parsedLongitude;
};

exports.parseLatitude = function(latitude) {
	var parsedLatitude = {};
	var result = parseLatLng(latitude);
	parsedLatitude.degrees = prependZeros(result[2], 2);
	var minutesAndSeconds = calculteMinutesAndSeconds(parseFloat("0." + result[3]));
	parsedLatitude.minutes = prependZeros(minutesAndSeconds.minutes, 2);
	parsedLatitude.seconds = prependZeros(minutesAndSeconds.seconds, 2);
	parsedLatitude.secondsFraction = prependZeros(minutesAndSeconds.secondsFraction, 2);
	var isPositiveNumber = result[1] == undefined;
	parsedLatitude.hemisphere = getLatitudeHemisphere(isPositiveNumber);
	return parsedLatitude;
};

function isArray(o) {
	  return Object.prototype.toString.call(o) === '[object Array]';
}

/**
 * @param args can be a single argument or an array of arguments to pass to parseFunction
 */
exports.executeParseFunctionAndCatchException = function(parseFunction, args) {	
	// if argument is not array it inside an array
	if (!isArray(args)) {
		args = [args];
	}
	
	try {
		return parseFunction.apply(this, args);
	} catch (e) {
		console.log('could not parse data ' + args + ' exception ' + e.message);
	}
};

exports.assertValidCommand = function(commandName, commandParameters, capabilities) {
	var command = capabilities.commands[commandName];
	
	if (command == undefined) {
		throw new Error('command ' + commandName + ' is not defined in capabilities file');
	}
	
	if (command.parameters == undefined) {
		throw new Error('command ' + commandName + ' has no parameters defined in capabilities file');
	}
	
	for (var parameter in command.parameters) {
		var regexp = new RegExp(command.parameters[parameter].pattern);
		var parameterValue = commandParameters[parameter];
		var match = regexp.test(parameterValue);
		if (!match) {
			var message = "parameterValue " + parameterValue + " does not match expression " + command.parameters[parameter].pattern;
			throw new Error(message);
		}
	}
};

exports.parseTimeInterval = function(interval) {

	var result = /^([0-9]{1,3})(s)?(m)?(h)?$/i.exec(interval);
	
	var intervalInSeconds;
	
	var intervalInt = parseInt(result[1], 10);
			
	if (result[2] != undefined) {
		intervalInSeconds = intervalInt
	}
	if (result[3] != undefined) {
		intervalInSeconds = intervalInt * 60;
	}
	if (result[4] != undefined) {
		intervalInSeconds = intervalInt * 60 * 60;
	}
	return intervalInSeconds;
};




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
	returnValue.seconds = Math.round((minutes - returnValue.minutes) * 60);
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

exports.formatLongitude = function(longitude) {
	var parsedLongitude = parseLatLng(longitude);
	var degrees = prependZeros(parsedLongitude[2], 3);
	var minutesAndSeconds = calculteMinutesAndSeconds(parseFloat("0." + parsedLongitude[3]));
	var minutes = prependZeros(minutesAndSeconds.minutes, 2);
	var seconds = prependZeros(minutesAndSeconds.seconds, 2);
	var isPositiveNumber = parsedLongitude[1] == undefined;s
	var longitude = degrees + minutes + seconds + getLongitudeHemisphere(isPositiveNumber);
	return longitude;
};

exports.formatLatitude = function(latitude) {
	var parsedLatitude = parseLatLng(latitude);
	var degrees = prependZeros(parsedLatitude[2], 2);
	var minutesAndSeconds = calculteMinutesAndSeconds(parseFloat("0." + parsedLatitude[3]));
	var minutes = prependZeros(minutesAndSeconds.minutes, 2);
	var seconds = prependZeros(minutesAndSeconds.seconds, 2);
	var isPositiveNumber = parsedLatitude[1] == undefined;
	var longitude = degrees + minutes + seconds + getLatitudeHemisphere(isPositiveNumber);
	return longitude;
};


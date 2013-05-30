var prependZeros = function (number, desiredStringLength, base) {
    if (base === undefined) {
        base = 10;
    }
    var numberAsString = number.toString(base);
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

var parseLatLng = function (latlng) {
    return (/^(-)?([0-9]*)\.([0-9]*)$/i).exec(latlng + '');
};

var calculateMinutes = function (degDec) {
    return parseFloat("0." + degDec) * 60;
};

var calculateSeconds = function (minutes) {
    return (minutes - Math.floor(minutes)) * 60;
};

var calculateDecimal = function (val, noOfDecimalPlaces) {
    var stringVal = ((val - Math.floor(val)).toFixed(noOfDecimalPlaces) + "").substr(2);
    return prependZeros(stringVal, noOfDecimalPlaces);
};

var getLongitudeHemisphere = function (positiveNumber) {
    if (positiveNumber) {
        return "E";
    } else {
        return "W";
    }
};

var getLatitudeHemisphere = function (positiveNumber) {
    if (positiveNumber) {
        return "N";
    } else {
        return "S";
    }
};

var parseMinsAndSeconds = function (result, parsedLatLng) {
    var minutes = calculateMinutes(result[3]);
    parsedLatLng.minutes = prependZeros(Math.floor(minutes), 2);
    var seconds = calculateSeconds(minutes);
    parsedLatLng.seconds = prependZeros(Math.floor(seconds), 2);
    parsedLatLng.secondsFraction = calculateDecimal(seconds, 2);
};

exports.parseLongitude = function (longitude) {
    var parsedLongitude = {};
    var result = parseLatLng(longitude);
    parsedLongitude.degrees = prependZeros(result[2], 3);
    parseMinsAndSeconds(result, parsedLongitude);
    var isPositiveNumber = result[1] === undefined;
    parsedLongitude.hemisphere = getLongitudeHemisphere(isPositiveNumber);
    //var longitude = degrees + minutes + seconds + secondsFraction + getLongitudeHemisphere(isPositiveNumber);
    return parsedLongitude;
};

exports.parseLatitude = function (latitude) {
    var parsedLatitude = {};
    var result = parseLatLng(latitude);
    parsedLatitude.degrees = prependZeros(result[2], 2);
    parseMinsAndSeconds(result, parsedLatitude);
    var isPositiveNumber = result[1] === undefined;
    parsedLatitude.hemisphere = getLatitudeHemisphere(isPositiveNumber);
    return parsedLatitude;
};

var parseLatLngMinDec = function (latlng, degreeDecimalPlaces, getHemesphere) {
    var parsedLatLng = {};
    var result = parseLatLng(latlng);
    parsedLatLng.degrees = prependZeros(result[2], degreeDecimalPlaces);

    var minutes = calculateMinutes(result[3]);
    parsedLatLng.minutes = prependZeros(Math.floor(minutes), 2);
    parsedLatLng.minutes = parsedLatLng.minutes + "." + calculateDecimal(minutes, 3);
    var isPositiveNumber = result[1] === undefined;
    parsedLatLng.hemisphere = getHemesphere(isPositiveNumber);
    return parsedLatLng;
};

exports.parseLongitudeMinDec = function (longitude) {
    return parseLatLngMinDec(longitude, 3, getLongitudeHemisphere);
};

exports.parseLatitudeMinDec = function (latitude) {
    return parseLatLngMinDec(latitude, 2, getLatitudeHemisphere);
};

function isArray(o) {
    return Object.prototype.toString.call(o) === '[object Array]';
}

/**
 * @param args can be a single argument or an array of arguments to pass to parseFunction
 */
exports.executeParseFunctionAndCatchException = function (parseFunction, args) {
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

exports.assertValidMessage = function (messageName, messageParameters, api) {
    var message = api[messageName];

    if (message === undefined) {
        throw new Error('message ' + messageName + ' is not defined in the API for this tracker');
    }

    if (message.parameters === undefined) {
        throw new Error('message ' + messageName + ' has no parameters defined in the API for this tracker');
    }

    for (var parameter in message.parameters) {
        var regexp = new RegExp(message.parameters[parameter].pattern);
        var parameterValue = messageParameters[parameter];
        var match = regexp.test(parameterValue);
        if (!match) {
            var errorMessage = "parameterValue " + parameterValue + " does not match expression " + message.parameters[parameter].pattern;
            throw new Error(errorMessage);
        }
    }
};

exports.parseTimeInterval = function (interval) {

    var result = /^([0-9]{1,3})(s)?(m)?(h)?$/i.exec(interval);

    var intervalInSeconds;

    var intervalInt = parseInt(result[1], 10);

    if (result[2] !== undefined) {
        intervalInSeconds = intervalInt;
    }
    if (result[3] !== undefined) {
        intervalInSeconds = intervalInt * 60;
    }
    if (result[4] !== undefined) {
        intervalInSeconds = intervalInt * 60 * 60;
    }
    return intervalInSeconds;
};

exports.getTimeIntervalAsFourHexDigits = function (interval) {
    if (interval > 0xFFFF) {
        throw new Error('max interval is ' + 0xFFFF);
    }
    return prependZeros(interval.toString(16), 4).toUpperCase();
};

exports.bufferIndexOf = function (buffer, searchOctet, fromIndex, skipHits) {
    var count = 0;
    var i = fromIndex || 0;
    var hitsRemaining = skipHits || 0;
    var bufferIndex = -1;
    for (; i < buffer.length; i++) {
        if (buffer[i] === searchOctet) {
            if (hitsRemaining-- === 0) {
                bufferIndex = i;
            }
        }
    }
    return bufferIndex;
};

exports.calculateNemaChecksum = function(buffer) {
    var checksum = 0;

    var getCharCode;

    if (buffer instanceof Buffer) {
        getCharCode = function(position) {
            return buffer[position];
        };
    }  else {
        // assume String object or literal
        getCharCode = function(position) {
            return buffer.charCodeAt(position);
        };
    }
    for (var i = 0; i < buffer.length; i++) {
        checksum = checksum ^ getCharCode(i);
    }

    var checksumAsHexString = prependZeros(checksum, 2, 16);

    return checksumAsHexString;
};

var isNumerical = function(character) {
     return character >= '0' && character <= '9';
};

var readNumbers = function(string) {
    var index = 0;
    var readNextNumber = function () {
        var numericalCharacterCount = 0;

        for (; index < string.length; index++) {
            var character = string[index];
            if (isNumerical(character)) {
                numericalCharacterCount++;
            } else {
                if (numericalCharacterCount > 0) {
                    break;
                }
            }
        }
        return string.substring(index, index - numericalCharacterCount);
    };

    var number;
    var i = 0;
    var numberArray = [];
    while (index < string.length) {
        numberArray[i++] = readNextNumber();
    }
    return numberArray;
};

var isLatLngNegative = function(string) {
    for (var i = 0; i < string.length; i++) {
        var character = string[i];
        if (character === 'S' || character === 'W' || character === '-') {
            return true;
        }
    }
    return false;
};

exports.parseLatLng = function (string) {
    // E13413.0810
    // E01044.1742
    var latlng = 0;

    var numberArray = readNumbers(string);
    var degressMinutuesString = numberArray[0];

    if (degressMinutuesString.length > 3) {
        // assume DDDMM or DDMM
        var degrees = parseInt(degressMinutuesString.substring(0, degressMinutuesString.length - 2), 10);
        var minutes = parseInt(degressMinutuesString.substring(degressMinutuesString.length - 2, degressMinutuesString.length), 10);
        var minuteFraction = parseInt(numberArray[1], 10);

        var minutesDecimal = minutes + convertIntegerPartToFractionalPart(minuteFraction);

        latlng = degrees + (minutesDecimal / 60);
    }

    if (isLatLngNegative(string)) {
        latlng = latlng / -1;
    }
    return latlng;
};

var convertIntegerPartToFractionalPart = function (n) {
    return n / Math.pow(10, ("" + n).length);
};


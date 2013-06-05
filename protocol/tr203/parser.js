var util = require('../util');

var G_CHARACTER_CODE = 'G'.charCodeAt(0);
var S_CHARACTER_CODE = 'S'.charCodeAt(0);
var BANG_CHARACTER_CODE = '!'.charCodeAt(0);
var ASTERIKS_CHARACTER_CODE = '*'.charCodeAt(0);
var COMMA_CHARACTER_CODE = ','.charCodeAt(0);

var parseMessage = function(buffer) {
    var message = {};
    var startIndex = 0;
    var endIndex;

    var readNextValue = function () {
        endIndex = util.bufferIndexOf(buffer, COMMA_CHARACTER_CODE, startIndex);
        var string = buffer.toString('UTF8', startIndex, endIndex);
        startIndex = endIndex + 1;
        return string;
    };

 /*   GSr,IMEI,Device_Mode,Report_Type,Alarm_Status,Geofence_st
    atus,GPS_Fix,UTC_Date,UTC_Time,Longitude,Latitude,Altitude
        ,Speed,Heading,Number_of_Satellites,HDOP,Battery_capacity  */

    message.type = readNextValue();
    message.imei = readNextValue();
    message.deviceMode = readNextValue();
    message.reportType = readNextValue();
    message.alarmStatus = readNextValue();
    message.geofenceStatus = readNextValue();

    message.location = {};
    message.location.gpsFix = readNextValue();
    var utcDate = readNextValue();
    var utcTime = readNextValue();
    message.location.longitude = util.parseLatLng(readNextValue());
    message.location.latitude = util.parseLatLng(readNextValue());
    message.location.altitude = readNextValue();
    message.location.speed = readNextValue();
    message.location.heading = readNextValue();
    message.location.numberOfSatellites = readNextValue();
    message.location.HDOP = readNextValue();

    message.trackerId =  message.imei;

    var date = new Date(0);
    var day = utcDate.slice(0, 2);
    var month = utcDate.slice(2, 4);
    var year =  utcDate.slice(4, 6);

    date.setUTCDate(day);
    date.setUTCMonth(parseInt(month, 10) - 1);
    date.setUTCFullYear('20' + year);

    var hours = utcTime.slice(0, 2);
    var minutes = utcTime.slice(2, 4);
    var seconds =  utcTime.slice(4, 6);

    date.setUTCHours(hours);
    date.setUTCMinutes(minutes);
    date.setUTCSeconds(seconds);

    message.location.timestamp = date;

    return message;
};

var findFrameAndParseMessage = function (buffer, callback) {
    var messageStartIndex = 0;
    var error = null;
    var message;
    var bufferToReturn = buffer;
    try {
        if (buffer.length > 2) {
           if (buffer[0] == G_CHARACTER_CODE && buffer[1] == S_CHARACTER_CODE) {
               for (var i = 3; i < buffer.length; i++) {
                   if (buffer[i] == BANG_CHARACTER_CODE) {
                       if (buffer[i - 3] !== ASTERIKS_CHARACTER_CODE) {
                           throw new Error('incompatible protocol no checksum delimiter found');
                       }

                       var checksum = buffer.slice(i - 2, i) ;

                       var frameContents = buffer.slice(messageStartIndex, i - 3);

                       if (util.calculateNemaChecksum(frameContents) != checksum) {
                           throw new Error('invalid checksum');
                       }

                       message = parseMessage(frameContents);

                       bufferToReturn = buffer.slice(i + 1);

                       break;
                   }
               }
           } else {
               throw new Error('incompatible protocol');
           }
        }
    } catch (e) {
        error = e;
    }

    setImmediate(function () {
        callback(error, message, bufferToReturn);
    });

};


module.exports = findFrameAndParseMessage;
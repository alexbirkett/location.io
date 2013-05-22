var gpsMessagePattern = new RegExp(
    "(\\d{2})(\\d{2})(\\d{2})" + // Date (YYMMDD)
        "([AV])" +                   // Validity
        "(\\d{2})(\\d{2}.\\d{4})" +  // Latitude (DDMM.MMMM)
        "([NS])" +
        "(\\d{3})(\\d{2}.\\d{4})" +  // Longitude (DDDMM.MMMM)
        "([EW])" +
        "(\\d+.\\d)" +               // Speed
        "(\\d{2})(\\d{2})(\\d{2})" + // Time (HHMMSS)
        "(\\d+.\\d{2})" +            // Course
        "(\\d+)" +                   // State
        "(.+)");                      // Mileage (?)

function parseLatitude(degrees, minutes, hemisphere) {
    //console.log('latitude degrees ' + degrees + ' minutes ' + minutes + ' hemisphere ' + hemisphere);
    latitude = parseInt(degrees, 10) + (minutes / 60);
    if (hemisphere == 'S') {
        latitude = -latitude;
    } else if (hemisphere != 'N') {
        throw "invalid hemisphere";
    }
    return latitude;
}

function parseLongitude(degrees, minutes, hemisphere) {
    //console.log('longitude degrees ' + degrees + ' minutes ' + minutes + ' hemisphere ' + hemisphere);

    longitude = parseInt(degrees, 10) + (minutes / 60);
    if (hemisphere == 'W') {
        longitude = -longitude;
    } else if (hemisphere != 'E') {
        throw "invalid hemisphere";
    }
    return longitude;
}

var parseMessage = function (data) {
    var messageArray = gpsMessagePattern.exec(data);

    var message = {};
    var date = new Date();

    date.setUTCFullYear("20" + messageArray[1]);
    date.setUTCMonth(messageArray[2] - 1);
    date.setUTCDate(messageArray[3]);


    var available = messageArray[4];
    if (available == 'V') {
        message.available = false;
    } else if (available == 'A') {
        message.available = true;
    } else {
        throw "invalid availablility";
    }

    message.latitude = parseLatitude(messageArray[5], messageArray[6], messageArray[7]);
    message.longitude = parseLongitude(messageArray[8], messageArray[9], messageArray[10]);

    message.speed = messageArray[11];


    date.setUTCHours(messageArray[12]);
    date.setUTCMinutes(messageArray[13]);
    date.setUTCSeconds(messageArray[14]);

    message.course = messageArray[15];
    message.millage = messageArray[16];

    message.timestamp = date;


    return message;
};

module.exports = parseMessage;
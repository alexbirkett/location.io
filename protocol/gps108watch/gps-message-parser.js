var gpsMessagePattern = new RegExp(
    "(\\d{3})*(\\d{2}.\\d{4})*" +  // Longitude (DDDMM.MMMM)
        "," +
        "([EW])*" +
        "," +
        "(\\d{2})*(\\d{2}.\\d{4})*" +  // Latitude (DDMM.MMMM)
        "," +
        "([NS])*" +
        "," +
        "(\\d{3}.\\d{2})*" +  // Speed
        "," +
        "(\\d{3})*" // Altitude
);

function parseLatitude(degrees, minutes, hemisphere) {
    //console.log('latitude degrees ' + degrees + ' minutes ' + minutes + ' hemisphere ' + hemisphere);
    latitude = parseInt(degrees, 10) + (minutes / 60);
    if (hemisphere == 'S') {
        latitude = -latitude;
    } else if (hemisphere != 'N') {
        throw new Error("invalid hemisphere");
    }
    return latitude;
}

function parseLongitude(degrees, minutes, hemisphere) {
    longitude = parseInt(degrees, 10) + (minutes / 60);
    if (hemisphere == 'W') {
        longitude = -longitude;
    } else if (hemisphere != 'E') {
        throw "invalid hemisphere";
    }
    return longitude;
}

var parseMessage = function (data) {
    var message = {};
    var messageArray = gpsMessagePattern.exec(data);
    if (messageArray[4] && messageArray[5] && messageArray[6]) {
        message.latitude = parseLatitude(messageArray[4], messageArray[5], messageArray[6]);
    }
    if (messageArray[1] && messageArray[2] && messageArray[3]) {
        message.longitude = parseLongitude(messageArray[1], messageArray[2], messageArray[3]);
    }

    if (messageArray[7]) {
        message.speed = parseFloat(messageArray[7]);
    }

    if (messageArray[8]) {
        message.altitude = parseInt(messageArray[8], 10);
    }

    return message;
};

module.exports = parseMessage;
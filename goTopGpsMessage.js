

// V,DATE:120903,TIME:160649,LAT:59.9326566N,LOT:010.7875033E,Speed:005.5,X-X-X-X-82-10,000,24202-0324-0E26


var pattern = /^(A|V),DATE:(\d{2})(\d{2})(\d{2}),TIME:(\d{2})(\d{2})(\d{2}),LAT:(\d{2}.\d*)(N|S),LOT:(\d{3}.\d*)(E|W),Speed:(\d{3}.\d),?(.*),?(.*),?(.*)/i;

function parseLatitude(degrees, hemisphere) {
	latitude = parseFloat(degrees);
	if (hemisphere == 'S') {
		latitude = -latitude;
	} else if (hemisphere != 'N') {
		throw "invalid hemisphere";
	}
	return latitude;
}

function parseLongitude(degrees, hemisphere) {
	//console.log('longitude degrees ' + degrees + ' minutes ' + minutes + ' hemisphere ' + hemisphere);
	
	longitude = parseFloat(degrees);
	if (hemisphere == 'W') {
		longitude = -longitude;
	} else if (hemisphere != 'E') {
		throw "invalid hemisphere";
	}
	return longitude;
}

exports.parseMessage = function(message) {
	console.log(message);
	var matchArray = pattern.exec(message);
	
	var message = new Object();
	
	var available = matchArray[1];
	if (available == 'A') {
		message.available = true;
	} else {
		message.available = false;
	}
	
	var date = new Date();
	
	date.setUTCFullYear("20"+matchArray[2]);
	date.setUTCMonth(matchArray[3] - 1);
	date.setUTCDate(matchArray[4]);
	date.setUTCHours(matchArray[5]);
	date.setUTCMinutes(matchArray[6]);
	date.setUTCSeconds(matchArray[7]);
	
	message.timestamp = date;
	
	message.latitude = parseLatitude(matchArray[8], matchArray[9]);
	message.longitude = parseLongitude(matchArray[10], matchArray[11]);
	message.speed = matchArray[12];
	message.status = matchArray[13];
	message.unknown = matchArray[14];
	message.network = matchArray[15];
	
	//console.log(message);
	return message;
};

var parseGpsMessage = require('./gps-message-parser');

var framePattern = /^#(.+),([a-zA-Z]{3}-.),?(.*)#$/;

function parseFrame(frame) {
	//console.log('parsing frame: ' + frame);
	var matchArray = framePattern.exec(frame);
	var frame = new Object();
	frame.serialNumber = matchArray[1];
	frame.type = matchArray[2];
	frame.messageBody = matchArray[3];
	return frame;
}

parseMessage = function(message) {
	
	var object = new Object();
	var frame = parseFrame(message);
	
	object.type = frame.type;
	object.serialNumber = frame.serialNumber;
	
	switch (frame.type) {
	case 'ALM-A':
		object.message = parseGpsMessage(frame.messageBody);
		break;
	case 'CMD-T':
		object.message = parseGpsMessage(frame.messageBody);
	default:
		break;
	}
	return object;
};

module.exports = parseMessage;

var goTopGpsMessageProtocol = require('./goTopGpsMessage');

var framePattern = /^#(.+),([a-zA-Z]{3}-.),?(.*)#$/;

function parseFrame(frame) {
	var matchArray = framePattern.exec(frame);
	var frame = new Object();
	frame.serialNumber = matchArray[1];
	frame.type = matchArray[2];
	frame.messageBody = matchArray[3];
	console.log(frame);
	return frame;
}

exports.parseMessage = function(message) {
	
	var object = new Object();
	var frame = parseFrame(message);
	
	object.type = frame.type;
	object.serialNumber = frame.serialNumber;
	
	switch (frame.type) {
	case 'ALM-A':
		object.message = goTopGpsMessageProtocol.parseMessage(frame.messageBody);
		break;
	case 'CMD-T':
		object.message = goTopGpsMessageProtocol.parseMessage(frame.messageBody);
	default:
		break;
	}
	console.log(object);
};
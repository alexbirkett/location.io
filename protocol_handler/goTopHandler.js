var goTopMessageParser = require('../parsers/goTop');

var goTop = function(socket, data) {

	this.socket = socket;
	var frameBuffer = data;
	
	socket.on('data', function(data) {
		frameBuffer = Buffer.concat([frameBuffer, data]);
		
		console.log('goTop data');
		handleData();
	});
	socket.on('close', function(data) {
		console.log('goTop close event');
	});
	
	console.log('goTop');
	
	var handleData = function() {
		// 35 is #
		if (frameBuffer.length > 1 && frameBuffer.readUInt8(frameBuffer.length - 1) == 35) {
			handleFrame(frameBuffer);
			frameBuffer = new Buffer(0);
		}
	};
	
	var handleFrame = function(buffer) {
		var frameAsJson = goTopMessageParser(buffer);
		console.log(frameAsJson);
	};
	
	handleData();
	
};

module.exports = goTop;
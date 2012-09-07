var goTopMessageParser = require('../parsers/goTop');
var util = require('util');
var events = require('events');


var GoTopProtocolHandler = function() {
	events.EventEmitter.call(this);
};

util.inherits(GoTopProtocolHandler, events.EventEmitter);

GoTopProtocolHandler.prototype.handleConnection = function(socket, data) {
	console.log("handle connect " + this.test);

	var frameBuffer = data;
	var eventEmitter = this;
	
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
		var message = goTopMessageParser(buffer);
		eventEmitter.emit('message', message);
		console.log(message);
	};
	
	handleData();
	
};


module.exports = GoTopProtocolHandler;
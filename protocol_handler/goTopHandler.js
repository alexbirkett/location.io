var goTopMessageParser = require('../parsers/goTop');
var events = require('events');


var GoTopProtocolHandler = function(eventEmitter) {
	this.eventEmitter = eventEmitter;
};

GoTopProtocolHandler.prototype.handleConnection = function(socket, data) {
	//console.log("handle connect " + this.test);

	var frameBuffer = data;
	var self = this;
	this.remoteAddress = socket.remoteAddress;
	this.remotePort = socket.remotePort;
	
	socket.on('data', function(data) {
		frameBuffer = Buffer.concat([frameBuffer, data]);
		
		//console.log('goTop data');
		handleData();
	});
	socket.on('close', function(data) {
		self.eventEmitter.emit('close', self);
	});
	
	//console.log('goTop');
	
	var handleData = function() {
		// 35 is #
		if (frameBuffer.length > 1 && frameBuffer.readUInt8(frameBuffer.length - 1) == 35) {
			handleFrame(frameBuffer);
			frameBuffer = new Buffer(0);
		}
	};
	
	var setAndEmittIdIfrequired = function(message) {
		if (self.id == undefined) {
			self.id = message.serialNumber;
			self.eventEmitter.emit('connection', self);
		}
	};
	
	var handleFrame = function(buffer) {
		var message = goTopMessageParser(buffer);
		setAndEmittIdIfrequired(message);
		self.eventEmitter.emit('message', message);
	};
	
	handleData();
	
};


GoTopProtocolHandler.prototype.getId = function() {
	return 'gotop:' + this.remoteAddress + ':' + this.remotePort + ':' + this.id;
};


module.exports = GoTopProtocolHandler;
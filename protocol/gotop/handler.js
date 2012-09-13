var goTopMessageParser = require('./parser');
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
	
	
	
	var handleFrame = function(buffer) {
		var message = goTopMessageParser(buffer);
		self.setAndEmittIdIfrequired(message);
		self.eventEmitter.emit('message', message);
	};
	
	handleData();
	
};

function buildCommand(password, command, data) {
	return ':' + password + ',' + command + data + '#';
};

GoTopProtocolHandler.prototype.setAuthorizedNumber = function(password, index, value, callback) {
	if (index > 5) {
		throw "only 5 authorized numbers supported";
	}
	this.sendCommand(buildCommand(password, 'A' + index, value));
	
};


GoTopProtocolHandler.prototype.sendCommand = function(command, expectedResponse, callback) {
	
	if (expectedResponse == undefined) {
		socket.write(command);
		this.expectedResponse = expectedResponse;
		this.callback = callback;
	} else {
		throw 'command outstanding';
	}

};

GoTopProtocolHandler.prototype.getId = function() {
	return 'gotop:' + this.remoteAddress + ':' + this.remotePort + ':' + this.id;
};

GoTopProtocolHandler.prototype.setAndEmittIdIfrequired = function(message) {
	if (this.id == undefined) {
		this.id = message.serialNumber;
		this.eventEmitter.emit('connection', this);
	}
};


module.exports = GoTopProtocolHandler;
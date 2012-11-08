var goTopMessageParser = require('./parser');
var buildCommand = require('./message-builder');
var events = require('events');

var GoTopProtocolHandler = function(eventEmitter) {
	this.eventEmitter = eventEmitter;
};

GoTopProtocolHandler.prototype.handleConnection = function(socket, data) {
	//console.log("handle connect " + this.test);

	var frameBuffer = data;
	var self = this;
	this.socket = socket;
	
	socket.on('data', function(data) {
		frameBuffer = Buffer.concat([frameBuffer, data]);
		
		//console.log('goTop data');
		handleData();
	});
	socket.on('close', function(data) {
		self.eventEmitter.emit('tracker-disconnected', self.getId());
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
		console.log(message.type);
		switch(message.type) {
		case 'ALM-A':
			self.eventEmitter.emit('location-update', self.getId(), message.location);
			self.eventEmitter.emit('alarm', self.getId(), message.location);
			break;
		case 'CMD-T':
			self.eventEmitter.emit('location-update', self.getId(), message.location);
			break;
	   case 'CMD-F':
			self.eventEmitter.emit('location-update', self.getId(), message.location);
			break;
		case 'CMD-X':
			self.eventEmitter.emit('heart-beat', self.getId(), message.location);
			break;
		}
	
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


GoTopProtocolHandler.prototype.sendCommand = function(commandName, commandParameters, callback) {
	
	console.log("commandName " + commandName);
	console.log(commandParameters);
	
	try {
		var message = buildCommand(commandName, commandParameters);
		this.socket.write(message, function(err) {
			callback(err);
		});
	} catch(e) {
		console.log("build command failed " + e);
		process.nextTick(function() {
			callback(e + "");
		})
	}
};

GoTopProtocolHandler.prototype.getId = function() {
	return 'gotop' + this.id;
};

GoTopProtocolHandler.prototype.setAndEmittIdIfrequired = function(message) {
	if (this.id == undefined) {
		this.id = message.serialNumber;
		this.eventEmitter.emit('tracker-connected', { id:this.getId(),protocol: "gotop" }, this);
	}
};

module.exports = GoTopProtocolHandler;
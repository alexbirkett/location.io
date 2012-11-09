var parseMessage = require('./parser');
var buildCommand = require('./command-builder');
var events = require('events');

var GoTopProtocolHandler = function(eventEmitter) {
	this.eventEmitter = eventEmitter;
};

GoTopProtocolHandler.prototype.handleConnection = function(socket, data) {
	
	var frameBuffer = data;
	var self = this;
	this.socket = socket;
	
	socket.on('data', function(data) {
		frameBuffer = Buffer.concat([frameBuffer, data]);
		
		handleData();
	});
	socket.on('close', function(data) {
		self.eventEmitter.emit('tracker-disconnected', self.getId());
	});
	
	var handleData = function() {
		// 35 is #
		if (frameBuffer.length > 1 && frameBuffer.readUInt8(frameBuffer.length - 1) == 35) {
			handleFrame(frameBuffer);
			frameBuffer = new Buffer(0);
		}
	};
	
	var handleFrame = function(buffer) {
		var message = parseMessage(buffer);
		self.setAndEmittIdIfrequired(message);
		//console.log(message.type);
		console.log(message);
		self.eventEmitter.emit(message.type, self.getId(), message.location);
		if (message.location != undefined) {
			console.log('location update');
			console.log(message.location);
			self.eventEmitter.emit('location-update', self.getId(), message.location);
		}
	};
	
	handleData();
	
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
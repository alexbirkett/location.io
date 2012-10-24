var goTopMessageParser = require('./parser');
var events = require('events');

var capabilities = {
		commands : [ {
			name : "oneTimeLocate",
			passwordRequired : true
		} ],
		properties : [ {
			name : "authorizedNumber",
			count:5,
			writable:true,
			passwordRequired:true,
			parameters : [ {
				type : "telephoneNumber",
				name : "authorizedNumber"
			} ]
		}, {
			name : "continous-tracking",
			writable:true,
			passwordRequired:true,
			parameters : [ {
				type : "time-period",
				name : "update-fequency"
			} ]
		},{
			name : "speeding-alarm",
			writable:true,
			passwordRequired:true,
			parameters : [ {
				type : "boolean",
				name : "enabled"
			},{
				type : "speed",
				name : "speed"
			} ]
		},{
			name : "geoFence",
			count: 5,
			writable:true,
			passwordRequired:true,
			parameters : [ {
				type : "longitude",
				name : "minLongitude"
			}, {
				type : "longitude",
				name : "maxLongitude"
			}, {
				type : "latitude",
				name : "minLatitude"
			}, {
				type : "latitude",
				name : "maxLatitude"
			} ]
		},{
			name : "timeZone",
			writable:true,
			passwordRequired:true,
			parameters : [ {
				type : "timezone",
				name : "timezone"
			}]
		},{
			name : "lowBatteryAlarm",
			writable:true,
			passwordRequired:true,
			parameters : [ {
				type : "boolean",
				name : "enabled"
			},{
				type : "percentage",
				name : "percentage"
			}]
		},{
			name : "changePassword",
			writable:true,
			passwordRequired:true,
			parameters : [ {
				type : "password",
				name : "password"
			}]
		}]
	};

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
		switch(message.type) {
		case 'ALM-A':
			self.eventEmitter.emit('location-update', self.getId(), message.location);
			self.eventEmitter.emit('alarm', self.getId(), message.location);
			break;
		case 'CMD-T':
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
	return 'gotop' + this.remoteAddress + 'X' + this.remotePort + 'X' + this.id;
};

GoTopProtocolHandler.prototype.setAndEmittIdIfrequired = function(message) {
	if (this.id == undefined) {
		this.id = message.serialNumber;
		this.eventEmitter.emit('tracker-connected', { id:this.getId(),capabilities: capabilities }, this);
	}
};

module.exports = GoTopProtocolHandler;


var protocolModules = require('./modules');

var Connection = function(eventEmitter) {
	this.eventEmitter = eventEmitter;
	this.frameBuffer = new Buffer(0);
	this.id = null;
	this.protocolModule = null;
}

module.exports = Connection;

Connection.prototype.attachSocket = function(socket) {
	var self = this;
	
	this.socket = socket;
	this.socket.setKeepAlive(true, 600000);	

	var setAndEmittIdIfrequired = function(message) {
		if (self.id == null) {
			self.id = message.trackerId;
			self.eventEmitter.emit('tracker-connected', self.getId(), self.protocolModuleName);
		}
	}; 

	var detectProtocolModuleIfRequired = function() {
		console.log('detect protocol if required');
		if (self.protocolModule == null) {
			try {
				
				for (var protocolModuleName in protocolModules) {
					var moduleToTest = protocolModules[protocolModuleName];
					
					if (moduleToTest.isSupportedProtocol(self.frameBuffer)) {
						self.protocolModule = moduleToTest;
						self.protocolModuleName = protocolModuleName;
						console.log('using ' + protocolModuleName + 'protocol module');
						break;
					}
					
				}								
				if (self.protocolModule == null) {
					console.log('closing socket')
					// could not detect protocol
					self.socket.destroy();
				}
			} catch (e) {
				console.log('execption occurred ' + e);
				// wait for more data
			}
		};
	};
	
	var handleMessage = function(message) {
		setAndEmittIdIfrequired(message);
		self.eventEmitter.emit("message", self.getId(), message);
	}; 

	this.socket.on('data', function(data) {
		self.frameBuffer = Buffer.concat([self.frameBuffer, data]);
		detectProtocolModuleIfRequired();
		
		//console.log('data');
		
		if (self.protocolModule != null) {
			
			while (self.frameBuffer.length > 0) {
				var result = self.protocolModule.parse(self.frameBuffer);
				self.frameBuffer = result.buffer;
				if (result.message == undefined) {
					// could not parse message
					break;
				} else {
					handleMessage(result.message);
				}
			}
			
		}

	});
	
	this.socket.on('close', function(data) {
		self.eventEmitter.emit('tracker-disconnected', self.id);
	});

	this.socket.on('error', function() {
		console.log('socket error occured');
	});
};

Connection.prototype.sendCommand = function(commandName, commandParameters, callback) {
	
	try {
		var message = this.protocolModule.buildCommand(commandName, commandParameters);
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

Connection.prototype.getId = function() {
	return this.protocolModuleName + this.id;
};

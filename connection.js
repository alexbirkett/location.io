

var Connection = function(eventEmitter, protocolModules) {
	this.eventEmitter = eventEmitter;
	this.frameBuffer = new Buffer(0);
	this.id = null;
	this.protocolModule = null;
	this.protocolModules = protocolModules;
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
		//console.log('detect protocol if required');
		if (self.protocolModule == null) {
			try {
				
				for (var protocolModuleName in self.protocolModules) {
					var moduleToTest = self.protocolModules[protocolModuleName];
					
					if (moduleToTest.isSupportedProtocol(self.frameBuffer)) {
						self.protocolModule = moduleToTest;
						self.protocolModuleName = protocolModuleName;
						console.log('using ' + protocolModuleName + ' protocol module');
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
	
		try {
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
						if (result.requiredMessageAck != undefined) {
							self.sendCommand(result.requiredMessageAck, result.message, function() {
							});
						}
					}
				}

			}
		} catch (e) {
			console.log('error parsing data from ' + self.getId());
			//self.socket.destroy();
		}

	});
	
	this.socket.on('close', function(data) {
		self.eventEmitter.emit('tracker-disconnected', self.getId());
	});

	this.socket.on('error', function() {
		console.log('socket error occured');
	});
};

Connection.prototype.sendCommand = function(commandName, commandParameters, callback) {
	console.log('sending commmand ' + commandName);
	commandParameters.trackerId = this.id;
	console.log(commandParameters);
	try {
		var message = this.protocolModule.buildCommand(commandName, commandParameters);
		console.log('sending to tracker: ' + message)
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

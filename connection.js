var forEach = require('async-foreach').forEach;
require('smarter-buffer');

module.exports.attachSocket = function(self, socket, protocolModules, callback) {
	self.protocolModules = protocolModules;
	self.upMessagesCallbacks = {};
	
	socket.setKeepAlive(true, 30000);

	var setAndEmittIdIfrequired = function(message) {
		
		if (!self.id) {
		    self.rawId = message.trackerId;
			self.id = self.protocolModules[0].name + message.trackerId;
			callback('tracker-connected', self.id, self.protocolModules[0].name);
		}
	}; 

	socket.on('data', function(data) {
		bufferAndHandleData(self, data, handleData, parse, function(message) {
			setAndEmittIdIfrequired(message);
			callback('message', self.id, message);			
			
			sendAck(self.protocolModules[0], socket, message, function(err) {
			    
			});
			
			if (self.upMessagesCallbacks[message.type] != undefined) {
			    self.upMessagesCallbacks[message.type](null);
			}
			self.upMessagesCallbacks[message.type] = undefined;
			    
		});
	});
	
	socket.on('close', function(data) {
		callback('tracker-disconnected', self.id);
	});

	socket.on('error', function(err) {
		console.log('socket error occured ' + err);
	});
};


var bufferAndHandleData = function(self, data, handleDataFunction, parseFunction, handleMessageFunction) {
	self.dataBuffer = Buffer.smarterConcat([self.dataBuffer, data]);
	if (!self.handlingData) {
		handleDataFunction(self, parseFunction, handleMessageFunction);
	}
};

module.exports._bufferAndHandleData = bufferAndHandleData;

var handleData = function(self, parseFunction, handleMessageFunction, callback) {
	
	if (self.handlingData) {
		throw "already handling data";
	}
	
	var doCallCallback = function() {
		if (typeof (callback) == "function") {
			callback(null);
		}
	};

	var handleParseComplete = function(err, message, data, protocolModules) {
		
		// more data was added while we were parsing or unconsumed data has been passed back
		var moreParsingRequired = self.dataBuffer || (message && data.length > 0); 
		
		self.dataBuffer = Buffer.smarterConcat([data, self.dataBuffer]);
		self.protocolModules = protocolModules;
				
		if (message) {
			handleMessageFunction(message);
		}
		
		if (moreParsingRequired) {
			kickOffParse();
		} else {
			self.handlingData = false;
			doCallCallback();
		}
	}; 

	
	var kickOffParse = function() {
		self.handlingData = true;
		var dataToParse = self.dataBuffer;
		self.dataBuffer = undefined;
		parseFunction(dataToParse, self.protocolModules, handleParseComplete);
	};
	
	
	if (!self.handlingData) {
		kickOffParse();
	} 
};

module.exports._handleData = handleData;

var parseWrapper = function(parsefunction, data, callback) {
	var parsing = true;
	
	var timeoutId = setTimeout(function() {
		parsing = false;
		callback("timeout");
	}, 1000); // 1 second
	
	var calledBackSynchronously = true;
		
	var callCallback = function() {
		if (parsing) {
			clearTimeout(timeoutId);
			var outerArguments = arguments;
			
			if (calledBackSynchronously) {
				callback.apply(this, arguments);
			} else {
				setImmediate(function() {
					callback.apply(this, outerArguments);
				});
			}
			
			parsing = false;
		}
	}


	try {
		parsefunction(data, callCallback);
		calledBackSynchronously = false;
	} catch(e) {
		callCallback(e);
	}
}

var parse = function(data, protocolModules, callback) {
    var message = null;
 
 	var protocolModulesCopy = protocolModules.slice();
 	
 	var error = true;
 	
	forEach(protocolModulesCopy, function(module, index, arr) {
		var done = this.async();

		parseWrapper(module.parseMessage, data, function(errorFromParser, messageFromParser, buffer) {
			
			if (error) {
				// if error has been set to null, then at least one module is not passing back an error
				error = errorFromParser;
			}
			
			var coninueLoop = true;
			if (errorFromParser) {
				// remove this module so we don't attempt to use it again
				protocolModules.splice(index, 1);
			} else {
				if (messageFromParser) {
					protocolModules = [module];
					// this module can parse the message - it will be used from now on
					data = buffer;
					coninueLoop = false;
					message = messageFromParser;
				}
			}
			done(coninueLoop);
		}); 


	}, function() {
		callback(error, message, data, protocolModules);
	});
		
};
module.exports._parse = parse;

var sendAck = function(module, socket, message, callback) {
    var ack;
    
    if (module.buildAck != undefined) {
       ack = module.buildAck(message);    
    }
    
    if (ack != undefined) {
        socket.write(ack, function(err) {
            callback(err);
        });
    }
}

module.exports.sendMessage = function(self, socket, messageName, commandParameters, callback) {
	console.log('sending message ' + messageName);
	commandParameters.trackerId = self.rawId;
	console.log(commandParameters);
	var module = self.protocolModules[0];
	try {
		var message = module.buildMessage(messageName, commandParameters);
		console.log('sending to tracker: ' + message)
		socket.write(message, function(err) {
	        //@TODO no guarantee that protocols that don't require up messages to be ACKed also don't require down messages to be acked.
		    if (err || module.buildAck == undefined) {
	            callback(err);        
		    } else {
		        self.upMessagesCallbacks[messageName] = callback;
		    }
		});
		
		
	} catch(e) {
		console.log("build message failed " + e);
		setImmediate(function() {
			callback(e + "");
		})
	}
};


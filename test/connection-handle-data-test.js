var vows = require('vows'), assert = require('assert');

var connection = require('../connection');

var getParseFunction = function(meta) {
	
	meta.parseCallCount = 0;
		
	var parse = function(data, protocolModules, callback) {
		process.nextTick(function() {
			var message;

			if (meta.parseCallCount == 0) {

				message = "message0";
			} else if (meta.parseCallCount == 1) {

				message = "message1";
			}

			callback(null, message, data, protocolModules);
			meta.parseCallCount++;
		});
	};
	return parse;
};


vows.describe('connection.handleData').addBatch({
	'handle data returns a message' : {
		topic : function() {
			var self = {};
			self.dataBuffer = new Buffer("hello world");
		//	self.protocolModules = [1, 2, 3];

			var meta = {};
			var testCaseCallback = this.callback;
			
			meta.handleMessageCallCount = 0;
			meta.messagesHandled = [];
	
			var handleMessage = function(message) {
				meta.messagesHandled[meta.handleMessageCallCount] = message;
				meta.handleMessageCallCount++;
			};
	
			var handleDataDoneCallback = function() {
				testCaseCallback(self, meta);
			};
			
			connection._handleData(self, getParseFunction(meta), handleMessage, handleDataDoneCallback);
		},
		'should return a message' : function(self, meta) {
			console.log('self');
			console.log(self);
			console.log('meta');
			console.log(meta);
			//assert.equal(message, "message0");
		}
	}/*,
	'passes back unparsed data' : {
		topic : function() {
			
			var self = {};
			self.dataBuffer = new Buffer("in good faith");
			self.protocolModules = [1,2,3];
			
			var round = 0;
			var parse = function(data, protocolModules, callback) {
				process.nextTick(function() {
					
					var dataToPassBack = data;
					var i = 0;
					while(i < data.length && data.readUInt8(i) != 0x20) {
						i++;
					}
					
					console.log('i is ' + i);
					
					var message = null;
					
					if (i > 0) {
						message = data.toString('utf8', 0, i);
						dataToPassBack = data.slice(i);
					}
					
					console.log('message' + message);
					console.log('dataToPassback ' + dataToPassBack);
					callback(null, message, dataToPassBack, protocolModules);
		
				});
			};
			
			connection._handleData(self, parse, this.callback);
		},
		'should return a message' : function(err, message) {
			assert.equal(message, "in");
		},
		'another return a message' : function(err, message) {
			console.log('second callback ' + message);
			assert.equal(message, "good");
		},
		'and a third message' : function(err, message) {
			console.log('second callback ' + message);
			assert.equal(message, "faith");
		}
	}*/
}).export(module);
// Export the Suite
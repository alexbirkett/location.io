var vows = require('vows'), assert = require('assert');

var connection = require('../connection');

var getSimpleParser = function(meta) {

	meta.parseCallCount = 0;

	var parse = function(data, protocolModules, callback) {
		process.nextTick(function() {
			meta.parseCallCount++;
			
			var dataToPassBack = data;
			
			var dataLength = 0;
			for (var i = 0; i < data.length; i++) {
				if (data.readUInt8(i) == 0x20) {
					dataLength = i;
					break;
				}
			}
			
			var message = null;

			if (dataLength > 0) {
				message = data.toString('utf8', 0, i);
				dataToPassBack = data.slice(dataLength + 1);
			}

			callback(null, message, dataToPassBack, protocolModules);
		
		});
	};
	return parse;
};

vows.describe('connection.handleData').addBatch({
	'test simple parser': {
		topic: function() {
			var meta = {};
			var parse = getSimpleParser(meta);
			var buffer = new Buffer("hello ");
			parse(buffer, null, this.callback);
			
		},
		'should return hello': function(err, message, dataToPassBack, protocolModules) {
			assert.isNull(err);
			assert.equal(message, "hello");
			assert.equal(dataToPassBack.length, 0);
			assert.isNull(protocolModules);
 		}
	},
	'handleData returns messages' : {
		topic : function() {
			var self = {};
			self.dataBuffer = new Buffer("in good faith i_will_not_get_sent_back_because_im_not_followed_by_a_space");
	
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
			
			connection._handleData(self, getSimpleParser(meta), handleMessage, handleDataDoneCallback);
		},
		'should pass back messages and left overdata' : function(self, meta) {
			assert.equal(self.dataBuffer + '', 'i_will_not_get_sent_back_because_im_not_followed_by_a_space');
			assert.isFalse(self.handlingData);
			assert.equal(meta.handleMessageCallCount, 3);
			assert.equal(meta.messagesHandled[0], "in");
			assert.equal(meta.messagesHandled[1], "good");
			assert.equal(meta.messagesHandled[2], "faith");
			assert.equal(meta.parseCallCount, 4);
		}
	},
	'handleData handles incremental data' : {
		topic : function() {
			var self = {};
			self.dataBuffer = new Buffer("in good");
	
			process.nextTick(function() {
				self.dataBuffer = new Buffer(" faith i_will_not_get_sent_back_because_im_not_followed_by_a_space");
			});
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
			
			connection._handleData(self, getSimpleParser(meta), handleMessage, handleDataDoneCallback);
		},
		'should pass back messages and left overdata' : function(self, meta) {
			assert.equal(self.dataBuffer + '', 'i_will_not_get_sent_back_because_im_not_followed_by_a_space');
			assert.isFalse(self.handlingData);
			assert.equal(meta.handleMessageCallCount, 3);
			assert.equal(meta.messagesHandled[0], "in");
			assert.equal(meta.messagesHandled[1], "good");
			assert.equal(meta.messagesHandled[2], "faith");
			assert.equal(meta.parseCallCount, 4);
		}
	},
	'bufferAndHandleData handlesData when not already handling data' : {
		topic : function() {
			var meta = {};
			meta.self = {};
			meta.self.handlingData = false;
			
			meta.self.dataBuffer = new Buffer('hello');

			var data = Buffer(' world');
			
			var handleData = function(self, parseFunction, handleMessageFunction) {			
				meta.handleData = {};
				meta.handleData.self = self;
				meta.handleData.parseFunction = parseFunction;
				meta.handleData.handleMessageFunction = handleMessageFunction;
			};
			connection._bufferAndHandleData(meta.self, data, handleData, "parseFunction", "handleMessageFunction");
			return meta;
			
		},
		'should handleData' : function(meta) {
			assert.equal(meta.handleData.self, meta.self);
			assert.equal(meta.handleData.parseFunction, "parseFunction");
			assert.equal(meta.handleData.handleMessageFunction, "handleMessageFunction");
			assert.equal(meta.self.dataBuffer + '', "hello world");
		}
	},
	'bufferAndHandleData only buffers when already handling data' : {
		topic : function() {
			var meta = {};
			meta.self = {};
			meta.self.handlingData = true;
			
			meta.self.dataBuffer = new Buffer('hello');

			var data = Buffer(' world');
			
			meta.handleDataCalled = false;
			
			var handleData = function(self, parseFunction, handleMessageFunction) {
				meta.handleDataCalled = true;
			};
			
			connection._bufferAndHandleData(meta.self, data, handleData, "parseFunction", "handleMessageFunction");
			return meta;
			
		},
		'should not handleData' : function(meta) {
			assert.isFalse(meta.handleDataCalled);
			assert.equal(meta.self.dataBuffer + '', "hello world");
		}
	}
}).export(module);
// Export the Suite
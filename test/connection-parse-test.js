var vows = require('vows'), assert = require('assert');

var connection = require('../connection');

vows.describe('connection.parse').addBatch({
	'parse with three modules, the last one of which returns a message' : {
		topic : function() {
			var protocolModules = [{
				parseMessage : function(buffer, callback) {
					process.nextTick(function() {
						callback("error", null, buffer);
					});
				}
			}, {
				parseMessage : function(buffer, callback) {
					process.nextTick(function() {
						callback(null, null, buffer);
					});
				}
			}, {
				parseMessage : function(buffer, callback) {
					process.nextTick(function() {
						callback(null, "message", buffer);
					});
				},
				desiredModule : true
			}];
			
			connection._parse(new Buffer(0) ,protocolModules, this.callback);
		},
		'should removesModules all other modules if a module successfully parses message' : function(err, message, data, protocolModules) {
			assert.isNull(err);
			assert.equal(message, "message");
			assert.equal(data.length, 0);
			assert.equal(protocolModules.length, 1);
		}
	},
	'parse with two modules, the last one of which returns a message' : {
		topic : function() {
			var protocolModules = [{
				parseMessage : function(buffer, callback) {
					process.nextTick(function() {
						callback("error", null, buffer);
					});
				},
				desiredModuleA : false
			}, {
				parseMessage : function(buffer, callback) {
					process.nextTick(function() {
						callback(null, "message", buffer);
					});
				},
				desiredModuleA : true
			}];
			
			connection._parse(new Buffer(0) ,protocolModules, this.callback);
		},
		'should removesModules all other modules if a module successfully parses message' : function(err, message, data, protocolModules) {
			assert.isNull(err);
			assert.equal(message, "message");
			assert.equal(data.length, 0);
			assert.equal(protocolModules.length, 1);
		}
	},
	'parse with one module that returns a error and none that return a message' : {
		topic : function() {
			var protocolModules = [{
				parseMessage : function(buffer, callback) {
					process.nextTick(function() {
						callback("error", null, buffer);
					});
				}
			}, {
				parseMessage : function(buffer, callback) {
					process.nextTick(function() {
						callback(null, null, buffer);
					});
				}
			}, {
				parseMessage : function(buffer, callback) {
					process.nextTick(function() {
						callback(null, null, buffer);
					});
				},
				desiredModule : true
			}];

			connection._parse(new Buffer(7),protocolModules, this.callback);
		},
		'should remove module that returns an error' : function(err, message, data, protocolModules) {
			assert.isNull(err);
			assert.isNull(message); // no message was sent back
			assert.equal(data.length, 7); // we get back the same buffer we passed in
			assert.equal(protocolModules.length, 2); // the module that threw an error should have been removed
		}
	},
	'parse when first module returns a message' : {
		topic : function() {
			var protocolModules = [{
				parseMessage : function(buffer, callback) {
					process.nextTick(function() {
						callback(null, 'message', buffer);
					});
				}
			}, {
				parseMessage : function(buffer, callback) {
					process.nextTick(function() {
						callback(null, null, buffer);
					});
				}
			}];

			connection._parse(new Buffer(12),protocolModules, this.callback);
		},
		'should not call parse on second module in list' : function(err, message, data, protocolModules) {
			assert.isNull(err);
			assert.equal(message, 'message');
			assert.equal(data.length, 12); // we get back the same buffer we passed in
			assert.equal(protocolModules.length, 1); // only the module that returned the message should callback
		}
	},
	'parse when first module throws an exception a message' : {
		topic : function() {
			var protocolModules = [{
				parseMessage : function(buffer, callback) {
					throw "error";
				}
			}, {
				parseMessage : function(buffer, callback) {
					process.nextTick(function() {
						callback(null, "message", buffer);
					});
				}
			}];

			connection._parse(new Buffer(2),protocolModules, this.callback);
		},
		'should ignore broken module' : function(err, message, data, protocolModules) {
			assert.isNull(err);
			assert.equal(message, 'message');
			assert.equal(data.length, 2); // we get back the same buffer we passed in
			assert.equal(protocolModules.length, 1); // only the module that returned the message should callback
		}
	},
	'parse when first module callsback syncrhonously' : {
		topic : function() {
			var protocolModules = [{
				parseMessage : function(buffer, callback) {
					callback(null, null, buffer);
				}
			}, {
				parseMessage : function(buffer, callback) {
					process.nextTick(function() {
						callback(null, "message", buffer);
					});
				}
			}];

			connection._parse(new Buffer(2),protocolModules, this.callback);
		},
		'should call back' : function(err, message, data, protocolModules) {
			assert.isNull(err);
			assert.equal(message, "message");
			assert.equal(data.length, 2); // we get back the same buffer we passed in
			assert.equal(protocolModules.length, 1); // only the module that returned the message should callback
		}
	},
	'parse when parse function does not callback' : {
		topic : function() {
			var protocolModules = [{
				parseMessage : function(buffer, callback) {
					// do nothing
				}
			}];

			connection._parse(new Buffer(2),protocolModules, this.callback);
		},
		'should time out' : function(err, message, data, protocolModules) {
			assert.equal(err, "timeout");
		}
	},
	'parse when parse function calls back after timeout' : {
		topic : function() {
			var protocolModules = [{
				parseMessage : function(buffer, callback) {
					setTimeout(function() {
						callback(null);
					}, 1500);
				}
			}];

			connection._parse(new Buffer(2),protocolModules, this.callback);
		},
		'should time out' : function(err, message, data, protocolModules) {
			assert.equal(err, "timeout");
		}
	},
	'parse when one module does not return a message and another times out' : {
		topic : function() {
			var protocolModules = [{
				parseMessage : function(buffer, callback) {
					
				}
			}, {
				parseMessage : function(buffer, callback) {
					process.nextTick(function() {
						callback(null, null, buffer);
					});
				},
				remaining: true
			}];

			connection._parse(new Buffer(2),protocolModules, this.callback);
		},
		'should return null message' : function(err, message, data, protocolModules) {
			assert.isNull(err);
			assert.isNull(message);
			assert.equal(protocolModules.length, 1);
			assert.isTrue(protocolModules[0].remaining);
		}
	},
	'parse when one module times out and another does not return a message' : {
		topic : function() {
			var protocolModules = [
			{
				parseMessage : function(buffer, callback) {
					process.nextTick(function() {
						callback(null, null, null);
					});
				},
				remaining: true
			},
			{
				parseMessage : function(buffer, callback) {
					
				}
			}];

			connection._parse(new Buffer(2),protocolModules, this.callback);
		},
		'should return null message' : function(err, message, data, protocolModules) {
			assert.isNull(err);
			assert.isNull(message);
			assert.equal(protocolModules.length, 1);
			assert.isTrue(protocolModules[0].remaining);
			assert.equal(data.length, 2);
		}
	}
}).export(module);
// Export the Suite
var vows = require('vows'), assert = require('assert');

var Connection = require('../connection');

vows.describe('connection.parse').addBatch({
	'parse with one module that returns a message' : {
		topic : function() {
			var protocolModules = [{
				parse : function(buffer, callback) {
					process.nextTick(function() {
						callback("error", null, buffer);
					});
				}
			}, {
				parse : function(buffer, callback) {
					process.nextTick(function() {
						callback(null, null, buffer);
					});
				}
			}, {
				parse : function(buffer, callback) {
					process.nextTick(function() {
						callback(null, "message", buffer);
					});
				},
				desiredModule : true
			}];

			var connection = new Connection(function() {
			}, protocolModules);
			connection._parse(new Buffer(0), this.callback);
		},
		'should removesModules all other modules if a module successfully parses message' : function(err, message, data, connection) {
			assert.isNull(err);
			assert.equal(message, "message");
			assert.equal(data.length, 0);
			assert.equal(connection.protocolModules.length, 1);
		}
	},
	'parse with one module that returns a error and none that return a message' : {
		topic : function() {
			var protocolModules = [{
				parse : function(buffer, callback) {
					process.nextTick(function() {
						callback("error", null, buffer);
					});
				}
			}, {
				parse : function(buffer, callback) {
					process.nextTick(function() {
						callback(null, null, buffer);
					});
				}
			}, {
				parse : function(buffer, callback) {
					process.nextTick(function() {
						callback(null, null, buffer);
					});
				},
				desiredModule : true
			}];

			var connection = new Connection(function() {
			}, protocolModules);
			connection._parse(new Buffer(7), this.callback);
		},
		'should remove module that returns an error' : function(err, message, data, connection) {
			assert.isNull(err);
			assert.isNull(message); // no message was sent back
			assert.equal(data.length, 7); // we get back the same buffer we passed in
			assert.equal(connection.protocolModules.length, 2); // the module that threw an error should have been removed
		}
	}
}).export(module);
// Export the Suite
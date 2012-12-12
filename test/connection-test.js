var vows = require('vows'), assert = require('assert');

var Connection = require('../connection');

/*topic : function() {
 parseMessage(new Buffer(CMD_X), this.callback);
 },
 'should be a heartBeat' : function(err, message, buffer) {

 var expectedMessage = {
 trackerId : '861785001515349',
 type : 'heartBeat'
 };

 assert.deepEqual(message, expectedMessage);
 assert.equal(buffer.length, 0);
 }*/

vows.describe('connection').addBatch({
	'parse' : {
		topic : function() {
			return {};
		},
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
				console.log('hello');
			},
			'should removesModules all other modules if a module successfully parses message' : function(err, message, data, connection) {
				console.log('test');
				assert.isNull(err);
				assert.equal(message, "message");
				assert.equal(data.length, 0);
				assert.equal(connection.protocolModules.length, 1);
			}
		}
	}
}).export(module);
// Export the Suite
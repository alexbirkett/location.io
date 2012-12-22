var TrackerSimulator = require('./tracker-simulator');
var assert = require('assert');
var vows = require('vows');
var async = require('async');

require('smarter-buffer');
var forEach = require('async-foreach').forEach;

var createServer = function(port, callback) {
	var net = require('net');
	
	var numberOfCallsToData = 0;
	var numberOfCallsToEnd = 0;
	var buffer;
	
	var server = net.createServer(function(client) {//'connection' listener
		console.log('server connected');
		
		client.on('end', function(data) {
			// when socket disconnects take down server
			closeServer();
			numberOfCallsToEnd++;
			buffer = Buffer.smarterConcat([buffer, data]);
		});
	

		client.on('data', function(data) {
			numberOfCallsToData++;
			console.log(data.toString());
			buffer = Buffer.smarterConcat([buffer, data]);
		});
	
	});
	
	server.listen(port, function() { //'listening' listener
 	 	console.log('server bound');
	});
	
	var closeServer = function() {
		server.close(function(err) {
			callback(err, buffer, numberOfCallsToData, numberOfCallsToEnd);		
		});
	}
}

var nextPort = 3141;
var getNextPort = function() {
	return nextPort++;
}

vows.describe('tracker-simulator').addBatch({
    'handles hello and world': {
        topic: function() {
        	var trackerSimulator = new TrackerSimulator();
        	var port = getNextPort();
        	createServer(port, this.callback);
        	
        	async.series([
			    function(callback)	{
			   		trackerSimulator.connect({host: 'localhost', port: port}, callback);
			   	},
			    function(callback) {
			    	var messages = ['hello', 'world'];
			    	trackerSimulator.sendMessage(messages, 1000, 2, 1, callback);
			    }
			],function(err) {
				trackerSimulator.destroy();
			});
        },
        'buffer should be hello world': function (err, buffer, numberOfCallsToData, numberOfCallsToEnd) {
          	assert.isNull(err);
          	assert.equal(buffer, "helloworld");
          	console.log(buffer + '');
          	console.log('numberOfCallsToData ' + numberOfCallsToData + ' numberOfCallsToEnd ' + numberOfCallsToEnd);
        }
    }
}).export(module); // Export the Suite
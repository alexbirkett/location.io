
var assert = require('assert');
var vows = require('vows');
var trackerSimulator = require('./tracker-simulator');
var async = require('async');

var tk103Buffer = "(012345678901BO012110601V5955.9527N01047.4330E000.023100734.62000000000L000000)";
var gotTopMessage = "#353327020115804,CMD-T,A,DATE:090329,TIME:223252,LAT:22.7634066N,LOT:114.3964783E,Speed:000.0,84-20,#";

var LocationIo = require('../index');

var locationIo = new LocationIo();

var nextPort = 11235;
var getNextPort = function() {
	return nextPort++;
}

vows.describe('protocol-identifier-tests').addBatch({
    'handles gotop message': {
        topic: function() {
        	var callback = this.callback;
        	var port = getNextPort();
        	var protocolType;
			locationIo.createServer(port, function(eventType, id, message) {
				//var eventAruments = arguments;
				console.log('event type ' + eventType);
				if (eventType == 'tracker-connected') {
					protocolType = message;
				} else if (eventType == 'message') {
					locationIo.close(function() {
						callback(id, message, protocolType);
					});
				} else if (eventType == 'server-up') {
					async.series([
			   			function(callback)	{
			   				trackerSimulator.connect({host: 'localhost', port: port}, callback);
			   			},
			    		function(callback) {
			    			var messages = [gotTopMessage];
			    			trackerSimulator.sendMessage(messages, 1000, 2, callback);
			    		}
					],function(err) {
						trackerSimulator.destroy();
					});
				}
			});
        },
        'should be gotop message': function (id, message, protocol) {
			assert.equal(protocol, "gotop");
        }
    },
  
}).export(module); // Export the Suite
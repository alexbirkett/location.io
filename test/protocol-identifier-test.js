
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

var testMessage = function(port, message, callback) {
	locationIo.createServer(port, function(eventType, id, protocol) {
			if (eventType == 'tracker-connected') {
				locationIo.close(function() {
					callback(id, protocol);
				});		
			} else if (eventType == 'server-up') {
				async.series([
			   		function(callback)	{
							trackerSimulator.connect({host: 'localhost', port: port}, callback);
		   			},
		    		function(callback) {
		    			var messageArray = [message];
			    		trackerSimulator.sendMessage(messageArray, 1, 2, callback);
		    		}
		    ],function(err) {
						trackerSimulator.destroy();
			});
		}
	});	
};

vows.describe('protocol-identifier-tests').addBatch({
    'handles gotop message': {
        topic: function() {
        	var port = getNextPort();
        	testMessage(port,gotTopMessage, this.callback);
			
        },
        'should be gotop message': function (id, protocol) {
			assert.equal(protocol, "gotop");
        }
    },
  
}).export(module); // Export the Suite
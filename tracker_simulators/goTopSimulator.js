var net = require('net');
var trackerSimulator = require('./TrackerSimulator');
var MESSAGE_CMD_T = "#861785001515349,CMD-T,V,DATE:120903,TIME:160649,LAT:59.9326566N,LOT:010.7875033E,Speed:005.5,X-X-X-X-49-5,000,24202-0ED9-D93B#";
var MESSAGE_CMD_X = "#861785001515349,CMD-X#";
var MESSAGE_ALM_A = "#861785001515349,ALM-A,V,DATE:120903,TIME:160649,LAT:59.9326566N,LOT:010.7875033E,Speed:005.5,X-X-X-X-82-10,000,24202-0324-0E26#";


var bombard = function() {
	//console.log('bombard');
	for (var i = 0; i < 100000; i++) {
		trackerSimulator([MESSAGE_CMD_T, MESSAGE_CMD_X, MESSAGE_ALM_A], 1000, 100, bombard);
	}
	
};
bombard();
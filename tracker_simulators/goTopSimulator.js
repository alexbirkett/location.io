var net = require('net');

var MESSAGE_CMD_T = "#861785001515349,CMD-T,V,DATE:120903,TIME:160649,LAT:59.9326566N,LOT:010.7875033E,Speed:005.5,X-X-X-X-49-5,000,24202-0ED9-D93B#";
var MESSAGE_CMD_X = "#861785001515349,CMD-X#";
var MESSAGE_ALM_A = "#861785001515349,ALM-A,V,DATE:120903,TIME:160649,LAT:59.9326566N,LOT:010.7875033E,Speed:005.5,X-X-X-X-82-10,000,24202-0324-0E26#";


function getParameters() {
	
	var args = process.argv.slice(2);
	if (args.length < 2) {
		throw "usage <hostname> <port>";
	}
	
	var params = new Object();
	
	params.hostname = args[0];
	params.port = args[1];
	return params;
}

function sliceString(string, sliceLength, index) {
	
	var beginPos = index*sliceLength;
	var endPos = beginPos + sliceLength;
	var slice;
	if (beginPos < string.length) {
		if (endPos < string.length) {
			slice = string.slice(beginPos, beginPos + sliceLength);
		} else {
			slice = string.slice(beginPos);
		}
	} else {
		throw "out of bounds";
	}
	return slice;
}


function sendMessage(message, client, callback) {
	var sliceIndex = 0;
	var sliceLength = 40;
	var sendNextSlice = function() {
		var slice = sliceString(message, sliceLength, sliceIndex);
		sliceIndex++;
		console.log('sending ' + slice);
		client.write(slice);
		if (slice.length == sliceLength) {
			setTimeout(sendNextSlice, 100);
		} else {
			callback();
		}
	};
	sendNextSlice();
}

function start() {
	var params = getParameters();
	
	var client = net.createConnection(params.port, params.hostname);

	client.addListener("connect", function(){
	    
		sendMessage(MESSAGE_CMD_T, client, function() {
			setTimeout(function () {
				sendMessage(MESSAGE_CMD_X, client, function() {
					setTimeout(function () {
						sendMessage(MESSAGE_ALM_A, client, function() {
							
						});
					}, 1000);
				});
			}, 1000);
		});
		
	    console.log("done");
	});
}

start();
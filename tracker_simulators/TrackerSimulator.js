var net = require('net');

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


function sendMessage(message, client, pauseBetweenSlices, callback) {
	var sliceIndex = 0;
	var sliceLength = 40;
	var sendNextSlice = function() {
		var slice = sliceString(message, sliceLength, sliceIndex);
		sliceIndex++;
		//console.log('sending ' + slice);
		client.write(slice);
		if (slice.length == sliceLength) {
			setTimeout(sendNextSlice, pauseBetweenSlices);
		} else {
			callback();
		}
	};
	sendNextSlice();
}

module.exports = function(messages, pauseBetweenMessages, pauseBetweenSlices, callback) {
	var params = getParameters();
	
	var client = net.createConnection(params.port, params.hostname);

	client.addListener("connect", function(){
		
		var messageIndex = 0;
	    
		var sendNextMessage = function() {
			if (messageIndex < messages.length) {
				sendMessage(messages[messageIndex], client, pauseBetweenSlices, function() {
					setTimeout(sendNextMessage, pauseBetweenMessages);
				});
				messageIndex++;
			} else {
				//console.log('end');
				client.destroy();
				callback();
			}
		};

		sendNextMessage();
	});
	
	client.addListener("error", function(err) {
		console.log(err);
	});
};

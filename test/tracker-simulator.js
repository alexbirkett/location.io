var net = require('net');
var async = require('async');
var forEach = require('async-foreach').forEach;

function sliceString(string, sliceLength, index) {
	var beginPos = index * sliceLength;
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

function buildSliceArray(message, sliceLength) {
	var slices = [];
	for(var i = 0; true; i++) {
		try {
			var slice = sliceString(message, sliceLength, i);
			slices.push(slice);
		} catch(e) {
			break;
		}
	}
	return slices;
}

function sendMessage(message, client, pauseBetweenSlices, sliceLength, callback) {
	var slices = buildSliceArray(message, sliceLength);
	var sendNextSlice = function(slice, sendSliceCallback) {
		client.write(slice);
		setTimeout(function() {
			sendSliceCallback();
		}, pauseBetweenSlices);
		
	};

	async.forEachSeries(slices, sendNextSlice, function() {
		callback();
	});
}

var client;

module.exports.connect = function(connectOptions, callback) {
	client = net.createConnection(connectOptions, callback);
}

module.exports.sendMessage = function(messages, pauseBetweenMessages, pauseBetweenSlices, sliceLength, callback) {

	forEach(messages, function(message, index, arr) {
		var done = this.async();

		sendMessage(message, client, pauseBetweenSlices, sliceLength, function() {
			setTimeout(function() {
				done();
			}, pauseBetweenMessages);
		});


	}, function() {
		callback();
	});
}; 

module.exports.destroy = function() {
	client.destroy();
}
	

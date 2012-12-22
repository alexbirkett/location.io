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

var SLICE_LENGTH = 1000;
function buildSliceArray(message) {
	var slices = [];
	for(var i = 0; true; i++) {
		try {
			var slice = sliceString(message, SLICE_LENGTH, i);
			slices.push(slice);
		} catch(e) {
			break;
		}
	}
	return slices;
}

function sendMessage(message, client, pauseBetweenSlices, callback) {
	var slices = buildSliceArray(message);
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

module.exports.sendMessage = function(messages, pauseBetweenMessages, pauseBetweenSlices, callback) {

	forEach(messages, function(message, index, arr) {
		var done = this.async();

		sendMessage(message, client, pauseBetweenSlices, function() {
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
	

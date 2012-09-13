//require('v8-profiler');
var net = require('net');
var fs = require('fs');
var ProtocolIdentifier = require('./protocol-identifier');
var GoTopProtocolHandler = require('./protocol/gotop/handler');
var events = require('events');
var util = require('util');

var tk103 = function(socket) {
	
};
var phonelocator = function(socket) {
	
};

var protocolIdentifer = new ProtocolIdentifier(phonelocator, GoTopProtocolHandler, tk103);


var TrackerProtocolHandler = function() {
	events.EventEmitter.call(this);
};

util.inherits(TrackerProtocolHandler, events.EventEmitter);

TrackerProtocolHandler.prototype.createServer = function(port) {

	this.emit('server_up', "server up");
	var server = net.createServer();
	var self = this;
	
	server.on('connection', function(socket) {	
			
		socket.once('data', function(data) {
			var ConnectionHandler = protocolIdentifer.identifyProtocol(data);
			var connectionHandler = new ConnectionHandler(self);
			connectionHandler.handleConnection(socket, data);
		});
	

		socket.on('close', function(data) {
	
		});

	});

	server.on('close', function(socket) {
		console.log('socket closed');
	});

	server.listen(port);
};

module.exports = TrackerProtocolHandler;



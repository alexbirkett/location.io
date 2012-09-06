var net = require('net');
var fs = require('fs');
var ProtocolIdentifier = require('./ProtocolIdentifier');
var goTopProtocolHandler = require('./protocol_handler/goTopHandler');


var tk103 = function(socket) {
	
};
var phonelocator = function(socket) {
	
};

protocolIdentifer = new ProtocolIdentifier(phonelocator, goTopProtocolHandler, tk103);


function getPortParameter() {
	
	var args = process.argv.slice(2);
	if (args.length < 1) {
		throw "usage  <port>";
	}
	
	return args[0];
}

function createServer(port) {
	var server = net.createServer();
	server.on('connection', function(socket) {	
		
		console.log('new connection\n');
		
		socket.once('data', function(data) {
			var HandlerFactory = protocolIdentifer.identifyProtocol(data);
			new HandlerFactory(socket, data);
		});
	

		socket.on('close', function(data) {
			console.log('close event');
		});

	});

	server.on('close', function(socket) {
		console.log('socket closed');
	});

	server.listen(port);
}
createServer(getPortParameter());
//require('v8-profiler');
var net = require('net');
var fs = require('fs');
var ProtocolIdentifier = require('./ProtocolIdentifier');
var GoTopProtocolHandler = require('./protocol_handler/goTopHandler');

var goTopProtocolHandler = new GoTopProtocolHandler();

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

var totalConnections = 0;
var openConnections = 0;
var receivedMessages = 0;
function createServer(port) {
	var server = net.createServer();
	server.on('connection', function(socket) {	
		
		totalConnections++;
		openConnections++;
		//console.log('new connection');
		
		socket.once('data', function(data) {
		//	console.log('data ' + data);
			var connectionHandler = protocolIdentifer.identifyProtocol(data);
			connectionHandler.handleConnection(socket, data);
		});
	

		socket.on('close', function(data) {
		//	console.log('close event');
			openConnections--;
		});

	});

	server.on('close', function(socket) {
		console.log('socket closed');
	});

	server.listen(port);
}
createServer(getPortParameter());

var showDebug = function() {
	var closedConnections = totalConnections - openConnections;
	console.log('open conneciton ' + openConnections + ' total connections ' + totalConnections + ' closed connections ' + closedConnections + ' received messages ' + receivedMessages);
};

setInterval(showDebug, 1000);

goTopProtocolHandler.on("message", function(message) {
	receivedMessages++;
	//console.log(message);
});

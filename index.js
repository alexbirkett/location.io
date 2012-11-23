//require('v8-profiler');
var net = require('net');
var fs = require('fs');
var ProtocolIdentifier = require('./protocol-identifier');
var events = require('events');
var util = require('util');
var Connection = require('./connection');

var LocationIo = function() {
	events.EventEmitter.call(this);
};

util.inherits(LocationIo, events.EventEmitter);

LocationIo.prototype.protocolModules = require('./modules');

LocationIo.prototype.createServer = function(port) {

	var self = this;
	this.emit('server_up', "server up");
	var server = net.createServer();
	
	this.connections = {};

	server.on('connection', function(socket) {	
		var connection = new Connection(self, self.protocolModules);
		connection.attachSocket(socket);
		self.connections[socket.remoteAddress+":"+socket.remotePort] = connection;
	});

	server.on('close', function(socket) {
		console.log('socket closed');
		self.connections[socket.remoteAddress+":"+socket.remotePor] = undefined;
	});

	server.listen(port);
};

LocationIo.prototype.sendCommand = function(trackerId, commandName, commandParameters, callback) {
	console.log('trackerId ' + trackerId)
	var connection = this.findConnectionById(trackerId);
	if (connection == undefined) {
		process.nextTick(function() {
			callback('unknown tracker');
		});
	} else {
		connection.sendCommand(commandName, commandParameters, callback);
	}
};

LocationIo.prototype.findConnectionById = function(id) {
	console.log('connections');
	console.log(this.connections);
	console.log('finding tracker id ' + id);
	
	for (var socket in this.connections) {
		
		var connection = this.connections[socket];
		console.log('testing connection ' + connection.getId());
			
		if (connection.getId() == id) {
			return connection;
		}
	}
};

LocationIo.prototype.getCapabilities = function(protocolName) {
	console.log(this.protocolModules);
	return this.protocolModules[protocolName].capabilities;
};

module.exports = LocationIo;



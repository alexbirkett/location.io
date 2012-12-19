//require('v8-profiler');
var net = require('net');
var fs = require('fs');
var events = require('events');
var util = require('util');
var connection = require('./connection');

var LocationIo = function() {
	events.EventEmitter.call(this);
};

util.inherits(LocationIo, events.EventEmitter);

LocationIo.prototype.protocolModules = require('./modules');

LocationIo.prototype.createServer = function(port, emitFunction) {

	var self = this;
	if (!emitFunction) {
		emitFunction = function() {
			self.emit.apply(self, arguments);
		};
	}

	emitFunction('server_up', "server up");
	var server = net.createServer();
	
	this.connections = {};

	var createProtocolModuleArray = function() {
		
		var moduleArray = [];
		for (var moduleName in this.protocolModules) {
			var module = this.protocolModules[moduleName];
			module.name = moduleName;
			moduleArray.push(module);
		}
		
		console.log('returning ');
		console.log(moduleArray);
		return moduleArray;
	};
	
	server.on('connection', function(socket) {
		console.log('socket connected');
		connection.attachSocket(socket, socket, createProtocolModuleArray(), emitFunction);
		self.connections[socket.remoteAddress+":"+socket.remotePort] = socket;
	});

	server.on('close', function(socket) {
		console.log('socket closed');
		self.connections[socket.remoteAddress+":"+socket.remotePor] = undefined;
	});

	server.listen(port);
};

LocationIo.prototype.sendCommand = function(trackerId, commandName, commandParameters, callback) {
	console.log('trackerId ' + trackerId)
	var socket = this.findConnectionById(trackerId);
	if (socket == undefined) {
		process.nextTick(function() {
			callback('unknown tracker');
		});
	} else {
		connection.sendCommand(socket, socket, commandName, commandParameters, callback);
	}
};

LocationIo.prototype.findConnectionById = function(id) {
	console.log('connections');
	console.log(this.connections);
	console.log('finding tracker id ' + id);
	
	for (var socket in this.connections) {
		
		var connection = this.connections[socket];
		console.log('testing connection ' + connection.id);
			
		if (connection.id == id) {
			return connection;
		}
	}
};

LocationIo.prototype.getCapabilities = function(protocolName) {
	console.log('protocol name ' + protocolName);
	console.log(protocolName);
	console.log(this.protocolModules);
	
	
	return this.protocolModules[protocolName].capabilities;
};

module.exports = LocationIo;



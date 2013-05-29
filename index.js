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

LocationIo.prototype.createServer = function(port, callback) {

    var self = this;
    var emitFunction = function() {
        self.emit.apply(self, arguments);
    };

    var server = net.createServer();

    this.sockets = {};


    server.on('connection', function(socket) {
        connection.attachSocket(socket, socket, self.protocolModules, emitFunction);
        var socketKey = socket.remoteAddress + ":" + socket.remotePort;
        self.sockets[socketKey] = socket;
        
        socket.on('close', function() {
            delete self.sockets[socketKey];
        });
    });

    server.listen(port, function(err) {
        emitFunction('server-up', err);
        if (callback) {
            callback(err);
        }
        callback = undefined;
    });

    server.on('error', function(err) {
        if (callback) {
            callback(err);
        } else {
            emitFunction('error', err);
        }
        callback = undefined;
    });

    this.server = server;
};

LocationIo.prototype.sendMessage = function(trackerId, messageName, commandParameters, callback) {
    console.log('trackerId ' + trackerId);
    var socket = this.findConnectionById(trackerId);
    if (socket === undefined) {
        setImmediate(function() {
            callback('unknown tracker');
        });
    } else {
        connection.sendMessage(socket, socket, messageName, commandParameters, callback);
    }
};

LocationIo.prototype.findConnectionById = function (id) {
    console.log('finding tracker id ' + id);

    for (var socketName in this.sockets) {

        var socket = this.sockets[socketName];
            console.log('testing connection ' + socket.id);

            if (socket.id == id) {
                return socket;
            }
        }
};

LocationIo.prototype.getApi = function(protocolName) {
    console.log('protocol name ' + protocolName);
    console.log(protocolName);
    console.log(this.protocolModules);
    return this.protocolModules[protocolName].api;
};

LocationIo.prototype.close = function(callback) {
    //console.log('closing server');
    this.server.close(callback);
};

module.exports = LocationIo;



protocolModules = {};
var protocols = ['gotop'];


protocols.forEach(function(moduleName) {
	protocolModules[moduleName] = require('./protocol/' + moduleName + '/module');
		
});

module.exports = protocolModules;
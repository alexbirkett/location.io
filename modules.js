
protocolModules = {};
var protocols = ['watch', 'gotop','tk103'];


protocols.forEach(function(moduleName) {
	protocolModules[moduleName] = require('./protocol/' + moduleName + '/module');
		
});

module.exports = protocolModules;
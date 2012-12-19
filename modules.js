
protocolModules = [];
var protocols = ['gotop'/*, 'tk103'*/];

var index = 0;

protocols.forEach(function(moduleName) {
	protocolModules[index] = require('./protocol/' + moduleName + '/module');
	protocolModules[index].name = moduleName;
	index++;
});

module.exports = protocolModules;
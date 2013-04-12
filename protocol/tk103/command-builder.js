var capabilities = require('./api');
var util = require('../util');
var constants = require('./constants');

var buildCommand = function(commandName, commandParameters) {	
	util.assertValidCommand(commandName, commandParameters, capabilities);
	return messageBuilders[commandName](commandParameters);
};

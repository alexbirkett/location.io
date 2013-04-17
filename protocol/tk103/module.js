var messageBuilder = require('./message-builder');

module.exports = {
	//commands: require('./commands'),
    capabilities: require('./api'),
	parseMessage: require('./parser'),
	buildAck: messageBuilder.buildAck,
	buildMessage: messageBuilder.buildMessage
};

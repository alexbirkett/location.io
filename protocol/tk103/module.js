var messageBuilder = require('./message-builder');

module.exports = {
	//commands: require('./commands'),
	parseMessage: require('./parser'),
	buildAck: function(message) {
        if (message.type != undefined) {
            var builder = messageBuilder.acks[message.type];
            if (builder != undefined) {
                return builder(message);
            }
        }
	}
};

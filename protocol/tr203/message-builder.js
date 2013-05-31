var util = require('../util');
var constants = require('./constants');

var messages = {
    setOnLineMode: function (messageValue) {
        return constants.COMMAND_HEADERS.ACTION_COMMAND + ',' + messageValue.trackerId + ',M3(Q0=' + util.parseTimeInterval(messageValue.interval) + ',Q2=02)';
    }
};

/*Ask TR-203 set on-line report with interval of 60 seconds and
report by UDP
GSC,011412000010789,M3(Q0=60,Q2=04)*34!
GSC,011412000010789,M3(Q0=300,Q2=02)*07!*/


module.exports.buildMessage = function (messageName, parameters) {
    var builder = messages[messageName];

    if (builder === undefined) {
        throw "no command builder defined for message " + messageName;
    }
    var message = builder(parameters);
    var messageWithChecksum = message + '*' + util.calculateNemaChecksum(message) + '!';
    return messageWithChecksum;
};

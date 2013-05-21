var util = require('../util');

var messages = {
    locateOneTime: function (messageValue) {
        return '#806#' + messageValue.password + '##';
    }
};

module.exports.buildMessage = function (messageName, parameters) {
    var builder = messages[messageName];

    if (builder === undefined) {
        throw "no command builder defined for message " + messageName;
    }
    var message = builder(parameters);
    return message;
};

var messageTypes = {
    'AUT': 'loginMessage',
    'SOS': 'sosMessage'
};

module.exports = function (messageCode) {
    return messageTypes[messageCode];
};

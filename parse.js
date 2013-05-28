var forEach = require('async-foreach').forEach;

var parseWrapper = function (parsefunction, data, callback) {
    var parsing = true;

    var timeoutId = setTimeout(function () {
        parsing = false;
        callback("timeout");
    }, 1000); // 1 second

    var calledBackSynchronously = true;

    var callCallback = function () {
        if (parsing) {
            clearTimeout(timeoutId);
            var outerArguments = arguments;

            if (calledBackSynchronously) {
                callback.apply(this, arguments);
            } else {
                setImmediate(function () {
                    callback.apply(this, outerArguments);
                });
            }

            parsing = false;
        }
    };


    try {
        parsefunction(data, callCallback);
        calledBackSynchronously = false;
    } catch (e) {
        callCallback(e);
    }
};

module.exports._parse = function (data, callback) {
    var message = null;

    var protocolModules = this.protocolModules;
    var protocolModulesCopy = protocolModules.slice();

    var error = true;

    forEach(protocolModulesCopy, function (module, index, arr) {
        var done = this.async();

        parseWrapper(module.parseMessage, data, function (errorFromParser, messageFromParser, buffer) {

            if (error) {
                // if error has been set to null, then at least one module is not passing back an error
                error = errorFromParser;
            }

            var coninueLoop = true;
            if (errorFromParser) {
                // remove this module so we don't attempt to use it again
                protocolModules.splice(index, 1);
            } else {
                if (messageFromParser) {
                    protocolModules = [module];
                    // this module can parse the message - it will be used from now on
                    data = buffer;
                    coninueLoop = false;
                    message = messageFromParser;
                }
            }
            done(coninueLoop);
        });


    }, function () {
        callback(error, message, data, protocolModules);
    });

};
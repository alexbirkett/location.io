var assert = require('assert');
var vows = require('vows');

var TK103MESSAGE = "(012345678901BO012110601V5955.9527N01047.4330E000.023100734.62000000000L000000)";
var GOTTOPMESSAGE = "#353327020115804,CMD-T,A,DATE:090329,TIME:223252,LAT:22.7634066N,LOT:114.3964783E,Speed:000.0,84-20,#";

var LocationIo = require('../index');

var testHelper = require('../protocol/test/test-helper.js');

process.on('uncaughtException', function (err) {
    console.log('Caught exception: ' + err.stack);
});

var nextPort = 2988;

var getNextPort = function () {
    return nextPort++;
};

var testUpMessage = function () {
    var args = [getNextPort];
    args = args.concat(Array.prototype.slice.call(arguments, 0));

    var callback = args[args.length - 1];

    testHelper.testUpMessage.apply(this, args);
};

vows.describe('protocol-identifier-tests').addBatch({
    'handles gotop message': {
        topic: function () {
            testUpMessage(GOTTOPMESSAGE, 0, 2, this.callback);
        },
        'should be gotop message': function (err, message, returnedData, protocol) {
            assert.equal(protocol, "gotop");
        }
    },
    'handles tk103 message': {
        topic: function () {
            testUpMessage(TK103MESSAGE, 0, 2, this.callback);
        },
        'should be gotop message': function (err, message, returnedData, protocol) {
            assert.equal(protocol, "tk103");
        }
    }

}).export(module); // Export the Suite
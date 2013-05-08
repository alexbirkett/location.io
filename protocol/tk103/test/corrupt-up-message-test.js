var assert = require('assert');
var vows = require('vows');
var testHelper = require('../../test/test-helper.js');

process.on('uncaughtException', function(err) {
  console.log('Caught exception: ' + err.stack);
});

var nextPort = 2999;

var getNextPort = function() {
    return nextPort++;
}

var sendData = function() {
   var args = [getNextPort];
   args = args.concat(Array.prototype.slice.call(arguments, 0));
   testHelper.testUpMessage.apply(this, args);
}
          
var createTests = function(sliceLength) {
    
    return {
        'handles garbage sent by TK102-2': {
            topic: function() {
               var MESSAGE = ":(000000000000AV001)";
               sendData(MESSAGE, 0, sliceLength, this.callback);        
            },
            'should fail with error': function (err, message) {
                assert.isNotNull(err);
            }
        }
         
    };

}

var suite = vows.describe('up-message-tests');

var test = {};
test.topic = function() {
        return i;
    }
    test.result = function(err) {
        console.log(err);
    }
    
var tests = {};
for (var i = 1; i < 150; i ++) {
    tests['test with slice length ' + i] = createTests(i);
}

suite.addBatch(tests);
    
suite.export(module); // Export the Suite


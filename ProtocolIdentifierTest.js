var assert = require('assert');

var ProtocolIdentifer = require('./ProtocolIdentifier');

var phonelocator = function() {
	
};

var goTop = function() {
	console.log('goTop');
};

var tk103 = function() {
	console.log('tk103');
};



protocolIdentifer = new ProtocolIdentifer(phonelocator, goTop, tk103);

var tk103Buffer = new Buffer("(012345678901BO012110601V5955.9527N01047.4330E000.023100734.62000000000L000000)");
var gotTopBuffer = new Buffer("#353327020115804,CMD-T,A,DATE:090329,TIME:223252,LAT:22.7634066N,LOT:114.3964783E,Speed:000.0,84-20,#");

assert.equal(tk103, protocolIdentifer.identifyProtocol(tk103Buffer), "tk103 failed");
assert.equal(goTop, protocolIdentifer.identifyProtocol(gotTopBuffer), "goTop failed");

console.log('tests complete');



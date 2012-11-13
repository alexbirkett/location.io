module.exports = {
	capabilities: require('./capabilities'),
	parse: require('./parser'),
	buildCommand: require('./command-builder'),
	
	isSupportedProtocol: function(buffer) {
		if (buffer.length < 1) {
			throw new Error("buffer empty");
		}		
		var firstOctet = buffer.readUInt8(0);
		
		if (firstOctet == 40) {
			return true;
		} else {
			return false;
		}
	}
};

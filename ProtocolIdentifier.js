module.exports = function(phonelocator, goTop, tk103) {
	this.goTop = goTop;
	this.tk103 = tk103;
	this.phonelocator = phonelocator;
	this.identifyProtocol = function(buffer) {
		var firstOctet = buffer.readUInt8(0);
		
		if (firstOctet < 6) {
			// Phonelocator binary protocol
			return this.phonelocator;
		} else if (firstOctet == 40) {
			return this.tk103;
		} else if (firstOctet == 35) {
			return this.goTop;
		} else {
			throw "uknown protocol exception";
		}
	};
};
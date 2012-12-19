var LocationIo = require('./index');

var locationIo = new LocationIo();

locationIo.on("tracker-connected", function(trackerId) {
	console.log('new connection ' + trackerId);
});

locationIo.on("tracker-disconnected", function(id) {
	console.log('connection closed ' + id);
});

locationIo.on("message", function(trackerId, message) {
	console.log('message from ' + trackerId);
	console.log(message);
});


locationIo.createServer(1338);


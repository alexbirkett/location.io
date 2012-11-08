var assert = require('assert');

var buildCommandMessage = require('../message-builder');

var testSetAuthorizedNumber = function() {
	var message = buildCommandMessage('setAuthorizedNumber', {
		authorizedNumber : "+1555555",
		password : "123456",
		index : 1
	});
	assert.equal(message, ":123456A1,+1555555#");

	assert.throws(function() {
		buildCommandMessage('setAuthorizedNumber', {
			authorizedNumber : "+1555555",
			password : "123456",
			index : 0
		});
	}, Error);
	
	assert.throws(function() {
		buildCommandMessage('setAuthorizedNumber', {
			authorizedNumber : "+1555555",
			password : "123456",
			index : 6
		});
	}, Error);
	
	assert.throws(function() {
		buildCommandMessage('setAuthorizedNumber', {
			authorizedNumber : "1555555",
			password : "123456",
			index : 1
		});
	}, Error);
	
	// missing index
	assert.throws(function() {
		buildCommandMessage('setAuthorizedNumber', {
			authorizedNumber : "+1555555",
			password : "123456"
		});
	}, Error);

	// missing password
	assert.throws(function() {
		buildCommandMessage('setAuthorizedNumber', {
			authorizedNumber : "+1555555",
			index : 1
		});
	}, Error);
	
	
	// missing password
	assert.throws(function() {
		buildCommandMessage('setAuthorizedNumber', {
			password : "123456",
			index : 1
		});
	}, Error);
		
};

var testDeleteAuthorizedNumber = function() {
	var message = buildCommandMessage('deleteAuthorizedNumber', {
		password : "123456",
		index : 2
	});
	assert.equal(message, ":123456A2,D#");
};


var testLocateOneTime = function() {
	var message = buildCommandMessage('locateOneTime', {
		password : "123456",
	});
	assert.equal(message, ":123456F#");
};

var testSetContinuousTracking = function() {
	var message = buildCommandMessage('setContinuousTracking', {
		password : "123456",
		enabled: true,
		interval: "5s"
	});
	assert.equal(message, ":123456M1,005S#");
	
	var message = buildCommandMessage('setContinuousTracking', {
		password : "555555",
		enabled: true,
		interval: "10S"
	});
	assert.equal(message, ":555555M1,010S#");
	

	var message = buildCommandMessage('setContinuousTracking', {
		password : "123456",
		enabled: true,
		interval: "200m"
	});
	assert.equal(message, ":123456M1,200M#");
	
	var message = buildCommandMessage('setContinuousTracking', {
		password : "123456",
		enabled: true,
		interval: "30M"
	});
	assert.equal(message, ":123456M1,030M#");
	
	
	var message = buildCommandMessage('setContinuousTracking', {
		password : "123456",
		enabled: false,
		interval: "1h"
	});
	
	
	var message = buildCommandMessage('setContinuousTracking', {
		password : "123456",
		enabled: false,
		interval: "45H"
	});
	assert.equal(message, ":123456M0,045H#");
	

	assert.throws(function() {
		buildCommandMessage('setContinuousTracking', {
			password : "123456",
			enabled : false,
			interval : "91H"
		});
	}, Error); 
	
	assert.throws(function() {
		buildCommandMessage('setContinuousTracking', {
			password : "123456",
			enabled : false,
			interval : "256S"
		});
	}, Error);
	
	assert.throws(function() {
		buildCommandMessage('setContinuousTracking', {
			password : "123456",
			enabled : false,
			interval : "256m"
		});
	}, Error); 
};



var testSetSpeedingAlarm = function() {

	var message = buildCommandMessage('setSpeedingAlarm', {
		password : "123456",
		speed: 80,
		enabled: true
	});
	assert.equal(message, ":123456J1,080#");


	var message = buildCommandMessage('setSpeedingAlarm', {
		password : "123456",
		speed: 80,
		enabled: false
	});
	assert.equal(message, ":123456J0,080#");
}; 

var testSetGeoFence = function() {

	var message = buildCommandMessage('setGeoFence', {
		password : "123456",
		index: 1,
		enabled: true,
		exit: true,
		maxLatitude: 51.193125,
		minLongitude: 9.21575,
		minLatitude: 50.403097,
		maxLongitude: 11.019925
	});
	assert.equal(message, ":123456I1,1,1,51113525N009125670E50241115N011011173E#");
};

var testSetTimeZone = function() {
	
	var message = buildCommandMessage('setTimeZone', {
		password : "123456",
		timeZone: "+08"
	});
	assert.equal(message, ":123456L+08#");
	
	var message = buildCommandMessage('setTimeZone', {
		password : "123456",
		timeZone: "-07"
	});
	assert.equal(message, ":123456L-07#");
	
	assert.throws(function() {
		buildCommandMessage('setTimeZone', {
			password : "123456",
			timeZone : "07"
		});
	}, Error);

	
};

var testSetLowBatteryAlarm = function() {
	
	var message = buildCommandMessage('setLowBatteryAlarm', {
		password : "123456",
		enabled: true,
		percentage:40
	});
	assert.equal(message, ":123456N1,40#");
	
};

var testSetPassword = function() {
	
	var message = buildCommandMessage('setPassword', {
		password : "123456",
		newPassword: "456789",
	});
	assert.equal(message, ":123456H456789#");
	
};

var testSetAcc = function() {
	var message = buildCommandMessage('setAcc', {
		password : "123456",
		enabled: true
	});
	assert.equal(message, ":123456T1#");
	
	var message = buildCommandMessage('setAcc', {
		password : "123456",
		enabled: false
	});
	assert.equal(message, ":123456T0#");
};

var testSetListenMode = function() {
	var message = buildCommandMessage('setListenMode', {
		password : "123456",
		enabled: true
	});
	assert.equal(message, ":123456U1#");
	
	var message = buildCommandMessage('setListenMode', {
		password : "123456",
		enabled: false
	});
	assert.equal(message, ":123456U0#");
};
// 
var testSetApnAndServer = function() {
	var message = buildCommandMessage('setApnAndServer', {
		password : "123456",
		ipAddress: "119.122.101.91",
		port:7289,
		apn:"CMNET"
	});
	assert.equal(message, ":123456CCMNET,119.122.101.91:7289#");
};

var testSetApnUserNameAndPassword = function() {
	var message = buildCommandMessage('setApnUserNameAndPassword', {
		password : "123456",
		apnUserName: "internet",
		apnPassword: "internet123"
	});
	assert.equal(message, ":123456Ointernet,internet123#");
};

testSetAuthorizedNumber();
testDeleteAuthorizedNumber();
testLocateOneTime();
testSetContinuousTracking();
testSetSpeedingAlarm();
testSetGeoFence();
testSetTimeZone();
testSetLowBatteryAlarm();
testSetPassword();
testSetAcc();
testSetListenMode();
testSetApnAndServer();
testSetApnUserNameAndPassword();

console.log("done");

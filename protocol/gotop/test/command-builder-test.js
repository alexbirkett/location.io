var assert = require('assert');

var buildCommand = require('../command-builder');

var testSetAuthorizedNumber = function() {
	var message = buildCommand('setAuthorizedNumber', {
		authorizedNumber : "+1555555",
		password : "123456",
		index : 1
	});
	assert.equal(message, ":123456A1,+1555555#");

	assert.throws(function() {
		buildCommand('setAuthorizedNumber', {
			authorizedNumber : "+1555555",
			password : "123456",
			index : 0
		});
	}, Error);
	
	assert.throws(function() {
		buildCommand('setAuthorizedNumber', {
			authorizedNumber : "+1555555",
			password : "123456",
			index : 6
		});
	}, Error);
	
	assert.throws(function() {
		buildCommand('setAuthorizedNumber', {
			authorizedNumber : "1555555",
			password : "123456",
			index : 1
		});
	}, Error);
	
	// missing index
	assert.throws(function() {
		buildCommand('setAuthorizedNumber', {
			authorizedNumber : "+1555555",
			password : "123456"
		});
	}, Error);

	// missing password
	assert.throws(function() {
		buildCommand('setAuthorizedNumber', {
			authorizedNumber : "+1555555",
			index : 1
		});
	}, Error);
	
	
	// missing password
	assert.throws(function() {
		buildCommand('setAuthorizedNumber', {
			password : "123456",
			index : 1
		});
	}, Error);
		
};

var testDeleteAuthorizedNumber = function() {
	var message = buildCommand('deleteAuthorizedNumber', {
		password : "123456",
		index : 2
	});
	assert.equal(message, ":123456A2,D#");
};


var testLocateOneTime = function() {
	var message = buildCommand('locateOneTime', {
		password : "123456",
	});
	assert.equal(message, ":123456F#");
};

var testSetContinuousTracking = function() {
	var message = buildCommand('setContinuousTracking', {
		password : "123456",
		enabled: true,
		interval: "5s"
	});
	assert.equal(message, ":123456M1,005S#");
	
	var message = buildCommand('setContinuousTracking', {
		password : "555555",
		enabled: true,
		interval: "10S"
	});
	assert.equal(message, ":555555M1,010S#");
	

	var message = buildCommand('setContinuousTracking', {
		password : "123456",
		enabled: true,
		interval: "200m"
	});
	assert.equal(message, ":123456M1,200M#");
	
	var message = buildCommand('setContinuousTracking', {
		password : "123456",
		enabled: true,
		interval: "30M"
	});
	assert.equal(message, ":123456M1,030M#");
	
	
	var message = buildCommand('setContinuousTracking', {
		password : "123456",
		enabled: false,
		interval: "1h"
	});
	
	
	var message = buildCommand('setContinuousTracking', {
		password : "123456",
		enabled: false,
		interval: "45H"
	});
	assert.equal(message, ":123456M0,045H#");
	

	assert.throws(function() {
		buildCommand('setContinuousTracking', {
			password : "123456",
			enabled : false,
			interval : "91H"
		});
	}, Error); 
	
	assert.throws(function() {
		buildCommand('setContinuousTracking', {
			password : "123456",
			enabled : false,
			interval : "256S"
		});
	}, Error);
	
	assert.throws(function() {
		buildCommand('setContinuousTracking', {
			password : "123456",
			enabled : false,
			interval : "256m"
		});
	}, Error); 
};



var testSetSpeedingAlarm = function() {

	var message = buildCommand('setSpeedingAlarm', {
		password : "123456",
		speed: 80,
		enabled: true
	});
	assert.equal(message, ":123456J1,080#");


	var message = buildCommand('setSpeedingAlarm', {
		password : "123456",
		speed: 80,
		enabled: false
	});
	assert.equal(message, ":123456J0,080#");
}; 

var testSetGeoFence = function() {

	var message = buildCommand('setGeoFence', {
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
	
	var message = buildCommand('setTimeZone', {
		password : "123456",
		timeZone: "+08"
	});
	assert.equal(message, ":123456L+08#");
	
	var message = buildCommand('setTimeZone', {
		password : "123456",
		timeZone: "-07"
	});
	assert.equal(message, ":123456L-07#");
	
	assert.throws(function() {
		buildCommand('setTimeZone', {
			password : "123456",
			timeZone : "07"
		});
	}, Error);

	
};

var testSetLowBatteryAlarm = function() {
	
	var message = buildCommand('setLowBatteryAlarm', {
		password : "123456",
		enabled: true,
		percentage:40
	});
	assert.equal(message, ":123456N1,40#");
	
};

var testSetPassword = function() {
	
	var message = buildCommand('setPassword', {
		password : "123456",
		newPassword: "456789",
	});
	assert.equal(message, ":123456H456789#");
	
};

var testSetAcc = function() {
	var message = buildCommand('setAcc', {
		password : "123456",
		enabled: true
	});
	assert.equal(message, ":123456T1#");
	
	var message = buildCommand('setAcc', {
		password : "123456",
		enabled: false
	});
	assert.equal(message, ":123456T0#");
};

var testSetListenMode = function() {
	var message = buildCommand('setListenMode', {
		password : "123456",
		enabled: true
	});
	assert.equal(message, ":123456U1#");
	
	var message = buildCommand('setListenMode', {
		password : "123456",
		enabled: false
	});
	assert.equal(message, ":123456U0#");
};
// 
var testSetApnAndServer = function() {
	var message = buildCommand('setApnAndServer', {
		password : "123456",
		ipAddress: "119.122.101.91",
		port:7289,
		apn:"CMNET"
	});
	assert.equal(message, ":123456CCMNET,119.122.101.91:7289#");
};

var testSetApnUserNameAndPassword = function() {
	var message = buildCommand('setApnUserNameAndPassword', {
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

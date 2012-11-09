var parseMessage = require('../parser');
var assert = require('assert');

var CMD_T = "#861785001515349,CMD-T,V,DATE:120903,TIME:160649,LAT:59.9326566N,LOT:010.7875033E,Speed:005.5,X-X-X-X-49-5,000,24202-0ED9-D93B#";

var testCmdT = function() {
	var message = parseMessage(new Buffer(CMD_T)).message;
	
	var expectedMessage = {
		trackerId : '861785001515349',
		type : 'setContinuousTrackingResponse',
		location : {
			available : false,
			timestamp : new Date('2012-09-03T16:06:49.000Z'),
			latitude : 59.9326566,
			longitude : 10.7875033,
			speed : 5.5,
			status : {
				batteryLife : 49,
				gsmSignal : 5
			},
			network : {
				countryCode : 242,
				networkCode : 2,
				locationAreaCode : 3801,
				cellId : 55611
			}
		}
	};
	
	assert.deepEqual(message, expectedMessage);
};

var CMD_X = "#861785001515349,CMD-X#";

var testCmdX = function() {
	var message = parseMessage(new Buffer(CMD_X)).message;
	var expectedMessage = { trackerId: '861785001515349', type: 'heartBeat' };
	assert.deepEqual(message, expectedMessage);
};

var ALM_A = "#861785001515349,ALM-A,V,DATE:120903,TIME:160649,LAT:59.9326566N,LOT:010.7875033E,Speed:005.5,X-X-X-X-82-10,000,24202-0324-0E26#";

var testAlmA = function() {
	var message = parseMessage(new Buffer(ALM_A)).message;
	assert.equal(message.type, 'sosAlarm');
};

var CMD_T_GPS101 = '#353327020115804,CMD-T,A,DATE:090329,TIME:223252,LAT:22.7634066N,LOT:114.3964783E,Speed:000.0,84-20,#';

var testCmdTGPS101 = function() {
	var message = parseMessage(new Buffer(CMD_T_GPS101)).message;
	assert.equal(message.type, 'setContinuousTrackingResponse');
};

var ERROR = '#012896001890042, ERROR!,V,DATE:121107,TIME:210208,LAT:59.9323966N,LOT:010.7906316E,Speed:000.0,X-X-X-X-67-21,000,24202-0EDD-D9EF#';

var testError = function() {
	var message = parseMessage(new Buffer(ERROR)).message;
	assert.equal(message.type, 'error');
};

var ERROR2 = '#012896001890042, ERROR!,A,DATE:121107,TIME:211706,LAT:59.9323316N,LOT:010.7905816E,Speed:000.0,X-X-X-X-67-21,000,24202-0EDD-D9EF#';

var testError2 = function() {
	var message = parseMessage(new Buffer(ERROR)).message;
	assert.equal(message.type, 'error');
};

var CMD_A1 = '#012896001890042,CMD-A1,V,DATE:121107,TIME:211022,LAT:59.9322950N,LOT:010.7906583E,Speed:000.0,X-X-X-X-67-21,000,24202-0EDD-D9EF#';

var testCmdA1 = function() {
	var message = parseMessage(new Buffer(CMD_A1)).message;
	assert.equal(message.type, 'setAuthorizedNumberResponse');
};

var CMD_A1A = '#012896001890042,CMD-A1,V,DATE:121107,TIME:213410,LAT:59.9323683N,LOT:010.7907400E,Speed:000.0,X-X-X-X-66-21,000,24202-0EDD-D9EF#';

var testCmdA1A = function() {
	var message = parseMessage(new Buffer(CMD_A1)).message;
	assert.equal(message.type, 'setAuthorizedNumberResponse');
};

var CMD_F = '#012896001890042,CMD-F,A,DATE:121107,TIME:211352,LAT:59.9322983N,LOT:010.7906366E,Speed:000.0,X-X-X-X-67-21,000,24202-0EDD-D9EF#';

var testCmdF = function() {
	var message = parseMessage(new Buffer(CMD_F)).message;
	assert.equal(message.type, 'oneTimeLocate');
};

var CMD_C = '#012896001890042,CMD-C,A,DATE:121107,TIME:211706,LAT:59.9323316N,LOT:010.7905816E,Speed:000.0,X-X-X-X-67-21,000,24202-0EDD-D9EF#';

var testCmdC = function() {
	var message = parseMessage(new Buffer(CMD_C)).message;
	assert.equal(message.type, 'setApnAndServerResponse');
};

var CMD_M = '#012896001890042,CMD-M,V,DATE:121107,TIME:213410,LAT:59.9323683N,LOT:010.7907400E,Speed:000.0,X-X-X-X-66-21,000,24202-0EDD-D9EF#';

var testCmdM = function() {
	var message = parseMessage(new Buffer(CMD_M)).message;
	assert.equal(message.type, 'setApnAndServerResponse');
};

var CMD_U1 = '#012896001890042,CMD-U1,A,DATE:121107,TIME:215241,LAT:59.9323933N,LOT:010.7907500E,Speed:000.0,X-X-X-X-73-21,000,24202-0EDD-D9EF#';

var testCmdU1 = function() {
	var message = parseMessage(new Buffer(CMD_U1)).message;
	assert.equal(message.type, 'setListenModeResponse');
};

var CMD_N = '#012896001890042,CMD-N,A,DATE:121107,TIME:215617,LAT:59.9322716N,LOT:010.7906750E,Speed:000.0,X-X-X-X-73-22,000,24202-0EDD-D9EF#';

var testCmdN = function() {
	var message = parseMessage(new Buffer(CMD_N)).message;
	assert.equal(message.type, 'setLowBatteryAlarmResponse');
};

var CMD_H = '#012896001890042,CMD-H,A,DATE:121107,TIME:215947,LAT:59.9323000N,LOT:010.7908650E,Speed:000.0,X-X-X-X-73-22,000,24202-0EDD-D9EF#';

var testCmdH = function() {
	var message = parseMessage(new Buffer(CMD_H)).message;
	assert.equal(message.type, 'setModifyPasswordResponse');
};

var CMD_J = "#012896001890042,CMD-J,A,DATE:121107,TIME:221144,LAT:59.9323533N,LOT:010.7906583E,Speed:000.0,X-X-X-X-72-22,000,24202-0EDD-D9EF#";

var testCmdJ = function() {
	var message = parseMessage(new Buffer(CMD_J)).message;
	assert.equal(message.type, 'setSpeedingAlarmResponse');
};

var CMD_L = '#012896001890042,CMD-L,A,DATE:121107,TIME:221314,LAT:59.9323000N,LOT:010.7908633E,Speed:000.0,X-X-X-X-72-22,000,24202-0EDD-D9EF#';

var testCmdL = function() {
	var message = parseMessage(new Buffer(CMD_L)).message;
	assert.equal(message.type, 'setTimeZoneResponse');
};

var MULTIPLE_CMD = CMD_X + CMD_A1 + " " + CMD_F;

var testMultipleCmd = function() {
	var result = parseMessage(new Buffer(MULTIPLE_CMD));
	assert.equal(result.message.type, 'heartBeat');
		
	result = parseMessage(result.buffer);
	assert.equal(result.message.type, 'setAuthorizedNumberResponse');
	 
	result = parseMessage(result.buffer);
	assert.equal(result.message.type, 'oneTimeLocate');
	
	//assert.equal(message.type, 'setTimeZoneResponse');
};

var PARTIAL_MESSAGE = '#012896001890042,CMD-L,A,DATE:121107,TIME:221314,LAT';

var testParitalMessage = function() {
	var buffer = new Buffer(PARTIAL_MESSAGE);
	var result = parseMessage(buffer);
	assert.equal(result.message, undefined);
	assert.equal(result.buffer, buffer);
	
	
}

testCmdT();
testCmdX();
testAlmA();
testCmdTGPS101();
testError();
testError2();
testCmdA1();
testCmdA1A();
testCmdF();
testCmdC();
testCmdM();
testCmdU1();
testCmdN();
testCmdH();
testCmdJ();
testCmdL();
testMultipleCmd();
testParitalMessage();


console.log('done');

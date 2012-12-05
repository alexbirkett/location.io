var parseMessage = require('../parser');
var assert = require('assert');
var vows = require('vows');

var CMD_T = "#861785001515349,CMD-T,V,DATE:120903,TIME:160649,LAT:59.9326566N,LOT:010.7875033E,Speed:005.5,X-X-X-X-49-5,000,24202-0ED9-D93B#";
var CMD_X = "#861785001515349,CMD-X#";
var ALM_A = "#861785001515349,ALM-A,V,DATE:120903,TIME:160649,LAT:59.9326566N,LOT:010.7875033E,Speed:005.5,X-X-X-X-82-10,000,24202-0324-0E26#";
var CMD_T_GPS101 = '#353327020115804,CMD-T,A,DATE:090329,TIME:223252,LAT:22.7634066N,LOT:114.3964783E,Speed:000.0,84-20,#';
var ERROR = '#012896001890042, ERROR!,V,DATE:121107,TIME:210208,LAT:59.9323966N,LOT:010.7906316E,Speed:000.0,X-X-X-X-67-21,000,24202-0EDD-D9EF#';
var ERROR2 = '#012896001890042, ERROR!,A,DATE:121107,TIME:211706,LAT:59.9323316N,LOT:010.7905816E,Speed:000.0,X-X-X-X-67-21,000,24202-0EDD-D9EF#';
var CMD_A1 = '#012896001890042,CMD-A1,V,DATE:121107,TIME:211022,LAT:59.9322950N,LOT:010.7906583E,Speed:000.0,X-X-X-X-67-21,000,24202-0EDD-D9EF#';
var CMD_A1A = '#012896001890042,CMD-A1,V,DATE:121107,TIME:213410,LAT:59.9323683N,LOT:010.7907400E,Speed:000.0,X-X-X-X-66-21,000,24202-0EDD-D9EF#';
var CMD_F = '#012896001890042,CMD-F,A,DATE:121107,TIME:211352,LAT:59.9322983N,LOT:010.7906366E,Speed:000.0,X-X-X-X-67-21,000,24202-0EDD-D9EF#';
var CMD_C = '#012896001890042,CMD-C,A,DATE:121107,TIME:211706,LAT:59.9323316N,LOT:010.7905816E,Speed:000.0,X-X-X-X-67-21,000,24202-0EDD-D9EF#';
var CMD_M = '#012896001890042,CMD-M,V,DATE:121107,TIME:213410,LAT:59.9323683N,LOT:010.7907400E,Speed:000.0,X-X-X-X-66-21,000,24202-0EDD-D9EF#';
var CMD_U1 = '#012896001890042,CMD-U1,A,DATE:121107,TIME:215241,LAT:59.9323933N,LOT:010.7907500E,Speed:000.0,X-X-X-X-73-21,000,24202-0EDD-D9EF#';
var CMD_N = '#012896001890042,CMD-N,A,DATE:121107,TIME:215617,LAT:59.9322716N,LOT:010.7906750E,Speed:000.0,X-X-X-X-73-22,000,24202-0EDD-D9EF#';
var CMD_H = '#012896001890042,CMD-H,A,DATE:121107,TIME:215947,LAT:59.9323000N,LOT:010.7908650E,Speed:000.0,X-X-X-X-73-22,000,24202-0EDD-D9EF#';
var CMD_J = "#012896001890042,CMD-J,A,DATE:121107,TIME:221144,LAT:59.9323533N,LOT:010.7906583E,Speed:000.0,X-X-X-X-72-22,000,24202-0EDD-D9EF#";
var CMD_L = '#012896001890042,CMD-L,A,DATE:121107,TIME:221314,LAT:59.9323000N,LOT:010.7908633E,Speed:000.0,X-X-X-X-72-22,000,24202-0EDD-D9EF#';
var MULTIPLE_CMD = CMD_X + CMD_A1 + CMD_F;
var PARTIAL_MESSAGE = '#012896001890042,CMD-L,A,DATE:121107,TIME:221314,LAT';

vows.describe('gotop').addBatch({
	'parserTests' : {
		'cmdT' : {
			topic : function(banana) {
				parseMessage(new Buffer(CMD_T), this.callback);
			},
			'should be a setContinuousTrackingResponse' : function(err, message, buffer) {
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
				assert.equal(buffer.length, 0);
			}
		},
		'cmdX' : {
			topic : function() {
				parseMessage(new Buffer(CMD_X), this.callback);
			},
			'should be a heartBeat' : function(err, message, buffer) {

				var expectedMessage = {
					trackerId : '861785001515349',
					type : 'heartBeat'
				};

				assert.deepEqual(message, expectedMessage);
				assert.equal(buffer.length, 0);
			}
		},
		'alarmA' : {
			topic : function() {
				parseMessage(new Buffer(ALM_A), this.callback);
			},
			'should be an sosAlarm' : function(err, message, buffer) {

				assert.equal(message.type, 'sosAlarm');
				assert.equal(buffer.length, 0);
			}
		},
		'cmdTGps101' : {
			topic : function() {
				parseMessage(new Buffer(CMD_T_GPS101), this.callback);
			},
			'should be a setContinuousTrackingResponse' : function(err, message, buffer) {
				assert.equal(message.type, 'setContinuousTrackingResponse');
				assert.equal(buffer.length, 0);
			}
		},
		'testError' : {
			topic : function() {
				parseMessage(new Buffer(ERROR), this.callback);
			},
			'should be an error' : function(err, message, buffer) {
				assert.equal(message.type, 'error');
				assert.equal(buffer.length, 0);
			}
		},
		'testError2' : {
			topic : function() {
				parseMessage(new Buffer(ERROR2), this.callback);
			},
			'should be an error' : function(err, message, buffer) {
				assert.equal(message.type, 'error');
				assert.equal(buffer.length, 0);
			}
		},
		'testCmdA1' : {
			topic : function() {
				parseMessage(new Buffer(CMD_A1), this.callback);
			},
			'should be a setAuthorizedNumberResponse' : function(err, message, buffer) {

				assert.equal(message.type, 'setAuthorizedNumberResponse');
				assert.equal(buffer.length, 0);
			}
		},
		'testCmdA1A' : {
			topic : function() {
				parseMessage(new Buffer(CMD_A1), this.callback);
			},
			'should be a setAuthorizedNumberResponse' : function(err, message, buffer) {

				assert.equal(message.type, 'setAuthorizedNumberResponse');
				assert.equal(buffer.length, 0);
			}
		},
		'testCmdF' : {
			topic : function() {
				parseMessage(new Buffer(CMD_F), this.callback);
			},
			'shoud be a oneTimeLocate' : function(err, message, buffer) {

				assert.equal(message.type, 'oneTimeLocate');
				assert.equal(buffer.length, 0);
			}
		},
		'testCmdC' : {
			topic : function() {
				parseMessage(new Buffer(CMD_C), this.callback);
			},
			'should be setApnAndServerResponse' : function(err, message, buffer) {

				assert.equal(message.type, 'setApnAndServerResponse');
				assert.equal(buffer.length, 0);
			}
		},
		/*'testCmdM' : {
		 topic : function() {
		 parseMessage(new Buffer(CMD_M), this.callback);
		 },
		 'testCmdMResult' : function(dataConsumed, message, buffer) {
		 console.log(message);
		 assert.equal(message.type, 'setApnAndServerResponse');
		 assert.equal(dataConsumed, DataConsumedEnum.Yes);
		 assert.equal(buffer.length, 0);
		 }
		 }*/
		'testCmdU' : {
			topic : function() {
				parseMessage(new Buffer(CMD_U1), this.callback);
			},
			'should be a setListenModeResponse' : function(err, message, buffer) {

				assert.equal(message.type, 'setListenModeResponse');
				assert.equal(buffer.length, 0);
			}
		},
		'testCmdN' : {
			topic : function() {
				parseMessage(new Buffer(CMD_N), this.callback);
			},
			'should be a setLowBatteryAlarmResponse' : function(err, message, buffer) {

				assert.equal(message.type, 'setLowBatteryAlarmResponse');
				assert.equal(buffer.length, 0);
			}
		},
		'testCmdH' : {
			topic : function() {
				parseMessage(new Buffer(CMD_H), this.callback);
			},
			'should be a setModifyPasswordResponse' : function(err, message, buffer) {

				assert.equal(message.type, 'setModifyPasswordResponse');
				assert.equal(buffer.length, 0);
			}
		},
		'testCmdJ' : {
			topic : function() {
				parseMessage(new Buffer(CMD_J), this.callback);
			},
			'should be a setSpeedingAlarmResponse' : function(err, message, buffer) {

				assert.equal(message.type, 'setSpeedingAlarmResponse');
				assert.equal(buffer.length, 0);
			}
		},
		'testCmdL' : {
			topic : function() {
				parseMessage(new Buffer(CMD_L), this.callback);
			},
			'should be a setTimeZoneResponse' : function(err, message, buffer) {

				assert.equal(message.type, 'setTimeZoneResponse');
				assert.equal(buffer.length, 0);
			}
		},
		'test multiple frames' : { topic : function() {
				parseMessage(new Buffer(MULTIPLE_CMD), this.callback);
			}, 'after heartbeat': { 
					topic: function(message, buffer) {
					assert.equal(message.type, 'heartBeat');
					assert.notEqual(buffer.length, 0);
					parseMessage(buffer, this.callback);
				},
				'after setAuthorizedNumberResponse' : {
					topic: function(message, buffer) {
						assert.equal(message.type, 'setAuthorizedNumberResponse');
						assert.notEqual(buffer.length, 0);
						parseMessage(buffer, this.callback);
					},
					'after oneTimeLocate': function(err, message, buffer) {
						assert.equal(message.type, 'oneTimeLocate');
						assert.equal(buffer.length, 0);
					}
				}

			}

		},
		'test partial frame' : {
			topic : function() {
				parseMessage(new Buffer(PARTIAL_MESSAGE), this.callback);
			},
			'should return more data required' : function(err, message, buffer) {
				assert.notEqual(buffer.length, 0);
			}
		}
	}
}).export(module);


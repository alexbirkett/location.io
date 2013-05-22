var assert = require('assert');
var vows = require('vows');
var testHelper = require('../../test/test-helper.js');

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


var nextPort = 6141;

process.on('uncaughtException', function (err) {
    console.log('Caught exception: ' + err.stack);
});

var getNextPort = function () {
    return nextPort++;
};

var sendData = function () {
    var args = [getNextPort];
    args = args.concat(Array.prototype.slice.call(arguments, 0));
    testHelper.testUpMessage.apply(this, args);
};

var createTests = function (sliceLength) {
    return {
        'parserTests': {
            'cmdT': {
                topic: function () {
                    sendData(CMD_T, 0, sliceLength, this.callback);
                },
                'should not reutrn err': function (err, message, returnedData) {
                    assert.isNull(err);
                },
                'should be a setContinuousTrackingResponse': function (err, message, returnedData) {
                    var expectedMessage = {
                        trackerId: '861785001515349',
                        type: 'setContinuousTrackingResponse',
                        location: {
                            available: false,
                            timestamp: new Date('2012-09-03T16:06:49.000Z'),
                            latitude: 59.9326566,
                            longitude: 10.7875033,
                            speed: 5.5,
                            status: {
                                batteryLife: 49,
                                gsmSignal: 5
                            },
                            network: {
                                countryCode: 242,
                                networkCode: 2,
                                locationAreaCode: 3801,
                                cellId: 55611
                            }
                        }
                    };

                    assert.deepEqual(message, expectedMessage);
                }
            },
            'cmdX': {
                topic: function () {
                    sendData(CMD_X, 0, sliceLength, this.callback);
                },
                'should not reutrn err': function (err, message, returnedData) {
                    assert.isNull(err);
                },
                'should be a heartBeat': function (err, message, returnedData) {

                    var expectedMessage = {
                        trackerId: '861785001515349',
                        type: 'heartBeat'
                    };

                    assert.deepEqual(message, expectedMessage);
                }
            },
            'alarmA': {
                topic: function () {
                    sendData(ALM_A, 0, sliceLength, this.callback);
                },
                'should not reutrn err': function (err, message, returnedData) {
                    assert.isNull(err);
                },
                'should be an sosAlarm': function (err, message, returnedData) {
                    assert.equal(message.type, 'sosAlarm');
                }
            },
            'cmdTGps101': {
                topic: function () {
                    sendData(CMD_T_GPS101, 0, sliceLength, this.callback);
                },
                'should not reutrn err': function (err, message, returnedData) {
                    assert.isNull(err);
                },
                'should be a setContinuousTrackingResponse': function (err, message, returnedData) {
                    assert.equal(message.type, 'setContinuousTrackingResponse');
                }
            },
            'testError': {
                topic: function () {
                    sendData(ERROR, 0, sliceLength, this.callback);
                },
                'should not reutrn err': function (err, message, returnedData) {
                    assert.isNull(err);
                },
                'should be an error': function (err, message, returnedData) {
                    assert.equal(message.type, 'error');
                }
            },
            'testError2': {
                topic: function () {
                    sendData(ERROR2, 0, sliceLength, this.callback);
                },
                'should not reutrn err': function (err, message, returnedData) {
                    assert.isNull(err);
                },
                'should be an error': function (err, message, returnedData) {
                    assert.equal(message.type, 'error');
                }
            },
            'testCmdA1': {
                topic: function () {
                    sendData(CMD_A1, 0, sliceLength, this.callback);
                },
                'should not reutrn err': function (err, message, returnedData) {
                    assert.isNull(err);
                },
                'should be a setAuthorizedNumberResponse': function (err, message, returnedData) {
                    assert.equal(message.type, 'setAuthorizedNumberResponse');
                }
            },
            'testCmdF': {
                topic: function () {
                    sendData(CMD_F, 0, sliceLength, this.callback);
                },
                'should not reutrn err': function (err, message, returnedData) {
                    assert.isNull(err);
                },
                'shoud be a oneTimeLocate': function (err, message, returnedData) {
                    assert.equal(message.type, 'oneTimeLocate');
                }
            },
            'testCmdC': {
                topic: function () {
                    sendData(CMD_C, 0, sliceLength, this.callback);
                },
                'should not reutrn err': function (err, message, returnedData) {
                    assert.isNull(err);
                },
                'should be setApnAndServerResponse': function (err, message, returnedData) {
                    assert.equal(message.type, 'setApnAndServerResponse');
                }
            },
            'testCmdU': {
                topic: function () {
                    sendData(CMD_U1, 0, sliceLength, this.callback);
                },
                'should not reutrn err': function (err, message, returnedData) {
                    assert.isNull(err);
                },
                'should be a setListenModeResponse': function (err, message, returnedData) {
                    assert.equal(message.type, 'setListenModeResponse');
                }
            },
            'testCmdN': {
                topic: function () {
                    sendData(CMD_N, 0, sliceLength, this.callback);
                },
                'should not reutrn err': function (err, message, returnedData) {
                    assert.isNull(err);
                },
                'should be a setLowBatteryAlarmResponse': function (err, message, returnedData) {
                    assert.equal(message.type, 'setLowBatteryAlarmResponse');
                }
            },
            'testCmdH': {
                topic: function () {
                    sendData(CMD_H, 0, sliceLength, this.callback);
                },
                'should not reutrn err': function (err, message, returnedData) {
                    assert.isNull(err);
                },
                'should be a setModifyPasswordResponse': function (err, message, returnedData) {
                    assert.equal(message.type, 'setModifyPasswordResponse');
                }
            },
            'testCmdJ': {
                topic: function () {
                    sendData(CMD_J, 0, sliceLength, this.callback);
                },
                'should not reutrn err': function (err, message, returnedData) {
                    assert.isNull(err);
                },
                'should be a setSpeedingAlarmResponse': function (err, message, returnedData) {
                    assert.equal(message.type, 'setSpeedingAlarmResponse');
                }
            },
            'testCmdL': {
                topic: function () {
                    sendData(CMD_L, 0, sliceLength, this.callback);
                },
                'should not reutrn err': function (err, message, returnedData) {
                    assert.isNull(err);
                },
                'should be a setTimeZoneResponse': function (err, message, returnedData) {
                    assert.equal(message.type, 'setTimeZoneResponse');
                }
            }
        }
    };
};


var suite = vows.describe('gotop-up-message-tests');

var batch = {};
for (var i = 1; i < 150; i++) {
    batch['test with slice length ' + i] = createTests(i);
}
suite.addBatch(batch);

suite.export(module); // Export the Suite


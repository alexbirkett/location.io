var assert = require('assert');
var vows = require('vows');
var testHelper = require('../../test/test-helper.js');

var nextPort = 3141;

process.on('uncaughtException', function (err) {
    console.log('Caught exception: ' + err.stack);
});

var CMD_T = "#861785001515349,CMD-T,V,DATE:120903,TIME:160649,LAT:59.9326566N,LOT:010.7875033E,Speed:005.5,X-X-X-X-49-5,000,24202-0ED9-D93B#";

var getNextPort = function () {
    return nextPort++;
};

var testDownMessage = function () {
    var args = [getNextPort, CMD_T, undefined];
    args = args.concat(Array.prototype.slice.call(arguments, 0));
    testHelper.testDownMessage.apply(this, args);
};

vows.describe('gotop down-message-tests').addBatch({
    'test setAuthorizedNumber': {
        'test with valid params': {
            topic: function () {
                var params = {
                    authorizedNumber: "+1555555",
                    password: "123456",
                    index: 1
                };
                testDownMessage("setAuthorizedNumber", params, 19, undefined, this.callback);
            },
            'should not fail with error': function (err, downMessageReceivedByTracker) {
                assert.isNull(err);
            },
            'message should be received by tracker': function (err, downMessageReceivedByTracker) {
                assert.equal(downMessageReceivedByTracker, ":123456A1,+1555555#");
            }
        },
        'test with invalid index (too low)': {
            topic: function () {
                var params = {
                    authorizedNumber: "+1555555",
                    password: "123456",
                    index: 0
                };
                testDownMessage("setAuthorizedNumber", params, 19, undefined, this.callback);
            },
            'should fail with error': function (err, downMessageReceivedByTracker) {
                assert.isNotNull(err);
            }
        },
        'test with invalid index (too high)': {
            topic: function () {
                var params = {
                    authorizedNumber: "+1555555",
                    password: "123456",
                    index: 6
                };
                testDownMessage("setAuthorizedNumber", params, 19, undefined, this.callback);
            },
            'should fail with error': function (err, downMessageReceivedByTracker) {
                assert.isNotNull(err);
            }
        },
        'test with invalid phone number': {
            topic: function () {
                var params = {
                    authorizedNumber: "1555555",
                    password: "123456",
                    index: 6
                };
                testDownMessage("setAuthorizedNumber", params, 19, undefined, this.callback);
            },
            'should fail with error': function (err, downMessageReceivedByTracker) {
                assert.isNotNull(err);
            }
        },
        'test with missing index': {
            topic: function () {
                var params = {
                    authorizedNumber: "+1555555",
                    password: "123456"
                };
                testDownMessage("setAuthorizedNumber", params, 19, undefined, this.callback);
            },
            'should fail with error': function (err, downMessageReceivedByTracker) {
                assert.isNotNull(err);
            }
        },
        'test with missing password': {
            topic: function () {
                var params = {
                    authorizedNumber: "+1555555",
                    index: 1
                };
                testDownMessage("setAuthorizedNumber", params, 19, undefined, this.callback);
            },
            'should fail with error': function (err, downMessageReceivedByTracker) {
                assert.isNotNull(err);
            }
        }
    },
    'test testDeleteAuthorizedNumber': {
        'test with valid params': {
            topic: function () {
                var params = {
                    password: "123456",
                    index: 2
                };
                testDownMessage("deleteAuthorizedNumber", params, 12, undefined, this.callback);
            },
            'should not fail with error': function (err, downMessageReceivedByTracker) {
                assert.isNull(err);
            },
            'message should be received by tracker': function (err, downMessageReceivedByTracker) {
                assert.equal(downMessageReceivedByTracker, ":123456A2,D#");
            }
        }
    },
    'test testLocateOneTime': {
        'test with valid params': {
            topic: function () {
                var params = {
                    password: "123456"
                };
                testDownMessage("locateOneTime", params, 9, undefined, this.callback);
            },
            'should not fail with error': function (err, downMessageReceivedByTracker) {
                assert.isNull(err);
            },
            'message should be received by tracker': function (err, downMessageReceivedByTracker) {
                assert.equal(downMessageReceivedByTracker, ":123456F#");
            }
        }
    },
    'test testSetContinuousTracking': {
        'test with 5s interval': {
            topic: function () {
                var params = {
                    password: "123456",
                    enabled: true,
                    interval: "5s"
                };
                testDownMessage("setContinuousTracking", params, 15, undefined, this.callback);
            },
            'should not fail with error': function (err, downMessageReceivedByTracker) {
                assert.isNull(err);
            },
            'message should be received by tracker': function (err, downMessageReceivedByTracker) {
                assert.equal(downMessageReceivedByTracker, ":123456M1,005S#");
            }
        },
        'test with 10s interval': {
            topic: function () {
                var params = {
                    password: "555555",
                    enabled: true,
                    interval: "10S"
                };
                testDownMessage("setContinuousTracking", params, 15, undefined, this.callback);
            },
            'should not fail with error': function (err, downMessageReceivedByTracker) {
                assert.isNull(err);
            },
            'message should be received by tracker': function (err, downMessageReceivedByTracker) {
                assert.equal(downMessageReceivedByTracker, ":555555M1,010S#");
            }
        },
        'test with 200m interval': {
            topic: function () {
                var params = {
                    password: "123456",
                    enabled: true,
                    interval: "200m"
                };
                testDownMessage("setContinuousTracking", params, 15, undefined, this.callback);
            },
            'should not fail with error': function (err, downMessageReceivedByTracker) {
                assert.isNull(err);
            },
            'message should be received by tracker': function (err, downMessageReceivedByTracker) {
                assert.equal(downMessageReceivedByTracker, ":123456M1,200M#");
            }
        },
        'test with 30M interval': {
            topic: function () {
                var params = {
                    password: "123456",
                    enabled: true,
                    interval: "30M"
                };
                testDownMessage("setContinuousTracking", params, 15, undefined, this.callback);
            },
            'should not fail with error': function (err, downMessageReceivedByTracker) {
                assert.isNull(err);
            },
            'message should be received by tracker': function (err, downMessageReceivedByTracker) {
                assert.equal(downMessageReceivedByTracker, ":123456M1,030M#");
            }
        },
        'test with 1h interval': {
            topic: function () {
                var params = {
                    password: "123456",
                    enabled: false,
                    interval: "1h"
                };
                testDownMessage("setContinuousTracking", params, 15, undefined, this.callback);
            },
            'should not fail with error': function (err, downMessageReceivedByTracker) {
                assert.isNull(err);
            },
            'message should be received by tracker': function (err, downMessageReceivedByTracker) {
                assert.equal(downMessageReceivedByTracker, ":123456M0,001H#");
            }
        },
        'test with 45H interval': {
            topic: function () {
                var params = {
                    password: "123456",
                    enabled: false,
                    interval: "45H"
                };
                testDownMessage("setContinuousTracking", params, 15, undefined, this.callback);
            },
            'should not fail with error': function (err, downMessageReceivedByTracker) {
                assert.isNull(err);
            },
            'message should be received by tracker': function (err, downMessageReceivedByTracker) {
                assert.equal(downMessageReceivedByTracker, ":123456M0,045H#");
            }
        }
    },
    'test setSpeedingAlarm': {
        'test with valid params (enabled)': {
            topic: function () {
                var params = {
                    password: "123456",
                    speed: 80,
                    enabled: true
                };
                testDownMessage("setSpeedingAlarm", params, 14, undefined, this.callback);
            },
            'should not fail with error': function (err, downMessageReceivedByTracker) {
                assert.isNull(err);
            },
            'message should be received by tracker': function (err, downMessageReceivedByTracker) {
                assert.equal(downMessageReceivedByTracker, ":123456J1,080#");
            }
        },
        'test with valid params (disabled)': {
            topic: function () {
                var params = {
                    password: "123456",
                    speed: 80,
                    enabled: false
                };
                testDownMessage("setSpeedingAlarm", params, 14, undefined, this.callback);
            },
            'should not fail with error': function (err, downMessageReceivedByTracker) {
                assert.isNull(err);
            },
            'message should be received by tracker': function (err, downMessageReceivedByTracker) {
                assert.equal(downMessageReceivedByTracker, ":123456J0,080#");
            }
        }
    },
    'test setGeoFence': {
        'test with valid params': {
            topic: function () {
                var params = {
                    password: "123456",
                    index: 1,
                    enabled: true,
                    exit: true,
                    maxLatitude: 51.193125,
                    minLongitude: 9.21575,
                    minLatitude: 50.403097,
                    maxLongitude: 11.019925
                };
                testDownMessage("setGeoFence", params, 53, undefined, this.callback);
            },
            'should not fail with error': function (err, downMessageReceivedByTracker) {
                assert.isNull(err);
            },
            'message should be received by tracker': function (err, downMessageReceivedByTracker) {
                assert.equal(downMessageReceivedByTracker, ":123456I1,1,1,51113525N009125670E50241115N011011173E#");
            }
        }
    },
    'test setTimeZone': {
        'test with +08': {
            topic: function () {
                var params = {
                    password: "123456",
                    timeZone: "+08"
                };
                testDownMessage("setTimeZone", params, 12, undefined, this.callback);
            },
            'should not fail with error': function (err, downMessageReceivedByTracker) {
                assert.isNull(err);
            },
            'message should be received by tracker': function (err, downMessageReceivedByTracker) {
                assert.equal(downMessageReceivedByTracker, ":123456L+08#");
            }
        },
        'test with -07': {
            topic: function () {
                var params = {
                    password: "123456",
                    timeZone: "-07"
                };
                testDownMessage("setTimeZone", params, 12, undefined, this.callback);
            },
            'should not fail with error': function (err, downMessageReceivedByTracker) {
                assert.isNull(err);
            },
            'message should be received by tracker': function (err, downMessageReceivedByTracker) {
                assert.equal(downMessageReceivedByTracker, ":123456L-07#");
            }
        },
        'test with invalid timezone': {
            topic: function () {
                var params = {
                    password: "123456",
                    timeZone: "07"
                };
                testDownMessage("setTimeZone", params, 12, undefined, this.callback);
            },
            'should fail with error': function (err, downMessageReceivedByTracker) {
                assert.isNotNull(err);
            }
        }
    },
    'test setLowBatteryAlarm': {
        'test with valid params': {
            topic: function () {
                var params = {
                    password: "123456",
                    enabled: true,
                    percentage: 40
                };
                testDownMessage("setLowBatteryAlarm", params, 13, undefined, this.callback);
            },
            'should not fail with error': function (err, downMessageReceivedByTracker) {
                assert.isNull(err);
            },
            'message should be received by tracker': function (err, downMessageReceivedByTracker) {
                assert.equal(downMessageReceivedByTracker, ":123456N1,40#");
            }
        }
    },
    'test setPassword': {
        'test with valid params': {
            topic: function () {
                var params = {
                    password: "123456",
                    newPassword: "456789"
                };
                testDownMessage("setPassword", params, 15, undefined, this.callback);
            },
            'should not fail with error': function (err, downMessageReceivedByTracker) {
                assert.isNull(err);
            },
            'message should be received by tracker': function (err, downMessageReceivedByTracker) {
                assert.equal(downMessageReceivedByTracker, ":123456H456789#");
            }
        }
    },
    'test setAcc': {
        'test enabled': {
            topic: function () {
                var params = {
                    password: "123456",
                    enabled: true
                };
                testDownMessage("setAcc", params, 10, undefined, this.callback);
            },
            'should not fail with error': function (err, downMessageReceivedByTracker) {
                assert.isNull(err);
            },
            'message should be received by tracker': function (err, downMessageReceivedByTracker) {
                assert.equal(downMessageReceivedByTracker, ":123456T1#");
            }
        },
        'test disabled': {
            topic: function () {
                var params = {
                    password: "123456",
                    enabled: false
                };
                testDownMessage("setAcc", params, 10, undefined, this.callback);
            },
            'should not fail with error': function (err, downMessageReceivedByTracker) {
                assert.isNull(err);
            },
            'message should be received by tracker': function (err, downMessageReceivedByTracker) {
                assert.equal(downMessageReceivedByTracker, ":123456T0#");
            }
        }
    },
    'test setListenMode': {
        'test enabled': {
            topic: function () {
                var params = {
                    password: "123456",
                    enabled: true
                };
                testDownMessage("setListenMode", params, 10, undefined, this.callback);
            },
            'should not fail with error': function (err, downMessageReceivedByTracker) {
                assert.isNull(err);
            },
            'message should be received by tracker': function (err, downMessageReceivedByTracker) {
                assert.equal(downMessageReceivedByTracker, ":123456U1#");
            }
        },
        'test disabled': {
            topic: function () {
                var params = {
                    password: "123456",
                    enabled: false
                };
                testDownMessage("setListenMode", params, 10, undefined, this.callback);
            },
            'should not fail with error': function (err, downMessageReceivedByTracker) {
                assert.isNull(err);
            },
            'message should be received by tracker': function (err, downMessageReceivedByTracker) {
                assert.equal(downMessageReceivedByTracker, ":123456U0#");
            }
        }
    },
    'test setApnAndServer': {
        'test with valid params': {
            topic: function () {
                var params = {
                    password: "123456",
                    ipAddress: "119.122.101.91",
                    port: 7289,
                    apn: "CMNET"
                };
                testDownMessage("setApnAndServer", params, 34, undefined, this.callback);
            },
            'should not fail with error': function (err, downMessageReceivedByTracker) {
                assert.isNull(err);
            },
            'message should be received by tracker': function (err, downMessageReceivedByTracker) {
                assert.equal(downMessageReceivedByTracker, ":123456CCMNET,119.122.101.91:7289#");
            }
        }
    },
    'test setApnUserNameAndPassword': {
        'test with valid params': {
            topic: function () {
                var params = {
                    password: "123456",
                    apnUserName: "internet",
                    apnPassword: "internet123"
                };
                testDownMessage("setApnUserNameAndPassword", params, 29, undefined, this.callback);
            },
            'should not fail with error': function (err, downMessageReceivedByTracker) {
                assert.isNull(err);
            },
            'message should be received by tracker': function (err, downMessageReceivedByTracker) {
                assert.equal(downMessageReceivedByTracker, ":123456Ointernet,internet123#");
            }
        }
    }
}).export(module);

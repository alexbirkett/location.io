var constants = require('./constants');

var capabilities = {
	message: {},
	commands: {}
};

var trackerIdParameter = {
	pattern: ""
};

var alarmTypeParameter = {
	pattern: "vehiclePowerOff|accident|sos|vehicleAlarm|underSpeed|geoFence|overSpeed|movement"
};

var timePeriodParameter = {
	type: "text",
	pattern: "^[0-9]{1,3}[s|S|m|M|h|H]$"
};

var speedParameter = {
}

capabilities.commands[constants.commands.ANSWER_HANDSHAKE_SIGNAL_MESSAGE] = {
	parameters : {
		trackerId : trackerIdParameter
	}
}; 

capabilities.commands[constants.commands.DEVICE_LOGIN_RESPONSE_MESSAGE] = {
	parameters : {
		trackerId : trackerIdParameter
		
	}
};

capabilities.commands[constants.commands.SAME_TIME_CONTINUES_FEEDBACK_CONFIGURE] = {
	parameters : {
		trackerId : trackerIdParameter,
		enabled : {
			type:"boolean"
		},
		interval: timePeriodParameter,
		duration: timePeriodParameter
	}
};

capabilities.commands[constants.commands.ANSWER_ALARM_MESSAGE] = {
	parameters : {
		trackerId : trackerIdParameter,
		alarmType : alarmTypeParameter
	}
};

capabilities.commands[constants.commands.ONE_TIME_ENQUIRY_MESSAGE] = {
	parameters : {
		trackerId : trackerIdParameter
	}
};

capabilities.commands[constants.commands.SETTING_VEHICLE_HIGH_AND_LOW_LIMIT_SPEED] = {
	parameters : {
		trackerId : trackerIdParameter,
		minSpeed: speedParameter,
		maxSpeed: speedParameter
	}
};

capabilities.commands[constants.commands.CIRCUIT_CONTROL_SIGNAL] = {
	parameters : {
		trackerId : trackerIdParameter,
		enabled: {
			type: "boolean"
		}
	}
};

capabilities.commands[constants.commands.OIL_CONTROL_SINGLE] = {
	parameters : {
		trackerId : trackerIdParameter,
		enabled: {
			type: "boolean"
		}
	}
};

capabilities.commands[constants.commands.CONTROL_THE_RESTARTED_MESSAGE_OF_THE_DEVICE] = {
	parameters : {
		trackerId : trackerIdParameter
	}
};

capabilities.commands[constants.commands.SET_ACC_OPEN_SENDING_DATA_INTERVALS] = {
	parameters : {
		trackerId : trackerIdParameter,
		interval: timePeriodParameter
	}
};

capabilities.commands[constants.commands.SET_ACC_CLOSE_SENDING_DATA_INTERVALS] = {
	parameters : {
		trackerId : trackerIdParameter,
		interval: timePeriodParameter
	}
};


capabilities.commands[constants.commands.SETTING_GEO_FENCE_MESSAGE] = {
	parameters : {
		trackerId : trackerIdParameter,
		enabled : {
			type : "boolean"
		},
		maxLatitude : {
			type : "text"
		},
		minLongitude : {
			type : "text"
		},
		minLatitude : {
			type : "text"
		},
		maxLongitude : {
			type : "text"
		}
	}
}; 

module.exports = capabilities;

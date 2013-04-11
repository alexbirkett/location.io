
module.exports.messages  = {
	HANDSHAKE_SIGNAL_MESSAGE : "handshakeSignalMessage",
	
	LOGIN_MESSAGE:"loginMessage",
	//  called 'Response to set up passing back the isochronal and continuous message.' in the 1.8 version of the document
	CONTINUOUS_ANSWER_SETTING_ISOCHRONOUS_FEEDBACK_MESSAGE: "continuousAnswerSettingIsochronousFeedbackMessage",
	
	ALARM_MESSAGE:"alarmMessage",
	
	// called 'Answer to Message of calling the roll.' in the 1.8 version of the document
	ANSWER_CALLING_MESSAGE: "answerCallingMessage",
	
	// called 'Isochronous and continues feedback message' in the 1.8 vesion of the document
	ISOCHRONOUS_FOR_CONTINUES_FEEDBACK_MESSAGE: "Isochronous for continues feedback message",
	
	// called 'Continuously passing back ending message' in the 1.8 version of the document
	CONTINUES_FEEDBACK_ENDING_MESSAGE: "continuesFeedbackEndingMessage",
	
	// called 'Response to set up vehicle max and min speed' in the 1.8 version of the document
	SETUP_THE_SPEED_OF_THE_CAR: "setupTheSpeedOfTheCar",
	
	// called 'Response to circuit Control' in the 1.8 version of the document
	CONTROL_CIRCUIT: "controlCircuit",
	
	// called 'Response to oil Control' in the 1.8 version of the document
	CONTROL_OIL: "controlOil",
	
	// called 'Answer to the restarted message of the device' in the 1.8 version of the document
	ANSWER_THE_RESTARTED_MESSAGE_OF_THE_DEVICE: "answerTheRestartedMessageOfTheDevice",
	
	// called 'Answer to Setting ACC open data intervals' in the 1.8 version of the document
	ANSWER_THE_SETTING_ACC_OPEN_SENDING_DATA_INTERVALS: "answerTheSettingAccOpenSendingDataIntervals",
	
	// called 'Answer to Setting ACC close sending data intervals' in the 1.8 version of the document
	ANSWER_THE_SETTING_ACC_CLOSE_SENDING_DATA_INTERVALS: "answerTheSettingAccCloseSendingDataIntervals",
	
	// called 'Answer to Setting Geo-fence Messages in the 1.8 version of the document
	ANSWER_THE_SETTING_GEO_FENCE_MESSAGE: "answerTheSettingGeoFenceMessage"

};


module.exports.messageAcks = {
	ANSWER_HANDSHAKE_SIGNAL_MESSAGE: "answerHandshakeSignalMessage",
	DEVICE_LOGIN_RESPONSE_MESSAGE: "deviceLoginResponseMessage",
	ANSWER_ALARM_MESSAGE: "answerAlarmMessage"
};

module.exports.commands  = {
	// These names are taken 'as is' from the 1.5 version of the protocol document
	SAME_TIME_CONTINUES_FEEDBACK_CONFIGURE: "sameTimeContinuesFeedbackConfigure",
	ONE_TIME_ENQUIRY_MESSAGE: "oneTimeEnquiryMessage",
	SETTING_VEHICLE_HIGH_AND_LOW_LIMIT_SPEED: "settingVehicleHighAndLowLimitSpeed",
	CIRCUIT_CONTROL_SIGNAL: "circuitControlSignal",
	
	// yes, it's really called 'oil control single' in the 1.5 version of the document
	OIL_CONTROL_SINGLE: "oilControlSingle",
	CONTROL_THE_RESTARTED_MESSAGE_OF_THE_DEVICE: "controlTheRestartedMessageOfTheDevice",
	SET_ACC_OPEN_SENDING_DATA_INTERVALS: "setAccOpenSendingDataIntervals",
	SET_ACC_CLOSE_SENDING_DATA_INTERVALS: "setAccCloseSendingDataIntervals",
	SETTING_GEO_FENCE_MESSAGE: "settingGeoFenceMessage"
};


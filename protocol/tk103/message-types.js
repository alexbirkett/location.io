var messageTypes = {

    'P00': 'handshakeSignalMessage',
    'P05': 'loginMessage',
    'S08': 'configureUpdateInterval',
    'O01': 'alarmMessage',
    'P04': 'requestLocation',
    'R00': 'locationUpdate',
    'R02': 'updatesEnding',
    'P12': 'configureSpeedAlert',
    'V00': 'configureSwitch0',
    'V01': 'configureSwitch1',
    'T00': 'restartDevice',
    'R05': 'configureUpdateIntervalWhenAccOpen',
    'R06': 'configureUpdateIntervalWhenAccClosed',
    'U00': 'configureGeofence'
    /*   'R03': ['obtainTheTerminalLocationMessage', gpsMessageOnlyParse, 'AR03'],
     'S20': ['responseToMonitoringCommands'],
     'P02': ['answerToSettingUpTheTerminalIPAddressAndPort'],
     'P03': ['answerToSettingAPNMessage'],
     'P01': ['responseToReadingTheTerminalVersionMessage', responseToReadingTheTerminalVersionMessage],
     'S21': ['responseToCancelingAllAlarmMessages'],
     'S04': ['answerToClearingMileageMessages'],
     'S05': ['answerToStartingTheUpgradeMessages'],
     'S06': ['answerToInitializeMileageMessage'],
     'S23': ['answerToCenterSendsShortMessagesToThedispatchingScreen'],
     'R04': ['dispatchScreenSendsAShortMessageToTheCenter', dispatchScreenSendsAShortMessageToTheCenterParse, 'AS07'],
     'S09': ['responseToCenterSendAnInstantMessageToTheAdvertisingScreen'],
     'R01': ['compensationDataReturnMessages', gpsMessageOnlyParse],
     'Y01': ['answerToRequestPhotoTakingMessages', notImplemented],
     'Y02': ['sendThePictureDataPacketsMessages', notImplemented],
     'P16': ['answerToDownloadingGroupNumbers', answerToGroupNumbersParse],
     'P17': ['answerToCancelingGroupNumbers', answerToGroupNumbersParse],
     'P18': ['uploadGroupNumbers',uploadGroupNumbersParse, 'AP19'],
     'O02': ['alarmForDataOffsetAndMessagesReturn', parseAlarmMessage]*/
};

module.exports = function (messageCode) {
    return messageTypes[messageCode];
};

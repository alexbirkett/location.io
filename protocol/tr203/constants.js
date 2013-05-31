
var constants = {
    'COMMAND_HEADERS' : {
        'WRITE_SETTING':'GSS',
        'REPORT_SETTING':'GSs',
        'WRITE_GEO_FENCE_PARAMETER':'GSG',
        'REPORT_GEO_FENCE_PARAMETER':'GSg',
        'ACTION_COMMAND': 'GSC',
        'POSITION_AND_STATUS_REPORT_FORMAT_0': 'GSr',
        'POSITION_AND_STATUS_REPORT_FORMAT_1': 'GSh'
    },
    'MESSAGE_PACKET_CONTROL': {
        'MIDDLE_OF_MESSAGE': '0',
        'START_OF_MESSAGE': '1',
        'END_OF_MESSAGE': '2',
        'ONE_PACKET_MESSAGE': '3'
    },
    COMMAND_CODEWORD: {
        'SET_STANDBY_MODE': 'M7',
        'SET_PERIODIC_MODE': 'M2',
        'SET_ON_LINE_MODE': 'M3',
        'SET_MOTION_MODE': 'M4',
        'SET_PARKING_MODE': 'M6',
        'SET_SLEEPING_MODE': 'M1',
        'SET_OFF_MODE': 'M8',
        'SET_TIMER': 'N0',
        'PING_DEVICE': 'N1',
        'ENABLE_VOICE_MONITOR': 'N4',
        'ENABLE_GEO_FENCE': 'N6',
        'DISABLE_GEO_FENCE': 'N7',
        'ENABLE_DATA_LOGGER': 'N8',
        'DISABLE_DATA_LOGGER': 'N9',
        'DISMISS_SOS_ALARM': 'Na',
        'DISMISS_PARKING_ALARM': 'Nb',
        'DISMISS_SLEEPING_ALARM': 'Nc',
        'DISMISS_GEO_FENCE_ALARM': 'Ne',
        'DISMISS_LOW_BATTERY_ALARM': 'Nh',
        'DISMISS_ALL_ALARM': 'Ni',
        'READ_CONFIGURATION': 'L1',
        'READ_GEO_FENCE': 'L3',
        'MAKE_TR_203_CONNECT_TO_SERVER': 'L4',
        'DISCONNECT_FROM_SERVER': 'L5'
    }
};



module.exports = constants;
// Commands, message acks start with A, Messages command acks with B


// Up message
// Messages
// BP00 ? (Handshake signal Message)
// BP05 Login message (Login Message)
// BO01 Alarm message (Alarm Message)
// BR00 Location update (Isochronous for continues feedback message)
// BR02 ? (Continues feedback ending message)


// Command acks
// ACK  COMMAND ACKED
// BS08 (AR00) (Continuous answer setting isochronous feedback message)
// BP04 (AP00) (Answer Calling Message)
// BP12 (AP12) (Setup the spped of the car)
// BV00 (AV00) (Control circuit)
// BV01 (AV01) (Control oil)  could this be a bug in the document?
// BT00 (AT00) (Answer the restarted message of the device)
// BR05 (AR05) (Answer the Setting ACC open sending data intervals)
// BR06 (AR06) (Answer the Setting ACC close sending data intervals)
// BU00 (AX05) (Answer the Setting Geo-fence Message)

// Down message
// Commands
// AR00 configure update interval (Same time continues feedback configure)
// AP00 request location (one time enquiry message)
// AP12 configure speed alert (Setting vehicle high and low limit speed)
// AV00 configure switch 0 (Circuit control signal)
// AV01 configure switch 1 (Oil control single)
// AT00 restart device
// AR05 configure update interval when ACC open? (Set ACC open sending data intervals)
// AR06 configure update interval when ACC closed? (Set ACC close sending data intervals)
// AX05 configure geofence (Setting Geo-fence Message)

// Message acks
// AP01 (BP00) handshake ack
// AP05 (BP05) login ack
// AS01 (BO01) answer alarm message
// 

// One time enqiry message AP00 -> BP04
// 

var trackerIdParameter = {
    pattern: ''
};

var timePeriodParameter = {
    type: "text",
    pattern: "^[0-9]{1,3}[s|S|m|M|h|H]$"
};

var speedParameter = {
};

module.exports =  {
    // AR00 (BS08)
    configureUpdateInterval: {
        parameters: {
            trackerId: trackerIdParameter,
            enabled: {
                type: 'boolean'
            },
            interval: timePeriodParameter,
            duration: timePeriodParameter
        }
    },
    // AP00 (BP04)
    requestLocation: {
        parameters: {
            trackerId: trackerIdParameter
        }
    },
    // AP12 (BP12)
    configureSpeedAlert: {
        parameters: {
            trackerId: trackerIdParameter,
            minSpeed: speedParameter,
            maxSpeed: speedParameter
        }
    },
    // AV00 (BV00)
    configureSwitch0: {
        parameters: {
            trackerId: trackerIdParameter,
            enabled: {
                type: "boolean"
            }
        }
    },
    // AV01 (BV01)
    configureSwitch1: {
        parameters: {
            trackerId: trackerIdParameter,
            enabled: {
                type: "boolean"
            }
        }
    },
    // AT00 (BT00)
    restartDevice: {
        parameters: {
            trackerId: trackerIdParameter
        }
    },
    // AR05 (BR05)
    configureUpdateIntervalWhenAccOpen: {
        parameters: {
            trackerId: trackerIdParameter,
            interval: timePeriodParameter
        }
    },
    // AR06 (BR06)
    configureUpdateIntervalWhenAccClosed: {
        parameters: {
            trackerId: trackerIdParameter,
            interval: timePeriodParameter
        }
    },
    // AX05 (BU00) configure geofence (Setting Geo-fence Message)
    configureGeofence: {
        parameters: {
            trackerId: trackerIdParameter,
            enabled: {
                type: "boolean"
            },
            maxLatitude: {
                type: "text"
            },
            minLongitude: {
                type: "text"
            },
            minLatitude: {
                type: "text"
            },
            maxLongitude: {
                type: "text"
            }
        }
    }
};

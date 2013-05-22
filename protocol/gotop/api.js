var passwordParameter = {
    type: "text",
    pattern: "^[0-9]{6}$"
};

module.exports = {
    setAuthorizedNumber: {
        parameters: {
            password: passwordParameter,
            authorizedNumber: {
                type: "text",
                pattern: "^\\+([0-9])*$"
            },
            index: {
                type: "text",
                pattern: "^[1-5]$"
            }
        }
    },
    deleteAuthorizedNumber: {
        parameters: {
            password: passwordParameter,
            index: {
                type: "text",
                pattern: "^[1-5]$"
            }
        }
    },
    locateOneTime: {
        parameters: {
            password: passwordParameter
        }
    },
    setContinuousTracking: {
        parameters: {
            password: passwordParameter,
            enabled: {
                type: "boolean"
            },
            interval: {
                type: "text",
                pattern: "^[0-9]{1,3}[s|S|m|M|h|H]$"
            }
        }
    },
    setSpeedingAlarm: {
        parameters: {
            password: passwordParameter,
            enabed: {
                type: "boolean"
            },
            speed: {
                type: "text"
            }

        }
    },
    setGeoFence: {
        parameters: {
            password: passwordParameter,
            index: {
                type: "text",
                pattern: "^[1-5]$"
            },
            enabled: {
                type: "boolean"
            },
            exit: {
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
    },
    setTimeZone: {
        parameters: {
            password: passwordParameter,
            timeZone: {
                type: "text",
                pattern: "^(\\+|-)[0-9]{2}$"
            }

        }
    },
    setLowBatteryAlarm: {
        parameters: {
            password: passwordParameter,
            enabled: {
                type: "boolean"
            },
            percentage: {
                type: "text",
                pattern: "^[0-9]{2}$"
            }

        }
    },
    setPassword: {
        parameters: {
            password: passwordParameter,
            newPassword: passwordParameter
        }
    },
    setAcc: {
        parameters: {
            password: passwordParameter,
            enabled: {
                type: "boolean"
            }
        }
    },
    setListenMode: {
        parameters: {
            password: passwordParameter,
            enabled: {
                type: "boolean"
            }
        }
    },
    setApnAndServer: {
        parameters: {
            password: passwordParameter,
            ipAddress: {
                type: "text",
                pattern: "^[0-9]{1,3}\\.([0-9]){1,3}\\.([0-9]){1,3}\\.([0-9]){1,3}$"
            },
            port: {
                type: "text",
                pattern: "^[0-9]{1,5}$" // 65535
            },
            apn: {
                type: "text"
            }
        }
    },
    setApnUserNameAndPassword: {
        parameters: {
            password: passwordParameter,
            apnUserName: {
                type: "text"
            },
            apnPassword: {
                type: "text"
            }
        }
    }
};




var passwordParameter = {
	type : "text",
	pattern : "^[0-9]{6}$"
}; 

exports.capabilities = {
	commands : {
		setAuthorizedNumber : {
			parameters : {
				password: passwordParameter,
				authorizedNumber: {
					type : "text",
					pattern: "^\\+([0-9])*$"
				},
				index: {
					type : "text",
					pattern:"^[1-5]$"
				}
			}
		},
		deleteAuthorizedNumber : {
			parameters : {
				password:passwordParameter,
				index: {
					type : "text",
					pattern:"^[1-5]$"
				}
			}
		},
		locateOneTime : {
			parameters : {
				password: passwordParameter
			}
		},
		setContinuousTracking : {
			parameters : {
				password: passwordParameter,
				enabed : {
					type:"boolean"
				},
				interval: {
					type: "text",
					pattern: "^[0-9]{1,3}[s|S|m|M|h|H]$"
				}
			}
		},
		setSpeedingAlarm : {
			parameters : {
				password: passwordParameter,
				enabed : {
					type:"boolean"
				},
				speed: {
					type: "text"
				}
				
			}
		},
		setGeoFence : {
			parameters : {
				password: passwordParameter,
				index: {
					type : "text",
					pattern:"^[1-5]$"
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
				minLatitiude: {
					type: "text"
				},
				maxLongitude: {
					type: "text"
				}
			}
		},
		timeZone : {
			writable : true,
			passwordRequired : true,
			parameters : [{
				type : "timeZone",
				name : "timeZone"
			}]
		},
		lowBatteryAlarm : {
			writable : true,
			passwordRequired : true,
			parameters : [{
				type : "boolean",
				name : "enabled"
			}, {
				type : "percentage",
				name : "percentage"
			}]
		},
		changePassword : {
			writable : true,
			passwordRequired : true,
			parameters : [{
				type : "password",
				name : "newPassword"
			}]
		}
	}
};

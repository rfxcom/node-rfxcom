/**
 * Created by max on 02/07/2017.
 */
'use strict';
const
    Transmitter = require('./transmitter'),
    RfxCom = require('./rfxcom');

/*
 * This is a class for controlling fans
 */
class Fan extends Transmitter {
    constructor(rfxcom, subtype, options) {
        super(rfxcom, subtype, options);
        this.packetType = "fan";
        this.packetNumber = 0x17;
    }

    /*
     * validate the unitCode based on the subtype (handle a 1-element array as well)
     *
    */
    _splitDeviceId(deviceId) {
        let id = {};
        const parts = Transmitter.splitAtSlashes(deviceId);
        if (this.isSubtype("SEAV_TXS4")) {
            // format should be J/SW1/SW2/remote_ID, like "0/10/0010110101/0x5"
            if (parts.length !== 4 ||
                !parts[0].match(/^[01]$/) ||
                !parts[1].match(/^[01][01]$/) ||
                !parts[2].match(/^[01][01][01][01][01][01][01][01][01][01]$/) ||
                isNaN(Number(parts[3])))
            {
                throw new Error("Invalid deviceId format");
            }
            id = RfxCom.stringToBytes(parts[3], 1);
            if (id.value < 0 || id.value > 31) {
                Transmitter.remoteIdError(id);

            }
            id.bytes[0] = (parts[2].charAt(7) === '1' ? 1 : 0)*128 +
                (parts[2].charAt(8) === '1' ? 1 : 0)*64 +
                (parts[2].charAt(9) === '1' ? 1 : 0)*32 +
                id.value;
            const J = parts[0].charAt(0) === '1' ? 1 : 0;
            const SW2 = (parts[1].charAt(0) === '1' ? 1 : 0)*2 +
                        (parts[1].charAt(1) === '1' ? 1 : 0);
            id.bytes = [J*128 + SW2*32,
                        (parts[2].charAt(0) === '1' ? 1 : 0)*64 +
                        (parts[2].charAt(1) === '1' ? 1 : 0)*32 +
                        (parts[2].charAt(2) === '1' ? 1 : 0)*16 +
                        (parts[2].charAt(3) === '1' ? 1 : 0)*8 +
                        (parts[2].charAt(4) === '1' ? 1 : 0)*4 +
                        (parts[2].charAt(5) === '1' ? 1 : 0)*2 +
                        (parts[2].charAt(6) === '1' ? 1 : 0),
                        id.bytes[0]];
        } else {
            if (parts.length !== 1) {
                throw new Error("Invalid deviceId format");
            }
            id = RfxCom.stringToBytes(parts[0], 3);
            if ((this.isSubtype(["SIEMENS_SF01", "FT1211R"]) && (id.value > 0xffff || id.value < 1)) ||
                (this.isSubtype(["ITHO_CVE_RFT", "ITHO_CVE_ECO_RFT"]) && (id.value > 0xffffff || id.value < 1)) ||
                (this.isSubtype("NOVY") && (id.value > 0x09 || id.value < 0)) ||
                (this.isSubtype(["LUCCI_AIR", "WESTINGHOUSE_7226640", "LUCCI_AIR_DC", "CASAFAN", "FALMEC", "LUCCI_AIR_DCII"]) &&
                    (id.value > 0x0f || id.value < 0))) {
                Transmitter.addressError(id);

            }
        }
        return {
            idBytes: id.bytes
        };
    };

    _sendCommand(deviceId, command, callback) {
        const device = this._splitDeviceId(deviceId);
        let buffer = [device.idBytes[0], device.idBytes[1], device.idBytes[2], command, 0];

        return this.sendRaw(this.packetNumber, this.subtype, buffer, callback);
    };

    /*
     * SEAV General-purpose remote control button press. Buttons are labelled "T1", "T2", "T3", "T4".
     * Use either these strings or just the button number
     */
    buttonPress(deviceId, button, callback) {
        if (this.isSubtype("SEAV_TXS4")) {
            let command = NaN;
            if (typeof button === "string") {
                const str = button.match(/T?([1-4])/);
                if (str !== null) {
                    command = parseInt(str[1], 10);
                }
            } else {
                command = Math.round(Number(button));
            }
            if (command > 0 && command < 5) {
                return this._sendCommand(deviceId, command, callback);
            } else {
                throw new Error("Invalid button '" + button + "'");
            }
        } else {
            throw new Error("Device does not support buttonPress()");
        }
    }

    setSpeed(deviceId, speed, callback) {
        speed = Math.round(speed);
        if (this.isSubtype("ITHO_CVE_RFT")) {
            if (speed < 1 || speed > 3) {
                throw new Error("Invalid speed: value must be in range 1-3");
            } else {
                return this._sendCommand(deviceId, speed, callback);
            }
        } else if (this.isSubtype("ITHO_CVE_ECO_RFT")) {
                if (speed < 1 || speed > 4) {
                    throw new Error("Invalid speed: value must be in range 1-4");
                } else {
                    // noinspection EqualityComparisonWithCoercionJS
                    return this._sendCommand(deviceId, speed == 4 ? 0x08: speed, callback);
                }
        } else if (this.isSubtype(["LUCCI_AIR", "WESTINGHOUSE_7226640", "CASAFAN"])) {
            if (speed < 0 || speed > 3) {
                throw new Error("Invalid speed: value must be in range 0-3");
            } else {
                return this._sendCommand(deviceId, 0x04 - speed, callback);
            }
        } else if (this.isSubtype("FT1211R")) {
            if (speed < 1 || speed > 5) {
                throw new Error("Invalid speed: value must be in range 1-5");
            } else {
                return this._sendCommand(deviceId, speed + 2, callback);
            }
        } else if (this.isSubtype("FALMEC")) {
            if (speed < 0 || speed > 4) {
                throw new Error("Invalid speed: value must be in range 0-4");
            } else {
                return this._sendCommand(deviceId, speed + 1, callback);
            }
        } else if (this.isSubtype("LUCCI_AIR_DC")) {
            if (speed < 1 || speed > 6) {
                throw new Error("Invalid speed: value must be in range 1-6");
            } else {
                return this._sendCommand(deviceId, speed + 7, callback);
            }
        } else if (this.isSubtype("LUCCI_AIR_DCII")) {
            if (speed < 0 || speed > 6) {
                throw new Error("Invalid speed: value must be in range 0-6");
            } else {
                return this._sendCommand(deviceId, speed + 1, callback);
            }
        } else {
            throw new Error("Device does not support setSpeed()");
        }
    }

    decreaseSpeed(deviceId, callback) {
        if (this.isSubtype("SIEMENS_SF01")) {
            return this._sendCommand(deviceId, 0x02, callback);
        } else if (this.isSubtype(["LUCCI_AIR_DC", "NOVY"])) {
            return this._sendCommand(deviceId, 0x03, callback);
        } else {
            throw new Error("Device does not support decreaseSpeed()");
        }
    }

    increaseSpeed(deviceId, callback) {
        if (this.isSubtype("SIEMENS_SF01")) {
            return this._sendCommand(deviceId, 0x04, callback);
        } else if (this.isSubtype(["LUCCI_AIR_DC", "NOVY"])) {
            return this._sendCommand(deviceId, 0x02, callback);
        } else {
            throw new Error("Device does not support increaseSpeed()");
        }
    }

    switchOff(deviceId, callback) {
        if (this.isSubtype(["LUCCI_AIR", "WESTINGHOUSE_7226640", "CASAFAN"])) {
            return this._sendCommand(deviceId, 0x04, callback);
        } else if (this.isSubtype(["FALMEC", "LUCCI_AIR_DCII"])) {
            return this._sendCommand(deviceId, 0x01, callback);
        } else {
            throw new Error("Device does not support switchOff()");
        }
    }

    startTimer(deviceId, timeout, callback) {
        if (typeof timeout === "function") {
            callback = timeout;
            timeout = 1;
        } else {
            timeout = Math.round(timeout);
        }
        if (this.isSubtype("SIEMENS_SF01")) {
            return this._sendCommand(deviceId, 0x01, callback);
        } else if (this.isSubtype("ITHO_CVE_RFT")) {
            return this._sendCommand(deviceId, 0x04, callback);
        } else if (this.isSubtype("ITHO_CVE_ECO_RFT")) {
            if (timeout < 1 || timeout > 3) {
                throw new Error("Invalid timer timeout: value must be in range 1-3");
            } else {
                return this._sendCommand(deviceId, timeout + 3, callback);
            }
        } else if (this.isSubtype("FALMEC")) {
            if (timeout < 1 || timeout > 4) {
                throw new Error("Invalid timer timeout: value must be in range 1-4");
            } else {
                return this._sendCommand(deviceId, timeout + 5, callback);
            }
        } else if (this.isSubtype("FT1211R")) {
            if (timeout !== 1 && timeout !== 4 && timeout !== 8) {
                throw new Error("Invalid timer timeout: value must be 1, 4, or 8");
            } else {
                let cmd;
                if (timeout === 1) {
                    cmd = 0x09;
                } else if (timeout === 4) {
                    cmd = 0x0A;
                } else {
                    cmd = 0x0B;
                }
                return this._sendCommand(deviceId, cmd, callback);
            }
        } else {
            throw new Error("Device does not support startTimer()");
        }
    }

    toggleOnOff(deviceId, callback) {
         if (this.isSubtype(["FT1211R", "LUCCI_AIR_DC", "NOVY"])) {
            return this._sendCommand(deviceId, 0x01, callback);
        } else {
            throw new Error("Device does not support toggleOnOff()");
        }
    }

    toggleFanDirection(deviceId, callback) {
        if (this.isSubtype("FT1211R")) {
            return this._sendCommand(deviceId, 0x08, callback);
        } else if (this.isSubtype("LUCCI_AIR_DCII")) {
            return this._sendCommand(deviceId, 0x09, callback);
        } else {
            throw new Error("Device does not support toggleFanDirection()");
        }
    }

    setFanDirection(deviceId, direction, callback) {
        if (this.isSubtype("LUCCI_AIR_DC")) {
            if (direction === 0 || /reverse/i.exec(direction)) {
                return this._sendCommand(deviceId, 0x05, callback);
            } else if (direction === 1 || /natural|normal|forward/i.exec(direction)) {
                return this._sendCommand(deviceId, 0x06, callback);
            } else {
                throw new Error("Unrecognised fan direction '" + direction + "'");
            }
        } else {
            throw new Error("Device does not support setFanDirection()");
        }
    }

    toggleLightOnOff(deviceId, callback) {
        if (this.isSubtype("SIEMENS_SF01")) {
            return this._sendCommand(deviceId, 0x06, callback);
        } else if (this.isSubtype(["LUCCI_AIR", "WESTINGHOUSE_7226640", "CASAFAN"])) {
            return this._sendCommand(deviceId, 0x05, callback);
        } else if (this.isSubtype(["LUCCI_AIR_DC", "NOVY"])) {
            return this._sendCommand(deviceId, 0x04, callback);
        } else if (this.isSubtype("FT1211R")) {
            return this._sendCommand(deviceId, 0x02, callback);
        } else if (this.isSubtype("LUCCI_AIR_DCII")) {
            return this._sendCommand(deviceId, 0x08, callback);
        } else {
            throw new Error("Device does not support toggleLightOnOff()");
        }
    }

    switchLightOn(deviceId, callback) {
        if (this.isSubtype("FALMEC")) {
            return this._sendCommand(deviceId, 0x0A, callback);
        } else {
            throw new Error("Device does not support switchLightOn()");
        }
    }

    switchLightOff(deviceId, callback) {
        if (this.isSubtype("FALMEC")) {
            return this._sendCommand(deviceId, 0x0B, callback);
        } else {
            throw new Error("Device does not support switchLightOff()");
        }
    }

    program(deviceId, callback) {
        if (this.isSubtype("SIEMENS_SF01")) {
            return this._sendCommand(deviceId, 0x03, callback);
        } else if (this.isSubtype("NOVY")) {
            return this._sendCommand(deviceId, 0x05, callback);
        } else if (this.isSubtype("ITHO_CVE_RFT")) {
            return this._sendCommand(deviceId, 0x06, callback);
        } else if (this.isSubtype("LUCCI_AIR_DC")) {
            return this._sendCommand(deviceId, 0x07, callback);
        } else if (this.isSubtype("ITHO_CVE_ECO_RFT")) {
            return this._sendCommand(deviceId, 0x09, callback);
        } else {
            throw new Error("Device does not support program()");
        }
    }

    confirm(deviceId, callback) {
        if (this.isSubtype("SIEMENS_SF01")) {
            return this._sendCommand(deviceId, 0x05, callback);
        } else {
            throw new Error("Device does not support confirm()");
        }
    }

    eraseAll(deviceId, callback) {
        if (this.isSubtype("ITHO_CVE_RFT")) {
            return this._sendCommand(deviceId, 0x07, callback);
        } else if (this.isSubtype("ITHO_CVE_ECO_RFT")) {
            return this._sendCommand(deviceId, 0x0A, callback);
        } else {
            throw new Error("Device does not support eraseAll()");
        }
    }

    standby(deviceId, callback) {
        if (this.isSubtype("ITHO_CVE_ECO_RFT")) {
            return this._sendCommand(deviceId, 0x07, callback);
        } else {
            throw new Error("Device does not support standby()");
        }
    }

    resetFilter(deviceId, callback) {
        if (this.isSubtype("NOVY")) {
            return this._sendCommand(deviceId, 0x06, callback);
        } else {
            throw new Error("Device does not support resetFilter()");
        }
    }

}

module.exports = Fan;

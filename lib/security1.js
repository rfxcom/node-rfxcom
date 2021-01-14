/**
 * Created by max on 11/07/2017.
 */
'use strict';
const
    Transmitter = require('./transmitter'),
    RfxCom = require('./rfxcom');

/*
 * This is a class for controlling multiple types of autmated blinds
 */
class Security1 extends Transmitter {
    constructor(rfxcom, subtype, options) {
        super(rfxcom, subtype, options);
        this.packetType = "security1";
        this.packetNumber = 0x20;
    };

/*
 * Splits the device id and returns the components.
 * Throws an Error if the format is invalid.
 */
    _splitDeviceId(deviceId) {
        let id = {};
        const parts = Transmitter.splitAtSlashes(deviceId);
        if (parts.length === 1) {
            if (this.isSubtype(['KD101', 'SA30'])) {
                id = RfxCom.stringToBytes(parts[0], 2);
                if (id.value <= 0xffff) {
                    id.bytes.push(0);
                } else {
                    Transmitter.addressError(id);
                }
            } else if (this.isSubtype(['X10_DOOR', 'X10_PIR', 'X10_SECURITY'])) {
                id = RfxCom.stringToBytes(parts[0], 2);
                if (id.value <= 0xffff) {
                    id.bytes = [id.bytes[0], 0, id.bytes[1]];
                } else {
                    Transmitter.addressError(id);
                }
            } else if (this.isSubtype(['RM174RF', 'FERPORT_TAC'])) {
                id = RfxCom.stringToBytes(parts[0], 3);
                if (id.value < 1 || id.value > 0xffffff) {
                    Transmitter.addressError(id);
                }
            } else {
                id = RfxCom.stringToBytes(parts[0], 3);
                if (id.value < 0 || id.value > 0xffffff) {
                    Transmitter.addressError(id);
                }
            }
        } else {
            throw new Error("Invalid deviceId format");
        }
        return {
            idBytes: id.bytes,
        };
    };

    _sendCommand(deviceId, status, callback) {
        const device = this._splitDeviceId(deviceId);
        let buffer = [device.idBytes[0], device.idBytes[1], device.idBytes[2], status, 0];

        return this.sendRaw(this.packetNumber, this.subtype, buffer, callback);
    };

/*
 * Sends a message reporting the supplied status (0 - 255), simulating a security detector.
 * The status value is not error-checked, refer to the SDK documentation for the allowed values for each subtype
 */
    sendStatus(deviceId, status, callback) {
        return this._sendCommand(deviceId, Math.round(status), callback);
    };

    sendPanic(deviceId, callback) {
        if (this.isSubtype("X10_SECURITY")) {
            return this._sendCommand(deviceId, 0x6, callback);
        } else {
            throw new Error("Device does not support sendPanic()");
        }
    };

    cancelPanic(deviceId, callback) {
        if (this.isSubtype("X10_SECURITY")) {
            return this._sendCommand(deviceId, 0x7, callback);
        } else {
            throw new Error("Device does not support cancelPanic()");
        }
    };

    armSystemAway(deviceId, callback) {
        if (this.isSubtype("X10_SECURITY")) {
            return this._sendCommand(deviceId, 0x9, callback);
        } else {
            throw new Error("Device does not support armSystemAway()");
        }
    };

    armSystemAwayWithDelay(deviceId, callback) {
        if (this.isSubtype("X10_SECURITY")) {
            return this._sendCommand(deviceId, 0xa, callback);
        } else {
            throw new Error("Device does not support armSystemAwayWithDelay()");
        }
    };

    armSystemHome(deviceId, callback) {
        if (this.isSubtype("X10_SECURITY")) {
            return this._sendCommand(deviceId, 0xb, callback);
        } else {
            throw new Error("Device does not support armSystemHome()");
        }
    };

    armSystemHomeWithDelay(deviceId, callback) {
        if (this.isSubtype("X10_SECURITY")) {
            return this._sendCommand(deviceId, 0xc, callback);
        } else {
            throw new Error("Device does not support armSystemHomeWithDelay()");
        }
    };

    disarmSystem(deviceId, callback) {
        if (this.isSubtype("X10_SECURITY")) {
            return this._sendCommand(deviceId, 0xd, callback);
        } else {
            throw new Error("Device does not support disarmSystem()");
        }
    };

    switchLightOn(deviceId, channel, callback) {
        if (this.isSubtype("X10_SECURITY")) {
            if (channel === 1 || channel === 2) {
                return this._sendCommand(deviceId, 0xf + 2*channel, callback);
            } else {
                throw new Error("Invalid channel: value must be in range 1-2");
            }
        } else {
            throw new Error("Device does not support switchOnLight()");
        }
    };

    switchLightOff(deviceId, channel, callback) {
        if (this.isSubtype("X10_SECURITY")) {
            if (channel === 1 || channel === 2) {
                return this._sendCommand(deviceId, 0xe + 2*channel, callback);
            } else {
                throw new Error("Invalid channel: value must be in range 1-2");
            }
        } else {
            throw new Error("Device does not support switchOffLight()");
        }
    };

    // Call-throughs to (temporarily) support deprecated function names
    switchOnLight(deviceId, channel, callback) {
        return this.switchLightOn(deviceId, channel, callback);
    };
    switchOffLight(deviceId, channel, callback) {
        return this.switchLightOff(deviceId, channel, callback);
    };
}

module.exports = Security1;
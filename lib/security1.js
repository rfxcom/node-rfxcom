/**
 * Created by max on 11/07/2017.
 */
const defines = require('./defines'),
    index = require('./index'),
    Transmitter = require('./transmitter'),
    RfxCom = require('./rfxcom');

/*
 * This is a class for controlling multiple types of autmated blinds
 */
class Security1 extends Transmitter {
    constructor(rfxcom, subtype, options) {
        super(rfxcom, subtype, options);
        this.packetType = "security1";
    };

/*
 * Splits the device id  and returns the components.
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
                    throw new Error("Address 0x" + id.value.toString(16) + " outside valid range");
                }
            } else if (this.isSubtype(['X10_DOOR', 'X10_PIR', 'X10_SECURITY'])) {
                id = RfxCom.stringToBytes(parts[0], 2);
                if (id.value <= 0xffff) {
                    id.bytes = [id.bytes[0], 0, id.bytes[1]];
                } else {
                    throw new Error("Address 0x" + id.value.toString(16) + " outside valid range");
                }
            } else if (this.isSubtype('RM174RF')) {
                id = RfxCom.stringToBytes(parts[0], 3);
                if (id.value < 1 || id.value > 0x3fffff) {
                    throw new Error("Address 0x" + id.value.toString(16) + " outside valid range");
                }
            } else {
                id = RfxCom.stringToBytes(parts[0], 3);
                if (id.value < 0 || id.value > 0xffffff) {
                    throw new Error("Address 0x" + id.value.toString(16) + " outside valid range");
                }
            }
        } else {
            throw new Error("Invalid deviceId format");
        }
        return {
            idBytes: id.bytes,
        };
    };

/*
 * Sends a message reporting the supplied status (0 - 255), simulating a security detector.
 * The status value is not error-checked, refer to the SDK documentation for the allowed values for each subtype
 */
    _sendCommand(deviceId, command, callback) {
        const self = this,
            device = self._splitDeviceId(deviceId),
            seqnbr = self.rfxcom.nextMessageSequenceNumber();
        let buffer = [0x08, defines.SECURITY1, self.subtype, seqnbr,
            device.idBytes[0], device.idBytes[1], device.idBytes[2],
            command, 0];

        self.rfxcom.queueMessage(self, buffer, seqnbr, callback);
        return seqnbr;
    };

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

    switchOnLight(deviceId, channel, callback) {
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

    switchOffLight(deviceId, channel, callback) {
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
}

module.exports = Security1;
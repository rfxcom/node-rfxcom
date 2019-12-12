/*jshint -W104 */
'use strict';
const defines = require('./defines'),
    Transmitter = require('./transmitter'),
    RfxCom = require('./rfxcom');

/*
 * This is a class for controlling Edisio devices
 */
class Edisio extends Transmitter {
    constructor(rfxcom, subtype, options) {
        super(rfxcom, subtype, options);
        this.packetType = "edisio";
        this.packetNumber = 0x1c;
        this.maxRepeat = 5;
    }

    /*
     * Splits the device id  and returns the components.
     * Throws an Error if the format is invalid.
     */
    _splitDeviceId(deviceId) {
        let id, unitCode;
        const parts = Transmitter.splitAtSlashes(deviceId);
        if (parts.length !== 2) {
            throw new Error("Invalid deviceId format");
        } else {
            id = RfxCom.stringToBytes(parts[0], 4);
            if ((id.value === 0) ||
                (this.isSubtype("EDISIO_CONTROLLER") && id.value > 0xffffffff))  {
                Transmitter.addressError(id);
            }
            unitCode = parseInt(parts[1]);
            if (this.isSubtype("EDISIO_CONTROLLER")) {
                if (unitCode === 0) {
                    throw new Error("Subtype doesn't support group commands");
                } else if (unitCode < 1 || unitCode > 16) {
                    throw new Error("Invalid unit code " + parts[1]);
                }
            }
        }
        return {
            idBytes: id.bytes,
            unitCode: unitCode
        };
    }

    _sendCommand(deviceId, command, level, R, G, B, callback) {
        const device = this._splitDeviceId(deviceId);
        let buffer = [device.idBytes[0], device.idBytes[1], device.idBytes[2], device.idBytes[3],
            device.unitCode, command, level, R, G, B, this.maxRepeat, 0, 0, 0];
        return this.sendRaw(this.packetNumber, this.subtype, buffer, callback);
    };

    switchOff(deviceId, callback) {
        return this._sendCommand(deviceId, 0x00, 0, 0, 0, 0, callback);
    };

    switchOn(deviceId, callback) {
        return this._sendCommand(deviceId, 0x01, 0, 0, 0, 0, callback);
    };

    toggleOnOff(deviceId, callback) {
        return this._sendCommand(deviceId, 0x02, 0, 0, 0, 0, callback);
    };

    setLevel(deviceId, level, callback) {
        level = Math.round(level);
        if (level > 100 || level < 0) {
            throw new Error("Dim level must be in the range 0-100");
        }
        return this._sendCommand(deviceId, 0x03, level, 0, 0, 0, callback);
    }

    increaseLevel(deviceId, roomNumber, callback) {
        if (typeof roomNumber === "function") {
            callback = roomNumber;
        }
        return this._sendCommand(deviceId, 0x04, 0, 0, 0, 0, callback);
    };

    decreaseLevel(deviceId, roomNumber, callback) {
        if (typeof roomNumber === "function") {
            callback = roomNumber;
        }
        return this._sendCommand(deviceId, 0x05, 0, 0, 0, 0, callback);
    };

    toggleDimming(deviceId, callback) {
        return this._sendCommand(deviceId, 0x06, 0, 0, 0, 0, callback);
    };

    stopDimming(deviceId, callback) {
        return this._sendCommand(deviceId, 0x07, 0, 0, 0, 0, callback);
    };

    setColour(deviceId, colour, callback) {
        if (colour.R === undefined || colour.G === undefined || colour.B === undefined) {
            throw new Error("Colour must be an object with fields R, G, B");
        }
        const R = Math.round(colour.R), G = Math.round(colour.G), B = Math.round(colour.B);
        if ((R > 255 || R < 0) || (G > 255 || G < 0) ||(B > 255 || B < 0)) {
            throw new Error("Colour RGB values must be in the range 0-255");
        }
        return this._sendCommand(deviceId, 0x08, 0, R, G, B, callback);
    };

    program(deviceId, callback) {
        return this._sendCommand(deviceId, 0x09, 0, 0, 0, 0, callback);
    };

    open(deviceId, callback) {
        return this._sendCommand(deviceId, 0x0a, 0, 0, 0, 0, callback);
    };

    stop(deviceId, callback) {
        return this._sendCommand(deviceId, 0x0b, 0, 0, 0, 0, callback);
    };

    close(deviceId, callback) {
        return this._sendCommand(deviceId, 0x0c, 0, 0, 0, 0, callback);
    };

    sendContactNormal(deviceId, callback) {
        return this._sendCommand(deviceId, 0x0d, 0, 0, 0, 0, callback);
    };

    sendContactAlert(deviceId, callback) {
        return this._sendCommand(deviceId, 0x0e, 0, 0, 0, 0, callback);
    };
}

module.exports = Edisio;
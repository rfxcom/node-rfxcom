/*jshint -W104 */
'use strict';
const defines = require('./defines'),
    Transmitter = require('./transmitter'),
    RfxCom = require('./rfxcom');

/*
 * This is a class for controlling Hunter Fan devices
 */
class HunterFan extends Transmitter {
    constructor(rfxcom, subtype, options) {
        super(rfxcom, subtype, options);
        this.packetType = "hunterFan";
        this.packetNumber = 0x1f;
    }

    /*
     * Splits the device id  and returns the components.
     * Throws an Error if the format is invalid.
     */
    _splitDeviceId(deviceId) {
        let id;
        const parts = Transmitter.splitAtSlashes(deviceId);
        if (parts.length !== 1) {
            throw new Error("Invalid deviceId format");
        } else {
            id = RfxCom.stringToBytes(parts[0], 6);
            if ((id.value <= 0) ||
                (this.isSubtype("HUNTER_FAN") && id.value > 0xffffffffffff))  {
                Transmitter.addressError(id);
            }
        }
        return {
            idBytes: id.bytes,
        };
    }

    _sendCommand(deviceId, command, callback) {
        const device = this._splitDeviceId(deviceId);
        let buffer = [device.idBytes[0], device.idBytes[1], device.idBytes[2], device.idBytes[3],
            device.idBytes[4], device.idBytes[5], command, 0];
        return this.sendRaw(this.packetNumber, this.subtype, buffer, callback);
    };

    switchOff(deviceId, callback) {
        return this._sendCommand(deviceId, 1, callback);
    }

    setSpeed(deviceId, speed, callback) {
        if (typeof speed === "number") {
            speed = Math.round(speed);
            if (speed < 0 || speed > 3) {
                throw new Error("Invalid speed: value must be in range 0-3")
            } else {
                if (speed === 0) {
                    return this.switchOff(deviceId, callback);
                } else {
                    return this._sendCommand(deviceId, speed + 2, callback);
                }
            }
        }
    }

    toggleLightOnOff(deviceId, callback) {
        return this._sendCommand(deviceId, 2, callback);
    }

    program(deviceId, callback) {
        return this._sendCommand(deviceId, 6, callback);
    }
}

module.exports = HunterFan;
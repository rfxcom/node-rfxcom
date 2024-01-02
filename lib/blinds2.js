/*jshint -W104 */
'use strict';
const defines = require('./defines'),
    Transmitter = require('./transmitter'),
    RfxCom = require('./rfxcom');

/*
 * This is a class for controlling 'bidirectional' automated blinds
 */
class Blinds2 extends Transmitter {
    constructor (rfxcom, subtype, options) {
        super (rfxcom, subtype, options);
        this.packetType = "blinds2";
        this.packetNumber = 0x31;
    }

/*
 * Splits the device id  and returns the components.
 * Throws an Error if the format is invalid.
 */
    _splitDeviceId(deviceId) {
        let id, unitCode;
        const parts = Transmitter.splitAtSlashes(deviceId);
        if (parts.length === 2) {
            id = RfxCom.stringToBytes(parts[0], 4);
            if (id.value <= 0 || id.value > 0xffffffff) {
                Transmitter.addressError(id)
            }
            unitCode = parseInt(parts[1]);
            if (isNaN(unitCode) || unitCode < 0 || unitCode > 16) {
                throw new Error("Invalid unit code " + parts[1]);
            } else if (unitCode === 0) {
                unitCode = 0x10;
            } else {
                unitCode = unitCode - 1;
            }
    } else {
            throw new Error("Invalid deviceId format");
        }
        return {
            idBytes: id.bytes,
            unitCode: unitCode
        };
    };

    _sendCommand(deviceId, command, percent, angle, callback) {
        const device = this._splitDeviceId(deviceId);
        let buffer = [device.idBytes[0], device.idBytes[1], device.idBytes[2], device.idBytes[3],
                      device.unitCode, command, percent, angle, 0];
        return this.sendRaw(this.packetNumber, this.subtype, buffer, callback);
    };

    _checkPercent(percent) {
        if (typeof percent != "number" || isNaN(percent) || percent < 0 || percent > 100) {
            throw new Error("Invalid percentage: must be in range 0-100");
        } else {
            percent = Math.round(percent);
        }
        return percent;
    };

    _checkAngle(angle) {
        if (typeof angle != "number" || isNaN(angle) || angle < 0 || angle > 180) {
            throw new Error("Invalid angle: must be in range 0-180");
        } else {
            angle = Math.round(angle);
        }
        return angle;
    };

    open(deviceId, callback) {
        return this._sendCommand(deviceId, defines.BLINDS_OPEN, 0, 0, callback);
    };

    up(deviceId, callback) {
        return this._sendCommand(deviceId, defines.BLINDS_OPEN, 0, 0, callback);
    };

    close(deviceId, callback) {
        return this._sendCommand(deviceId, defines.BLINDS_CLOSE, 0, 0, callback);
    };

    down(deviceId, callback) {
        return this._sendCommand(deviceId, defines.BLINDS_CLOSE, 0, 0, callback);
    };

    stop(deviceId, callback) {
        return this._sendCommand(deviceId, defines.BLINDS_STOP, 0, 0, callback);
    };

    confirm(deviceId, callback) {
        return this._sendCommand(deviceId, defines.BLINDS_CONFIRM, 0, 0, callback);
    };

    setPercent(deviceId, percent, callback) {
        if (callback === undefined && typeof percent === "function") {
            callback = percent;
            percent = 50;
        }
        percent = this._checkPercent(percent);
        return this._sendCommand(deviceId, defines.BLINDS_SET_PERCENT, percent, 0, callback);
    };

    setAngle(deviceId, angle, callback) {
        if (callback === undefined && typeof angle === "function") {
            callback = angle;
            angle = 90;
        }
        angle = this._checkAngle(angle);
        return this._sendCommand(deviceId, defines.BLINDS_SET_ANGLE, 0, angle, callback);
    };

    setPercentAndAngle(deviceId, percent, angle, callback) {
        if (angle === undefined && typeof percent === "function") {
            callback = percent;
            percent = 50;
            angle = 90;
        } else if (callback === undefined && typeof angle === "function") {
            callback = angle;
            angle = 90;
        }
        percent = this._checkPercent(percent);
        angle = this._checkAngle(angle);
        return this._sendCommand(deviceId, defines.BLINDS_SET_PERCENT_AND_ANGLE, percent, angle, callback);
    };

}

module.exports = Blinds2;

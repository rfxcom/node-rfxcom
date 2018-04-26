/*jshint -W104 */
'use strict';
const
    Transmitter = require('./transmitter');

/*
 * This is a class for controlling Lighting3 lights.
 */
class Lighting3 extends Transmitter {
    constructor(rfxcom, subtype, options) {
        super(rfxcom, subtype, options);
        this.packetType = "lighting3";
        this.packetNumber = 0x12;
    }

/*
 * Splits the device id into system code, channel number.
 *
 */
    _splitDeviceId(deviceId) {
        let  channelBytes = [];
        const parts = Transmitter.splitAtSlashes(deviceId);
        if (this.isSubtype('KOPPLA') && parts.length !== 2) {
            throw new Error("Invalid deviceId format");
        }
        const
            systemCode = parseInt(parts[0], 10),
            channelNumber = parseInt(parts[1], 10);
        if (systemCode < 1 || systemCode > 16) {
            throw new Error("Invalid system code " + parts[0]);
        }
        if (channelNumber === 0) {
            channelBytes[0] = 0xff;
            channelBytes[1] = 0x03;
        } else {
            channelBytes = [0, 0];
            if (channelNumber < 1 || channelNumber > 10) {
                throw new Error("Invalid channel number " + parts[1]);
            } else if (channelNumber > 8) {
                channelBytes[1] |= 1 << channelNumber - 9;
            } else {
                channelBytes[0] |= 1 << channelNumber - 1;
            }
        }
        return {
            systemCode: systemCode - 1,
            channelCode: channelBytes
        };
    };

    _sendCommand(deviceId, command, callback) {
        const device = this._splitDeviceId(deviceId);
        let buffer = [device.systemCode, device.channelCode[0], device.channelCode[1], command, 0];

        return this.sendRaw(this.packetNumber, this.subtype, buffer, callback);
    };

/*
 * Switch on systemCode/Channel
 */
    switchOn(deviceId, callback) {
        return this._sendCommand(deviceId, 0x10, callback);
    };

/*
 * Switch off systemCode/Channel
 */
    switchOff(deviceId, callback) {
        return this._sendCommand(deviceId, 0x1A, callback);
    };

/*
 * Set brightness level systemCode/Channel
 */
    setLevel(deviceId, level, callback) {
        if (level < 0 || level > 0xa) {
            throw new Error("Invalid level: value must be in range 0-10");
        }
        if (level === 0) {
            return this._sendCommand(deviceId, 0x1A, callback);
        } else if (level === 0xa) {
            return this._sendCommand(deviceId, 0x10, callback);
        } else {
            return this._sendCommand(deviceId, 0x10 + level, callback);
        }
    };

/*
 * Increase brightness systemCode/Channel 'Bright'
 */
    increaseLevel (deviceId, roomNumber, callback) {
        if (typeof roomNumber === "function") {
            callback = roomNumber;
        }
        return this._sendCommand(deviceId, 0x00, callback);
    };

/*
 * Decrease brightness systemCode/Channel 'Dim'
 */
    decreaseLevel (deviceId, roomNumber, callback) {
        if (typeof roomNumber === "function") {
            callback = roomNumber;
        }
        return this._sendCommand(deviceId, 0x08, callback);
    };

/*
 * Send the 'Program' command systemCode/Channel
 */
    program (deviceId, callback) {
        return this._sendCommand(deviceId, 0x1c, callback);
    };

}

module.exports = Lighting3;



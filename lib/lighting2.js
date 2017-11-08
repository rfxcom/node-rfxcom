/*jshint -W104 */
'use strict';
const
    Transmitter = require('./transmitter'),
    RfxCom = require('./rfxcom');

/*
 * This is a class for controlling Lighting2 lights.
 */
class Lighting2 extends Transmitter {
    constructor(rfxcom, subtype, options) {
        super(rfxcom, subtype, options);
        this.packetType = "lighting2";
        this.packetNumber = 0x11;
    }

/*
 * Splits the device id x/y and returns the components, the deviceId will be
 * returned as the component bytes, ready for sending.
 *
 * Throws an Error if the format is invalid or if the deviceId is not the
 * correct length, the address is out of the valid range
 *
 * If deviceId is an array, it is assumed to be already split
*/
    _splitDeviceId(deviceId) {
        let id, unitCode;
        const parts = Transmitter.splitAtSlashes(deviceId);
        if (this.isSubtype("KAMBROOK")) {
            if (parts.length !== 3) {
                throw new Error("Invalid deviceId format");
            }
            id = RfxCom.stringToBytes(parts[1], 4);
            if (id.value < 1 || id.value > 0xffffff) {
                Transmitter.remoteIdError(id);
            }
            id.bytes[0] = parts[0].toUpperCase().charCodeAt(0) - "A".charCodeAt(0);
            if (id.bytes[0] < 0 || id.bytes[0] > 3) {
                throw new Error("Invalid house code '" + parts[0] + "'");
            }
            unitCode = parseInt(parts[2]);
            if (unitCode === 0) {
                throw new Error("Subtype doesn't support group commands");
            } else if (unitCode < 1 || unitCode > 5) {
                throw new Error("Invalid unit code " + parts[2]);
            }
        } else {
            if (parts.length !== 2) {
                throw new Error("Invalid deviceId format");
            }
            id = RfxCom.stringToBytes(parts[0], 4);
            if (id.value < 1 || id.value > 0x03ffffff) {
                Transmitter.deviceIdError(id);
            }
            unitCode = parseInt(parts[1]);
            if (unitCode < 0 || unitCode > 16) {
                throw new Error("Invalid unit code " + parts[1]);
            }
        }
        return {
            idBytes: id.bytes,
            unitCode: unitCode
        };
    };

    _sendCommand(deviceId, command, level, callback) {
        const device = this._splitDeviceId(deviceId);
        level = (level === undefined) ? 0xf : level; // Now works when level == 0
        // If the device code is 0 convert to a group command by adding 3
        if (device.unitCode === 0) {
            command = command + 3;
            device.unitCode = 1;   // Group commands are sent with a unit code of 1
        }
        let buffer = [device.idBytes[0], device.idBytes[1], device.idBytes[2], device.idBytes[3],
            device.unitCode, command, level, 0];

        return this.sendRaw(this.packetNumber, this.subtype, buffer, callback);
    };

/*
 * Switch on deviceId/unitCode (unitCode 0 means group)
 */
    switchOn(deviceId, callback) {
        return this._sendCommand(deviceId, 1, 15, callback);
    };

/*
 * Switch off deviceId/unitCode (unitCode 0 means group)
 */
    switchOff(deviceId, callback) {
        return this._sendCommand(deviceId, 0, 0, callback);
    };

/*
 * Set dim level deviceId/unitCode (unitCode 0 means group)
 */
    setLevel(deviceId, level, callback) {
        if (this.isSubtype("KAMBROOK")) {
            throw new Error("KAMBROOK: Set level not supported")
        }
        if ((level < 0) || (level > 0xf)) {
            throw new Error("Invalid level: value must be in range 0-15");
        }
        return this._sendCommand(deviceId, 2, level, callback);
    };

}

module.exports = Lighting2;


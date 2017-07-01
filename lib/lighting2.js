/*jshint -W104 */
const defines = require('./defines'),
    index = require('./index'),
    Transmitter = require('./transmitter');

/*
 * This is a class for controlling Lighting2 lights.
 */
class Lighting2 extends Transmitter {
    constructor(rfxcom, subtype, options) {
        super(rfxcom, subtype, options);
        this.packetType = "lighting2";
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
        let parts, id, unitCode;
        if (Array.isArray(deviceId)) {
            parts = deviceId;
        } else {
            parts = deviceId.split("/");
        }
        if (this.isSubtype("KAMBROOK")) {
            if (parts.length !== 3) {
                throw new Error("Invalid deviceId format");
            }
            id = this.rfxcom.stringToBytes(parts[1], 4);
            if (id.value < 1 || id.value > 0xffffff) {
                throw new Error("Remote ID 0x" + id.value.toString(16) + " outside valid range");
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
            id = this.rfxcom.stringToBytes(parts[0], 4);
            if (id.value < 1 || id.value > 0x03ffffff) {
                throw new Error("Device ID 0x" + id.value.toString(16) + " outside valid range");
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
        const
            self = this,
            device = self._splitDeviceId(deviceId),
            seqnbr = self.rfxcom.getSequenceNumber();
        level = (level === undefined) ? 0xf : level; // Now works when level == 0
        // If the device code is 0 convert to a group command by adding 3
        if (device.unitCode === 0) {
            command = command + 3;
            device.unitCode = 1;   // Group commands are sent with a unit code of 1
        }
        let buffer = [0x0b, defines.LIGHTING2, self.subtype, seqnbr,
                      device.idBytes[0], device.idBytes[1], device.idBytes[2], device.idBytes[3],
                      device.unitCode, command, level, 0];

        self.rfxcom.queueMessage(self, buffer, seqnbr, callback);
        return seqnbr;
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


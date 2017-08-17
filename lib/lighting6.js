/*jshint -W104 */
const
    Transmitter = require('./transmitter'),
    RfxCom = require('./rfxcom');

/*
 * This is a class for controlling Lighting6 lights.
 */
class Lighting6 extends Transmitter {
    constructor(rfxcom, subtype, options) {
        super(rfxcom, subtype, options);
        this.packetType = "lighting6";
        this.packetNumber = 0x15;
    }

/*
 * Splits the device id into idBytes, group, unitCode.
 *
 */
    _splitDeviceId(deviceId) {
        const parts = Transmitter.splitAtSlashes(deviceId);
        if (this.isSubtype('BLYSS') && parts.length !== 3) {
            throw new Error("Invalid deviceId format");
        }
        const
            id = RfxCom.stringToBytes(parts[0], 2),
            group = parts[1].toUpperCase().charCodeAt(0),
            unit = parseInt(parts[2]);
        if (group < 0x41 || group > 0x50) {
            throw new Error("Invalid group code '" + parts[1] + "'")
        }
        if  (unit < 0 || unit > 5) {
            throw new Error("Invalid unit number " + unit)
        }
        return {
            idBytes: id.bytes,
            groupCode: group,
            unitCode: unit
        };
    };

    _sendCommand(deviceId, command, callback) {
        const device = this._splitDeviceId(deviceId);
        if (device.unitCode === 0) {
            command = command + 2;
        }
        let buffer = [device.idBytes[0], device.idBytes[1], device.groupCode, device.unitCode, command, 0, 0, 0];

        return this.sendRaw(this.packetNumber, this.subtype, buffer, callback);
    };

/*
 * Switch on deviceId/unitCode
 */
    switchOn(deviceId, callback) {
        return this._sendCommand(deviceId, 0x00, callback);
    };

/*
 * Switch off deviceId/unitCode
 */
    switchOff(deviceId, callback) {
        return this._sendCommand(deviceId, 0x01, callback);
    };

}

module.exports = Lighting6;

/*jshint -W104 */
'use strict';
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
        this.cmdseqnbr = -1;  // Will be incremented by the first call to nextCmdseqbr()
    }

    nextCmdseqnbr() {
        this.cmdseqnbr = this.cmdseqnbr + 1;
        if ((this.isSubtype('BLYSS') && this.cmdseqnbr >= 5) ||
            (this.isSubtype('CUVEO') && this.cmdseqnbr >= 255)) {
            this.cmdseqnbr = 0;
        }
        return this.cmdseqnbr;
    }
/*
 * Splits the device id into idBytes, group, unitCode.
 *
 */
    _splitDeviceId(deviceId) {
        const parts = Transmitter.splitAtSlashes(deviceId);
        if (this.isSubtype(['BLYSS', 'CUVEO']) && parts.length !== 3) {
            throw new Error("Invalid deviceId format");
        }
        const
            id = RfxCom.stringToBytes(parts[0], 2),
            unit = parseInt(parts[2]);
        let group = parts[1];
        if (this.isSubtype('BLYSS')) {
            group = group.toUpperCase().charCodeAt(0);
            if (group < 0x41 || group > 0x50) {
                throw new Error("Invalid group code '" + parts[1] + "'")
            }
            if  (unit < 0 || unit > 5) {
                throw new Error("Invalid unit number " + unit)
            }
        } else if (this.isSubtype('CUVEO')) {
            group = parseInt(group);
            if (group < 0x0 || group > 0x03) {
                throw new Error("Invalid group code '" + parts[1] + "'")
            }
            if  ((group === 0 && (unit < 1 || unit > 2)) ||
                 (group > 0 && (unit < 1 || unit > 8))) {
                throw new Error("Invalid unit number " + unit)
            }
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
        let buffer = [device.idBytes[0], device.idBytes[1], device.groupCode, device.unitCode,
            command, this.nextCmdseqnbr(), 0, 0];

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

/**
 * Created by max on 11/07/2017.
 */
'use strict';
const
    Transmitter = require('./transmitter'),
    RfxCom = require('./rfxcom');

/*
 * This is a class for controlling
 */
class Thermostat2 extends Transmitter {
    constructor(rfxcom, subtype, options) {
        super(rfxcom, subtype, options);
        this.packetType = "thermostat2";
        this.packetNumber = 0x41;
    };

/*
 * Extracts the device id.
 *
 */
    _splitDeviceId(deviceId) {
        const parts = Transmitter.splitAtSlashes(deviceId);
        if (this.isSubtype(['HE105', 'RTS10_RFS10_TLX1206']) && parts.length !== 1) {
            throw new Error("Invalid deviceId format");
        }
        const id = RfxCom.stringToBytes(parts[0], 1);
        if (id.value < 0 || id.value > 0x1f) {
            Transmitter.addressError(id);
        }
        return {
            idBytes: id.bytes
        };
    };

    _sendCommand(deviceId, command, callback) {
        const device = this._splitDeviceId(deviceId);
        let buffer = [device.idBytes[0], command, 0];

        return this.sendRaw(this.packetNumber, this.subtype, buffer, callback);
    };

    switchOn(deviceId, callback) {
        return this._sendCommand(deviceId, 0x01, callback);
    }

    switchOff(deviceId, callback) {
        return this._sendCommand(deviceId, 0x00, callback);
    }

    program(deviceId, callback) {
        if (this.isSubtype('RTS10_RFS10_TLX1206')) {
            return this._sendCommand(deviceId, 0x02, callback);
        } else {
            throw new Error("Device does not support program()")
        }
    }
}

module.exports = Thermostat2;

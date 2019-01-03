/**
 * Created by max on 11/07/2017.
 */
'use strict';
const
    Transmitter = require('./transmitter'),
    RfxCom = require('./rfxcom');

/*
 * This is a class for controlling Smartwares radiator valves
 */
class Radiator1 extends Transmitter {
    constructor(rfxcom, subtype, options) {
        super(rfxcom, subtype, options);
        this.packetType = "radiator1";
        this.packetNumber = 0x48;
    };

/*
 * Extracts the device id & unit code
 *
 */
    _splitDeviceId(deviceId) {
        const parts = Transmitter.splitAtSlashes(deviceId);
        if (parts.length !== 2) {
            throw new Error("Invalid deviceId format");
        }
        const id = RfxCom.stringToBytes(parts[0], 4);
        if (id.value < 1 || (this.isSubtype('SMARTWARES') && id.value > 0x3ffffff)) {
            Transmitter.addressError(id);
        }
        const unitCode = parseInt(parts[1]);
        if (unitCode < 1 || unitCode > 16) {
            throw new Error("Invalid unit code " + parts[1]);
        }
        return {
            idBytes: id.bytes,
            unitCode: unitCode
        };
    };

    _sendCommand(deviceId, command, setpoint, callback) {
        const device = this._splitDeviceId(deviceId);
        let buffer = [device.idBytes[0], device.idBytes[1], device.idBytes[2], device.idBytes[3], device.unitCode,
                      command, setpoint[0], setpoint[1], 0];

        return this.sendRaw(this.packetNumber, this.subtype, buffer, callback);
    };

    setNightMode(deviceId, callback) {
        return this._sendCommand(deviceId, 0x00, [0x00, 0x00], callback);
    }

    setDayMode(deviceId, callback) {
        return this._sendCommand(deviceId, 0x01, [0x00, 0x00], callback);
    }

    setTemperature(deviceId, temperature, callback) {
        if (typeof temperature !== "number") {
            throw new Error("Invalid temperature: must be a number in range 5.0-28.0");
        }
        const setpoint = Math.round(2*Math.max(Math.min(28.0, temperature), 5.0))/2;
        let setpointBytes = [Math.floor(setpoint), 10*(setpoint - Math.floor(setpoint))];
        return this._sendCommand(deviceId, 0x02, setpointBytes, callback);
    }

}

module.exports = Radiator1;

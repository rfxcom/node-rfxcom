/**
 * Created by max on 11/07/2017.
 */
const defines = require('./defines'),
    index = require('./index'),
    Transmitter = require('./transmitter'),
    RfxCom = require('./rfxcom');

/*
 * This is a class for controlling Digimax & TLX7506 thermostats
 */
class Thermostat1 extends Transmitter {
    constructor(rfxcom, subtype, options) {
        super(rfxcom, subtype, options);
        this.packetType = "thermostat1";
    };

/*
 * Extracts the device id.
 *
 */
    _splitDeviceId(deviceId) {
        let id = {};
        const parts = Transmitter.splitAtSlashes(deviceId);
        if (parts.length !== 1) {
            throw new Error("Invalid deviceId format");
        }
        id = RfxCom.stringToBytes(parts[0], 2);
        if (id.value < 0 || id.value > 0xffff) {
            throw new Error("Address 0x" + id.value.toString(16) + " outside valid range");
        }
        return {
            idBytes: id.bytes
        };
    };

    _sendCommand(deviceId, temperature, setpoint, ctrl, callback) {
        const self = this,
            device = self._splitDeviceId(deviceId),
            seqnbr = self.rfxcom.nextMessageSequenceNumber(),
            buffer = [0x09, defines.THERMOSTAT1, self.subtype, seqnbr, device.idBytes[0], device.idBytes[1],
                       temperature, setpoint, ctrl, 0];
        self.rfxcom.queueMessage(self, buffer, seqnbr, callback);
        return seqnbr;
    };

    sendMessage(deviceId, temperature, setpoint, status, mode, callback) {
        if (temperature < 0 || temperature > 50) {
            throw new Error("Invalid temperature: must be in range 0-50");
        } else if (setpoint < 5 || setpoint > 45) {
            throw new Error("Invalid setpoint: must be in range 5-45");
        } else if (status < 0 || status > 3) {
            throw new Error("Invalid status code: must be in range 0-3");
        } else if (mode !== 0 && mode !== 1) {
            throw new Error("Invalid mode: must be 0 or 1");
        } else {
            const ctrl = status | (mode << 7);
            if (this.isSubtype('DIGIMAX_SHORT')) {
                setpoint = 0x00;
            }
            return this._sendCommand(deviceId, Math.round(temperature), Math.round(setpoint), ctrl, callback);
        }
    }

}

module.exports = Thermostat1;

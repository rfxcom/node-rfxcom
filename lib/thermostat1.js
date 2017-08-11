/**
 * Created by max on 11/07/2017.
 */
const defines = require('./defines'),
    Transmitter = require('./transmitter'),
    RfxCom = require('./rfxcom');

/*
 * This is a class for controlling Digimax & TLX7506 thermostats
 */
class Thermostat1 extends Transmitter {
    constructor(rfxcom, subtype, options) {
        super(rfxcom, subtype, options);
        this.packetType = "thermostat1";
        this.packetNumber = 0x40;
    };

/*
 * Extracts the device id.
 *
 */
    _splitDeviceId(deviceId) {
        const parts = Transmitter.splitAtSlashes(deviceId);
        if (parts.length !== 1) {
            throw new Error("Invalid deviceId format");
        }
        const id = RfxCom.stringToBytes(parts[0], 2);
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

    sendMessage(deviceId, params, callback) {
        if (params === undefined || typeof params === "function") {
            throw new Error("Missing params")
        }
        let _params = Object.create(params || null);
        if (this.isSubtype('DIGIMAX_SHORT')) {
            _params.setpoint = 0;
        } else if (_params.setpoint === undefined || _params.setpoint < 5 || _params.setpoint > 45) {
            throw new Error("Invalid parameter setpoint: must be in range 5-45");
        } else {
            _params.setpoint = Math.round(_params.setpoint);
        }
        if (_params.temperature === undefined || _params.temperature < 0 || _params.temperature > 50) {
            throw new Error("Invalid parameter temperature: must be in range 0-50");
        } else {
            _params.temperature = Math.round(_params.temperature);
        }
        if (_params.status !== 0 && _params.status !== 1 && _params.status !== 2 && _params.status !== 3) {
            throw new Error("Invalid parameter status: must be in range 0-3");
        }
        if (_params.mode !== 0 && _params.mode !== 1) {
            throw new Error("Invalid parameter mode: must be 0 or 1");
        }
        const ctrl = _params.status | (_params.mode << 7);
        return this._sendCommand(deviceId, _params.temperature, _params.setpoint, ctrl, callback);
    }

}

module.exports = Thermostat1;

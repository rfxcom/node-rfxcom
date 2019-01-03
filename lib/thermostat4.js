/**
 * Created by max on 11/07/2017.
 */
'use strict';
const
    Transmitter = require('./transmitter'),
    RfxCom = require('./rfxcom');

/*
 * This is a class for controlling MCZ pellet stoves
 */
class Thermostat4 extends Transmitter {
    constructor(rfxcom, subtype, options) {
        super(rfxcom, subtype, options);
        this.packetType = "thermostat4";
        this.packetNumber = 0x43;
    };

    _splitDeviceId(deviceId) {
        const parts = Transmitter.splitAtSlashes(deviceId);
        if (this.isSubtype(['MCZ_PELLET_STOVE_1_FAN', 'MCZ_PELLET_STOVE_2_FAN', 'MCZ_PELLET_STOVE_3_FAN']) && parts.length !== 1) {
            throw new Error("Invalid deviceId format")
        }
        const id = RfxCom.stringToBytes(parts[0], 3);
        if (id.value < 1 || id.value > 0xffffff) {
            Transmitter.addressError(id);
        }
        return {
            idBytes: id.bytes
        };
    };

    _sendCommand(deviceId, beep, fan1Speed, fan23Speed, flamePower, mode, callback) {
        const device = this._splitDeviceId(deviceId);
        let buffer = [device.idBytes[0], device.idBytes[1], device.idBytes[2], beep, fan1Speed, fan23Speed, flamePower, mode, 0];

        return this.sendRaw(this.packetNumber, this.subtype, buffer, callback);
    };

/*
    Send the message with the specified parameters, given by the fields of the params object:
    {
        beep:<truthy, falsy>        Optional, defaults to true
        fanSpeed:[0-6, 0-6, 0-6]    Optional, one speed for each fan, defaults to 6 (auto), excess ignored, "auto" --> 6
        flamePower:<1, 2, 3, 4, 5>  Mandatory
        mode:<0, 1, 2, 3>, or
             <"Off", "Manual", "Auto", "Eco"> (case-insensitive, 3 characters needed)
                                    Mandatory
    }
 */
    sendMessage(deviceId, params, callback) {
        const
            numFans = [1, 2, 3][this.subtype];
        if (params === undefined || typeof params === "function") {
            throw new Error("Missing params")
        }
        let _params = Object.create(params || null);
        if (_params.beep === undefined) {
            _params.beep = true;
        } else {
            _params.beep = Boolean(_params.beep);
        }
        if (_params.fanSpeed === undefined) { // Set all fan speeds to 6 ("auto")
            _params.fanSpeed = [6, 6, 6];
        } else if (!Array.isArray(_params.fanSpeed)) {
            _params.fanSpeed = [_params.fanSpeed];
        }
        // delete excess fan speeds
        _params.fanSpeed = _params.fanSpeed.slice(0, numFans);
        // each speed must be a valid number, or it is forced to 6 ("auto")
        // _params.fanSpeed = _params.fanSpeed.map((speed) =>
        //             {return (typeof speed === "number" && speed >= 0 && speed <= 6) ? Math.round(speed) : 6});
        for (let i = 0; i < numFans; i++) {
            _params.fanSpeed[i] = (typeof _params.fanSpeed[i] === "number" && _params.fanSpeed[i] >= 0 && _params.fanSpeed[i] <= 6) ? Math.round(_params.fanSpeed[i]) : 6;
        }
        // if too few fan speeds specified, make the unspecified speeds 6 ("auto")
        if (_params.fanSpeed.length < numFans) {
            for (let i = 0; i < numFans - _params.fanSpeed.length; i++) {
                _params.fanSpeed.push(6);
            }
        }
        if (_params.flamePower === undefined || typeof _params.flamePower !== "number" ||
            _params.flamePower < 1 || _params.flamePower > 5) {
            throw new Error("Invalid parameter flamePower: must be in range 1-5");
        } else {
            _params.flamePower = Math.round(_params.flamePower);
        }
        if (_params.mode === undefined) {
            throw new Error("mode parameter must be specified");
        } else if (typeof _params.mode === "string") {
            if (/Off/i.test(_params.mode)) {
                _params.mode = 0x0;
            } else if (/Man/i.test(_params.mode)) {
                _params.mode = 0x1;
            } else if (/Aut/i.test(_params.mode)) {
                _params.mode = 0x2;
            } else if (/Eco/i.test(_params.mode)) {
                _params.mode = 0x3;
            } else {
                throw new Error("Invalid parameter mode: '" + _params.mode + "'");
            }
        } else if (typeof _params.mode !== "number" || _params.mode < 0 || _params.mode > 3) {
            throw new Error("Invalid parameter mode: must be in range 0-3");
        } else {
            _params.mode = Math.round(_params.mode);
        }
        const
            beep = _params.beep ? 1 : 0,
            fan1Speed = _params.fanSpeed[0],
            fan23Speed = (numFans > 1 ? _params.fanSpeed[1] : 0x01) |
                         (numFans > 2 ? _params.fanSpeed[2] << 4 : 0x10),
            flamePower = _params.flamePower,
            mode = _params.mode;
        return this._sendCommand(deviceId, beep, fan1Speed, fan23Speed, flamePower, mode, callback);
    };

}

module.exports = Thermostat4;

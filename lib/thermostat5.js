/**
 * Created by max on 01/01/2023.
 */
'use strict';
const
    Transmitter = require('./transmitter'),
    RfxCom = require('./rfxcom');

/*
 * This is a class for controlling thermostat5 devices
 */
class Thermostat5 extends Transmitter {
    constructor(rfxcom, subtype, options) {
        super(rfxcom, subtype, options);
        this.packetType = "thermostat5";
        this.packetNumber = 0x44;
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
        if (id.value < 1 || id.value > 0xffff) {
            Transmitter.addressError(id);
        }
        return {
            idBytes: id.bytes
        };
    };

    _sendCommand(deviceId, mode, flameColour, flameBrightness, fuelColour, fuelBrightness, callback) {
        const device = this._splitDeviceId(deviceId);
        let buffer = [device.idBytes[0], device.idBytes[1], mode, flameColour,
                      flameBrightness, fuelColour, fuelBrightness, 0, 0, 0];

        return this.sendRaw(this.packetNumber, this.subtype, buffer, callback);
    };

/*
    Send the message with the specified parameters, given by the fields of the params object:
    {
        mode:<0, 1, 2, 3, 4>, or
             <"Off", "LED", "Standby", "Low", "High"> (case-insensitive, 3 characters needed)
                                    Mandatory
        flameBrightness: 0-5  (0 is off)
        flameColour: 1-3
        fuelBrightness: 0-5   (0 is off)
        fuelColour: 1-14      (14 is cycle)
    }
 */
    sendMessage(deviceId, params, callback) {
        if (params === undefined || typeof params === "function") {
            throw new Error("Missing params")
        }
        let mode = 0;
        if (params.mode === undefined) {
            throw new Error("mode parameter must be specified");
        } else if (typeof params.mode === "string") {
            if (/Off/i.test(params.mode)) {
                mode = 0x0;
            } else if (/LED/i.test(params.mode)) {
                mode = 0x1;
            } else if (/Sta/i.test(params.mode)) {
                mode = 0x2;
            } else if (/Low/i.test(params.mode)) {
                mode = 0x3;
            } else if (/Hig/i.test(params.mode)) {
                mode = 0x4;
            } else {
                throw new Error("Invalid parameter mode: '" + params.mode + "'");
            }
        } else if (typeof params.mode !== "number" || params.mode < 0 || params.mode > 4) {
            throw new Error("Invalid parameter mode: must be in range 0-4");
        } else {
            mode = Math.round(params.mode);
        }
        let flameBrightness = 0; // Default to off
        if (params.flameBrightness !== undefined) {
            if (typeof params.flameBrightness !== "number" || params.flameBrightness < 0 || params.flameBrightness > 5) {
                throw new Error("Invalid parameter flameBrightness: must be in range 0-5");
            } else {
                flameBrightness = Math.round(params.flameBrightness);
            }
        }
        let flameColour = 1; // Default to 1
        if (params.flameColour !== undefined) {
            if (typeof params.flameColour !== "number" || params.flameColour < 1 || params.flameColour > 3) {
                throw new Error("Invalid parameter flameColour: must be in range 1-3");
            } else {
                flameColour = Math.round(params.flameColour);
            }
        }
        let fuelBrightness = 0; // Default to off
        if (params.fuelBrightness !== undefined) {
            if (typeof params.fuelBrightness !== "number" || params.fuelBrightness < 0 || params.fuelBrightness > 5) {
                throw new Error("Invalid parameter fuelBrightness: must be in range 0-5");
            } else {
                fuelBrightness = Math.round(params.fuelBrightness);
            }
        }
        let fuelColour = 14 // Default to Cycle
        if (params.fuelColour !== undefined) {
            if (typeof params.fuelColour !== "number" || params.fuelColour < 1 || params.fuelColour > 14) {
                throw new Error("Invalid parameter fuelColour: must be in range 1-14");
            } else {
                fuelColour = Math.round(params.fuelColour);
            }
        }
        return this._sendCommand(deviceId, mode, flameColour, flameBrightness, fuelColour, fuelBrightness, callback)
    }

}

module.exports = Thermostat5;

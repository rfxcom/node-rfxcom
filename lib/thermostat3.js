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
class Thermostat3 extends Transmitter {
    constructor(rfxcom, subtype, options) {
        super(rfxcom, subtype, options);
        this.packetType = "thermostat3";
        this.packetNumber = 0x42;
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
        const id = RfxCom.stringToBytes(parts[0], 3);
        if (id.value < 0 ||
            (this.isSubtype(["G6R_H4T1", "G6R_H3T1"]) && id.value > 0xff) ||
            (this.isSubtype(["G6R_H4TB", "G6R_H4S"]) && id.value > 0x3ffff) ||
            (this.isSubtype("G6R_H4TD") && id.value > 0xffff)) {
            Transmitter.addressError(id);
        }
        return {
            idBytes: id.bytes
        };
    };

    _sendCommand(deviceId, command, callback) {
        const device = this._splitDeviceId(deviceId);
        let buffer = [device.idBytes[0], device.idBytes[1], device.idBytes[2], command, 0];

        return this.sendRaw(this.packetNumber, this.subtype, buffer, callback);
    };

    switchOn(deviceId, callback) {
        return this._sendCommand(deviceId, 0x01, callback);
    }

    switchOff(deviceId, callback) {
        return this._sendCommand(deviceId, 0x00, callback);
    }

    switchOn2(deviceId, callback) {
        if (this.isSubtype("G6R_H4TB")) {
            return this._sendCommand(deviceId, 0x05, callback);
        } else {
            throw new Error("Device does not support switchOn2()");
        }
    }

    switchOff2(deviceId, callback) {
        if (this.isSubtype("G6R_H4TB")) {
            return this._sendCommand(deviceId, 0x04, callback);
        } else {
            throw new Error("Device does not support switchOff2()");
        }
    }

    up(deviceId, callback) {
        return this._sendCommand(deviceId, 0x02, callback);
    }

    down(deviceId, callback) {
        return this._sendCommand(deviceId, 0x03, callback);
    }

    runUp(deviceId, callback) {
        if (this.isSubtype(["G6R_H4T1", "G6R_H3T1", "G6R_H4TD"])) {
            return this._sendCommand(deviceId, 0x04, callback);
        } else {
            throw new Error("Device does not support runUp()");
        }
    }

    runDown(deviceId, callback) {
        if (this.isSubtype(["G6R_H4T1", "G6R_H3T1", "G6R_H4TD"])) {
            return this._sendCommand(deviceId, 0x05, callback);
        } else {
            throw new Error("Device does not support runDown()");
        }
    }

    stop(deviceId, callback) {
        if (this.isSubtype(["G6R_H4T1", "G6R_H3T1"])) {
            return this._sendCommand(deviceId, 0x06, callback);
        } else {
            throw new Error("Device does not support stop()");
        }
    }

}

module.exports = Thermostat3;

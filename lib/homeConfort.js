/**
 * Created by max on 30/06/2017.
 */
/*jshint -W104 */
'use strict';
const
    Transmitter = require('./transmitter'),
    RfxCom = require('./rfxcom');

/*
 * This is a class for controlling Home Confort devices.
 */
class HomeConfort extends Transmitter {
    constructor(rfxcom, subtype, options) {
        super(rfxcom, subtype, options);
        this.packetType = "homeConfort";
        this.packetNumber = 0x1b;
    }

/*
 * Splits the device id x/y and returns the components, the deviceId will be
 * returned as the component bytes, ready for sending.
 *
 * Throws an Error if the format is invalid or the address is out of range.
 */
    _splitDeviceId (deviceId) {
        let id, houseCode, unitCode;
        const parts = Transmitter.splitAtSlashes(deviceId);
        if (parts.length !== 3) {
            throw new Error("Invalid deviceId format");
        }
        id = RfxCom.stringToBytes(parts[0], 3);
        if ((id.value === 0) || ((this.isSubtype(["TEL_010"])) && id.value > 0x7ffff)) {
            Transmitter.addressError(id);
        }
        houseCode = parts[1].toUpperCase().charCodeAt(0);
        if (houseCode < 0x41 || (this.isSubtype("TEL_010") && houseCode > 0x44)) {
            throw new Error("Invalid house code '" + parts[1] + "'");
        }
        unitCode = parseInt(parts[2], 10);
        if (unitCode < 0 || unitCode > 4) {
            throw new Error("Invalid unit code " + parts[2]);
        }
        return {
            idBytes: id.bytes,
            houseCode: houseCode,
            unitCode: unitCode
        };
    };

/*
 * Creates a buffer containing the command message, and enqueues it for transmission. Parses and error checks the
 * deviceId, converting group commands appropriately.
 */
    _sendCommand(deviceId, command, callback) {
        const device = this._splitDeviceId(deviceId);
        if (device.unitCode === 0) {
            command = command + 2;
        }
        let buffer = [device.idBytes[0], device.idBytes[1], device.idBytes[2],
            device.houseCode, device.unitCode, command, 0, 0, 0];

        return this.sendRaw(this.packetNumber, this.subtype, buffer, callback);
    };

    /*
     * Switch On deviceId.
     */
    switchOn(deviceId, callback) {
        return this._sendCommand(deviceId, 0x01, callback);
    };

    /*
     * Switch Off deviceId.
     */
    switchOff(deviceId, callback) {
        return this._sendCommand(deviceId, 0x00, callback);
    };

}

module.exports = HomeConfort;

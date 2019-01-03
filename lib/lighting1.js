/*jshint -W104 */
'use strict';
const
    Transmitter = require('./transmitter');

/*
 * This is a class for controlling Lighting1 lights.
 */
class Lighting1 extends Transmitter {
    constructor(rfxcom, subtype, options) {
        super(rfxcom, subtype, options);
        this.packetType = "lighting1";
        this.packetNumber = 0x10;
    }

/*
 * Splits the device id into houseCode, unitCode.
 *
 */
    _splitDeviceId(deviceId) {
        let parts, houseCode, unitCode;
        if (Array.isArray(deviceId)) {
            parts = deviceId;
            if (parts.length !== 2) {
                throw new Error("Invalid deviceId format");
            }
            unitCode = parseInt(parts[1]);
        } else {
            parts = deviceId.split("");
            unitCode = parseInt(parts.slice(1).join(""), 10);
        }
        houseCode = parts[0].toUpperCase().charCodeAt(0);
        if (houseCode < 0x41 || (this.isSubtype("CHACON") && houseCode > 0x43) ||
            (this.isSubtype(["RISING_SUN", "COCO", "HQ"]) && houseCode > 0x44) || houseCode > 0x50) {
            throw new Error("Invalid house code '" + parts[0] + "'");
        }
        if ((this.isSubtype(["X10", "ARC", "WAVEMAN"]) && unitCode > 16) ||
            (this.isSubtype(["ELRO", "IMPULS", "HQ"]) && unitCode > 64) ||
            (this.isSubtype("PHILIPS_SBC") && unitCode > 8) ||
            (this.isSubtype("ENERGENIE_5_GANG") && unitCode > 10) ||
            (this.isSubtype(["CHACON", "RISING_SUN", "ENERGENIE_ENER010", "COCO"]) && unitCode > 4) ||
            (this.isSubtype("OASE_FM") && unitCode > 3)) {
            throw new Error("Invalid unit code " + parts[1]);
        }
        return {
            houseCode: houseCode,
            unitCode: unitCode
        };
    };

    _sendCommand(deviceId, command, callback) {
        const device = this._splitDeviceId(deviceId);
        if (device.unitCode === 0) {
            if (command < 2) {
                command = command + 5;
                if ((this.isSubtype(["X10", "ARC", "PHILIPS_SBC", "ENERGENIE_ENER010"])) === false) {
                    throw new Error("Device does not support group on/off commands");
                }
            } else if (command !== 7) {
                throw new Error("Device does not support group dim/bright commands");
            }
        }
        let buffer = [device.houseCode, device.unitCode, command, 0];

        return this.sendRaw(this.packetNumber, this.subtype, buffer, callback);
    };

/*
 * Switch on deviceId/unitCode
 */
    switchOn(deviceId, callback) {
        return this._sendCommand(deviceId, 0x01, callback);
    };

/*
 * Switch off deviceId/unitCode
 */
    switchOff(deviceId, callback) {
        return this._sendCommand(deviceId, 0x00, callback);
    };

/*
 * Increase brightness deviceId/unitCode (X10 only) 'Bright'
 */
    increaseLevel(deviceId, roomNumber, callback) {
        if (this.isSubtype("X10")) {
            if (typeof roomNumber === "function") {
                callback = roomNumber;
            }
            return this._sendCommand(deviceId, 0x03, callback);
        } else {
            throw new Error("Device does not support increaseLevel()")
        }
    };

/*
 * Decrease brightness deviceId/unitCode (X10 only) 'Dim'
 */
    decreaseLevel(deviceId, roomNumber, callback) {
        if (this.isSubtype("X10")) {
            if (typeof roomNumber === "function") {
                callback = roomNumber;
            }
            return this._sendCommand(deviceId, 0x02, callback);
        } else {
            throw new Error("Device does not support decreaseLevel()")
        }
    };

/*
 * 'Chime' deviceId/unitCode (ARC only)
 */
    chime(deviceId, callback) {
        if (this.isSubtype("ARC")) {
            return this._sendCommand(deviceId, 0x07, callback);
        } else {
            throw new Error("Device does not support chime()");
        }
    };

/*
 * 'Program' device (OASE_FM only)
 */
    program(deviceId, callback) {
        if (this.isSubtype("OASE_FM")) {
            return this._sendCommand(deviceId, 0x04, callback);
        } else {
            throw new Error("Device does not support program()");
        }
    };

}

module.exports = Lighting1;


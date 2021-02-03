/*jshint -W104 */
'use strict';
const defines = require('./defines'),
    Transmitter = require('./transmitter'),
    RfxCom = require('./rfxcom');

/*
 * This is a class for controlling multiple types of autmated blinds
 */
class Blinds1 extends Transmitter {
    constructor (rfxcom, subtype, options) {
        super (rfxcom, subtype, options);
        this.packetType = "blinds1";
        this.packetNumber = 0x19;
    }

/*
 * Splits the device id  and returns the components.
 * Throws an Error if the format is invalid.
 * Least significant nibble placed in the top 4 bits of the last id.byte for BLINDS_T6, BLINDS_T7 & BLINDS_T9
 */
    _splitDeviceId(deviceId) {
        let id, unitCode;
        const parts = Transmitter.splitAtSlashes(deviceId);
        if (this.isSubtype(["BLINDS_T2", "BLINDS_T4", "BLINDS_T5", "BLINDS_T10", "BLINDS_T11", "BLINDS_T18"])) {
            unitCode = 0;
        } else if (parts.length === 2) {
            unitCode = parseInt(parts[1]);
            if (unitCode < 0) {
                throw new Error("Invalid unit code " + parts[1]);
            } else if (this.isSubtype(["BLINDS_T0", "BLINDS_T1", "BLINDS_T6", "BLINDS_T7"])) {
                if (unitCode > 15) {
                    throw new Error("Invalid unit code " + parts[1]);
                }
            } else if (this.isSubtype(["BLINDS_T3", "BLINDS_T14"])) {
                if (unitCode === 0) {
                    unitCode = 0x10;
                } else if (unitCode > 16) {
                    throw new Error("Invalid unit code " + parts[1]);
                } else {
                    unitCode = unitCode - 1;
                }
            } else if (this.isSubtype("BLINDS_T8")) {
                if (unitCode === 0) {
                    throw new Error("Subtype doesn't support group commands");
                } else if (unitCode > 6) {
                    throw new Error("Invalid unit code " + parts[1]);
                }
                unitCode = unitCode - 1;
            } else if (this.isSubtype(["BLINDS_T9", "BLINDS_T16"])) {
                if (unitCode > 6) {
                    throw new Error("Invalid unit code " + parts[1]);
                }
            } else if (this.isSubtype(["BLINDS_T12", "BLINDS_T15"])) {
                if (unitCode === 0) {
                    unitCode = 0x0f;
                } else if (unitCode > 15) {
                    throw new Error("Invalid unit code " + parts[1]);
                } else {
                    unitCode = unitCode - 1;
                }
            } else if (this.isSubtype("BLINDS_T13")) {
                if (unitCode > 99) {
                    throw new Error("Invalid unit code " + parts[1]);
                }
            } else if (this.isSubtype("BLINDS_T17")) {
                if (unitCode > 5) {
                    throw new Error("Invalid unit code " + parts[1]);
                }
            }
        } else {
            throw new Error("Invalid deviceId format");
        }
        if (this.isSubtype(["BLINDS_T6", "BLINDS_T7", "BLINDS_T9"])) {
            id = RfxCom.stringToBytes(parts[0] + "0", 4); // Nibble shift
            id.value = id.value/16;
        } else {
            id = RfxCom.stringToBytes(parts[0], 3);
        }
        if ((id.value === 0) ||
            ((this.isSubtype(["BLINDS_T0", "BLINDS_T1", "BLINDS_T12", "BLINDS_T13",
                "BLINDS_T15", "BLINDS_T16"])) && id.value > 0xffff) ||
            ((this.isSubtype(["BLINDS_T2", "BLINDS_T3", "BLINDS_T4", "BLINDS_T5",
                "BLINDS_T10", "BLINDS_T11", "BLINDS_T14", "BLINDS_T17"])) && id.value > 0xffffff) ||
            ((this.isSubtype(["BLINDS_T6", "BLINDS_T7"])) && id.value > 0xfffffff) ||
            ((this.isSubtype("BLINDS_T8")) && id.value > 0xfff) ||
            ((this.isSubtype("BLINDS_T9")) && id.value > 0xfffff) ||
            ((this.isSubtype("BLINDS_T18")) && (id.value < 0x103000 || id.value > 0x103fff))) {
            Transmitter.addressError(id);
        }
        return {
            idBytes: id.bytes,
            unitCode: unitCode
        };
    }

    _sendCommand(deviceId, command, callback) {
        const device = this._splitDeviceId(deviceId);
        let buffer = [device.idBytes[0], device.idBytes[1], device.idBytes[2], device.unitCode, command, 0];
        if (this.isSubtype("BLINDS_T6") || this.isSubtype("BLINDS_T7") || this.isSubtype("BLINDS_T9")) {
            buffer[3] = buffer[3] | device.idBytes[3];
        }
        return this.sendRaw(this.packetNumber, this.subtype, buffer, callback);
    };

/*
 * Open deviceId.
 */
    open(deviceId, callback) {
        return this._sendCommand(deviceId, defines.BLINDS_OPEN, callback);
    };

/*
 * Close deviceId.
 */
    close(deviceId, callback) {
        return this._sendCommand(deviceId, defines.BLINDS_CLOSE, callback);
    };

/*
 * Stop deviceId.
 */
    stop(deviceId, callback) {
        if (this.isSubtype("BLINDS_T13")) {
            throw new Error("Device does not support stop()");
        } else {
            return this._sendCommand(deviceId, defines.BLINDS_STOP, callback);
        }
    };

/*
 * Confirm button
 */
    // noinspection JSUnusedGlobalSymbols
    confirm(deviceId, callback) {
        if (this.isSubtype(["BLINDS_T5", "BLINDS_T8"])) {
            throw new Error("Device does not support confirm()");
        } else if (this.isSubtype("BLINDS_T13")) {
            return this._sendCommand(deviceId, defines.BLINDS_T13_CONFIRM, callback);
        } else  {
            return this._sendCommand(deviceId, defines.BLINDS_CONFIRM, callback);
        }
    };

/*
 * Set (upper) limit.
 */
    setLimit(deviceId, callback) {
        if (this.isSubtype(["BLINDS_T0", "BLINDS_T1", "BLINDS_T4", "BLINDS_T9"])) {
            return this._sendCommand(deviceId, defines.BLINDS_SET_LIMIT, callback);
        } else {
            throw new Error("Device does not support setLimit()");
        }
    };

/*
 * Set lower limit.
 */
    setLowerLimit(deviceId, callback) {
        if (this.isSubtype(["BLINDS_T4", "BLINDS_T9"])) {
            return this._sendCommand(deviceId, defines.BLINDS_SET_LOWER_LIMIT, callback);
        } else {
            throw new Error("Device does not support setLowerLimit()");
        }
    };

/*
 * Reverse direction.
 */
    // noinspection JSUnusedGlobalSymbols
    reverse(deviceId, callback) {
        if (this.isSubtype("BLINDS_T4")) {
            return this._sendCommand(deviceId, defines.BLINDS_T4_REVERSE, callback);
        } else if (this.isSubtype(["BLINDS_T9", "BLINDS_T10"])) {
            return this._sendCommand(deviceId, defines.BLINDS_REVERSE, callback);
        } else if (this.isSubtype("BLINDS_T16")) {
            return this._sendCommand(deviceId, defines.BLINDS_T16_REVERSE, callback);
        } else {
            throw new Error("Device does not support reverse()");
        }
    };

/*
 * Down deviceId.
 */
    down(deviceId, callback) {
        if (this.isSubtype(["BLINDS_T5", "BLINDS_T8", "BLINDS_T10"])) {
            return this._sendCommand(deviceId, defines.BLINDS_DOWN, callback);
        } else {
            throw new Error("Device does not support down()");
        }
    };

/*
 * Up deviceId.
 */
    up(deviceId, callback) {
        if (this.isSubtype(["BLINDS_T5", "BLINDS_T8", "BLINDS_T10"])) {
            return this._sendCommand(deviceId, defines.BLINDS_UP, callback);
        } else {
            throw new Error("Device does not support up()");
        }
    };

/*
 * Go to intermediate position
 */
    intermediatePosition(deviceId, position, callback) {
        if (callback === undefined && typeof position === "function") {
            callback = position;
            position = 2;
        } else if (typeof position === "string") {
            position = parseInt(position);
        } else if (typeof position === "number") {
            position = Math.round(position);
        }
        if (this.isSubtype("BLINDS_T9")) {
            if ((typeof position != "number") || (isNaN(position)) || (position < 1) || (position > 3)) {
                throw new Error("Invalid position: value must be in range 1-3");
            } else {
                return this._sendCommand(deviceId, 0x06 + position, callback);
            }
        } else if (this.isSubtype(["BLINDS_T6", "BLINDS_T18"])) {
            return this._sendCommand(deviceId, 0x04, callback);
        } else if (this.isSubtype("BLINDS_T17")) {
            return this._sendCommand(deviceId, 0x05, callback);
        } else {
            throw new Error("Device does not support intermediatePosition()");
        }
    }

/*
 * T13 (screenline) adjust venetian blind angle
 */
    venetianIncreaseAngle(deviceId, callback) {
        if (this.isSubtype("BLINDS_T13")) {
            return this._sendCommand(deviceId, 0x04, callback);
        } else {
            throw new Error("Device does not support venetianIncreaseAngle()");
        }
    };

    venetianDecreaseAngle(deviceId, callback) {
        if (this.isSubtype("BLINDS_T13")) {
            return this._sendCommand(deviceId, 0x05, callback);
        } else {
            throw new Error("Device does not support venetianDecreaseAngle()");
        }
    };

/*
 * T6 Light command
 */
    toggleLightOnOff(deviceId, callback) {
        if (this.isSubtype("BLINDS_T6")) {
            return this._sendCommand(deviceId, 0x05, callback);
        } else {
            throw new Error("Device does not support toggleLightOnOff()");
        }
    };
}

module.exports = Blinds1;

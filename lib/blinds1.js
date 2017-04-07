module.exports = Blinds1;
/*jshint -W104 */
const defines = require('./defines'),
    index = require('./index'),
    util = require('util');

/*
 * This is a class for controlling multiple types of autmated blinds
 */
function Blinds1(rfxcom, subtype) {
    var self = this;

    self.rfxcom = rfxcom;
    self.subtype = subtype;

    if (typeof self.subtype === "undefined") {
        throw new Error("Must provide a subtype.");
    }
}

/*
    Returns true if the subtype matches the supplied subtypeName
 */
Blinds1.prototype.isSubtype = function (subtypeName) {
    return index.blinds1[subtypeName] === this.subtype;
};

/*
 * Splits the device id  and returns the components.
 * Throws an Error if the format is invalid.
 * Least significant nibble placed in the top 4 bits of the last id.byte for BLINDS_T6, BLINDS_T7 & BLINDS_T9
 */
Blinds1.prototype._splitDeviceId = function(deviceId) {
    var parts, id, unitCode;
    if (util.isArray(deviceId)) {
        parts = deviceId;
    } else {
        parts = deviceId.split("/");
    }
    if (this.isSubtype("BLINDS_T2") || this.isSubtype("BLINDS_T3") ||
        this.isSubtype("BLINDS_T4") || this.isSubtype("BLINDS_T5") ||
        this.isSubtype("BLINDS_T10") || this.isSubtype("BLINDS_T11")) {
        unitCode = 0;
    } else if (parts.length === 2) {
        unitCode = parseInt(parts[1]);
        if (this.isSubtype("BLINDS_T8")) {
            if (unitCode === 0) {
                throw new Error("Subtype doesn't support group commands");
            } else if (unitCode > 6) {
                throw new Error("Invalid unit code " + parts[1]);
            }
            unitCode = unitCode - 1;
        } else if (this.isSubtype("BLINDS_T12")) {
            if (unitCode === 0) {
                unitCode = 0x0f;
            } else if (unitCode > 15) {
                throw new Error("Invalid unit code " + parts[1]);
            } else {
                unitCode = unitCode - 1;
            }
        } else if (unitCode > 99 || (!this.isSubtype("BLINDS_T13") && unitCode > 15) || (this.isSubtype("BLINDS_T9") && unitCode > 6)) {
            throw new Error("Invalid unit code " + parts[1]);
        }

    } else {
        throw new Error("Invalid deviceId format");
    }
    if (this.isSubtype("BLINDS_T6") || this.isSubtype("BLINDS_T7") || this.isSubtype("BLINDS_T9")) {
        id = this.rfxcom.stringToBytes(parts[0] + "0", 4); // Nibble shift
        id.value = id.value/16;
    } else {
        id = this.rfxcom.stringToBytes(parts[0], 3);
    }
    if ((id.value === 0) ||
        ((this.isSubtype("BLINDS_T8")) && id.value > 0xfff) ||
        ((this.isSubtype("BLINDS_T0") || this.isSubtype("BLINDS_T1") || this.isSubtype("BLINDS_T12") || this.isSubtype("BLINDS_T13")) && id.value > 0xffff) ||
        ((this.isSubtype("BLINDS_T9")) && id.value > 0xfffff) ||
        ((this.isSubtype("BLINDS_T2") || this.isSubtype("BLINDS_T3") || this.isSubtype("BLINDS_T4") || this.isSubtype("BLINDS_T5") || this.isSubtype("BLINDS_T10") || this.isSubtype("BLINDS_T11")) && id.value > 0xffffff) ||
        ((this.isSubtype("BLINDS_T6") || this.isSubtype("BLINDS_T7")) && id.value > 0xfffffff)) {
            throw new Error("Address 0x" + id.value.toString(16) + " outside valid range");
    }
    return {
        idBytes: id.bytes,
        unitCode: unitCode
    };

};

Blinds1.prototype._timeoutHandler = function(buffer, seqnbr) {
    return false;
};

Blinds1.prototype._sendCommand = function(deviceId, command, callback) {
  var self = this,
      buffer,
      device = self._splitDeviceId(deviceId),
      seqnbr = self.rfxcom.getSequenceNumber();

    buffer = [0x09, defines.BLINDS1, self.subtype, seqnbr,
              device.idBytes[0], device.idBytes[1], device.idBytes[2], device.unitCode,
	         command, 0];

    if (this.isSubtype("BLINDS_T6") || this.isSubtype("BLINDS_T7") || this.isSubtype("BLINDS_T9")) {
        buffer[7]  = buffer[7] | device.idBytes[3];
    }
    self.rfxcom.queueMessage(self, buffer, seqnbr, callback);
    return seqnbr;
};

/*
 * Open deviceId.
 */
Blinds1.prototype.open = function(deviceId, callback) {
  return this._sendCommand(deviceId, defines.BLINDS_OPEN, callback);
};

/*
 * Close deviceId.
 */
Blinds1.prototype.close = function(deviceId, callback) {
  return this._sendCommand(deviceId, defines.BLINDS_CLOSE, callback);
};

/*
 * Stop deviceId.
 */
Blinds1.prototype.stop = function(deviceId, callback) {
    if (this.isSubtype("BLINDS_T13")) {
        throw new Error("Device does not support stop()");
    } else {
        return this._sendCommand(deviceId, defines.BLINDS_STOP, callback);
    }
};

/*
 * Confirm button
 */
Blinds1.prototype.confirm = function(deviceId, callback) {
    if (this.isSubtype("BLINDS_T5") || this.isSubtype("BLINDS_T8")) {
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
Blinds1.prototype.setLimit = function(deviceId, callback) {
    if (this.isSubtype("BLINDS_T0") || this.isSubtype("BLINDS_T1") ||
        this.isSubtype("BLINDS_T4") || this.isSubtype("BLINDS_T9")) {
        return this._sendCommand(deviceId, defines.BLINDS_SET_LIMIT, callback);
    } else {
        throw new Error("Device does not support setLimit()");
    }
};

/*
 * Set lower limit.
 */
Blinds1.prototype.setLowerLimit = function(deviceId, callback) {
    if (this.isSubtype("BLINDS_T4") || this.isSubtype("BLINDS_T9")) {
        return this._sendCommand(deviceId, defines.BLINDS_SET_LOWER_LIMIT, callback);
    } else {
        throw new Error("Device does not support setLowerLimit()");
    }
};

/*
 * Reverse direction.
 */
Blinds1.prototype.reverse = function(deviceId, callback) {
    if (this.isSubtype("BLINDS_T4")) {
        return this._sendCommand(deviceId, defines.BLINDS_T4_REVERSE, callback);
    } else if (this.isSubtype("BLINDS_T9") || this.isSubtype("BLINDS_T10")) {
        return this._sendCommand(deviceId, defines.BLINDS_REVERSE, callback);
    } else {
        throw new Error("Device does not support reverse()");
    }
};

/*
 * Down deviceId.
 */
Blinds1.prototype.down = function(deviceId, callback) {
    if (this.isSubtype("BLINDS_T5") || this.isSubtype("BLINDS_T8") || this.isSubtype("BLINDS_T10")) {
    return this._sendCommand(deviceId, defines.BLINDS_DOWN, callback);
    } else {
        throw new Error("Device does not support down()");
    }
};

/*
 * Up deviceId.
 */
Blinds1.prototype.up = function(deviceId, callback) {
    if (this.isSubtype("BLINDS_T5") || this.isSubtype("BLINDS_T8") || this.isSubtype("BLINDS_T10")) {
    return this._sendCommand(deviceId, defines.BLINDS_UP, callback);
    } else {
        throw new Error("Device does not support up()");
    }
};

module.exports = Lighting2;
/*jshint -W104 */
const defines = require('./defines'),
    index = require('./index'),
    util = require('util');

/*
 * This is a class for controlling Lighting2 lights.
 */
function Lighting2(rfxcom, subtype) {
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
Lighting2.prototype.isSubtype = function (subtypeName) {
    return index.lighting2[subtypeName] === this.subtype;
};

/*
 * Splits the device id x/y and returns the components, the deviceId will be
 * returned as the component bytes, ready for sending.
 *
 * Throws an Error if the format is invalid or if the deviceId is not the
 * correct length, the address is out of the valid range
 *
 * MRH: if deviceId is an array, it is assumed to be already split
 */
Lighting2.prototype._splitDeviceId = function(deviceId) {
    var parts, id, unitCode;
    if (util.isArray(deviceId)) {
        parts = deviceId;
    } else {
        parts = deviceId.split("/");
    }
    if (this.isSubtype("KAMBROOK")) {
        if (parts.length !== 3) {
            throw new Error("Invalid deviceId format");
        }
        id = this.rfxcom.stringToBytes(parts[1], 4);
        if (id.value < 1 || id.value > 0xffffff) {
            throw new Error("Remote ID 0x" + id.value.toString(16) + " outside valid range");
        }
        id.bytes[0] = parts[0].toUpperCase().charCodeAt(0) - "A".charCodeAt(0);
        if (id.bytes[0] < 0 || id.bytes[0] > 3) {
            throw new Error("Invalid house code '" + parts[0] + "'");
        }
        unitCode = parseInt(parts[2]);
        if (unitCode === 0) {
            throw new Error("Subtype doesn't support group commands");
        } else if (unitCode < 1 || unitCode > 5) {
            throw new Error("Invalid unit code " + parts[2]);
        }
    } else {
        if (parts.length !== 2) {
            throw new Error("Invalid deviceId format");
        }
        id = this.rfxcom.stringToBytes(parts[0], 4);
        if (id.value < 1 || id.value > 0x03ffffff) {
            throw new Error("Device ID 0x" + id.value.toString(16) + " outside valid range");
        }
        unitCode = parseInt(parts[1]);
        if (unitCode < 0 || unitCode > 16) {
            throw new Error("Invalid unit code " + parts[1]);
        }
    }
    return {
        idBytes: id.bytes,
        unitCode: unitCode
    };
};

Lighting2.prototype._sendCommand = function(deviceId, command, level, callback) {
    var self = this,
        device = self._splitDeviceId(deviceId),
        seqnbr = self.rfxcom.getSequenceNumber();
        level = (level === undefined) ? 0xf : level; // Now works when level == 0
    // If the device code is 0 convert to a group command by adding 3
    if (device.unitCode == 0) {
        command = command + 3;
        device.unitCode = 1;   // Group commands are sent with a unit code of 1
    }
    var buffer = [0x0b, defines.LIGHTING2, self.subtype, seqnbr, device.idBytes[0],
                    device.idBytes[1], device.idBytes[2], device.idBytes[3],
                    device.unitCode, command, level, 0];

    self.rfxcom.queueMessage(buffer, seqnbr, callback);

    return seqnbr;
};

/*
 * Switch on deviceId/unitCode (unitCode 0 means group)
 */
Lighting2.prototype.switchOn = function(deviceId, callback) {
    return this._sendCommand(deviceId, 1, 15, callback);
};

/*
 * Switch off deviceId/unitCode (unitCode 0 means group)
 */
Lighting2.prototype.switchOff = function(deviceId, callback) {
    return this._sendCommand(deviceId, 0, 0, callback);
};

/*
 * Set dim level deviceId/unitCode (unitCode 0 means group)
 */
Lighting2.prototype.setLevel = function(deviceId, level, callback) {
    if (this.isSubtype("KAMBROOK")) {
        throw new Error("KAMBROOK: Set level not supported")
    }
    if ((level < 0) || (level > 0xf)) {
        throw new Error("Invalid level: value must be in range 0-15");
    }
    return this._sendCommand(deviceId, 2, level, callback);
};

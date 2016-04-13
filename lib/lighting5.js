module.exports = Lighting5;
/*jshint -W104 */
const defines = require('./defines'),
    index = require('./index'),
    util = require('util');

/*
 * This is a class for controlling LightwaveRF lights.
 */
function Lighting5(rfxcom, subtype) {
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
Lighting5.prototype.isSubtype = function (subtypeName) {
    return index.lighting5[subtypeName] === this.subtype;
};

/*
 * Splits the device id x/y and returns the components, the deviceId will be
 * returned as the component bytes, ready for sending.
 *
 * Throws an Error if the format is invalid.
 */
Lighting5.prototype._splitDeviceId = function(deviceId) {
    var parts, id, unitCode;
    if (util.isArray(deviceId)) {
        parts = deviceId;
    } else {
        parts = deviceId.split("/");
    }
    if (this.isSubtype("MDREMOTE") || this.isSubtype("LIVOLO") || this.isSubtype("TRC02")) {
        unitCode = 1;
        if (parts.length !== 1) {
            throw new Error("Invalid deviceId format");
        }
    } else if (parts.length === 2) {
        unitCode = parseInt(parts[1]);
    } else {
        throw new Error("Invalid deviceId format");
    }
    id = this.rfxcom.stringToBytes(parts[0], 3);
    if (id.value < 1 || ((this.isSubtype("LIGHTWAVERF") || this.isSubtype("CONRAD") || this.isSubtype("TRC02")) && id.value > 0xffffff) ||
        (this.isSubtype("EMW100") && id.value > 0x3fff) || (this.isSubtype("BBSB") && id.value > 0x7ffff) ||
        ((this.isSubtype("MDREMOTE") || this.isSubtype("LIVOLO")) && id.value > 0xffff)) {
        throw new Error("Address 0x" + id.value.toString(16) + " outside valid range");
    }
    if (unitCode < 1 || ((this.isSubtype("LIGHTWAVERF") || this.isSubtype("CONRAD") ) && unitCode > 16) ||
        (this.isSubtype("BBSB") && unitCode > 6) || (this.isSubtype("EMW100") && unitCode > 4)) {
        throw new Error("Invalid unit code " + parts[1]);
    }
    return {
        idBytes: id.bytes,
        unitCode: unitCode
    };
};


Lighting5.prototype._sendCommand = function(deviceId, command, level, callback) {
    var self = this,
        device = self._splitDeviceId(deviceId),
        cmdId = self.rfxcom.getCmdNumber();
        level = (level === undefined) ? 0x1f : level; // Now works when level == 0
    // If the device code is 0 and the subtype supports group commands, translate them
    if (device.unitCode === 0) {
        if (this.isSubtype("LIGHTWAVERF") || this.isSubtype("BBSB") || this.isSubtype("CONRAD")) {
            if (command === 0x00) {
                command = 0x02;     // Group Off
            } else if (!this.isSubtype("LIGHTWAVERF") && command === 0x01) {
                command = 0x03;     // Group On
            } else {
                throw new Error("LIGHTWAVERF doesn't support Group On");
            }
        } else {
            throw new Error("Subtype doesn't support group commands");
        }
    }
    var buffer = [0x0a, defines.LIGHTING5, self.subtype, cmdId,
                  device.idBytes[0], device.idBytes[1], device.idBytes[2],
                  device.unitCode, command, level, 0];

    if (self.rfxcom.options.debug) {
        console.log("[rfxcom] on " + self.rfxcom.device + " - " + "Sent    : %s", self.rfxcom.dumpHex(buffer));
    }
    self.rfxcom.serialport.write(buffer, function(err, response) {
        if (typeof callback === "function") {
            callback(err, response, cmdId);
        }
    });
    return cmdId;
};


/*
 * Switch on deviceId/unitCode
 */
Lighting5.prototype.switchOn = function (deviceId, options, callback) {
    var command, level;
    if (this.isSubtype("LIGHTWAVERF")) {
        // TODO - use of the switchOn() command to set mood & level should be deprecated
        if (typeof options === "function") {
            callback = options;
            options = {};
        }
        if (typeof options === "undefined") {
            options = {};
        }
        if (typeof options.mood !== "undefined") {
            if (options.mood < 1 || options.mood > 5) {
                throw new Error("Invalid mood value must be in range 1-5.");
            } else {
                options.mood = options.mood + 2;
            }
        }
        command = options.mood || 1;
        if (typeof options.level !== "undefined") {
            command = 0x10;
            level = options.level || 0;
        }
        return this._sendCommand(deviceId, command, level, callback);
    } else {
        callback = options;
        return this._sendCommand(deviceId, 0x01, 0x1f, callback);
    }
};


/*
 * Switch off deviceId/unitCode
 */
Lighting5.prototype.switchOff = function (deviceId, callback) {

    return this._sendCommand(deviceId, 0x00, 0, callback);
};

/*
 Set dim level (Lightwave RF only)
 */
Lighting5.prototype.setLevel = function (deviceId, level, callback) {
        if (this.isSubtype("LIGHTWAVERF")) {
            if ((level < 0x0) || (level > 0x1f)) {
                throw new Error("Invalid level: value must be in range 0-31");
            }
            return this._sendCommand(deviceId, 0x10, level, callback);
        } else {
            throw new Error("Device does not support setLevel()");
        }
    };

/*
 Set mood (Lightwave RF only) - like a group on/off combination
 */
Lighting5.prototype.setMood = function (deviceId, mood, callback) {
        if (this.isSubtype("LIGHTWAVERF")) {
            if (mood < 1 || mood > 5) {
                throw new Error("Invalid mood value must be in range 1-5.");
            }
            return this._sendCommand(deviceId, mood + 2, 0x1f, callback);
        } else {
            throw new Error("Device does not support setMood()");
        }
    };

/*
 * Increase brightness deviceId/unitCode (MDREMOTE, Livolo, TRC02 only) 'Dim+'
 */
Lighting5.prototype.increaseLevel = function (deviceId, callback) {
        if (this.isSubtype("MDREMOTE") || this.isSubtype("LIVOLO") || this.isSubtype("TRC02")) {
            return this._sendCommand(deviceId, 0x02, 0, callback);
        } else {
            throw new Error("Device does not support increaseLevel()")
        }
    };

/*
 * Decrease brightness deviceId/unitCode (MDREMOTE, Livolo, TRC02 only) 'Dim-'
 */
Lighting5.prototype.decreaseLevel = function (deviceId, callback) {
        if (this.isSubtype("MDREMOTE") || this.isSubtype("LIVOLO") || this.isSubtype("TRC02")) {
            return this._sendCommand(deviceId, 0x03, 0, callback);
        } else {
            throw new Error("Device does not support decreaseLevel()")
        }
    };

/*
 Toggle on/off (Livolo only)
 */
Lighting5.prototype.toggleOnOff = function (deviceId, callback) {
        if (this.isSubtype("LIVOLO")) {
            return this._sendCommand(deviceId, 0x01, 0, callback);
        } else {
            throw new Error("Device does not support toggleOnOff()")
        }
    };

/*
 Learn/program (EMW100 only)
 */
Lighting5.prototype.program = function (deviceId, callback) {
        if (this.isSubtype("EMW100")) {
            return this._sendCommand(deviceId, 0x02, 0, callback);
        } else {
            throw new Error("Device does not support program()")
        }
    };



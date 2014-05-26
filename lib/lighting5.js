module.exports = Lighting5;
/*jshint -W104 */
const defines = require('./defines');

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
 * Splits the device id x/y and returns the components, the deviceId will be
 * returned as the component bytes, ready for sending.
 *
 * Throws an Error if the format is invalid.
 */
Lighting5.prototype._splitDeviceId = function(deviceId) {
    var parts, unitCode, idBytes, idValue;
    if (typeof deviceId === "object" && deviceId.constructor === Array) {
        parts = deviceId;
    } else {
        parts = deviceId.split("/");
    }
    idBytes = this.rfxcom.stringToBytes(parts[0]);
    if (idBytes.length !== 3) {
        throw new Error("Invalid deviceId format");
    }
    idValue = (idBytes[0]*256 + idBytes[1])*256 + idBytes[2];
    if (idValue < 1 || ((this.subtype == 0 || this.subtype == 4 || this.subtype == 6) && idValue > 0xfffff) ||
        (this.subtype == 1 && idValue > 0x3fff) || (this.subtype == 2 && idValue > 0x7ffff) ||
        ((this.subtype == 3 || this.subtype == 5) && idValue > 0xffff)) {
        throw new Error("Address " + idValue.toString(16) + " outside valid range");
    }
    if (this.subtype == 3 || this.subtype == 5 || this.subtype == 6) {
        unitCode = 1;
    } else if (parts.length == 2) {
        unitCode = parts[1];
    } else {
        throw new Error("Misisng unit code");
    }
    if (unitCode < 1 || ((this.subtype == 0 || this.subtype == 4 ) && unitCode > 16) ||
        (this.subtype == 2 && unitCode > 6) || (this.subtype == 1 && unitCode > 4)) {
        throw new Error("Unit code " + unitCode + " outside valid range");
    }
    return {
        idBytes: idBytes,
        unitCode: unitCode
    };
};


Lighting5.prototype._sendCommand = function(deviceId, command, level, callback) {
    var self = this,
        device = self._splitDeviceId(deviceId),
        cmdId = self.rfxcom.getCmdNumber();
    level = (level === undefined) ? 0xf : level; // Now works when level == 0
    // If the device code is 0 and the subtype supports group commands, translate them
    if (device.unitCode == 0) {
        if (self.subtype == 0x00 || self.subtype == 0x02 || self.subtype == 0x04) {
            if (command == 0x00) {
                command = 0x02;     // Group Off
            } else if (self.subtype != 0x00 && command == 0x01) {
                command = 0x03;     // Group On
            } else {
                throw new Error("LightwaveRF doesn't support Group On");
            }
        } else {
            throw new Error("Subtype doesn't support group commands");
        }
    }
    var buffer = [0x0a, defines.LIGHTING5, self.subtype, cmdId,
                    device.idBytes[0], device.idBytes[1], device.idBytes[2],
                    device.unitCode, command, level, 0];

    if (self.rfxcom.options.debug) {
        console.log("Sending %j", self.rfxcom.dumpHex(buffer));
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
Lighting5.prototype.switchOn = function (deviceId, callback) {
    return this._sendCommand(deviceId, 0x01, callback);
};

/*
 * Switch off deviceId/unitCode
 */
Lighting5.prototype.switchOff = function (deviceId, callback) {
    return this._sendCommand(deviceId, 0x00, callback);
};

/*
 Set dim level (Lightwave RF only)
 */
Lighting5.prototype.setLevel = function (deviceId, level, callback) {
    if (this.subtype == 0x00) {
        if ((level < 0x0) || (level > 0xf)) {
            throw new Error("Invalid level value must be in range 0-15.");
        }
        return this._sendCommand(deviceId, 0x10, level, callback);
    } else {
        return 0;
    }
};

/*
 Set mood (Lightwave RF only) - like a group on/off combination
 */
Lighting5.prototype.setMood = function (deviceId, mood, callback) {
    if (this.subtype == 0x00) {
        if (mood < 1 || mood > 5) {
            throw new Error("Invalid mood value must be in range 1-5.");
        }
        return this._sendCommand(deviceId, mood + 2, callback);
    } else {
        return 0;
    }
};

/*
 * Increase brightness deviceId/unitCode (MDREMOTE, Livolo, TRC02 only) 'Dim+'
 */
Lighting5.prototype.inreaseLevel = function (deviceId, callback) {
    if (this.subtype == 3 || this.subtype == 5 || this.subtype == 6) {
        return this._sendCommand(deviceId, 0x02, callback);
    } else {
        throw new Error("Device does not support increaseLevel()")
    }
};

/*
 * Decrease brightness deviceId/unitCode (MDREMOTE, Livolo, TRC02 only) 'Dim-'
 */
Lighting5.prototype.decreaseLevel = function (deviceId, callback) {
    if (this.subtype == 3 || this.subtype == 5 || this.subtype == 6) {
        return this._sendCommand(deviceId, 0x03, callback);
    } else {
        throw new Error("Device does not support decreaseLevel()")
    }
};


/*
 Toggle on/off (Livolo only)
 */
Lighting5.prototype.toggleOnOff = function (deviceId, callback) {
    if (this.subtype === 0x05) {
        return this._sendCommand(deviceId, callback);
    } else {
        return 0;
    }
};

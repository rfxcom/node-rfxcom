module.exports = Lighting5;
/*jshint -W104 */
const defines = require('./defines'),
    index = require('./index');

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
    Returns true if the subtype matches the supplied subtypeName, or any name in the array
 */
Lighting5.prototype.isSubtype = function (subtypeName) {
        var  self = this;
        if (Array.isArray(subtypeName)) {
            return !subtypeName.every(function (name) {return index.lighting5[name] !== self.subtype})
        } else {
            return index.lighting5[subtypeName] === self.subtype;
        }
    };

/*
 * Splits the device id x/y and returns the components, the deviceId will be
 * returned as the component bytes, ready for sending.
 *
 * Throws an Error if the format is invalid.
 */
Lighting5.prototype._splitDeviceId = function(deviceId) {
        var parts, id, unitCode;
        if (Array.isArray(deviceId)) {
            parts = deviceId;
        } else {
            parts = deviceId.split("/");
        }
        if (parts.length === 1) {
            if (this.isSubtype(["MDREMOTE", "MDREMOTE_107", "MDREMOTE_108", "TRC02", "TRC02_2", "AOKE", "LEGRAND", "RGB432W"])) {
                unitCode = 1;
            } else {
                throw new Error("Invalid deviceId format");
            }
        } else if (parts.length === 2) {
            unitCode = parseInt(parts[1], 10);
            if (this.isSubtype("AVANTEK")) {
                if (unitCode !== 0) {
                    unitCode = parts[1].toUpperCase().charCodeAt(0);
                }
            }
        } else {
            throw new Error("Invalid deviceId format");
        }
        id = this.rfxcom.stringToBytes(parts[0], 3);
        if (id.value < 1 ||
            ((this.isSubtype(["LIGHTWAVERF", "CONRAD", "TRC02"])) && id.value > 0xffffff) ||
            (this.isSubtype("EMW100") && id.value > 0x003fff) ||
            ((this.isSubtype(["BBSB", "EURODOMEST"])) && id.value > 0x07ffff) ||
            ((this.isSubtype(["MDREMOTE", "AOKE", "RGB432W", "MDREMOTE_107", "LEGRAND", "IT", "MDREMOTE_108", "KANGTAI"])) && id.value > 0x00ffff) ||
            ((this.isSubtype(["LIVOLO", "TRC02_2", "LIVOLO_APPLIANCE"])) && id.value > 0x007fff) ||
            (this.isSubtype("AVANTEK") && id.value > 0x0fffff)
           ) {
            throw new Error("Address 0x" + id.value.toString(16) + " outside valid range");
        }
        if (unitCode < 0 ||
            ((this.isSubtype(["LIGHTWAVERF", "CONRAD"]) ) && unitCode > 16) ||
            ((this.isSubtype(["EMW100", "EURODOMEST", "IT"])) && unitCode > 4) ||
            (this.isSubtype("BBSB") && unitCode > 6) ||
            (this.isSubtype("LIVOLO") && unitCode > 3) ||
            (this.isSubtype("LIVOLO_APPLIANCE") && unitCode > 10) ||
            (this.isSubtype("AVANTEK") && (unitCode !== 0 && (unitCode < 0x41 || unitCode > 0x45))) ||
            (this.isSubtype("KANGTAI") && unitCode > 30)
           ) {
            throw new Error("Invalid unit code " + parts[1]);
        }
        return {
            idBytes: id.bytes,
            unitCode: unitCode
        };
    };

Lighting5.prototype._timeoutHandler = function(buffer, seqnbr) {
        return false;
    };

Lighting5.prototype._sendCommand = function(deviceId, command, level, callback) {
        var self = this,
            device = self._splitDeviceId(deviceId),
            seqnbr = self.rfxcom.getSequenceNumber();
            level = (level === undefined) ? 0x1f : level; // Now works when level == 0
        // If the device code is 0 and the subtype supports group commands, translate them
        if (device.unitCode === 0) {
            if (this.isSubtype(["LIGHTWAVERF", "BBSB", "CONRAD", "LIVOLO", "LIVOLO_APPLIANCE", "EURODOMEST", "AVANTEK", "IT", "KANGTAI"])) {
                if (command === 0x00) {
                    if (this.isSubtype(["LIVOLO", "LIVOLO_APPLIANCE"])) {
                        command = 0x00;
                    } else {
                        command = 0x02;
                    }
                } else if (command === 0x01) {
                    if (this.isSubtype(["LIGHTWAVERF", "LIVOLO", "LIVOLO_APPLIANCE"])) {
                        throw new Error("Subtype doesn't support Group On");
                    } else {
                        command = 0x03;
                    }
                } else {
                    throw new Error("Group command must be On or Off");
                }
            } else {
                throw new Error("Subtype doesn't support group commands");
            }
        }
        var buffer = [0x0a, defines.LIGHTING5, self.subtype, seqnbr,
                      device.idBytes[0], device.idBytes[1], device.idBytes[2],
                      device.unitCode, command, level, 0];

        self.rfxcom.queueMessage(self, buffer, seqnbr, callback);
        return seqnbr;
    };


/*
 * Switch on deviceId/unitCode
 */
Lighting5.prototype.switchOn = function (deviceId, options, callback) {
        var command, level, device;
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
                if ((level < 0x0) || (level > 0x1f)) {
                    throw new Error("Invalid level: value must be in range 0-31");
                }
            }
            return this._sendCommand(deviceId, command, level, callback);
        } else if (this.isSubtype(["LIVOLO", "LIVOLO_APPLIANCE", "MDREMOTE_107", "LEGRAND"])) {
            throw new Error("Device does not support switchOn()");
        } else {
            callback = options;
            return this._sendCommand(deviceId, 0x01, 0x1f, callback);
        }
    };


/*
 * Switch off deviceId/unitCode
 */
Lighting5.prototype.switchOff = function (deviceId, callback) {
        var device = this._splitDeviceId(deviceId);
        if (this.isSubtype(["MDREMOTE", "MDREMOTE_107", "MDREMOTE_108", "LEGRAND"])) {
            throw new Error("Device does not support switchOff()");
        } else if (this.isSubtype(["LIVOLO", "LIVOLO_APPLIANCE"]) && device.unitCode !== 0) {
            throw new Error("Device supports switchOff() only for group");
        } else {
            return this._sendCommand(deviceId, 0x00, 0, callback);
        }
    };

/*
 Set dim level
 */
Lighting5.prototype.setLevel = function (deviceId, level, callback) {
        level = Math.round(level);
        if (this.isSubtype("LIGHTWAVERF")) {
            if ((level < 0x0) || (level > 0x1f)) {
                throw new Error("Invalid level: value must be in range 0-31");
            }
            return this._sendCommand(deviceId, 0x10, level, callback);
        } else if (this.isSubtype("IT")) {
            if ((level < 0x1) || (level > 0x08)) {
                throw new Error("Invalid level: value must be in range 1-8");
            }
            return this._sendCommand(deviceId, 0x10, level, callback);
        } else if (this.isSubtype(["MDREMOTE", "MDREMOTE_108"])) {
            if ((level < 0x01) || (level > 0x03)) {
                throw new Error("Invalid level: value must be in range 1-3");
            }
            return this._sendCommand(deviceId, 7 - level, level, callback);
        } else if (this.isSubtype("MDREMOTE_107")) {
            if ((level < 0x01) || (level > 0x06)) {
                throw new Error("Invalid level: value must be in range 1-6");
            }
            return this._sendCommand(deviceId, 9 - level, level, callback);
        } else {
            throw new Error("Device does not support setLevel()");
        }
    };

/*
 Set mood (Lightwave RF only) - like a group on/off combination
 */
Lighting5.prototype.setMood = function (deviceId, mood, callback) {
        mood = Math.round(mood);
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
        if (this.isSubtype(["MDREMOTE", "LIVOLO", "TRC02", "TRC02_2", "RGB432W", "MDREMOTE_108"])) {
            return this._sendCommand(deviceId, 0x02, 0, callback);
        } else if (this.isSubtype("MDREMOTE_107")) {
            return this._sendCommand(deviceId, 0x01, 0, callback);
        } else {
            throw new Error("Device does not support increaseLevel()")
        }
    };

/*
 * Decrease brightness deviceId/unitCode (MDREMOTE, Livolo, TRC02 only) 'Dim-'
 */
Lighting5.prototype.decreaseLevel = function (deviceId, callback) {
        if (this.isSubtype(["MDREMOTE", "LIVOLO", "TRC02", "TRC02_2", "RGB432W", "MDREMOTE_108"])) {
            return this._sendCommand(deviceId, 0x03, 0, callback);
        } else if (this.isSubtype("MDREMOTE_107")) {
            return this._sendCommand(deviceId, 0x02, 0, callback);
        } else {
            throw new Error("Device does not support decreaseLevel()")
        }
    };

/*
 Toggle on/off (Livolo, MDremote, & Legrand subtypes only)
 */
Lighting5.prototype.toggleOnOff = function (deviceId, callback) {
        var device;
        if (this.isSubtype("LIVOLO")) {
            device = this._splitDeviceId(deviceId);
            if (device.unitCode !== 0) {
                return this._sendCommand(deviceId, device.unitCode, 0x1f, callback);
            } else {
                throw new Error("Group command must be On or Off");
            }
        } else if (this.isSubtype("LIVOLO_APPLIANCE")) {
            device = this._splitDeviceId(deviceId);
            if (device.unitCode !== 0) {
                return this._sendCommand(deviceId, 0x01, 0x1f, callback);
            } else {
                throw new Error("Group command must be On or Off");
            }
        } else if (this.isSubtype(["MDREMOTE", "MDREMOTE_107", "MDREMOTE_108", "LEGRAND"])) {
            return this._sendCommand(deviceId, 0x00, 0x1f, callback);
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

/*
 Lightwave LW281 inline Open/Close/Stop relay - Close
 */
Lighting5.prototype.relayClose = function (deviceId, callback) {
        if (this.isSubtype("LIGHTWAVERF")) {
            return this._sendCommand(deviceId, 0x0d, 0, callback);
        } else {
            throw new Error("Device does not support relayClose()")
        }
    };

/*
 Lightwave LW281 inline Open/Close/Stop relay - Stop
 */
Lighting5.prototype.relayStop = function (deviceId, callback) {
        if (this.isSubtype("LIGHTWAVERF")) {
            return this._sendCommand(deviceId, 0x0e, 0, callback);
        } else {
            throw new Error("Device does not support relayStop()")
        }
    };

/*
 Lightwave LW281 inline Open/Close/Stop relay - Open
 */
Lighting5.prototype.relayOpen = function (deviceId, callback) {
        if (this.isSubtype("LIGHTWAVERF")) {
            return this._sendCommand(deviceId, 0x0f, 0, callback);
        } else {
            throw new Error("Device does not support relayOpen()")
        }
    };

/*
 Colour palette controls - TRC & RGB432W device types
 */
Lighting5.prototype.increaseColour = function (deviceId, callback) {
        if (this.isSubtype(["TRC02", "TRC02_2", "RGB432W"])) {
            return this._sendCommand(deviceId, 0x04, 0, callback);
        } else {
            throw new Error("Device does not support increaseColour()")
        }
    };

Lighting5.prototype.decreaseColour = function (deviceId, callback) {
        if (this.isSubtype(["TRC02", "TRC02_2", "RGB432W"])) {
            return this._sendCommand(deviceId, 0x05, 0, callback);
        } else {
            throw new Error("Device does not support decreaseColour()")
        }
    };

Lighting5.prototype.setColour = function (deviceId, colour, callback) {
        colour = Math.round(colour);
        if (this.isSubtype("TRC02_2")) {
            if ((colour < 0) || (colour > 61)) {
                throw new Error("Invalid colour: value must be in range 0-61");
            }
            return this._sendCommand(deviceId, 0x06 + colour, colour, callback);
        } else if (this.isSubtype(["TRC02", "RGB432W"])) {
            if ((colour < 0) || (colour > 126)) {
                throw new Error("Invalid colour: value must be in range 0-126");
            }
            return this._sendCommand(deviceId, 0x06 + colour, colour, callback);
        } else {
            throw new Error("Device does not support setColour()")
        }
    };

Lighting5.prototype.increaseColor = Lighting5.prototype.increaseColour;
Lighting5.prototype.decreaseColor = Lighting5.prototype.decreaseColour;
Lighting5.prototype.setColor = Lighting5.prototype.setColour;
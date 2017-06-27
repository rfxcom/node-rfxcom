module.exports = Rfy;
/*jshint -W104 */
const defines = require("./defines"),
    index = require("./index");

/*
 * This is a class for controlling Somfy RTS blind motors (RFY protocol)
 */
function Rfy(rfxcom, subtype) {
    var self = this;

    self.rfxcom = rfxcom;
    self.subtype = subtype;
    // Check in case another Rfy object is currently listing...
    if (self.rfxcom.listingRfyRemotes === undefined) {
        self.rfxcom.listingRfyRemotes = false;
    }

    if (typeof self.subtype === "undefined") {
        throw new Error("Must provide a subtype.");
    }
}

/*
    Returns true if the subtype matches the supplied subtypeName
 */
Rfy.prototype.isSubtype = function (subtypeName) {
    return index.rfy[subtypeName] === this.subtype;
};

/*
 * Splits the device ID into the ID bytes and unit code
 * Throw an error for invalid ID
 */
Rfy.prototype._splitDeviceId = function(deviceId) {
    var parts, id, unitCode;
    if (Array.isArray(deviceId)) {
        parts = deviceId;
    } else {
        parts = deviceId.split("/");
    }
    if (parts.length === 2) {
        id = this.rfxcom.stringToBytes(parts[0], 3);
        unitCode = parseInt(parts[1]);
    } else {
        throw new Error("Invalid deviceId format");
    }
    if (id.value < 1 || id.value > 0xfffff) {
        throw new Error("Address 0x" + id.value.toString(16) + " outside valid range");
    }
    if ((this.isSubtype("RFY") && (unitCode < 0x00 || unitCode > 0x04)) ||
        (this.isSubtype("RFYEXT") && (unitCode < 0x00 || unitCode > 0x0f)) ||
        (this.isSubtype("ASA") && (unitCode < 0x01 || unitCode > 0x05))) {
        throw new Error("Invalid unit code " + parts[1]);
    }
    return {
        idBytes: id.bytes,
        unitCode: unitCode
    };
};

/*
 * Called if the transmit queue times out waiting for a reply to a command from this Rfy
 * If we are listing remotes, and this is a response to the listremote command, we have
 * reached the end of the list: emit the event & clear the listingRfyRemotes flag
 */
Rfy.prototype._timeoutHandler = function(buffer, seqnbr) {
    if (this.rfxcom.listingRfyRemotes && this.seqnbr === seqnbr) {
        this.rfxcom.listingRfyRemotes = false;
        this.rfxcom.emit("rfyremoteslist", this.rfxcom.rfyRemotesList);
        this.rfxcom.rfyRemotesList = [];
        return true;
    } else {
        return false;
    }
};

/*
 * Called by the API commands to encode & queue the underlying byte sequence
 */
Rfy.prototype._sendCommand = function(deviceId, command, callback) {
    var self = this,
        device = self._splitDeviceId(deviceId),
        seqnbr = self.rfxcom.getSequenceNumber(),
        buffer = [0x0c, defines.RFY, self.subtype, seqnbr,
                  device.idBytes[0], device.idBytes[1], device.idBytes[2],
                  device.unitCode,
                  command, 0, 0, 0, 0];

    if (self.rfxcom.listingRfyRemotes) {
        self.seqnbr = seqnbr;
        self.rfxcom.rfyRemotesList = [];
    }
    self.rfxcom.queueMessage(self, buffer, seqnbr, callback);
    return seqnbr;
};

/*
 * General-purpose 'send any command' function - DOES NOT check the command is valid for the subtype!
 */
Rfy.prototype.do = function(deviceId, command, callback) {
    if (typeof command === "number") {
        command = Math.round(command);
        if (command >= 0 && command <= defines.LastRfyCommand) {
            return this._sendCommand(deviceId, command, callback);
        } else {
            throw new Error("Invalid command number " + command);
        }
    } else if (typeof command === "string") {
        if (typeof defines.RfyCommands[command] !== "undefined") {
            if (defines.RfyCommands[command] === defines.RfyCommands.listRemotes) {
                return this.listRemotes(callback);
            } else {
                return this._sendCommand(deviceId, defines.RfyCommands[command], callback);
            }
        } else {
            throw new Error("Unknown command '" + command + "'");
        }
    }
};

/*
 * 'Meta-commands' to manage the list of remotes in the RFXtrx433E
 */
Rfy.prototype.erase = function(deviceId, callback) {
    return this._sendCommand(deviceId, defines.RfyCommands.erasethis, callback);
};

Rfy.prototype.eraseAll = function(callback) {
    // Use a fake deviceId which is valid for all subtypes
    return this._sendCommand([1, 1], defines.RfyCommands.eraseall, callback);
};

Rfy.prototype.listRemotes = function(callback) {
    if (this.rfxcom.listingRfyRemotes) {
        this.rfxcom.debugLog("Error   : RFY listRemotes command received while previous list operation in progress");
        return -1;
    } else {
        this.rfxcom.listingRfyRemotes = true;
        // Use a fake deviceId which is valid for all subtypes
        return this._sendCommand([1, 1], defines.RfyCommands.listRemotes, callback);
    }
};

Rfy.prototype.program = function(deviceId, callback) {
    return this._sendCommand(deviceId, defines.RfyCommands.program, callback);
};

/*
 * Public API commands
 */
Rfy.prototype.up = function(deviceId, callback) {
    return this._sendCommand(deviceId, defines.RfyCommands.up, callback);
};

Rfy.prototype.down = function(deviceId, callback) {
    return this._sendCommand(deviceId, defines.RfyCommands.down, callback);
};

Rfy.prototype.stop = function(deviceId, callback) {
    return this._sendCommand(deviceId, defines.RfyCommands.stop, callback);
};

Rfy.prototype.venetianOpenUS = function (deviceId, callback) {
    if (this.isSubtype("ASA")) {
        throw new Error("ASA: Venetian blinds commands not supported");
    }
    return this._sendCommand(deviceId, defines.RfyCommands.up05sec, callback);
};

Rfy.prototype.venetianCloseUS = function (deviceId, callback) {
    if (this.isSubtype("ASA")) {
        throw new Error("ASA: Venetian blinds commands not supported");
    }
    return this._sendCommand(deviceId, defines.RfyCommands.down05sec, callback);
};

Rfy.prototype.venetianIncreaseAngleUS = function (deviceId, callback) {
    if (this.isSubtype("ASA")) {
        throw new Error("ASA: Venetian blinds commands not supported");
    }
    return this._sendCommand(deviceId, defines.RfyCommands.up2sec, callback);
};

Rfy.prototype.venetianDecreaseAngleUS = function (deviceId, callback) {
    if (this.isSubtype("ASA")) {
        throw new Error("ASA: Venetian blinds commands not supported");
    }
    return this._sendCommand(deviceId, defines.RfyCommands.down2sec, callback);
};

Rfy.prototype.venetianOpenEU = function (deviceId, callback) {
    if (this.isSubtype("ASA")) {
        throw new Error("ASA: Venetian blinds commands not supported");
    }
    return this._sendCommand(deviceId, defines.RfyCommands.up2sec, callback);
};

Rfy.prototype.venetianCloseEU = function (deviceId, callback) {
    if (this.isSubtype("ASA")) {
        throw new Error("ASA: Venetian blinds commands not supported");
    }
    return this._sendCommand(deviceId, defines.RfyCommands.down2sec, callback);
};

Rfy.prototype.venetianIncreaseAngleEU = function (deviceId, callback) {
    if (this.isSubtype("ASA")) {
        throw new Error("ASA: Venetian blinds commands not supported");
    }
    return this._sendCommand(deviceId, defines.RfyCommands.up05sec, callback);
};

Rfy.prototype.venetianDecreaseAngleEU = function (deviceId, callback) {
    if (this.isSubtype("ASA")) {
        throw new Error("ASA: Venetian blinds commands not supported");
    }
    return this._sendCommand(deviceId, defines.RfyCommands.down05sec, callback);
};

Rfy.prototype.enableSunSensor = function (deviceId, callback) {
    return this._sendCommand(deviceId, defines.RfyCommands.sunwindenable, callback);
};

Rfy.prototype.disableSunSensor = function (deviceId, callback) {
    return this._sendCommand(deviceId, defines.RfyCommands.sundisable, callback);
};


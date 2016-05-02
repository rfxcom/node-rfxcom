module.exports = Chime1;
/*jshint -W104 */
const defines = require('./defines'),
    index = require('./index'),
    util = require('util');

/*
 * This is a class for controlling Lighting1 lights.
 */
function Chime1(rfxcom, subtype) {
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
Chime1.prototype.isSubtype = function (subtypeName) {
    return index.chime1[subtypeName] === this.subtype;
};

/*
 * validate the unitCode based on the subtype (handle a 1-element array as well)
 *
 */
Chime1.prototype._splitDeviceId = function(deviceId) {
    var parts, id;
    if (util.isArray(deviceId)) {
        parts = deviceId;
    } else {
        parts = deviceId.split("/");
    }
    if (parts.length !== 1) {
        throw new Error("Invalid device ID format");
    }
    if (this.isSubtype("BYRON_SX")) {
        id = this.rfxcom.stringToBytes(parts[0], 2);
    } else if (this.isSubtype("BYRON_MP001")) {
        // Expect a string of exactly six ones & zeros
        if (parts[0].match(/[01][01][01][01][01][01]/) === null) {
            throw new Error("Invalid device ID format");
        }
        id = {
            bytes: [(parts[0].charAt(0) === '0' ? 1 : 0)*64 +
                    (parts[0].charAt(1) === '0' ? 1 : 0)*16 +
                    (parts[0].charAt(2) === '0' ? 1 : 0)*4 +
                    (parts[0].charAt(3) === '0' ? 1 : 0),
                    (parts[0].charAt(4) === '0' ? 1 : 0)*64 +
                    (parts[0].charAt(5) === '0' ? 1 : 0)*16 + 15,
                    0x54]
            };
    } else {
        id = this.rfxcom.stringToBytes(parts[0], 3);
    }
    if ((this.isSubtype("BYRON_SX") && id.value > 0xff) ||
        (this.isSubtype("ENVIVO") && id.value > 0xffffff) ||
        (this.isSubtype("SELECT_PLUS") && id.value > 0x03fffff)) {
        throw new Error("Device ID 0x" + id.value.toString(16) + " outside valid range");
    }
    return {
        idBytes: id.bytes
    };
};

Chime1.prototype._sendCommand = function (deviceId, command, callback) {
    var self = this,
        buffer,
        device = self._splitDeviceId(deviceId),
        cmdId = self.rfxcom.getCmdNumber();

    if (device.idBytes.length === 2 && command !== undefined) {
         device.idBytes.push(command);
    }
    buffer = [0x07, defines.CHIME1, self.subtype, cmdId,
        device.idBytes[0], device.idBytes[1], device.idBytes[2], 0];

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

Chime1.prototype.chime = function(deviceId, tone, callback) {
    if (callback == undefined && typeof tone === "function") {
        callback = tone;
        tone = 0x5;
    }
    if (this.isSubtype("BYRON_SX") && (tone < 0x00 || tone > 0x0f)) {
        throw new Error("Invalid tone: value must be in range 0-15");
    }
    return this._sendCommand(deviceId, tone, callback);
};

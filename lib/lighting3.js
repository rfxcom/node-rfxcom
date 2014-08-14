module.exports = Lighting3;
/*jshint -W104 */
const defines = require('./defines');

/*
 * This is a class for controlling Lighting3 lights.
 */
function Lighting3(rfxcom, subtype) {
        var self = this;

        self.rfxcom = rfxcom;
        self.subtype = subtype;

        if (typeof self.subtype === "undefined") {
            throw new Error("Must provide a subtype.");
        }
    }

/*
 * Splits the device id into system code, channel number.
 *
 */
Lighting3.prototype._splitDeviceId = function(deviceId) {
        var parts, systemCode, channelNumber, channelBytes = [];
        if (typeof deviceId === "object" && deviceId.constructor === Array) {
            parts = deviceId;
        } else {
            parts = deviceId.split("/");
        }
        if (parts.length !== 2) {
            throw new Error("Invalid deviceId format");
        }
        systemCode = parseInt(parts[0], 10);
        if (systemCode < 1 || systemCode > 16) {
            throw new Error("Invalid system code " + parts[0]);
        }
        channelNumber = parseInt(parts[1], 10);
        if (channelNumber === 0) {
            channelBytes[0] = 0xff;
            channelBytes[1] = 0x03;
        } else {
            channelBytes = [0, 0];
            if (channelNumber < 1 || channelNumber > 10) {
                throw new Error("Invalid channel number " + parts[1]);
            } else if (channelNumber > 8) {
                channelBytes[1] |= 1 << channelNumber - 9;
            } else {
                channelBytes[0] |= 1 << channelNumber - 1;
            }
        }
        return {
            systemCode: systemCode - 1,
            channelCode: channelBytes
        };
    };

Lighting3.prototype._sendCommand = function (deviceId, command, callback) {
    var self = this;
    var device = self._splitDeviceId(deviceId);
    var cmdId = self.rfxcom.getCmdNumber();
    var buffer = [0x08, defines.LIGHTING3, self.subtype, cmdId,
        device.systemCode, device.channelCode[0], device.channelCode[1], command, 0];

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
 * Switch on systemCode/Channel
 */
Lighting3.prototype.switchOn = function(deviceId, callback) {
    return this._sendCommand(deviceId, 0x10, callback);
};

/*
 * Switch off systemCode/Channel
 */
Lighting3.prototype.switchOff = function(deviceId, callback) {
    return this._sendCommand(deviceId, 0x1A, callback);
};

/*
 * Set brightness level systemCode/Channel
 */
Lighting3.prototype.setLevel = function(deviceId, level, callback) {
        if (level < 0 || level > 0xa) {
            throw new Error("Invalid level: value must be in range 0-10");
        }
        if (level === 0) {
            return this._sendCommand(deviceId, 0x1A, callback);
        } else if (level === 0xa) {
            return this._sendCommand(deviceId, 0x10, callback);
        } else {
            return this._sendCommand(deviceId, 0x10 + level, callback);
        }
    };

/*
 * Increase brightness systemCode/Channel 'Bright'
 */
Lighting3.prototype.increaseLevel = function (deviceId, callback) {
        return this._sendCommand(deviceId, 0x00, callback);
    };

/*
 * Decrease brightness systemCode/Channel 'Dim'
 */
Lighting3.prototype.decreaseLevel = function (deviceId, callback) {
        return this._sendCommand(deviceId, 0x08, callback);
    };

/*
 * Send the 'Program' command systemCode/Channel
 */
Lighting3.prototype.program = function (deviceId, callback) {
        return this._sendCommand(deviceId, 0x1c, callback);
    };


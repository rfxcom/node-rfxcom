module.exports = Lighting2;
/*jshint -W104 */
const defines = require('./defines');

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
        if (typeof deviceId === "object" && deviceId.constructor === Array) {
            parts = deviceId;
        } else {
            parts = deviceId.split("/");
        }
        if (parts.length !== 2) {
            throw new Error("Invalid deviceId format.");
        }
        id = this.rfxcom.stringToBytes(parts[0], 4);
        if (id.bytes.length !== 4) {
            throw new Error("Invalid deviceId format");
        }
        if (id.value < 1 || id.value > 0x03ffffff) {
            throw new Error("Device ID outside valid range 1..0x03ffffff");
        }
        unitCode = Math.round(parts[1]);
        if (unitCode < 0 || unitCode > 16) {
            throw new Error("Unit code " + unitCode + " is not valid")
        }
        return {
            idBytes: id.bytes,
            unitCode: unitCode
        };
    };

Lighting2.prototype._sendCommand = function(deviceId, command, level, callback) {
        var self = this;
        var device = self._splitDeviceId(deviceId);
        var cmdId = self.rfxcom.getCmdNumber();
        level = (level === undefined) ? 0xf : level; // Now works when level == 0
        // If the device code is 0 convert to a group command by adding 3
        if (device.unitCode == 0) {
            command = command + 3;
            device.unitCode = 1;   // Group commands are sent with a unit code of 1
        }
        var buffer = [0x0b, defines.LIGHTING2, self.subtype, cmdId, device.idBytes[0],
                        device.idBytes[1], device.idBytes[2], device.idBytes[3],
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
 * Switch on deviceId/unitCode (unitCode 0 means group)
 */
Lighting2.prototype.switchOn = function(deviceId, callback) {
        return this._sendCommand(deviceId, 1, callback);
    };

/*
 * Switch off deviceId/unitCode (unitCode 0 means group)
 */
Lighting2.prototype.switchOff = function(deviceId, callback) {
        return this._sendCommand(deviceId, 0, callback);
    };

/*
 * Set dim level deviceId/unitCode (unitCode 0 means group)
 */
Lighting2.prototype.setLevel = function(deviceId, level, callback) {
        if ((level < 0) || (level > 0xf)) {
            throw new Error("Invalid level: value must be in range 0-15.");
        }
        return this._sendCommand(deviceId, 2, level, callback);
    };

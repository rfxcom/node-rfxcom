module.exports = Lighting6;
/*jshint -W104 */
const defines = require('./defines');

/*
 * This is a class for controlling Lighting6 lights.
 */
function Lighting6(rfxcom, subtype) {
    var self = this;

    self.rfxcom = rfxcom;
    self.subtype = subtype;

    if (typeof self.subtype === "undefined") {
        throw new Error("Must provide a subtype.");
    }
}

/*
 * Splits the device id into idBytes, houseCode, unitCode.
 *
 */
Lighting6.prototype._splitDeviceId = function(deviceId) {
    var parts, id, houseCode, unit;
    if (typeof deviceId === "object" && deviceId.constructor === Array) {
        parts = deviceId;
    } else {
        parts = deviceId.split("/");
    }
    if (parts.length !== 3) {
        throw new Error("Invalid deviceId format.");
    }
    id = this.rfxcom.stringToBytes(parts[0], 2);
    houseCode = parts[1].toUpperCase().charCodeAt(0);
    unit = parseInt(parts[2]);
    if (houseCode < 0x41 || houseCode > 0x50) {
        throw new Error("Invalid house code")
    }
    if  (unit > 5) {
        throw new Error("Invalid unit number")
    }
    return {
        idBytes: id.bytes,
        houseCode: houseCode,
        unitCode: unit
    };
};

Lighting6.prototype._sendCommand = function (deviceId, command, callback) {
    var self = this;
    var device = self._splitDeviceId(deviceId);
    var cmdId = self.rfxcom.getCmdNumber();
    if (device.unitCode === 0) {
        command = command + 2;
    }

    var buffer = [0x0A, defines.LIGHTING6, self.subtype, cmdId,
        device.idBytes[0], device.idBytes[1], device.houseCode, device.unitCode, command, 0, 0];

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
Lighting6.prototype.switchOn = function(deviceId, callback) {
    return this._sendCommand(deviceId, 0x00, callback);
};

/*
 * Switch off deviceId/unitCode
 */
Lighting6.prototype.switchOff = function(deviceId, callback) {
    return this._sendCommand(deviceId, 0x01, callback);
};



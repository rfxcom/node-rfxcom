module.exports = Lighting6;
/*jshint -W104 */
const defines = require('./defines'),
    index = require('./index'),
    util = require('util');

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
    Returns true if the subtype matches the supplied subtypeName
 */
Lighting6.prototype.isSubtype = function (subtypeName) {
    return index.lighting6[subtypeName] === this.subtype;
};

/*
 * Splits the device id into idBytes, group, unitCode.
 *
 */
Lighting6.prototype._splitDeviceId = function(deviceId) {
        var parts, id, group, unit;
        if (util.isArray(deviceId)) {
            parts = deviceId;
        } else {
            parts = deviceId.split("/");
        }
        if (parts.length !== 3) {
            throw new Error("Invalid deviceId format");
        }
        id = this.rfxcom.stringToBytes(parts[0], 2);
        group = parts[1].toUpperCase().charCodeAt(0);
        unit = parseInt(parts[2]);
        if (group < 0x41 || group > 0x50) {
            throw new Error("Invalid group code '" + parts[1] + "'")
        }
        if  (unit < 0 || unit > 8) {
            throw new Error("Invalid unit number " + unit)
        }
        return {
            idBytes: id.bytes,
            groupCode: group,
            unitCode: unit
        };
    };

Lighting6.prototype._timeoutHandler = function(buffer, seqnbr) {
    return false;
};

Lighting6.prototype._sendCommand = function (deviceId, command, callback) {
        var self = this;
        var device = self._splitDeviceId(deviceId);
        var seqnbr = self.rfxcom.getSequenceNumber();
        if (device.unitCode === 0) {
            command = command + 2;
        }

        var buffer = [0x0b, defines.LIGHTING6, self.subtype, seqnbr,
            device.idBytes[0], device.idBytes[1], device.groupCode, device.unitCode, command, 0, 0, 0];

        self.rfxcom.queueMessage(self, buffer, seqnbr, callback);
            return seqnbr;
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



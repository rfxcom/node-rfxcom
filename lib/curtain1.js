module.exports = Curtain1;
/*jshint -W104 */
const defines = require('./defines'),
    index = require('./index'),
    util = require('util');

/*
 * This is a class for controlling Harrison curtain controllers..
 */
function Curtain1(rfxcom, subtype) {
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
Curtain1.prototype.isSubtype = function (subtypeName) {
    return index.curtain1[subtypeName] === this.subtype;
};

/*
 * Splits the device id x/y and returns the components, the deviceId will be
 * returned as the component bytes, ready for sending.
 *
 * Throws an Error if the format is invalid.
 */
Curtain1.prototype._splitDeviceId = function(deviceId) {
        var parts, id, houseCode, unitCode;
        if (util.isArray(deviceId)) {
            parts = deviceId;
            if (parts.length !== 2) {
                throw new Error("Invalid deviceId format");
            }
            unitCode = parseInt(parts[1]);
        } else {
            parts = deviceId.split("");
            unitCode = parseInt(parts.slice(1).join(""), 10);
        }
        houseCode = parts[0].toUpperCase().charCodeAt(0);
        if (houseCode < 0x41 || (this.isSubtype("HARRISON") && houseCode > 0x50)) {
            throw new Error("Invalid house code '" + parts[0] + "'");
        }
        if (unitCode < 1 || unitCode > 16) {
            throw new Error("Invalid unit code " + parts[1]);
        }
        return {
            houseCode: houseCode,
            unitCode: unitCode
        };
    };

Curtain1.prototype._timeoutHandler = function(buffer, seqnbr) {
        return false;
    };

Curtain1.prototype._sendCommand = function(deviceId, command, callback) {
        var self = this,
            device = self._splitDeviceId(deviceId),
            seqnbr = self.rfxcom.getSequenceNumber(),
            buffer = [0x07, defines.CURTAIN1, 0x00, seqnbr, device.houseCode, device.unitCode, command, 0];

        self.rfxcom.queueMessage(self, buffer, seqnbr, callback);
        return seqnbr;
    };

/*
 * Open deviceId.
 */
Curtain1.prototype.open = function(deviceId, callback) {
        return this._sendCommand(deviceId, defines.CURTAIN_OPEN, callback);
    };

/*
 * Close deviceId.
 */
Curtain1.prototype.close = function(deviceId, callback) {
        return this._sendCommand(deviceId, defines.CURTAIN_CLOSE, callback);
    };

/*
 * Stop deviceId.
 */
Curtain1.prototype.stop = function(deviceId, callback) {
        return this._sendCommand(deviceId, defines.CURTAIN_STOP, callback);
    };

/*
 * Programme deviceId.
 */
Curtain1.prototype.program = function(deviceId, callback) {
        return this._sendCommand(deviceId, defines.CURTAIN_PROGRAM, callback);
    };


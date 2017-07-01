/**
 * Created by max on 30/06/2017.
 */
/*jshint -W104 */
const defines = require('./defines'),
    index = require('./index'),
    Transmitter = require('./transmitter');

/*
 * This is a class for controlling Harrison curtain controllers..
 */
class HomeConfort extends Transmitter {
    constructor(rfxcom, subtype) {
        super(rfxcom, subtype);
        this.packetType = "homeConfort";
    }

    _timeoutHandler(buffer, seqnbr) {
        return false;
    };

};

module.exports = HomeConfort;

//    function HomeConfort(rfxcom, subtype) {
    // var self = this;
    //
    // self.rfxcom = rfxcom;
    // self.packetType = "homeConfort";
    // self.subtype = subtype;
    //
    // if (typeof self.subtype === "undefined") {
    //     throw new Error("Must provide a subtype.");
    // }
//}

/*
    Returns true if the subtype matches the supplied subtypeName
 */
/*
HomeConfort.prototype.isSubtype = function (subtypeName) {
    //return index.homeConfort[subtypeName] === this.subtype
    return index[this.packetType][subtypeName] === this.subtype;
};
*/

/*
 * Splits the device id x/y and returns the components, the deviceId will be
 * returned as the component bytes, ready for sending.
 *
 * Throws an Error if the format is invalid.
 */
HomeConfort.prototype._splitDeviceId = function(deviceId) {
    var parts, id, houseCode, unitCode;
    if (Array.isArray(deviceId)) {
        parts = deviceId;
    } else {
        parts = deviceId.split("/");
    }
    if (parts.length !== 3) {
        throw new Error("Invalid deviceId format");
    }
    id = this.rfxcom.stringToBytes(parts[0], 3);
    if ((id.value === 0) || ((this.isSubtype(["TEL_010"])) && id.value > 0x7ffff)) {
        throw new Error("Address 0x" + id.value.toString(16) + " outside valid range");
    }
    houseCode = parts[1].toUpperCase().charCodeAt(0);
    if (houseCode < 0x41 || (this.isSubtype("TEL_010") && houseCode > 0x44)) {
        throw new Error("Invalid house code '" + parts[1] + "'");
    }
    unitCode = parseInt(parts[2], 10);
    if (unitCode < 0 || unitCode > 4) {
        throw new Error("Invalid unit code " + parts[2]);
    }
    return {
        idBytes: id.bytes,
        houseCode: houseCode,
        unitCode: unitCode
    };
};

/*
HomeConfort.prototype._timeoutHandler = function(buffer, seqnbr) {
    return false;
};
*/

HomeConfort.prototype._sendCommand = function(deviceId, command, callback) {
    var self = this, device, seqnbr, buffer;
    seqnbr = self.rfxcom.getSequenceNumber();
    device = self._splitDeviceId(deviceId);
    if (device.unitCode === 0) {
        command = command + 2;
    }
    buffer = [0x0C, defines.HOMECONFORT, self.subtype, seqnbr, device.idBytes[0], device.idBytes[1], device.idBytes[2],
              device.houseCode, device.unitCode, command, 0, 0, 0];

    self.rfxcom.queueMessage(self, buffer, seqnbr, callback);
    return seqnbr;
};

/*
 * Open deviceId.
 */
HomeConfort.prototype.switchOn = function(deviceId, callback) {
    return this._sendCommand(deviceId, 0x01, callback);
};

/*
 * Close deviceId.
 */
HomeConfort.prototype.switchOff = function(deviceId, callback) {
    return this._sendCommand(deviceId, 0x00, callback);
};



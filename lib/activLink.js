/*jshint -W104 */
'use strict';
const defines = require('./defines'),
    Transmitter = require('./transmitter'),
    RfxCom = require('./rfxcom');

/*
 * This is a class for controlling Honeywell ActivLink doorbells & chimes
 */
class ActivLink extends Transmitter {
    constructor(rfxcom, subtype, options) {
        super(rfxcom, subtype, options);
        this.packetType = "activLink";
        this.packetNumber = 0x1d;
    }

    /*
     * Splits the device id  and returns the components.
     * Throws an Error if the format is invalid.
     */
    _splitDeviceId(deviceId) {
        let id;
        const parts = Transmitter.splitAtSlashes(deviceId);
        if (parts.length !== 1) {
            throw new Error("Invalid deviceId format");
        } else {
            id = RfxCom.stringToBytes(parts[0], 3);
            if ((id.value <= 0) || id.value > 0x0fffff)  {
                Transmitter.addressError(id);
            }
        }
        return {
            idBytes: id.bytes,
        };
    }

    _sendCommand(deviceId, alert, knock, callback) {
        const device = this._splitDeviceId(deviceId);
        let buffer = [device.idBytes[0], device.idBytes[1], device.idBytes[2], alert, knock, 0, 0];
        return this.sendRaw(this.packetNumber, this.subtype, buffer, callback);
    };

    chime(deviceId, knock, alert, callback) {
        if (callback === undefined && typeof(alert) === "function") {
            callback = alert;
            alert = defines.HONEYWELL_NORMAL;
        }
        if (this.isSubtype("ACTIV_LINK_CHIME") && (knock < 0 || knock > 1)) {
            throw new Error("Invalid knock: value must be 0 or 1");
        } else if (this.isSubtype("ACTIV_LINK_CHIME") && (alert < 0 || alert > 4)) {
            throw new Error("Invalid alert: value must be in range 0-4");
        }
        return this._sendCommand(deviceId, alert, knock, callback);
    }

}
    
module.exports = ActivLink;

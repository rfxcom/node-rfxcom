/*jshint -W104 */
const defines = require('./defines'),
    index = require('./index'),
    Transmitter = require('./transmitter'),
    RfxCom = require('./rfxcom');

/*
 * This is a class for controlling Harrison curtain controllers..
 */
class Curtain1 extends Transmitter {
    constructor(rfxcom, subtype, options) {
        super(rfxcom, subtype, options);
        this.packetType = "curtain1";
    }

/*
 * Splits the device id x/y and returns the components, the deviceId will be
 * returned as the component bytes, ready for sending.
 *
 * Throws an Error if the format is invalid.
 */
    _splitDeviceId(deviceId) {
        let parts, id, houseCode, unitCode;
        if (Array.isArray(deviceId)) {
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

    _sendCommand(deviceId, command, callback) {
        const
            device = this._splitDeviceId(deviceId),
            seqnbr = this.rfxcom.nextMessageSequenceNumber(),
            buffer = [0x07, defines.CURTAIN1, 0x00, seqnbr, device.houseCode, device.unitCode, command, 0];

        this.rfxcom.queueMessage(this, buffer, seqnbr, callback);
        return seqnbr;
    };

/*
 * Open deviceId.
 */
    open(deviceId, callback) {
        return this._sendCommand(deviceId, defines.CURTAIN_OPEN, callback);
    };

/*
 * Close deviceId.
 */
    close(deviceId, callback) {
        return this._sendCommand(deviceId, defines.CURTAIN_CLOSE, callback);
    };

/*
 * Stop deviceId.
 */
    stop(deviceId, callback) {
        return this._sendCommand(deviceId, defines.CURTAIN_STOP, callback);
    };

/*
 * Programme deviceId.
 */
    program(deviceId, callback) {
        return this._sendCommand(deviceId, defines.CURTAIN_PROGRAM, callback);
    };

}

module.exports = Curtain1;

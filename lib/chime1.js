/*jshint -W104 */
const
    Transmitter = require('./transmitter'),
    RfxCom = require('./rfxcom');

/*
 * This is a class for controlling doorbell chimes
 */
class Chime1 extends Transmitter {
    constructor(rfxcom, subtype, options) {
        super(rfxcom, subtype, options);
        this.packetType = "chime1";
        this.packetNumber = 0x16;
    }

/*
 * validate the unitCode based on the subtype (handle a 1-element array as well)
 *
*/
    _splitDeviceId(deviceId) {
        let id = {};
        const parts = Transmitter.splitAtSlashes(deviceId);
        if (parts.length !== 1) {
            throw new Error("Invalid device ID format");
        }
        if (this.isSubtype("BYRON_SX")) {
            id = RfxCom.stringToBytes(parts[0], 2);
        } else if (this.isSubtype("BYRON_MP001")) {
            // Expect a string of exactly six ones & zeros
            if (parts[0].match(/[01][01][01][01][01][01]/) === null) {
                throw new Error("Invalid device ID format");
            }
            id = { bytes: [(parts[0].charAt(0) === '0' ? 1 : 0)*64 +
                           (parts[0].charAt(1) === '0' ? 1 : 0)*16 +
                           (parts[0].charAt(2) === '0' ? 1 : 0)*4 +
                           (parts[0].charAt(3) === '0' ? 1 : 0),
                           (parts[0].charAt(4) === '0' ? 1 : 0)*64 +
                           (parts[0].charAt(5) === '0' ? 1 : 0)*16 + 15,
                           0x54] };
        } else {
            id = RfxCom.stringToBytes(parts[0], 3);
        }
        if ((this.isSubtype("BYRON_SX") && id.value > 0xff) ||
            (this.isSubtype("ENVIVO") && id.value > 0xffffff) ||
            (this.isSubtype("SELECT_PLUS") && id.value > 0x03fffff)) {
            Transmitter.deviceIdError(id);
        }
        return {
            idBytes: id.bytes
        };
    };

    _sendCommand(deviceId, command, callback) {
        const device = this._splitDeviceId(deviceId);
        if (device.idBytes.length === 2 && command !== undefined) {
            device.idBytes.push(command);
        }
        let buffer = [device.idBytes[0], device.idBytes[1], device.idBytes[2], 0];

        return this.sendRaw(this.packetNumber, this.subtype, buffer, callback);
    };

    chime(deviceId, tone, callback) {
        if (callback === undefined && typeof tone === "function") {
            callback = tone;
            tone = 0x5;
        }
        if (this.isSubtype("BYRON_SX") && (tone < 0x00 || tone > 0x0f)) {
            throw new Error("Invalid tone: value must be in range 0-15");
        }
        return this._sendCommand(deviceId, tone, callback);
    };

}

module.exports = Chime1;

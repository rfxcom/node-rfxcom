/**
 * Created by max on 11/07/2017.
 */
'use strict';
const
    index = require('./index'),
    Transmitter = require('./transmitter'),
    RfxCom = require('./rfxcom');

/*
 * This is a class for sending wireless remote control commands
 */
class Remote extends Transmitter {
    constructor(rfxcom, subtype, options) {
        super(rfxcom, subtype, options);
        this.packetType = "remote";
        this.packetNumber = 0x30;
    };

/*
 * Extracts the device id.
 *
 */
    _splitDeviceId(deviceId) {
        const parts = Transmitter.splitAtSlashes(deviceId);
        if (this.isSubtype(['ATI_REMOTE_WONDER', 'ATI_REMOTE_WONDER_PLUS', 'MEDION', 'X10_PC_REMOTE', 'ATI_REMOTE_WONDER_2']) && parts.length !== 1) {
            throw new Error("Invalid deviceId format");
        }
        const id = RfxCom.stringToBytes(parts[0], 1);
        if (id.value < 0 || id.value > 0xff) {
            Transmitter.addressError(id);
        }
        return {
            idBytes: id.bytes
        };
    };

    _sendCommand(deviceId, command, callback) {
        const device = this._splitDeviceId(deviceId);
        let buffer = [device.idBytes[0], command, 0];

        return this.sendRaw(this.packetNumber, this.subtype, buffer, callback);
    };

/*
 * General-purpose remote control button press. Pass the button string as a parameter, or a button number
 */
    buttonPress(deviceId, button, callback) {
        if (this.isSubtype("ATI_REMOTE_WONDER_2")) {
            throw new Error("Device does not support buttonPress()");
        } else if (typeof button === "number") {
            if (button >= 0 && button <= 255) {
                return this._sendCommand(deviceId, Math.round(button), callback);
            } else {
                throw new Error("Invalid button: value must be in range 0-255")
            }
        } else if (typeof button === "string") {
            // First look for an exact match
            const dict = index.commands[this.subtype];
            let buttonNumber = NaN;
            for (let key in dict) {
                if (dict.hasOwnProperty(key)) {
                    if (dict[key] === button) {
                        buttonNumber = Number(key);
                        break;
                    }
                }
            }
            if (isNaN(buttonNumber)) {
                // If the exact match fails, look for a case-insensitive match (risky, as a few button names differ only in case)
                const upperCaseButton = button.toUpperCase();
                for (let key in dict) {
                    if (dict.hasOwnProperty(key)) {
                        if (dict[key].toUpperCase() === upperCaseButton) {
                            buttonNumber = Number(key);
                            break;
                        }
                    }
                }
            }
            if (isNaN(buttonNumber)) {
                throw new Error("Invalid button name '" + button + "'");
            } else {
                return this._sendCommand(deviceId, buttonNumber, callback);
            }
        }
    };

}

module.exports = Remote;

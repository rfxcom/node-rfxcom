/*jshint -W104 */
'use strict';
const defines = require("./defines"),
    Transmitter = require('./transmitter'),
    RfxCom = require('./rfxcom');

/*
 * This is a class for controlling Somfy RTS blind motors (RFY protocol)
 */
class Rfy extends Transmitter {
    constructor(rfxcom, subtype, options) {
        super(rfxcom, subtype, options);
        this.packetType = "rfy";
        this.packetNumber = 0x1a;
        if (this.rfxcom.listingRfyRemotes === undefined) {
            this.rfxcom.listingRfyRemotes = false;
        }
        if (this.options.venetianBlindsMode === undefined) {
            this.options.venetianBlindsMode = "EU";
        }
    }

    _timeoutHandler(buffer, seqnbr) {
        if (this.rfxcom.listingRfyRemotes && this.seqnbr === seqnbr) {
            this.rfxcom.listingRfyRemotes = false;
            this.rfxcom.emit("rfyremoteslist", this.rfxcom.rfyRemotesList);
            this.rfxcom.rfyRemotesList = [];
            return true;
        } else {
            return false;
        }
    };
    
/*
 * Splits the device ID into the ID bytes and unit code
 * Throw an error for invalid ID
 */
    _splitDeviceId(deviceId) {
        const parts = Transmitter.splitAtSlashes(deviceId);
        if (parts.length !== 2) {
            throw new Error("Invalid deviceId format");
        }
        const
            id = RfxCom.stringToBytes(parts[0], 3),
            unitCode = parseInt(parts[1]);
        if (id.value < 1 || id.value > 0xfffff) {
            Transmitter.addressError(id);
        }
        if ((this.isSubtype("RFY") && (unitCode < 0x00 || unitCode > 0x04)) ||
            (this.isSubtype("RFYEXT") && (unitCode < 0x00 || unitCode > 0x0f)) ||
            (this.isSubtype("ASA") && (unitCode < 0x01 || unitCode > 0x05))) {
            throw new Error("Invalid unit code " + parts[1]);
        }
        return {
            idBytes: id.bytes,
            unitCode: unitCode
        };
    };
    
/*
 * Called by the API commands to encode & queue the underlying byte sequence
 */
    _sendCommand(deviceId, command, callback) {
        if (this.isSubtype("RFY_RESERVED")) {
            throw new Error("RFY subtype GEOM no longer supported");
        }
        const device = this._splitDeviceId(deviceId);
        let buffer = [device.idBytes[0], device.idBytes[1], device.idBytes[2], device.unitCode, command, 0, 0, 0, 0];
        let options = {};
        const seqnbr = this.sendRaw(this.packetNumber, this.subtype, buffer, callback);
        if (this.rfxcom.listingRfyRemotes) {
            this.seqnbr = seqnbr;
            this.rfxcom.rfyRemotesList = [];
        }
        return seqnbr;
    };

/*
 * General-purpose 'send any command' method - DOES NOT check the command is valid for the subtype!
 */
    doCommand(deviceId, command, callback) {
        if (typeof command === "number") {
            command = Math.round(command);
            if (command >= 0 && command <= defines.LastRfyCommand) {
                return this._sendCommand(deviceId, command, callback);
            } else {
                throw new Error("Invalid command number " + command);
            }
        } else if (typeof command === "string") {
            if (typeof defines.RfyCommands[command] !== "undefined") {
                if (defines.RfyCommands[command] === defines.RfyCommands.listRemotes) {
                    return this.listRemotes(callback);
                } else {
                    return this._sendCommand(deviceId, defines.RfyCommands[command], callback);
                }
            } else {
                throw new Error("Unknown command '" + command + "'");
            }
        }
    };

/*
 * 'Meta-commands' to manage the list of remotes in the RFXtrx433E
 */
    erase(deviceId, callback) {
        return this._sendCommand(deviceId, defines.RfyCommands.erasethis, callback);
    };

    eraseAll(callback) {
    // Use a fake deviceId which is valid for all subtypes
        return this._sendCommand([1, 1], defines.RfyCommands.eraseall, callback);
    };

    listRemotes(callback) {
        if (this.rfxcom.listingRfyRemotes) {
            this.rfxcom.debugLog("Error   : RFY listRemotes command received while previous list operation in progress");
            return -1;
        } else {
            this.rfxcom.listingRfyRemotes = true;
            // Use a fake deviceId which is valid for all subtypes
            return this._sendCommand([1, 1], defines.RfyCommands.listRemotes, callback);
        }
    };

    program(deviceId, callback) {
        return this._sendCommand(deviceId, defines.RfyCommands.program, callback);
    };

/*
 * Public API commands
 */
    up(deviceId, callback) {
        return this._sendCommand(deviceId, defines.RfyCommands.up, callback);
    };

    down(deviceId, callback) {
        return this._sendCommand(deviceId, defines.RfyCommands.down, callback);
    };

    stop(deviceId, callback) {
        return this._sendCommand(deviceId, defines.RfyCommands.stop, callback);
    };

    venetianOpen(deviceId, callback) {
        if (this.isSubtype("ASA")) {
            throw new Error("ASA: Venetian blinds commands not supported");
        }
        if (this.options.venetianBlindsMode === "US") {
            return this._sendCommand(deviceId, defines.RfyCommands.up05sec, callback);
        } else {
            return this._sendCommand(deviceId, defines.RfyCommands.up2sec, callback);
        }
    };

    venetianClose(deviceId, callback) {
        if (this.isSubtype("ASA")) {
            throw new Error("ASA: Venetian blinds commands not supported");
        }
        if (this.options.venetianBlindsMode === "US") {
            return this._sendCommand(deviceId, defines.RfyCommands.down05sec, callback);
        } else {
            return this._sendCommand(deviceId, defines.RfyCommands.down2sec, callback);
        }
    };

    venetianIncreaseAngle(deviceId, callback) {
        if (this.isSubtype("ASA")) {
            throw new Error("ASA: Venetian blinds commands not supported");
        }
        if (this.options.venetianBlindsMode === "US") {
            return this._sendCommand(deviceId, defines.RfyCommands.up2sec, callback);
        } else {
            return this._sendCommand(deviceId, defines.RfyCommands.up05sec, callback);
        }
    };

    venetianDecreaseAngle(deviceId, callback) {
        if (this.isSubtype("ASA")) {
            throw new Error("ASA: Venetian blinds commands not supported");
        }
        if (this.options.venetianBlindsMode === "US") {
            return this._sendCommand(deviceId, defines.RfyCommands.down2sec, callback);
        } else {
            return this._sendCommand(deviceId, defines.RfyCommands.down05sec, callback);
        }
    };

    enableSunSensor(deviceId, callback) {
        return this._sendCommand(deviceId, defines.RfyCommands.sunwindenable, callback);
    };

    disableSunSensor(deviceId, callback) {
        return this._sendCommand(deviceId, defines.RfyCommands.sundisable, callback);
    };

}

module.exports = Rfy;

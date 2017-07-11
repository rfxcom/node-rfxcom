/*jshint -W104 */
const defines = require("./defines"),
    index = require("./index"),
    Transmitter = require('./transmitter'),
    RfxCom = require('./rfxcom');

/*
 * This is a class for controlling Somfy RTS blind motors (RFY protocol)
 */
class Rfy extends Transmitter {
    constructor(rfxcom, subtype, options) {
        super(rfxcom, subtype, options);
        this.packetType = "rfy";
        if (this.rfxcom.listingRfyRemotes === undefined) {
            this.rfxcom.listingRfyRemotes = false;
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
        let parts, id, unitCode;
        if (Array.isArray(deviceId)) {
            parts = deviceId;
        } else {
            parts = deviceId.split("/");
        }
        if (parts.length === 2) {
            id = RfxCom.stringToBytes(parts[0], 3);
            unitCode = parseInt(parts[1]);
        } else {
            throw new Error("Invalid deviceId format");
        }
        if (id.value < 1 || id.value > 0xfffff) {
            throw new Error("Address 0x" + id.value.toString(16) + " outside valid range");
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
        const self = this,
            device = self._splitDeviceId(deviceId),
            seqnbr = self.rfxcom.nextMessageSequenceNumber();
        let buffer = [0x0c, defines.RFY, self.subtype, seqnbr,
                device.idBytes[0], device.idBytes[1], device.idBytes[2],
                device.unitCode,
                command, 0, 0, 0, 0];
    
        if (self.rfxcom.listingRfyRemotes) {
            self.seqnbr = seqnbr;
            self.rfxcom.rfyRemotesList = [];
        }
        self.rfxcom.queueMessage(self, buffer, seqnbr, callback);
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

    venetianOpenUS(deviceId, callback) {
        if (this.isSubtype("ASA")) {
            throw new Error("ASA: Venetian blinds commands not supported");
        }
        return this._sendCommand(deviceId, defines.RfyCommands.up05sec, callback);
    };

    venetianCloseUS(deviceId, callback) {
        if (this.isSubtype("ASA")) {
            throw new Error("ASA: Venetian blinds commands not supported");
        }
        return this._sendCommand(deviceId, defines.RfyCommands.down05sec, callback);
    };

    venetianIncreaseAngleUS(deviceId, callback) {
        if (this.isSubtype("ASA")) {
            throw new Error("ASA: Venetian blinds commands not supported");
        }
        return this._sendCommand(deviceId, defines.RfyCommands.up2sec, callback);
    };

    venetianDecreaseAngleUS(deviceId, callback) {
        if (this.isSubtype("ASA")) {
            throw new Error("ASA: Venetian blinds commands not supported");
        }
        return this._sendCommand(deviceId, defines.RfyCommands.down2sec, callback);
    };

    venetianOpenEU(deviceId, callback) {
        if (this.isSubtype("ASA")) {
            throw new Error("ASA: Venetian blinds commands not supported");
        }
        return this._sendCommand(deviceId, defines.RfyCommands.up2sec, callback);
    };

    venetianCloseEU(deviceId, callback) {
        if (this.isSubtype("ASA")) {
            throw new Error("ASA: Venetian blinds commands not supported");
        }
        return this._sendCommand(deviceId, defines.RfyCommands.down2sec, callback);
    };

    venetianIncreaseAngleEU(deviceId, callback) {
        if (this.isSubtype("ASA")) {
            throw new Error("ASA: Venetian blinds commands not supported");
        }
        return this._sendCommand(deviceId, defines.RfyCommands.up05sec, callback);
    };

    venetianDecreaseAngleEU(deviceId, callback) {
        if (this.isSubtype("ASA")) {
            throw new Error("ASA: Venetian blinds commands not supported");
        }
        return this._sendCommand(deviceId, defines.RfyCommands.down05sec, callback);
    };

    enableSunSensor(deviceId, callback) {
        return this._sendCommand(deviceId, defines.RfyCommands.sunwindenable, callback);
    };

    disableSunSensor(deviceId, callback) {
        return this._sendCommand(deviceId, defines.RfyCommands.sundisable, callback);
    };

}

module.exports = Rfy;

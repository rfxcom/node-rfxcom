/*jshint -W104 */
'use strict';
const
    Transmitter = require('./transmitter'),
    RfxCom = require('./rfxcom');

/*
 * This is a class for controlling LightwaveRF lights.
 */
class Lighting5 extends Transmitter {
    constructor(rfxcom, subtype, options) {
        super(rfxcom, subtype, options);
        this.packetType = "lighting5";
        this.packetNumber = 0x14;
    }

/*
 * Splits the device id x/y and returns the components, the deviceId will be
 * returned as the component bytes, ready for sending.
 *
 * Throws an Error if the format is invalid.
 */
    _splitDeviceId(deviceId) {
        let unitCode = NaN;
        const parts = Transmitter.splitAtSlashes(deviceId);
        if (parts.length === 1) {
            if (this.isSubtype(["MDREMOTE", "MDREMOTE_107", "MDREMOTE_108", "TRC02", "TRC02_2", "AOKE", "LEGRAND", "RGB432W"])) {
                unitCode = 1;
            } else {
                throw new Error("Invalid deviceId format");
            }
        } else if (parts.length === 2) {
            unitCode = parseInt(parts[1], 10);
            if (this.isSubtype("AVANTEK")) {
                if (unitCode !== 0) {
                    unitCode = parts[1].toUpperCase().charCodeAt(0);
                }
            }
        } else {
            throw new Error("Invalid deviceId format");
        }
        const id = RfxCom.stringToBytes(parts[0], 3);
        if (id.value < 1 ||
            ((this.isSubtype(["LIGHTWAVERF", "CONRAD", "TRC02"])) && id.value > 0xffffff) ||
            (this.isSubtype("EMW100") && id.value > 0x003fff) ||
            ((this.isSubtype("BBSB")) && id.value > 0x07ffff) ||
            ((this.isSubtype(["MDREMOTE", "AOKE", "RGB432W", "MDREMOTE_107", "LEGRAND", "IT", "MDREMOTE_108", "KANGTAI"])) && id.value > 0x00ffff) ||
            ((this.isSubtype(["LIVOLO", "TRC02_2", "LIVOLO_APPLIANCE"])) && id.value > 0x007fff) ||
            (this.isSubtype(["AVANTEK", "EURODOMEST"]) && id.value > 0x0fffff)
        ) {
            Transmitter.addressError(id);
        }
        if (unitCode < 0 ||
            ((this.isSubtype(["LIGHTWAVERF", "CONRAD"]) ) && unitCode > 16) ||
            ((this.isSubtype(["EMW100", "EURODOMEST", "IT"])) && unitCode > 4) ||
            (this.isSubtype("BBSB") && unitCode > 6) ||
            (this.isSubtype("LIVOLO") && unitCode > 3) ||
            (this.isSubtype("LIVOLO_APPLIANCE") && unitCode > 10) ||
            (this.isSubtype("AVANTEK") && (unitCode !== 0 && (unitCode < 0x41 || unitCode > 0x45))) ||
            (this.isSubtype("KANGTAI") && unitCode > 30)
        ) {
            throw new Error("Invalid unit code " + parts[1]);
        }
        return {
            idBytes: id.bytes,
            unitCode: unitCode
        };
    };

    _sendCommand(deviceId, command, level, callback) {
        const device = this._splitDeviceId(deviceId);
        level = (level === undefined) ? 0x1f : level; // Now works when level == 0
        // If the device code is 0 and the subtype supports group commands, translate them
        if (device.unitCode === 0) {
            if (this.isSubtype(["LIGHTWAVERF", "BBSB", "CONRAD", "LIVOLO", "LIVOLO_APPLIANCE", "EURODOMEST", "AVANTEK", "IT", "KANGTAI"])) {
                if (command === 0x00) {
                    if (this.isSubtype(["LIVOLO", "LIVOLO_APPLIANCE"])) {
                        command = 0x00;
                    } else {
                        command = 0x02;
                    }
                } else if (command === 0x01) {
                    if (this.isSubtype(["LIGHTWAVERF", "LIVOLO", "LIVOLO_APPLIANCE"])) {
                        throw new Error("Subtype doesn't support Group On");
                    } else {
                        command = 0x03;
                    }
                } else if (command === 0x0B) {
                    if (this.isSubtype(["LIGHTWAVERF"])) {
                        command = 0x0C;
                    } else {
                        throw new Error("Subtype doesn't support Group Lock");
                    }
                } else {
                    throw new Error("Group command must be On, Off, or Lock");
                }
            } else {
                throw new Error("Subtype doesn't support group commands");
            }
        }
        let buffer = [device.idBytes[0], device.idBytes[1], device.idBytes[2], device.unitCode, command, level, 0];

        return this.sendRaw(this.packetNumber, this.subtype, buffer, callback);
    };

/*
 * Switch on deviceId/unitCode
 */
    switchOn(deviceId, callback) {
        if (this.isSubtype(["LIVOLO", "LIVOLO_APPLIANCE", "MDREMOTE_107", "LEGRAND"])) {
            throw new Error("Device does not support switchOn()");
        } else {
            return this._sendCommand(deviceId, 0x01, 0x1f, callback);
        }
    };

/*
 * Switch off deviceId/unitCode
 */
    switchOff(deviceId, callback) {
        const device = this._splitDeviceId(deviceId);
        if (this.isSubtype(["MDREMOTE", "MDREMOTE_107", "MDREMOTE_108", "LEGRAND"])) {
            throw new Error("Device does not support switchOff()");
        } else if (this.isSubtype(["LIVOLO", "LIVOLO_APPLIANCE"]) && device.unitCode !== 0) {
            throw new Error("Device supports switchOff() only for group");
        } else {
            return this._sendCommand(deviceId, 0x00, 0, callback);
        }
    };

/*
 * Set dim level
 */
    setLevel(deviceId, level, callback) {
        level = Math.round(level);
        if (this.isSubtype("LIGHTWAVERF")) {
            if ((level < 0x0) || (level > 0x1f)) {
                throw new Error("Invalid level: value must be in range 0-31");
            }
            return this._sendCommand(deviceId, 0x10, level, callback);
        } else if (this.isSubtype("IT")) {
            if ((level < 0x1) || (level > 0x08)) {
                throw new Error("Invalid level: value must be in range 1-8");
            }
            return this._sendCommand(deviceId, 0x10, level, callback);
        } else if (this.isSubtype(["MDREMOTE", "MDREMOTE_108"])) {
            if ((level < 0x01) || (level > 0x03)) {
                throw new Error("Invalid level: value must be in range 1-3");
            }
            return this._sendCommand(deviceId, 7 - level, level, callback);
        } else if (this.isSubtype("MDREMOTE_107")) {
            if ((level < 0x01) || (level > 0x06)) {
                throw new Error("Invalid level: value must be in range 1-6");
            }
            return this._sendCommand(deviceId, 9 - level, level, callback);
        } else {
            throw new Error("Device does not support setLevel()");
        }
    };

/*
 * Set mood (Lightwave RF only) - like a group on/off combination
 */
    setMood(deviceId, mood, callback) {
        mood = Math.round(mood);
        if (this.isSubtype("LIGHTWAVERF")) {
            if (mood < 1 || mood > 5) {
                throw new Error("Invalid mood: value must be in range 1-5.");
            }
            return this._sendCommand(deviceId, mood + 2, 0x1f, callback);
        } else {
            throw new Error("Device does not support setMood()");
        }
    };

/*
 * Increase brightness deviceId/unitCode (MDREMOTE, Livolo, TRC02 only) 'Dim+'
 */
    increaseLevel(deviceId, roomNumber, callback) {
        if (this.isSubtype("LIVOLO_APPLIANCE")) {
            if (this.rfxcom.firmwareVersion > 1025) {
                if (typeof roomNumber === "function") {
                    callback = roomNumber;
                }
                const device = this._splitDeviceId(deviceId);
                if (device.unitCode === 7) {
                    return this._sendCommand(deviceId, 0x08, 0, callback);
                } else if (device.unitCode === 9) {
                    return this._sendCommand(deviceId, 0x0C, 0, callback);
                } else {
                    throw new Error("Only units 7 & 9 support dimming");
                }
            } else {   // Use the old style Livolo 10-way commands
                if (roomNumber === 1) {
                    return this._sendCommand(deviceId, 0x02, 0, callback);
                } else if (roomNumber === 2) {
                    return this._sendCommand(deviceId, 0x06, 0, callback);
                } else if (roomNumber === undefined) {
                    throw new Error("Missing room number");
                } else {
                    throw new Error("Invalid room number " + roomNumber)
                }
            }
        }
        if (typeof roomNumber === "function") { // For back-compatibilty: roomNumber is no longer used
            callback = roomNumber;
        }
        if (this.isSubtype(["MDREMOTE", "LIVOLO", "TRC02", "TRC02_2", "RGB432W", "MDREMOTE_108"])) {
            return this._sendCommand(deviceId, 0x02, 0, callback);
        } else if (this.isSubtype("MDREMOTE_107")) {
            return this._sendCommand(deviceId, 0x01, 0, callback);
        } else {
            throw new Error("Device does not support increaseLevel()")
        }
    };

/*
 * Decrease brightness deviceId/unitCode (MDREMOTE, Livolo, TRC02 only) 'Dim-'
 */
    decreaseLevel(deviceId, roomNumber, callback) {
        if (this.isSubtype("LIVOLO_APPLIANCE")) {
            if (this.rfxcom.firmwareVersion > 1025) {
                if (typeof roomNumber === "function") { // For back-compatibilty: roomNumber is no longer used
                    callback = roomNumber;
                }
                const device = this._splitDeviceId(deviceId);
                if (device.unitCode === 7) {
                    return this._sendCommand(deviceId, 0x09, 0, callback);
                } else if (device.unitCode === 9) {
                    return this._sendCommand(deviceId, 0x0D, 0, callback);
                } else {
                    throw new Error("Only units 7 & 9 support dimming");
                }
            } else {   // Use the old style Livolo 10-way commands
                if (roomNumber === 1) {
                    return this._sendCommand(deviceId, 0x03, 0, callback);
                } else if (roomNumber === 2) {
                    return this._sendCommand(deviceId, 0x07, 0, callback);
                } else if (roomNumber === undefined) {
                    throw new Error("Missing room number");
                } else {
                    throw new Error("Invalid room number " + roomNumber)
                }
            }
        }
        if (typeof roomNumber === "function") { // For back-compatibilty: roomNumber is no longer used
            callback = roomNumber;
        }
        if (this.isSubtype(["MDREMOTE", "LIVOLO", "TRC02", "TRC02_2", "RGB432W", "MDREMOTE_108"])) {
            return this._sendCommand(deviceId, 0x03, 0, callback);
        } else if (this.isSubtype("MDREMOTE_107")) {
            return this._sendCommand(deviceId, 0x02, 0, callback);
        } else {
            throw new Error("Device does not support decreaseLevel()")
        }
    };


/*
 * Toggle on/off (Livolo, MDremote, & Legrand subtypes only)
 */
    toggleOnOff(deviceId, callback) {
        const device = this._splitDeviceId(deviceId);
        if (this.isSubtype("LIVOLO")) {
            if (device.unitCode !== 0) {
                return this._sendCommand(deviceId, device.unitCode, 0x1f, callback);
            } else {
                throw new Error("Group command must be On or Off");
            }
        } else if (this.isSubtype("LIVOLO_APPLIANCE")) {
            if (this.rfxcom.firmwareVersion < 1026) {   // Use the old style Livolo 10-way commands
                if (device.unitCode !== 0) {
                    return this._sendCommand(deviceId, 0x01, 0x1f, callback);
                } else {
                    throw new Error("Group command must be Off");
                }
            } else {
                if (device.unitCode > 0 && device.unitCode < 8) {
                    return this._sendCommand(deviceId, device.unitCode, 0, callback);
                } else if (device.unitCode === 8 || device.unitCode === 9) {
                    return this._sendCommand(deviceId, device.unitCode + 2, 0, callback);
                } else if (device.unitCode === 10) {
                    return this._sendCommand(deviceId, device.unitCode + 4, 0, callback);
                } else {
                    throw new Error("Group command must be Off");
                }
            }
        } else if (this.isSubtype(["MDREMOTE", "MDREMOTE_107", "MDREMOTE_108", "LEGRAND"])) {
            return this._sendCommand(deviceId, 0x00, 0x1f, callback);
        } else {
            throw new Error("Device does not support toggleOnOff()")
        }
    };

/*
 * Learn/program (EMW100) or OK/Set (LIVOLO_APPLIANCE)
 */
    program(deviceId, callback) {
        if (this.isSubtype("EMW100")) {
            return this._sendCommand(deviceId, 0x02, 0, callback);
        } else if (this.isSubtype("LIVOLO_APPLIANCE") && this.rfxcom.firmwareVersion > 1025) {
            return this._sendCommand(deviceId, 0x13, 0, callback);
        } else {
            throw new Error("Device does not support program()")
        }
    };

/*
 * Lightwave LW281 inline Open/Close/Stop relay - Close
 */
    relayClose(deviceId, callback) {
        if (this.isSubtype("LIGHTWAVERF")) {
            return this._sendCommand(deviceId, 0x0d, 0, callback);
        } else {
            throw new Error("Device does not support relayClose()")
        }
    };

/*
 Lightwave LW281 inline Open/Close/Stop relay - Stop
 */
    relayStop(deviceId, callback) {
        if (this.isSubtype("LIGHTWAVERF")) {
            return this._sendCommand(deviceId, 0x0e, 0, callback);
        } else {
            throw new Error("Device does not support relayStop()")
        }
    };

/*
 Lightwave LW281 inline Open/Close/Stop relay - Open
 */
    relayOpen(deviceId, callback) {
        if (this.isSubtype("LIGHTWAVERF")) {
            return this._sendCommand(deviceId, 0x0f, 0, callback);
        } else {
            throw new Error("Device does not support relayOpen()")
        }
    };

/*
 * Lock socket (Lightwave RF only)
 */
    lock(deviceId, callback) {
        if (this.isSubtype("LIGHTWAVERF")) {
            return this._sendCommand(deviceId, 0x0b, 0x00, callback);
        } else {
            throw new Error("Device does not support lock()");
        }
    };

/*
 * Unlock socket (Lightwave RF only)
 */
    unlock(deviceId, callback) {
        if (this.isSubtype("LIGHTWAVERF")) {
            return this._sendCommand(deviceId, 0x0a, 0x00, callback);
        } else {
            throw new Error("Device does not support unlock()");
        }
    };

    /*
         Colour palette controls - TRC & RGB432W device types
         */
    increaseColour(deviceId, callback) {
        if (this.isSubtype(["TRC02", "TRC02_2", "RGB432W"])) {
            return this._sendCommand(deviceId, 0x04, 0, callback);
        } else {
            throw new Error("Device does not support increaseColour()")
        }
    };

    decreaseColour(deviceId, callback) {
        if (this.isSubtype(["TRC02", "TRC02_2", "RGB432W"])) {
            return this._sendCommand(deviceId, 0x05, 0, callback);
        } else {
            throw new Error("Device does not support decreaseColour()")
        }
    };

    setColour(deviceId, colour, callback) {
        colour = Math.round(colour);
        if (this.isSubtype("TRC02_2")) {
            if ((colour < 0) || (colour > 61)) {
                throw new Error("Invalid colour: value must be in range 0-61");
            }
            return this._sendCommand(deviceId, 0x06 + colour, colour, callback);
        } else if (this.isSubtype(["TRC02", "RGB432W"])) {
            if ((colour < 0) || (colour > 126)) {
                throw new Error("Invalid colour: value must be in range 0-126");
            }
            return this._sendCommand(deviceId, 0x06 + colour, colour, callback);
        } else {
            throw new Error("Device does not support setColour()")
        }
    };

/*
 * Scence control - Livolo appliance module only
 */
    setScene(deviceId, sceneNumber, roomNumber, callback) {
        if (this.isSubtype("LIVOLO_APPLIANCE")) {
            if (this.rfxcom.firmwareVersion > 1025) {
                if (typeof roomNumber === "function") { // For back-compatibilty: roomNumber is no longer used
                    callback = roomNumber;
                }
                sceneNumber = Math.round(sceneNumber);
                if (sceneNumber > 0 && sceneNumber < 5) {
                    return this._sendCommand(deviceId, sceneNumber + 14, 0, callback);
                } else {
                    throw new Error("Invalid scene number: value must be in range  1-4");
                }
            } else {
                if (roomNumber === 1) {
                    if (sceneNumber === 1) {
                        return this._sendCommand(deviceId, 0x04, 0, callback);
                    } else if (sceneNumber === 2) {
                        return this._sendCommand(deviceId, 0x05, 0, callback);
                    } else {
                        throw new Error("Invalid scene " + sceneNumber)
                    }
                } else if (roomNumber === 2) {
                    if (sceneNumber === 1) {
                        return this._sendCommand(deviceId, 0x08, 0, callback);
                    } else if (sceneNumber === 2) {
                        return this._sendCommand(deviceId, 0x09, 0, callback);
                    } else {
                        throw new Error("Invalid scene number " + sceneNumber)
                    }
                } else {
                    throw new Error("Invalid room number " + roomNumber)
                }
            }
        } else {
            throw new Error("Device does not support setScene()");
        }
    };

}

module.exports = Lighting5;

/*jshint -W104 */
'use strict';
const
    Transmitter = require('./transmitter'),
    RfxCom = require('./rfxcom');

/*
 * This is a class for controlling Funkbus devices.
 */
class Funkbus extends Transmitter {
    constructor(rfxcom, subtype, options) {
        super(rfxcom, subtype, options);
        this.packetType = "funkbus";
        this.packetNumber = 0x1e;
    }

    /*
     * Splits the device id into idBytes, group, and optional channelCode.
     *
     */
    // noinspection JSMethodCanBeStatic
    _splitDeviceId(deviceId) {
        const
            parts = Transmitter.splitAtSlashes(deviceId);
        if (parts.length < 2 || parts.length > 3) {
            throw new Error("Invalid deviceId format");
        }
        const
            id = RfxCom.stringToBytes(parts[0], 2),
            group = parts[1].toUpperCase().charCodeAt(0);
        if (id.value > 0xFFFF) {
            Transmitter.deviceIdError(id);
        }
        if (group < 0x41 || group > 0x43) {
            throw new Error("Invalid group code '" + parts[1] + "'");
        }
        return {
            idBytes:     id.bytes,
            groupCode:   group,
            channelCode: parts.length >= 3 ? parseInt(parts[2]) : -1
        };
    };

    _sendCommand(device, command, commandParameter, commandTime, callback) {
        if (commandParameter < 0) {
            commandParameter = device.channelCode;
        }
        let buffer = [device.idBytes[0], device.idBytes[1], device.groupCode, commandParameter,
            command, commandTime, 0, 0];

        return this.sendRaw(this.packetNumber, this.subtype, buffer, callback);
    };

    buttonPress(deviceId, buttonName, buttonNumber, buttonPressTime, callback) {
        if (buttonPressTime < 0 || buttonPressTime > 12) {
            throw new Error("Invalid buttonPressTime: value must be in range 0.0 - 12.0 seconds.");
        }
        const device = this._splitDeviceId(deviceId);
        const cmndtime = Math.max(0, Math.round(4*buttonPressTime) - 3);
        buttonNumber = Math.round(buttonNumber);
        if (this.isSubtype("GIRA")) {
            if (/All Off/i.test(buttonName)) {
                return this._sendCommand(device, 0x02, 0, cmndtime, callback);
            } else if (/All On/i.test(buttonName)) {
                return this._sendCommand(device, 0x03, 0, cmndtime, callback);
            } else if (/Scene/i.test(buttonName)) {
                if (buttonNumber >= 1 && buttonNumber <= 5) {
                    return this._sendCommand(device, 0x04, buttonNumber, cmndtime, callback);
                } else {
                    throw new Error("Invalid scene number " + buttonNumber)
                }
            } else if (/Master.*(-|Down)/i.test(buttonName)) {
                return this._sendCommand(device, 0x05, 0, cmndtime, callback);
            } else if (/Master.*([+]|Up)/i.test(buttonName)) {
                return this._sendCommand(device, 0x06, 0, cmndtime, callback);
            }
        }
        if (buttonNumber === 0) {
            throw new Error("Device doesn't support group commands")
        } else if (/^Down|^-|^Up|^[+]/i.test(buttonName)) {
            if (buttonNumber >= 1 && buttonNumber <= 8) {
                if (/^Down|^-/i.test(buttonName)) {
                    return this._sendCommand(device, 0x00, buttonNumber, cmndtime, callback);
                } else if (/^Up|^[+]/i.test(buttonName)) {
                    return this._sendCommand(device, 0x01, buttonNumber, cmndtime, callback);
                }
            } else {
                throw new Error("Invalid channel: value must be in range 1-8")
            }
        } else {
            throw new Error("Device doesn't support command \"" + buttonName + "\"");
        }
    };

/*
 * Switch on deviceId/groupCode/channelCode
 */
    switchOn(deviceId, callback) {
        const device = this._splitDeviceId(deviceId);
        if (device.channelCode !== 0) {
            return this.buttonPress(deviceId, "Up", device.channelCode, 0.5, callback);
        } else {
            return this.buttonPress(deviceId, "All On", 0, 0.5, callback);
        }
    };

/*
 * Switch off deviceId/groupCode/channelCode
 */
    switchOff(deviceId, callback) {
        const device = this._splitDeviceId(deviceId);
        if (device.channelCode !== 0) {
            return this.buttonPress(deviceId, "Down", device.channelCode, 0.5, callback);
        } else {
            return this.buttonPress(deviceId, "All Off", 0, 0.5, callback);
        }
    };

/*
 * Increase brightness deviceId/groupCode/channelCode, or the selected scene if channelCode == 0
 */
    increaseLevel(deviceId, roomNumber, callback) {
        if (typeof roomNumber === "function") { // For back-compatibilty: roomNumber is no longer used
            callback = roomNumber;
        }
        const device = this._splitDeviceId(deviceId);
        if (device.channelCode !== 0) {
            return this.buttonPress(deviceId, "Up", device.channelCode, 1.0, callback);
        } else {
            return this.buttonPress(deviceId, "Master Up", 0, 0.5, callback);
        }
    };

/*
 * Decrease brightness deviceId/groupCode/channelCode, or the selected scene if channelCode == 0
 */
    decreaseLevel(deviceId, roomNumber, callback) {
        if (typeof roomNumber === "function") { // For back-compatibilty: roomNumber is no longer used
            callback = roomNumber;
        }
        const device = this._splitDeviceId(deviceId);
        if (device.channelCode !== 0) {
            return this.buttonPress(deviceId, "Down", device.channelCode, 1.0, callback);
        } else {
            return this.buttonPress(deviceId, "Master Down", 0, 0.5, callback);
        }
    };

/*
 * Select a (previously programmed) scene
 */
    setScene(deviceId, sceneNumber, roomNumber, callback) {
        if (typeof roomNumber === "function") { // For back-compatibilty: roomNumber is no longer used
            callback = roomNumber;
        }
        return this.buttonPress(deviceId, "Scene", sceneNumber, 0.5, callback)
    };

}

module.exports = Funkbus;
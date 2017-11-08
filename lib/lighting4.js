/*jshint -W104 */
'use strict';
const
    Transmitter = require('./transmitter');

/*
 * This is a class for controlling Lighting4 lights.
 */
class Lighting4 extends Transmitter {
    constructor(rfxcom, subtype, options) {
        super(rfxcom, subtype, options);
        this.packetType = "lighting4";
        this.packetNumber = 0x13;
        if (Array.isArray(this.options.defaultPulseWidth) === false) {
            this.options.defaultPulseWidth = [0x01, 0x5E];
        }
    }

/*
 *  Send the specified data bytes (3-element array) and pulse width (2-element array)
 */
    _sendCommand(data, pulseWidth, callback) {
        let buffer = [data[0], data[1], data[2], pulseWidth[0], pulseWidth[1], 0];

        return this.sendRaw(this.packetNumber, this.subtype, buffer, callback);
    };

/*
 * Send the specified data - force it to be a 3-element numeric array
 */
    sendData(data, pulseWidth, callback) {
        data = Lighting4.toByteArray(data, 3);
        if (pulseWidth === undefined || pulseWidth === null) {
            pulseWidth = this.options.defaultPulseWidth;
        } else {
            pulseWidth = Lighting4.toByteArray(pulseWidth, 2);
        }
        return this._sendCommand(data, pulseWidth, callback);
    };

    static toByteArray(data, numBytes) {
        if (Array.isArray(data)) {
            data = data.reverse();
        } else {
            if (typeof data === "string") {
                data = parseInt(data);
            }
            let residual = data;
            data = [];
            while (residual > 0) {
                data.push(residual%256);
                residual = Math.floor(residual/256);
            }
        }
        while (data.length < numBytes) {
            data.push(0);
        }
        data = data.reverse();
        return data;
    };

}

module.exports = Lighting4;


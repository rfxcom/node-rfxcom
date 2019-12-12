/**
 * Created by max on 01/07/2017.
 */

'use strict';
const index = require('./index'); // Gives access to the subtype names

/*
 * A base class from which packet transmitters inherit, incorporating a couple of handy methods
 */
class Transmitter {
    constructor(rfxcom, subtype, options) {
        if (typeof subtype === "undefined") {
            throw new Error("Must provide a subtype.");
        }
        this.rfxcom = rfxcom;
        this.packetType = "";
        this.packetNumber = NaN;
        this.subtype = subtype;
        this.options = options || {};
    }

/*
 *   Returns true if the subtype matches the supplied subtypeName, of if it matches any one of the names supplied
 *    in an array of subtype names
 */
    isSubtype(subtypeName) {
        if (Array.isArray(subtypeName)) {
            const self = this;
            return !subtypeName.every(name => index[self.packetType][name] !== self.subtype)
        } else {
            return index[this.packetType][subtypeName] === this.subtype;
        }
    };

/*
 * Called by the transmission queue handler if no response is received
 */
    // noinspection JSMethodCanBeStatic
    _timeoutHandler(/*buffer, seqnbr*/) {
        return false;
    };

    setOption(newOptions) {
        for (let key in newOptions) {
            if (newOptions.hasOwnProperty(key)) {
                this.options[key] = newOptions[key];
            }
        }
    }

/*
 * Send the given buffer as a message with the specified type & subtype - no error-checking!
 */
    sendRaw(packetNumber, subtype, buffer, callback) {
        const
            self = this,
            seqnbr = self.rfxcom.nextMessageSequenceNumber(),
            len = buffer.unshift(packetNumber, subtype, seqnbr);
        buffer.unshift(len);
        self.rfxcom.queueMessage(self, buffer, seqnbr, callback);
        return seqnbr;
    }

    static splitAtSlashes(deviceId) {
        if (Array.isArray(deviceId)) {
            return deviceId;
        } else {
            return deviceId.split("/");
        }
    }

    static addressError(id) {
        throw new Error("Address " + (Number(id.value)< 0 ? "-" : "") + "0x" + Math.abs(Number(id.value)).toString(16) + " outside valid range");
    }

    static deviceIdError(id) {
        throw new Error("Device ID 0x" + Number(id.value).toString(16) + " outside valid range");
    }

    static remoteIdError(id) {
        throw new Error("Remote ID 0x" + Number(id.value).toString(16) + " outside valid range");
    }

}

module.exports = Transmitter;

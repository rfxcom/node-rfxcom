/**
 * Created by max on 01/07/2017.
 */

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
            return !subtypeName.every(function (name) {return index[self.packetType][name] !== self.subtype})
        } else {
            return index[this.packetType][subtypeName] === this.subtype;
        }
    };

/*
 * Called by the transmission queue handler if no response is received
 */
    _timeoutHandler(buffer, seqnbr) {
        return false;
    };

    setOption(newOptions) {
        for (let key in newOptions) {
            if (newOptions.hasOwnProperty(key)) {
                this.options[key] = newOptions[key];
            }
        }
    }

    static splitAtSlashes(deviceId) {
        if (Array.isArray(deviceId)) {
            return deviceId;
        } else {
            return deviceId.split("/");
        }
    }

}

module.exports = Transmitter;

/**
 * Created by max on 01/07/2017.
 */

/* Defines a class from which packet transmitters inherit, incorporating a couple of handy methods
*/

const index = require('./index'); // Gives access to the subtype names

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
    Returns true if the subtype matches the supplied subtypeName
*/
    isSubtype(subtypeName) {
        if (Array.isArray(subtypeName)) {
            let self = this;
            return !subtypeName.every(function (name) {return index[self.packetType][name] !== self.subtype})
        } else {
            return index[this.packetType][subtypeName] === this.subtype;
        }
    };

    _timeoutHandler(buffer, seqnbr) {
        return false;
    };
};

module.exports = Transmitter;

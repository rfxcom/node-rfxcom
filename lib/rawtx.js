'use strict';
const defines = require('./defines'),
    Transmitter = require('./transmitter');

/*
 * This is a class for controlling Harrison curtain controllers..
 */
class RawTx extends Transmitter {
    constructor(rfxcom, subtype, options) {
        // No real subtype for raw transmissions, use a dummy placeholder
        super(rfxcom, -1, options);
        this.packetType = "rawtx";
        this.packetNumber = 0x7f;
    }

    isSubtype(subtypeName) {
        // we don't have a real subtype, so always return false
        return false;
    }

    static _stringToArray(str) {
        str = str.trim().toUpperCase();
        if (str.indexOf(".") != -1 || str.indexOf("E") != -1) {
            throw new Error("Floating-point pulse times not allowed")
        }
        return str.split(/[ ,\t\n]+/).map(function(s) {return parseInt(s)});
    }

    static _anyNonValid(arr) {
        return (arr.some(function(x) {return x <= 0 || x >= 65536}))
    }

    static _anyNonNumeric(arr) {
        return (arr.some(function(x) {return typeof x !== "number"}))
    }

/*
    Send the message with the specified parameters, given by the fields of the params object:
    {
        repeats: 1-10   (defaults to 5))
        pulseTimes: <string or array of numbers>
    }
 */
    sendMessage(deviceId, params, callback) {
        const pulsesPerPacket = 124,
              maxPackets = 4;
        if (callback === undefined && typeof deviceId == "object") {
            if (params === undefined) {
                params = deviceId;
            } else if (typeof params == "function") {
                callback = params;
                params = deviceId;
            }
        }
        if (typeof params === "function") {
            throw new Error("RawTx: Missing params")
        }
        if (params.repeats === undefined) {
            params.repeats = 5;
        } else if (params.repeats < 1 || params.repeats > 10) {
            throw new Error("RawTx: Invalid number of repeats: " + params.repeats);
        }
        if (params.pulseTimes === undefined) {
            throw new Error("RawTx: Missing params.pulseTimes");
        }
        let pulseTimes;
        if (typeof params.pulseTimes === "string") {
            pulseTimes = RawTx._stringToArray(params.pulseTimes);
        } else if (params.pulseTimes instanceof Array) {
            pulseTimes = params.pulseTimes;
        } else {
            throw new Error("params.pulseTimes must be string or array")
        }
        if (RawTx._anyNonNumeric(pulseTimes)) {
            throw new Error("All pulse times must be numbers");
        }
        if (RawTx._anyNonValid(pulseTimes)) {
            throw new Error("All pulse times must be in the range 1 to 65535");
        }
        if (pulseTimes.length > pulsesPerPacket*maxPackets) {
            throw new Error("Too many pulse times, maximum " + pulsesPerPacket*maxPackets);
        }
        if (pulseTimes.length % 2 != 0) {
            throw new Error("Number of pulse times must be even");
        }

        const numPackets = Math.ceil(pulseTimes.length/pulsesPerPacket)
        let pulseIdx = 0;
        for (let packetIdx = 0; packetIdx < numPackets; packetIdx++) {
            let buffer = [0];
            while (pulseIdx < Math.min(pulseTimes.length, (packetIdx + 1)*pulsesPerPacket)) {
                buffer.push(Math.floor(pulseTimes[pulseIdx]/256), pulseTimes[pulseIdx]%256);
                pulseIdx++;
            }
            if (pulseIdx >= pulseTimes.length) {
                buffer[0] = params.repeats;
            }
            this.sendRaw(this.packetNumber, packetIdx, buffer, callback);
        };
    }
};

module.exports = RawTx;
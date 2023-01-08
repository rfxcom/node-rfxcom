/* global require: false, module */
const events = require("events"),
        util = require("util");

class FakeSerialPort extends events.EventEmitter {
    constructor() {
        super ();
        this.bytesWritten = [];
        this.flushed = false;
        this.isOpen = true;
    }

    write(buffer, callback) {
        this.bytesWritten += buffer;
        if (callback && typeof callback === "function") {
            callback();
        }
    };

    flush(callback) {
        this.flushed = true;
        if (callback && typeof callback === "function") {
            callback();
        }
    };

    close(callback) {
        this.isOpen = false;
        if (callback && typeof callback === "function") {
            callback();
        }
    };    
}
module.exports = FakeSerialPort;

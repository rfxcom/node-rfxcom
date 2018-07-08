/* global require: false, module */
const events = require("events"),
        util = require("util");

const FakeSerialPort = function() {
    const self = this;
    events.EventEmitter.call(this);
    self.bytesWritten = [];
    self.flushed = false;
    self.isOpen = true;
};
util.inherits(FakeSerialPort, events.EventEmitter);

FakeSerialPort.prototype.write = function(buffer, callback) {
    const self = this;
    self.bytesWritten += buffer;
    if (callback && typeof callback === "function") {
        callback();
    }
};

// noinspection JSUnusedGlobalSymbols
FakeSerialPort.prototype.flush = function(callback) {
    const self = this;
    self.flushed = true;
    if (callback && typeof callback === "function") {
        callback();
    }
};

FakeSerialPort.prototype.close = function(callback) {
    const self = this;
    self.isOpen = false;
    if (callback && typeof callback === "function") {
        callback();
    }
};

module.exports = FakeSerialPort;

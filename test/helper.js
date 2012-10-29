var events = require("events"),
    util = require("util");

var FakeSerialPort = function() {
  var self = this;
  events.EventEmitter.call(this);
  self.bytesWritten = [];
  self.flushed = false;
};
util.inherits(FakeSerialPort, events.EventEmitter);

FakeSerialPort.prototype.write = function(buffer, callback) {
  var self = this;
  self.bytesWritten += buffer;
  callback();
};

FakeSerialPort.prototype.flush = function(callback) {
  var self = this;
  self.flushed = true;
  callback();
};

module.exports = FakeSerialPort;
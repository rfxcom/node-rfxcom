var _ = require("underscore"),
  serialport = require("serialport"),
  EventEmitter = require('events').EventEmitter,
  util = require('util');

function RfxCom(device, options) {
  var self = this;
  this.options = options || {};

  this.handlers = {
    0x5a: "elec2Handler",
    0x01: "interfaceHandler",
    0x02: "messageHandler",
    0x14: "lighting5Handler"
  }

  // Running counter for command numbers.
  this._cmd = 0;
  this.device = device;

  this.rfxtrxParser = function() {
    var data = [],
        requiredBytes = 0;
    return function (emitter, buffer) {
      // Collect data
      data.push.apply(data, buffer);
      if (requiredBytes==0) {
        requiredBytes = buffer[0] + 1;
      }
      if (data.length==requiredBytes) {
        emitter.emit("data", data);
        data = [];
        requiredBytes = 0;
      }
    };
  }

  this.serial = new serialport.SerialPort(device, {
    baudrate : 38400,
    parser: this.rfxtrxParser()
  });

  // Add data read event listener
  this.serial.on("data", function(data) {
    if (self.options.debug) {
      console.log("Received: %s", self.dumpHex(data));
    }
    var length = data.shift(),
       packet_type = data.shift();
       handler = self.handlers[packet_type];
    if (typeof handler != "undefined") {
      self[handler](data);
    } else {
      if (self.options.debug) {
        console.log("Unhandled packet type = %s", self.dumpHex([packet_type]));
      }
    }
  });

  this.serial.on("error", function(msg) {
    console.log("Error %s", msg);
  });

  this.serial.on("end", function() {
    console.log("Received 'end'");
  });

  this.serial.on("drain", function() {
    console.log("Received 'drain'");
  });

  this.serial.on("open", function() {
    self.emit("ready");
  });
}

util.inherits(RfxCom, EventEmitter);

RfxCom.prototype.elec2Handler = function(data) {
  var subtypes = {
        0x01: "CM119/160"
      },
      TOTAL_DIVISOR = 223.666,
      subtype = subtypes[data[0]],
      seqnbr = data[1],
      id = data.slice(2, 4).toString(),
      count = data[4],
      instant = data.slice(5, 9),
      total = data.slice(9, 15),
      current_watts = this.bytesToUint32(instant),
      total_watts = this.bytesToUint48(total) / TOTAL_DIVISOR;

  this.emit("elec2", subtype, id, current_watts, total_watts);
}

RfxCom.prototype.messageHandler = function(data) {
  var seqnbr = data[0],
      message = data[1],
      responses = {
        0: "ACK - transmit OK",
        1: "ACK - transmit delayed",
        2: "NAK - transmitter did not lock onto frequency",
        3: "NAK - AC address not allowed"
      };
  this.emit("response", responses[message], seqnbr);
}

RfxCom.prototype.interfaceHandler = function(data) {
  var subtypes = {
        0x01: "CM119/160"
      },
      TOTAL_DIVISOR = 223.666,
      subtype = subtypes[data[0]],
      seqnbr = data[1],
      id = data.slice(2, 4).toString(),
      count = data[4],
      instant = data.slice(5, 9),
      total = data.slice(9, 15),
      current_watts = this.bytesToUint32(instant),
      total_watts = this.bytesToUint48(total) / TOTAL_DIVISOR;

  this.emit("elec2", subtype, id, current_watts, total_watts);
}

RfxCom.prototype.lighting5Handler = function(data) {
  var subtypes = {
        0x00: "LightwaveRF, Siemens",
        0x01: "EMW100 GAO/Everflourish"
      },
      commands = {
        0x00: "Off",
        0x01: "On"
      },
      subtype = subtypes[data[0]],
      seqnbr = data[1],
      id = this.dumpHex(data.slice(2, 5)),
      unitcode = data[5],
      command = commands[data[6]];

  this.emit("lighting5", subtype, id, unitcode, command);
}

RfxCom.prototype.getCmdNumber = function() {
  if (this._cmd > 256)
    this._cmd = 0;
  return this._cmd++;
}

RfxCom.prototype.reset = function(callback) {
  var buffer = [13, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  this.serial.write(buffer, callback);
}

RfxCom.prototype.getStatus = function(callback) {
  var cmd_id = this.getCmdNumber(),
      buffer = [13, 0, 0, cmd_id, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  this.serial.write(buffer, function(err, response) {
    callback(err, response, cmd_id);
  });
  return cmd_id;
}

RfxCom.prototype.lightOn = function(id, unit, callback) {
  var cmd_id = this.getCmdNumber(),
      buffer = [0x0A, 0x14, 0, cmd_id, 0xf0, 0x9a, 0xc7, 1, 1, 0, 0];
  this.serial.write(buffer, function(err, response) {
    callback(err, response, cmd_id);
  });
  return cmd_id;
}

RfxCom.prototype.lightOff = function(id, unit, callback) {
  var cmd_id = this.getCmdNumber(),
      buffer = [0x0A, 0x14, 0, cmd_id, 0xf0, 0x9a, 0xc7, 1, 0, 0, 0];
  this.serial.write(buffer, function(err, response) {
    callback(err, response, cmd_id);
  });
  return cmd_id;
}

RfxCom.prototype.delay = function(ms) {
  ms += +new Date();
  while (+new Date() < ms) { }
}

RfxCom.prototype.dumpHex = function(buffer) {
  function dec2hex(value) {
    var hexDigits = "0123456789ABCDEF";
    return "0x" + (hexDigits[value >> 4] + hexDigits[value & 15]); 
  };
  return _.map(buffer, dec2hex);
}

RfxCom.prototype.bytesToUint32 = function(bytes) {
  return (bytes[0] * Math.pow(2, 24)) + (bytes[1] << 16) + (bytes[2] << 8) + bytes[3];
};

RfxCom.prototype.bytesToUint48 = function(bytes) {
  return (bytes[0] * Math.pow(2, 40)) + (bytes[1] * Math.pow(2, 32)) +
    (bytes[2] * Math.pow(2, 24)) + (bytes[3] << 16) + (bytes[4] << 8) + bytes[4]
}

RfxCom.prototype.stringToBytes = function(bytes) {
  var result = [];
  for (var i=0; i < bytes.length; i+=2) {
    a.push("0x" + str.substr(i, 2));
  }
  return result;
}

module.exports.RfxCom = RfxCom;

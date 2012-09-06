var _ = require("underscore")
  , serialport = require("serialport")
  , EventEmitter = require("events").EventEmitter
  , util = require("util");

function RfxCom(device, options){
  var self = this;

  self.options = options || {};
  self.handlers = {
      0x01: "statusHandler"
    , 0x02: "messageHandler"
    , 0x14: "lighting5Handler"
    , 0x5a: "elec2Handler"
    , 0x20: "security1Handler"
  }

  // Running counter for command numbers.
  self._cmd = 0;

  // Allow for faking out the SerialPort
  if (typeof self.options.port != "undefined"){
    self.serialport = options.port;
  }

  // Store the device to use
  self.device = device;

  // This is a buffering parser which accumulates bytes until it receives the
  // number of bytes specified in the first byte of the message.
  // It relies on a flushed buffer, to ensure the first byte corresponds to the
  // size of the first message.
  // The 'data' message emitted has all the bytes from the message.
  self.rfxtrxParser = function(){
    var data = []
      , requiredBytes = 0;
    return function (emitter, buffer){
      // Collect data
      data.push.apply(data, buffer);
      if (requiredBytes == 0){
        requiredBytes = buffer[0] + 1;
      }
      if (data.length >= requiredBytes){
        emitter.emit("data", data.slice(0, requiredBytes+1));
        data = data.slice(requiredBytes);
        requiredBytes = 0;
      }
    };
  }
};
util.inherits(RfxCom, EventEmitter);

RfxCom.prototype.open = function(){
  var self = this;

  if (typeof self.serialport == "undefined"){
    self.serialport = new serialport.SerialPort(self.device, {
      baudrate : 38400,
      parser: self.rfxtrxParser()
    })
  }
  self.serialport.on("open", function(){
    self.emit("ready");
  });

  // Add data read event listener
  self.serialport.on("data", function(data){
    if (self.options.debug){
      console.log("Received: %s", self.dumpHex(data));
    }

    var length = data.shift()
      , packet_type = data.shift()
      , handler = self.handlers[packet_type];

    if (typeof handler != "undefined"){
      self[handler](data);
    } else {
      if (self.options.debug){
        console.log("Unhandled packet type = %s", self.dumpHex([packet_type]));
      }
    }
  });

  self.serialport.on("error", function(msg){
    console.log("Error %s", msg);
  });

  self.serialport.on("end", function(){
    console.log("Received 'end'");
  });

  self.serialport.on("drain", function(){
    console.log("Received 'drain'");
  });
}

RfxCom.prototype.messageHandler = function(data){
  var self = this
    , subtype = data[0]
    , seqnbr = data[1]
    , responses = {
        0: "ACK - transmit OK",
        1: "ACK - transmit delayed",
        2: "NAK - transmitter did not lock onto frequency",
        3: "NAK - AC address not allowed"
      }
    , message = data[2];
  self.emit("response", responses[message], seqnbr);
}

/**
 *
 * Called by the data event handler when data arrives from the device with
 * information about its settings.
 *
 */
RfxCom.prototype.statusHandler = function(data){
  var self = this
    , receiver_types = {
        0x50: "310MHz"
      , 0x51: "315MHz"
      , 0x52: "433.92MHz receiver only"
      , 0x53: "433.92MHz transceiver"
      , 0x55: "868.00MHz"
      , 0x56: "868.00MHz FSK"
      , 0x57: "868.30MHz"
      , 0x58: "868.30MHz FSK"
      , 0x59: "868.35MHz"
      , 0x5A: "868.35MHz FSK"
      , 0x5B: "868.95MHz"
    };
  var subtype = data[0]
    , seqnbr = data[1]
    , cmnd = data[2]
    , receiver_type = receiver_types[data[3]]
    , firmware_version = data[4];
    
  self.emit("status", subtype, seqnbr, cmnd, receiver_type, firmware_version);
}

/**
 *
 * Fetches a "command number" sequence number for identifying requests sent to
 * the device.
 *
 */
RfxCom.prototype.getCmdNumber = function(){
  var self = this;

  if (self._cmd > 256)
    self._cmd = 0;
  return self._cmd++;
}

/**
 *
 * Writes the reset sequence to the RFxtrx433.
 *
 */
RfxCom.prototype.reset = function(callback){
  var self = this
     , buffer = [13, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  self.serialport.write(buffer, callback);
}

/**
 *
 * Calls flush on the underlying SerialPort.
 *
 */
RfxCom.prototype.flush = function(callback){
  var self = this;
  self.serialport.flush(callback);
}

RfxCom.prototype.getStatus = function(callback){
  var self = this
    , cmd_id = self.getCmdNumber()
    , buffer = [13, 0, 0, cmd_id, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  self.serialport.write(buffer, function(err, response){
    if (callback){
      return callback(err, response, cmd_id);
    }
  });
  return cmd_id;
}

/**
 *
 * Turn on the specified light unit.
 *
 * Currently only works for lighting5 (LightwaveRF, Siemens) lights.
 *
 */
RfxCom.prototype.lightOn = function(id, unit, callback){
  var self = this
    , cmd_id = self.getCmdNumber()
    , id_bytes = self.stringToBytes(id)
    , buffer = [0x0A, 0x14, 0, cmd_id, id_bytes[0], id_bytes[1], id_bytes[2], unit, 1, 0, 0];

  if (self.options.debug){
    console.log("Sending lightOn data: %s", self.dumpHex(buffer));
  }
  self.serialport.write(buffer, function(err, response){
    callback(err, response, cmd_id);
  });
  return cmd_id;
}

/**
 *
 * Turn off the specified light unit.
 *
 * Currently only works for lighting5 (LightwaveRF, Siemens) lights.
 *
 */
RfxCom.prototype.lightOff = function(id, unit, callback){
  var self = this
    , cmd_id = self.getCmdNumber()
    , id_bytes = self.stringToBytes(id)
    , buffer = [0x0A, 0x14, 0, cmd_id, id_bytes[0], id_bytes[1], id_bytes[2], unit, 0, 0, 0];
  if (self.options.debug){
    console.log("Sending lightOff data: %s", self.dumpHex(buffer));
  }
  self.serialport.write(buffer, function(err, response){
    callback(err, response, cmd_id);
  });
  return cmd_id;
}

/**
 *
 * Wait for at least the specified number of milliseconds.
 *
 * This may not wait precisely for that number of milliseconds due to the
 * vagaries of system scheduling, but no fewer than the specified ms.
 *
 */
RfxCom.prototype.delay = function(ms){
  ms += +new Date();
  while (+new Date() < ms){ }
}

RfxCom.prototype.dumpHex = function(buffer, prefix){
  var prefix = prefix ? prefix : "";
  function dec2hex(value){
    var hexDigits = "0123456789ABCDEF";
    return prefix + (hexDigits[value >> 4] + hexDigits[value & 15]); 
  };
  return _.map(buffer, dec2hex)
}

/**
 *
 * Converts an array of 4 bytes to a 32bit integer.
 *
 */
RfxCom.prototype.bytesToUint32 = function(bytes){
  return (bytes[0] * Math.pow(2, 24)) + (bytes[1] << 16) + (bytes[2] << 8) + bytes[3];
};

/**
 *
 * Converts an array of 6 bytes to a 48bit integer.
 *
 */
RfxCom.prototype.bytesToUint48 = function(bytes){
  return (bytes[0] * Math.pow(2, 40)) + (bytes[1] * Math.pow(2, 32)) +
    (bytes[2] * Math.pow(2, 24)) + (bytes[3] << 16) + (bytes[4] << 8) + bytes[4]
}

/**
 *
 * Converts a string to an array of Byte values.
 *
 * e.g. stringToBytes("202020") == [32, 32, 32]
 *
 */
RfxCom.prototype.stringToBytes = function(bytes){
  var result = [];
  for (var i=0; i < bytes.length; i+=2){
    var byteString = bytes.substr(i, 2);
    if (byteString != "0x"){
      var value = parseInt(bytes.substr(i, 2), 16);
      if (typeof value != "undefined"){
        result.push(value);
      }
    }
  }
  return result;
}

/**
 *
 * Called by the data event handler when data arrives an OWL CM119/CM160 power
 * measurement device.
 *
 * Calculates the current usage and total usage from the bytes sent, and emits
 * an "elec2" message for handling.
 *
 */
RfxCom.prototype.elec2Handler = function(data){
  var self = this
    , subtypes = {
        0x01: "CM119/160"
      }
    , TOTAL_DIVISOR = 223.666
    , subtype = subtypes[data[0]]
    , seqnbr = data[1]
    , id = "0x" + self.dumpHex(data.slice(2, 4), false).join("")
    , count = data[4]
    , instant = data.slice(5, 9)
    , total = data.slice(9, 15)
    , current_watts = self.bytesToUint32(instant)
    , total_watts = self.bytesToUint48(total) / TOTAL_DIVISOR;

  var rounded_total = Math.round(total_watts * Math.pow(10, 2)) / Math.pow(10, 2);
  self.emit("elec2", subtype, id, current_watts, rounded_total);
}

/**
 *
 * Called by the data event handler when data arrives from various security
 * devices.
 *
 */
RfxCom.prototype.security1Handler = function(data){
  var self = this
      subtypes = {
        0x00: "X10 Security door/window sensor",
        0x01: "X10 security motion sensor",
        0x02: "X10 security remote (no alive packets)",
      }
    , subtype = subtypes[data[0]]
    , seqnbr = data[1]
    , id = "0x" + self.dumpHex(data.slice(2, 5), false).join("")
    , device_status = data[5]
    , battery_level = data[6];

  self.emit("security1", subtype, id, device_status, battery_level);
}

/**
 *
 * Called by the data event handler when data arrives from a LightwaveRF/Siemens
 * light control device.
 *
 */
RfxCom.prototype.lighting5Handler = function(data){
  var self = this
    , subtypes = {
        0x00: "LightwaveRF, Siemens",
        0x01: "EMW100 GAO/Everflourish"
      },
      commands = {
        0x00: "Off",
        0x01: "On"
      },
      subtype = subtypes[data[0]],
      seqnbr = data[1],
      id = "0x" + self.dumpHex(data.slice(2, 5), false).join(""),
      unitcode = data[5],
      command = commands[data[6]];

  self.emit("lighting5", subtype, id, unitcode, command);
}


/*
 * This is a class for controlling LightwaveRF lights.
 */
function LightwaveRf(rfxcom){
  var self = this;

  self.rfxcom = rfxcom;
}

/*
 * Switch on deviceId/unitCode
 */
LightwaveRf.prototype.switchOn = function(deviceId, unitCode, options, callback){
  if (typeof options == "function"){
    callback = options;
    options = {};
  }
  if (typeof options.mood != "undefined"){
    if (options.mood < 1 || options.mood > 5){
      throw new Error("Invalid mood value must be in range 1-5.");
    }
  }
  var self = this
    , cmd_id = self.rfxcom.getCmdNumber()
    , id_bytes = self.rfxcom.stringToBytes(deviceId)
    , cmd = options.mood || 1
    , level = options.level || 0x0
    , buffer = [0x0A, 0x14, 0, cmd_id, id_bytes[0], id_bytes[1], id_bytes[2], unitCode, cmd, level, 0];
  self.rfxcom.serialport.write(buffer, function(err, response){
    callback(err, response, cmd_id);
  });
}

/*
 * Switch off deviceId/unitCode
 */
LightwaveRf.prototype.switchOff = function(deviceId, unitCode, callback){
  var self = this
    , cmd_id = self.rfxcom.getCmdNumber()
    , id_bytes = self.rfxcom.stringToBytes(deviceId)
    , buffer = [0x0A, 0x14, 0, cmd_id, id_bytes[0], id_bytes[1], id_bytes[2], unitCode, 0, 0, 0];
  self.rfxcom.serialport.write(buffer, function(err, response){
    callback(err, response, cmd_id);
  });
}

module.exports.RfxCom = RfxCom;
module.exports.LightwaveRf = LightwaveRf;

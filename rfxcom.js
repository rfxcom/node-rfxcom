'use strict';

/*jslint nomen: true */
var _ = require("underscore"),
    serialport = require("serialport"),
    EventEmitter = require("events").EventEmitter,
    util = require("util");


var INTERFACE_CONTROL = 0,
    INTERFACE_MESSAGE = 1,
    TRANSCEIVER_MESSAGE = 2,
    ELEC2 = 0x5a,
    LIGHTING2 = 0x11,
    LIGHTING5 = 0x14,
    SECURITY1 = 0x20;


function RfxCom(device, options) {
  var self = this;

  self.options = options || {};
  self.handlers = {
    0x01: "statusHandler",
    0x02: "messageHandler",
    0x11: "lighting2Handler",
    0x14: "lighting5Handler",
    0x5a: "elec2Handler",
    0x20: "security1Handler",
    0x50: "temp19Handler",
    0x52: "temphumidity19Handler"
  };

  // Running counter for command numbers.
  /*jslint nomen: true */
  self._cmd = 0;

  // Allow for faking out the SerialPort
  if (typeof self.options.port !== "undefined") {
      self.serialport = options.port;
  }

  // Store the device to use
  self.device = device;

  // This is a buffering parser which accumulates bytes until it receives the
  // number of bytes specified in the first byte of the message.
  // It relies on a flushed buffer, to ensure the first byte corresponds to the
  // size of the first message.
  // The 'data' message emitted has all the bytes from the message.
  self.rfxtrxParser = function () {
    var data = [],
        requiredBytes = 0;
    return function (emitter, buffer) {
      // Collect data
      data.push.apply(data, buffer);
      if (requiredBytes === 0) {
        requiredBytes = buffer[0] + 1;
      }
      if (data.length >= requiredBytes) {
        emitter.emit("data", data.slice(0, requiredBytes + 1));
        data = data.slice(requiredBytes);
        requiredBytes = 0;
      }
    };
  };
}
util.inherits(RfxCom, EventEmitter);

RfxCom.prototype.open = function () {
  var self = this;

  if (typeof self.serialport === "undefined") {
    self.serialport = new serialport.SerialPort(self.device, {
      baudrate : 38400,
      parser: self.rfxtrxParser()
    });
  }
  self.serialport.on("open", function () {
    self.emit("ready");
  });

  // Add data read event listener
  self.serialport.on("data", function (data) {
    if (self.options.debug) {
      console.log("Received: %s", self.dumpHex(data));
    }

    var length = data.shift(),
        packetType = data.shift(),
        handler = self.handlers[packetType];

    if (typeof handler !== "undefined") {
      self[handler](data);
    } else {
      if (self.options.debug) {
        console.log("Unhandled packet type = %s", self.dumpHex([packetType]));
      }
    }
  });

  self.serialport.on("error", function (msg) {
    console.log("Error %s", msg);
  });

  self.serialport.on("end", function () {
    console.log("Received 'end'");
  });

  self.serialport.on("drain", function () {
    console.log("Received 'drain'");
  });
};

RfxCom.prototype.messageHandler = function (data) {
  var self = this,
      subtype = data[0],
      seqnbr = data[1],
      responses = {
        0: "ACK - transmit OK",
        1: "ACK - transmit delayed",
        2: "NAK - transmitter did not lock onto frequency",
        3: "NAK - AC address not allowed"
      },
      message = data[2];
  self.emit("response", responses[message], seqnbr);
};

RfxCom.prototype.initialise = function (callback) {
  var self = this;

  self.on("ready", function () {
    self.reset(function () {
      self.delay(500);
      self.flush();
      self.getStatus(callback);
    });
  });
  self.open();
};


/**
 *
 * Called by the data event handler when data arrives from the device with
 * information about its settings.
 *
 */
RfxCom.prototype.statusHandler = function (data) {
  var self = this,
      receiverTypes = {
        0x50: "310MHz",
        0x51: "315MHz",
        0x52: "433.92MHz receiver only",
        0x53: "433.92MHz transceiver",
        0x55: "868.00MHz",
        0x56: "868.00MHz FSK",
        0x57: "868.30MHz",
        0x58: "868.30MHz FSK",
        0x59: "868.35MHz",
        0x5A: "868.35MHz FSK",
        0x5B: "868.95MHz"
        },
        subtype = data[0],
        seqnbr = data[1],
        cmnd = data[2],
        receiverType = receiverTypes[data[3]],
        firmwareVersion = data[4],
        evt = {
          subtype: subtype,
          seqnbr: seqnbr,
          cmnd: cmnd,
          receiverType: receiverType,
          firmwareVersion: firmwareVersion
        };
  self.emit("status", evt);
};

/**
 *
 * Fetches a "command number" sequence number for identifying requests sent to
 * the device.
 *
 */
RfxCom.prototype.getCmdNumber = function () {
  var self = this;

  if (self._cmd > 256) {
    self._cmd = 0;
  }
  /*jslint plusplus: true */
  return self._cmd++;
};

/**
 *
 * Internal function for sending messages to the device.
 *
 */
RfxCom.prototype.sendMessage = function (type, subtype, cmd, extra, callback) {
  var self = this,
      cmdId = this.getCmdNumber(),
      byteCount = extra.length + 4,
      buffer = [byteCount, type, subtype, cmdId, cmd];

  buffer = buffer.concat(extra);
  self.serialport.write(buffer, callback);
  return cmdId;
};


/**
 *
 * Writes the reset sequence to the RFxtrx433.
 *
 */
RfxCom.prototype.reset = function (callback) {
  var self = this;
  return self.sendMessage(0, 0, 0, [0, 0, 0, 0, 0, 0, 0, 0, 0], callback);
};

/**
 *
 * Calls flush on the underlying SerialPort.
 *
 */
RfxCom.prototype.flush = function (callback) {
  var self = this;
  self.serialport.flush(callback);
};


/*
 * Sends the getstatus bytes to the interface.
 */
RfxCom.prototype.getStatus = function (callback) {
  var self = this;
  return self.sendMessage(0, 0, 2, [0, 0, 0, 0, 0, 0, 0, 0, 0], callback);
};

/*
 * Enables reception of different protocols.
 */
RfxCom.prototype.enable = function (protocols, callback) {
  var self = this,
      cmdId = this.getCmdNumber(),
      msg = {},
      buffer;

  _.each(protocols, function (protocol) {
    if (typeof msg[protocol.msg] === "undefined") {
      msg[protocol.msg] = protocol.bit;
    } else {
      /*jslint bitwise: true */
      msg[protocol.msg] |= protocol.bit;
    }
  });

  buffer = [0x0d, 0, 0, cmdId, 3, 0x53, 0, 0, msg["4"], msg["5"], 0, 0, 0, 0];

  self.serialport.write(buffer, function (err, response) {
    if (callback) {
      return callback(err, response, cmdId);
    }
  });
  return cmdId;
};

/**
 *
 * Turn on the specified light unit.
 *
 * Currently only works for lighting5 (LightwaveRF, Siemens) lights.
 *
 */
RfxCom.prototype.lightOn = function (id, unit, callback) {
  var self = this,
      cmdId = self.getCmdNumber(),
      idBytes = self.stringToBytes(id),
      buffer = [0x0a, LIGHTING5, 0, cmdId, idBytes[0], idBytes[1], idBytes[2], unit, 1, 0, 0];

  if (self.options.debug) {
    console.log("Sending lightOn data: %s", self.dumpHex(buffer));
  }
  self.serialport.write(buffer, function (err, response) {
    callback(err, response, cmdId);
  });
  return cmdId;
};

/**
 *
 * Turn off the specified light unit.
 *
 * Currently only works for lighting5 (LightwaveRF, Siemens) lights.
 *
 */
RfxCom.prototype.lightOff = function (id, unit, callback) {
  var self = this,
      cmdId = self.getCmdNumber(),
      idBytes = self.stringToBytes(id),
      buffer = [0x0a, LIGHTING5, 0, cmdId, idBytes[0], idBytes[1], idBytes[2],
                unit, 0, 0, 0];

  if (self.options.debug) {
    console.log("Sending lightOff data: %s", self.dumpHex(buffer));
  }
  self.serialport.write(buffer, function (err, response) {
    callback(err, response, cmdId);
  });
  return cmdId;
};

/**
 *
 * Wait for at least the specified number of milliseconds.
 *
 * This may not wait precisely for that number of milliseconds due to the
 * vagaries of system scheduling, but no fewer than the specified ms.
 *
 */
RfxCom.prototype.delay = function (ms) {
    ms += +new Date();
    while (+new Date() < ms) {
      // Do nothing...
    }
};

RfxCom.prototype.dumpHex = function (buffer, prefix) {
  prefix = prefix || "";
  function dec2hex(value) {
    var hexDigits = "0123456789ABCDEF";
        /*jslint bitwise: true */
    return prefix + (hexDigits[value >> 4] + hexDigits[value & 15]);
  }
  return _.map(buffer, dec2hex);
};

/**
 *
 * Converts an array of 4 bytes to a 32bit integer.
 *
 */
RfxCom.prototype.bytesToUint32 = function (bytes) {
  /*jslint bitwise: true */
  return (bytes[0] * Math.pow(2, 24)) + (bytes[1] << 16) +
         (bytes[2] << 8) + bytes[3];
};

/**
 *
 * Converts an array of 6 bytes to a 48bit integer.
 *
 */
RfxCom.prototype.bytesToUint48 = function (bytes) {
  /*jslint bitwise: true */
  return (bytes[0] * Math.pow(2, 40)) + (bytes[1] * Math.pow(2, 32)) +
         (bytes[2] * Math.pow(2, 24)) + (bytes[3] << 16) + (bytes[4] << 8) +
         bytes[4];
};

/**
 *
 * Converts a string to an array of Byte values.
 *
 * e.g. stringToBytes("202020") == [32, 32, 32]
 *
 */
RfxCom.prototype.stringToBytes = function (bytes) {
  var result = [],
      byteString,
      value,
      i;
  for (i = 0; i < bytes.length; i += 2) {
    byteString = bytes.substr(i, 2);
    if (byteString !== "0x") {
      value = parseInt(bytes.substr(i, 2), 16);
      if (typeof value !== "undefined") {
        result.push(value);
      }
    }
  }
  return result;
};

/**
 *
 * Called by the data event handler when data arrives from an OWL CM119/CM160
 * power measurement device.
 *
 * Calculates the current usage and total usage from the bytes sent, and emits
 * an "elec2" message for handling.
 *
 */
RfxCom.prototype.elec2Handler = function (data) {
  var self = this,
      subtypes = {
          1: "CM119/160"
      },
      TOTAL_DIVISOR = 223.666,
      subtype = subtypes[data[0]],
      seqnbr = data[1],
      id = "0x" + self.dumpHex(data.slice(2, 4), false).join(""),
      count = data[4],
      instant = data.slice(5, 9),
      total = data.slice(9, 15),
      currentWatts = self.bytesToUint32(instant),
      totalWatts = self.bytesToUint48(total) / TOTAL_DIVISOR,
      roundedTotal = Math.round(totalWatts * Math.pow(10, 2)) / Math.pow(10, 2),
      evt =  {
        subtype: subtype,
        id: id,
        currentWatts: currentWatts,
        totalWatts: roundedTotal
      };

    self.emit("elec2", evt);
};

/**
 *
 * Called by the data event handler when data arrives from various security
 * devices.
 *
 */
RfxCom.prototype.security1Handler = function (data) {
  var self = this,
      subtype = data[0],
      seqnbr = data[1],
      id = "0x" + self.dumpHex(data.slice(2, 5), false).join(""),
      deviceStatus = data[5],
      batterySignalLevel = data[6],
      evt = {
        subtype: subtype,
        id: id,
        deviceStatus: deviceStatus,
        batteryLevel: batterySignalLevel >> 4,
        rssi: batterySignalLevel & 0x0f,
        tampered: deviceStatus & 0x80
      };

    self.emit("security1", evt);
};

/**
 *
 * Called by the data event handler when data arrives from temp1-9
 * devices.
 *
 */
RfxCom.prototype.temp19Handler = function (data) {
  var self = this,
      subtype = data[0],
      seqnbr = data[1],
      id = "0x" + self.dumpHex(data.slice(2, 4), false).join(""),
      temperature = ((data[4] & 0x7f) * 256 + data[5]) / 10,
      signbit = data[4] & 0x80,
      batterySignalLevel = data[6],
      evt = {
        subtype: subtype,
        id: id,
        seqnbr: seqnbr,
        temperature: temperature * (signbit ? -1 : 1),
        batteryLevel: batterySignalLevel >> 4,
        rssi: batterySignalLevel & 0x0f,
      };
  self.emit("temp" + subtype, evt);
};

/**
 *
 * Called by the data event handler when data arrives from th1-9
 * devices.
 *
 */
RfxCom.prototype.temphumidity19Handler = function (data) {
  var self = this,
      subtype = data[0],
      seqnbr = data[1],
      id = "0x" + self.dumpHex(data.slice(2, 4), false).join(""),
      temperature = ((data[4] & 0x7f) * 256 + data[5]) / 10,
      signbit = data[4] & 0x80,
      humidity = data[6],
      humidityStatus = data[7],
      batterySignalLevel = data[8],
      evt = {
        subtype: subtype,
        id: id,
        seqnbr: seqnbr,
        temperature: temperature * (signbit ? -1 : 1),
        humidity: humidity,
        humidityStatus: humidityStatus,
        batteryLevel: batterySignalLevel >> 4,
        rssi: batterySignalLevel & 0x0f,
      };

  self.emit("th" + subtype, evt);
};

/**
 *
 * Called by the data event handler when data arrives from a LightwaveRF/Siemens
 * light control device.
 *
 */
RfxCom.prototype.lighting2Handler = function (data) {
  var self = this,
      subtypes = {
          0: "AC",
          1: "HomeEasy EU",
          2: "ANSLUT"
      },
      commands = {
        0: "Off",
        1: "On",
        2: "Set Level",
        3: "Group Off",
        4: "Group On",
        5: "Set Group Level"
      },
      subtype = subtypes[data[0]],
      seqnbr = data[1],
      idBytes = data.slice(2, 6),
      unitcode = data[6],
      command = commands[data[7]],
      level = data[8],
      rssi = data[9] & 0x0f,
      evt;

  idBytes[0] &= ~0xfc; // "id1 : 2"
  evt = {
    subtype: subtype,
    seqnbr: seqnbr,
    id: "0x" + self.dumpHex(idBytes, false).join(""),
    unitcode: unitcode,
    command: command,
    level: level,
    rssi: rssi
  };

  self.emit("lighting2", evt);
};

/**
 *
 * Called by the data event handler when data arrives from a LightwaveRF/Siemens
 * light control device.
 *
 */
RfxCom.prototype.lighting5Handler = function (data) {
  var self = this,
      subtypes = {
          0: "LightwaveRF, Siemens",
          1: "EMW100 GAO/Everflourish"
      },
      commands = {
          0: "Off",
          1: "On"
      },
      subtype = subtypes[data[0]],
      seqnbr = data[1],
      id = "0x" + self.dumpHex(data.slice(2, 5), false).join(""),
      unitcode = data[5],
      command = commands[data[6]],
      evt = {
        subtype: subtype,
        id: id,
        unitcode: unitcode,
        command: command
      };
  self.emit("lighting5", evt);
};


/*
 * This is a class for controlling LightwaveRF lights.
 */
function LightwaveRf(rfxcom) {
  var self = this;

  self.rfxcom = rfxcom;
}


/*
 * Splits the device id x/y and returns the components, the deviceId will be
 * returned as the component bytes, ready for sending.
 *
 * Throws an Error if the format is invalid.
 */
LightwaveRf.prototype._splitDeviceId = function (deviceId) {
  var parts = deviceId.split("/");
  if (parts.length !== 2) {
    throw new Error("Invalid deviceId format.");
  };
  return {
    idBytes: this.rfxcom.stringToBytes(parts[0]),
    unitCode: parts[1],
  };
};


LightwaveRf.prototype._sendCommand = function (deviceId, command, level, callback) {
  var self = this,
      device = self._splitDeviceId(deviceId),
      cmdId = self.rfxcom.getCmdNumber(),
      level = level || 0x1f,
      buffer = [0x0a, LIGHTING5, 0, cmdId, device.idBytes[0],
                device.idBytes[1], device.idBytes[2], device.unitCode,
                command, level, 0];

  self.rfxcom.serialport.write(buffer, function (err, response) {
    if (typeof callback === "function") {
        callback(err, response, cmdId);
    }
  });
  return cmdId;
};

/*
 * Switch on deviceId/unitCode
 */
LightwaveRf.prototype.switchOn = function (deviceId, options, callback) {
  if (typeof options === "function") {
    callback = options;
    options = {};
  };
  if (typeof options === "undefined") {
    options = {};
  };
  if (typeof options.mood !== "undefined") {
    if (options.mood < 1 || options.mood > 5) {
      throw new Error("Invalid mood value must be in range 1-5.");
      }
  };
  var command = options.mood || 1,
      level = options.level || 0;

  return this._sendCommand(deviceId, command, level, callback);
};

/*
 * Switch off deviceId/unitCode
 */
LightwaveRf.prototype.switchOff = function (deviceId, callback) {

  return this._sendCommand(deviceId, 0, undefined, callback);
};

/*
 * This is a class for controlling Lighting2 lights.
 */
function Lighting2(rfxcom, subtype) {
  var self = this;

  self.rfxcom = rfxcom;
  self.subtype = subtype;

  if (typeof self.subtype === "undefined") {
    throw new Error("Must provide a subtype.");
  };
}

/*
 * Splits the device id x/y and returns the components, the deviceId will be
 * returned as the component bytes, ready for sending.
 *
 * Throws an Error if the format is invalid or if the deviceId is not the
 * correct length.
 */
Lighting2.prototype._splitDeviceId = function (deviceId) {
  var parts = deviceId.split("/"),
      idBytes;
  if (parts.length !== 2) {
    throw new Error("Invalid deviceId format.");
  };
  idBytes = this.rfxcom.stringToBytes(parts[0]);
  if (idBytes.length !== 4) {
    throw new Error("Invalid deviceId format.");
  };
  return {
    idBytes: idBytes,
    unitCode: parts[1],
  };
};

Lighting2.prototype._sendCommand = function (deviceId, command, level, callback) {
  var self = this,
      device = self._splitDeviceId(deviceId),
      cmdId = self.rfxcom.getCmdNumber(),
      level = level || 0xf,
      buffer = [0x0b, LIGHTING2, self.subtype, cmdId, device.idBytes[0],
                device.idBytes[1], device.idBytes[2], device.idBytes[3],
                device.unitCode, command, level, 0];

  if (self.rfxcom.options.debug) {
    console.log("Sending %j", self.rfxcom.dumpHex(buffer));
  }
  self.rfxcom.serialport.write(buffer, function (err, response) {
    if (typeof callback === "function") {
      callback(err, response, cmdId);
    }
  });
  return cmdId;
};

/*
 * Switch on deviceId/unitCode
 */
Lighting2.prototype.switchOn = function (deviceId, callback) {
  return this._sendCommand(deviceId, 1, undefined, callback);
};

/*
 * Switch off deviceId/unitCode
 */
Lighting2.prototype.switchOff = function (deviceId, callback) {
  return this._sendCommand(deviceId, 0, undefined, callback);
};

/*
 * Switch off deviceId/unitCode
 */
Lighting2.prototype.setLevel = function (deviceId, level, callback) {
  if ((level < 0) || (level > 0xf)) {
    throw new Error("Invalid level value must be in range 0-15.");
  };
  return this._sendCommand(deviceId, 2, level, callback);
};

exports.RfxCom = RfxCom;
exports.LightwaveRf = LightwaveRf;
exports.Lighting2 = Lighting2;
exports.protocols = {
    MERTIK: {bit: 1, msg: 4},
    LIGHTWAVERF: {bit: 2, msg: 4},
    HIDEKI: {bit: 4, msg: 4},
    LACROSSE: {bit: 8, msg: 4},
    FS20: {bit: 0x10, msg: 4},
    PROGUARD: {bit: 0x20, msg: 4},
    ROLLERTROL: {bit: 0x40, msg: 4},
    X10: {bit: 1, msg: 5 },
    ARC: {bit: 2, msg: 5},
    AC: {bit: 4, msg: 5},
    OREGON: {bit: 0x20, msg: 5}
};

exports.security = {
    NORMAL: 0,
    NORMAL_DELAYED: 1,
    ALARM: 2,
    ALARM_DELAYED: 3,
    MOTION: 4,
    NO_MOTION: 5,
    X10_DOOR_WINDOW_SENSOR: 0,
    X10_MOTION_SENSOR: 1,
    X10_SECURITY_REMOTE: 2
};

exports.humidity = {
    DRY: 0,
    COMFORT: 1,
    NORMAL: 2,
    WET: 3
};
exports.lighting2 = {
    AC: 0,
    HOMEEASY_EU: 1,
    ANSLUT: 2
}

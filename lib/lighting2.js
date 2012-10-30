module.exports = Lighting2;
const defines = require('./defines');

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
      buffer = [0x0b, defines.LIGHTING2, self.subtype, cmdId, device.idBytes[0],
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

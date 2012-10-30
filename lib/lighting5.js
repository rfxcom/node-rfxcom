module.exports = Lighting5;
const defines = require('./defines');

/*
 * This is a class for controlling LightwaveRF lights.
 */
function Lighting5(rfxcom, subtype) {
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
 * Throws an Error if the format is invalid.
 */
Lighting5.prototype._splitDeviceId = function (deviceId) {
  var parts = deviceId.split("/");
  if (parts.length !== 2) {
    throw new Error("Invalid deviceId format.");
  };
  return {
    idBytes: this.rfxcom.stringToBytes(parts[0]),
    unitCode: parts[1],
  };
};


Lighting5.prototype._sendCommand = function (deviceId, command, level, callback) {
  var self = this,
      device = self._splitDeviceId(deviceId),
      cmdId = self.rfxcom.getCmdNumber(),
      level = level || 0x1f,
      buffer = [0x0a, defines.LIGHTING5, self.subtype, cmdId,
                device.idBytes[0], device.idBytes[1], device.idBytes[2], 
                device.unitCode, command, level, 0];

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
Lighting5.prototype.switchOn = function (deviceId, options, callback) {
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
Lighting5.prototype.switchOff = function (deviceId, callback) {

  return this._sendCommand(deviceId, 0, undefined, callback);
};

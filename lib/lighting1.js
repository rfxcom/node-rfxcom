module.exports = Lighting1;
/*jshint -W104 */
const defines = require('./defines');

/*
 * This is a class for controlling Lighting1 lights.
 */
function Lighting1(rfxcom, subtype) {
    var self = this;

    self.rfxcom = rfxcom;
    self.subtype = subtype;

    if (typeof self.subtype === "undefined") {
        throw new Error("Must provide a subtype.");
    }
}

/*
 * Splits the device id into houseCode, unitCode.
 *
 * TODO: Validate houseCode/unitCode.
 */
Lighting1.prototype._splitDeviceId = function(deviceId) {
  var parts = deviceId.split(""),
      houseCode = parts[0].charCodeAt(0),
      unitCode = parseInt(parts.slice(1).join(""));
  return {
      houseCode: houseCode,
      unitCode: unitCode
  };
};

Lighting1.prototype._sendCommand = function(deviceId, command, callback) {
    var self = this,
        device = self._splitDeviceId(deviceId),
        cmdId = self.rfxcom.getCmdNumber(),
        buffer = [0x07, defines.LIGHTING1, self.subtype, cmdId,
                  device.houseCode, device.unitCode, command, 0];

    if (self.rfxcom.options.debug) {
        console.log("Sending %j", self.rfxcom.dumpHex(buffer));
    }
    self.rfxcom.serialport.write(buffer, function(err, response) {
        if (typeof callback === "function") {
            callback(err, response, cmdId);
        }
    });
    return cmdId;
};

/*
 * Switch on deviceId/unitCode
 */
Lighting1.prototype.chime = function(deviceId, callback) {
    return this._sendCommand(deviceId, 0x07, callback);
};

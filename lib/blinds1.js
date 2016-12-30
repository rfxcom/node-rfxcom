module.exports = Blinds1;
/*jshint -W104 */
const defines = require('./defines'),
      util = require('util');

/*
 * This is a class for controlling Rollertrol and 'Hasta new' blinds controllers..
 */
function Blinds1(rfxcom) {
    var self = this;
    self.rfxcom = rfxcom;
}

/*
 * Splits the device id [Byte0/]Byte1/Byte2/UnitCode and returns the components.
 *
 *  If Byte0 is undefined, it is assummed to be 0. This is the only valid value
 *   for this byte for select devices (T0,T1,T8,T9, or T12).
 * Throws an Error if the format is invalid.
 */
Blinds1.prototype._splitDeviceId = function(deviceId) {

  var parts;

  if (util.isArray(deviceId)) {
      parts = deviceId;
  } else {
      parts = deviceId.split("/");
  }

  // @TODO: Validate values (bytes < 256, unitCode<16, byte0=0 for rollerTrol)

  if (parts.length == 3) {
      return {
	  byte0: 0,
	  byte1: parseInt(parts[0], 16),
	  byte2: parseInt(parts[1], 16),
	  unitCode: parseInt(parts[2], 16)
      };
  } else if (parts.length == 4) {
      return {
	  byte0: parseInt(parts[0], 16),
	  byte1: parseInt(parts[1], 16),
	  byte2: parseInt(parts[2], 16),
	  unitCode: parseInt(parts[3], 16)
      };
  } else {
      throw new Error("Invalid deviceId format.");
  }
};

Blinds1.prototype._sendCommand = function(deviceId, command, callback) {
  var self = this,
      device = self._splitDeviceId(deviceId),
      seqnbr = self.rfxcom.getSequenceNumber(),

    buffer = [0x09, // Packet length
	      defines.BLINDS1, // Packet Type
	      0x00, // subtype: TODO: Support other subtypes (0=RollerTrol)
	      seqnbr, // Sequence #
	      device.byte0, device.byte1, device.byte2,
	      device.unitCode, // Rollertrol: 0=all, or units 1-15  
	      // @VERIFY: is unitCode shifted? unitCode:4 + id4:4
	      command,
	      0 // batteryLevel:4 + rssi:4 ???
	      ];

    self.rfxcom.queueMessage(buffer, seqnbr, callback);
  return seqnbr;
};


/*
 * Open deviceId.
 */
Blinds1.prototype.open = function(deviceId, callback) {
  return this._sendCommand(deviceId, defines.BLINDS_OPEN, callback);
};

/*
 * Close deviceId.
 */
Blinds1.prototype.close = function(deviceId, callback) {
  return this._sendCommand(deviceId, defines.BLINDS_CLOSE, callback);
};

/*
 * Stop deviceId.
 */
Blinds1.prototype.stop = function(deviceId, callback) {
  return this._sendCommand(deviceId, defines.BLINDS_STOP, callback);
};

/*
 * Confirm button
 */
Blinds1.prototype.confirm = function(deviceId, callback) {
  return this._sendCommand(deviceId, defines.BLINDS_CONFIRM, callback);
};

/*
 * Set limit.
 */
Blinds1.prototype.set = function(deviceId, callback) {
  return this._sendCommand(deviceId, defines.BLINDS_SET, callback);
};


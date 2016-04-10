module.exports = Lighting1;
/*jshint -W104 */
const defines = require('./defines'),
    index = require('./index'),
    util = require('util');

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
    Returns true if the subtype matches the supplied subtypeName
 */
Lighting1.prototype.isSubtype = function (subtypeName) {
    return index.lighting1[subtypeName] === this.subtype;
};

/*
 * Splits the device id into houseCode, unitCode.
 *
 */
Lighting1.prototype._splitDeviceId = function(deviceId) {
  var parts, houseCode, unitCode;
  if (util.isArray(deviceId)) {
      parts = deviceId;
      if (parts.length !== 2) {
          throw new Error("Invalid deviceId format");
      }
      unitCode = parseInt(parts[1]);
  } else {
      parts = deviceId.split("");
      unitCode = parseInt(parts.slice(1).join(""));
  }
  houseCode = parts[0].toUpperCase().charCodeAt(0);
  if (houseCode < 0x41 || (this.isSubtype("CHACON") && houseCode > 0x43) ||
      ((this.isSubtype("RISING_SUN") || this.isSubtype("COCO")) && houseCode > 0x44) || houseCode > 0x50) {
      throw new Error("Invalid house code '" + parts[0] + "'");
  }
  if  (((this.isSubtype("X10") || this.isSubtype("ARC") || this.isSubtype("WAVEMAN")) && unitCode > 16) ||
      ((this.isSubtype("ELRO")  || this.isSubtype("IMPULS")) && unitCode > 64) ||
      (this.isSubtype("PHILIPS_SBC") && unitCode > 8) ||
      (this.isSubtype("ENERGENIE_5_GANG") && unitCode > 10) ||
      ((this.isSubtype("CHACON") || this.isSubtype("RISING_SUN") || this.isSubtype("ENERGENIE_ENER010") || this.isSubtype("COCO")) && unitCode > 4)) {
      throw new Error("Invalid unit code " + parts[1]);
  }
  return {
      houseCode: houseCode,
      unitCode: unitCode
  };
};

Lighting1.prototype._sendCommand = function (deviceId, command, callback) {
    var self = this,
        device = self._splitDeviceId(deviceId),
        cmdId = self.rfxcom.getCmdNumber();
    if (device.unitCode === 0) {
        if (command < 2) {
            command = command + 5;
            if ((this.isSubtype("X10") || this.isSubtype("ARC") || this.isSubtype("PHILIPS_SBC") ||
                 this.isSubtype("ENERGENIE_ENER010") || this.isSubtype("ENERGENIE_5_GANG")) === false) {
                throw new Error("Device does not support group on/off commands");
            }
        } else {
            throw new Error("Device does not support group dim/bright commands");
        }
    }
    
    var buffer = [0x07, defines.LIGHTING1, self.subtype, cmdId,
                device.houseCode, device.unitCode, command, 0];

    if (self.rfxcom.options.debug) {
        console.log("[rfxcom] on " + self.rfxcom.device + " - " + "Sent    : %s", self.rfxcom.dumpHex(buffer));
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
Lighting1.prototype.switchOn = function(deviceId, callback) {
        return this._sendCommand(deviceId, 0x01, callback);
    };

/*
 * Switch off deviceId/unitCode
 */
Lighting1.prototype.switchOff = function(deviceId, callback) {
        return this._sendCommand(deviceId, 0x00, callback);
    };

/*
 * Increase brightness deviceId/unitCode (X10 only) 'Bright'
 */
Lighting1.prototype.increaseLevel = function (deviceId, callback) {
        if (this.isSubtype("X10")) {
            return this._sendCommand(deviceId, 0x03, callback);
        } else {
            throw new Error("Device does not support increaseLevel()")
        }
    };

/*
 * Decrease brightness deviceId/unitCode (X10 only) 'Dim'
 */
Lighting1.prototype.decreaseLevel = function (deviceId, callback) {
        if (this.isSubtype("X10")) {
            return this._sendCommand(deviceId, 0x02, callback);
        } else {
            throw new Error("Device does not support decreaseLevel()")
        }
    };

/*
 * 'Chime' deviceId/unitCode (ARC only)
 */
Lighting1.prototype.chime = function(deviceId, callback) {
        if (this.isSubtype("ARC")) {
            return this._sendCommand(deviceId, 0x07, callback);
        } else {
            throw new Error("Device does not support chime()");
        }
    };

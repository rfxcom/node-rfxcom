module.exports = Lighting4;
/*jshint -W104 */
const defines = require('./defines'),
    index = require('./index'),
    util = require('util');

/*
 * This is a class for controlling Lighting4 lights.
 */
function Lighting4(rfxcom, subtype) {
    var self = this;

    self.rfxcom = rfxcom;
    self.subtype = subtype;
    // Set the pulse width to the default value from the API docs
    self.defaultPulseWidth = [0x01, 0x5E];

    if (typeof self.subtype === "undefined") {
        throw new Error("Must provide a subtype.");
    }
}

/*
 *  Returns true if the subtype matches the supplied subtypeName
 */
Lighting4.prototype.isSubtype = function (subtypeName) {
    return index.lighting4[subtypeName] === this.subtype;
};

/*
 *  Send the specified data bytes (3-element array) and pulse width (2-element array)
 */
Lighting4.prototype._sendCommand = function (data, pulseWidth, callback) {
    var self = this;
    var cmdId = self.rfxcom.getCmdNumber();
    var buffer = [0x09, defines.LIGHTING4, self.subtype, cmdId,
        data[0], data[1], data[2], pulseWidth[0], pulseWidth[1], 0];
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

Lighting4.prototype.toByteArray = function (data, numBytes) {
    if (util.isArray(data)) {
        data = data.reverse();
    } else {
        if (typeof data === "string") {
            data = parseInt(data);
        }
        var residual = data;
        data = [];
        while (residual > 0) {
            data.push(residual%256);
            residual = Math.floor(residual/256);
        }
    }
    while (data.length < numBytes) {
        data.push(0);
    }
    data = data.reverse();
    return data;
};

/*
 * Send the specified data - force it to be a 3-element numeric array
 */
Lighting4.prototype.sendData = function(data, pulseWidth, callback) {
    var self = this;
    data = this.toByteArray(data, 3);
    if (pulseWidth == undefined || pulseWidth == null) {
        pulseWidth = self.defaultPulseWidth;
    } else {
        pulseWidth = self.toByteArray(pulseWidth, 2);
    }
    return this._sendCommand(data, pulseWidth, callback);
};


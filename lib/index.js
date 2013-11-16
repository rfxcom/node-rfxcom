exports.RfxCom = require('./rfxcom');
exports.Lighting2 = require('./lighting2');
exports.Lighting5 = require('./lighting5');

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
};

exports.lighting5 = {
  LIGHTWAVERF: 0,
  EMW100: 1,
  BBSB: 2
};


/**
 *
 * Enumerate all attached devices
 *
 */
exports.devices = function(cb) {
  require('serialport').list(function(err, info) {
    var i, j, results;

    if (err) return cb(err);

    results = [];
    for (i = 0; i < info.length; i++) {
      if (info[i].pnpId.indexOf('usb-RFXCOM_RFXrec433_') === 0) {
        info[i].manufacturer = 'RFXCOM';
        info[i].serialNumber = info[i].pnpId.substring(21);
        j = info[i].serialNumber.indexOf('-');
        if (j !== -1) info[i].serialNumber = info[i].serialNumber.substring(0, j);
        info[i].productId = '0x6001';
        info[i].vendorId = '0x0403';
      }

      if (info[i].manufacturer !== 'RFXCOM') continue;
      if ((parseInt(info[i].productId, 16) === 0x6001) && (parseInt(info[i].vendorId, 16) === 0x0403)) results.push(info[i]);
    }

    cb(null, results);
  });
};

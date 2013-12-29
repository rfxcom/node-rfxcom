exports.RfxCom = require('./rfxcom');
exports.Lighting2 = require('./lighting2');
exports.Lighting5 = require('./lighting5');

exports.protocols = {
  BLYSS: {bit: 0x01, msg: 3},
  RUBICSON: {bit: 0x02, msg: 3},
  FINEOFFSET: {bit: 0x04, msg: 3},
  LIGHTING4: {bit: 0x08, msg: 3},
  RSL: {bit: 0x10, msg: 3},
  BYRONSX: {bit: 0x20, msg: 3},
  RFU6: {bit: 0x40, msg: 3},
  MERTIK: {bit: 0x01, msg: 4},
  LIGHTWAVERF: {bit: 0x02, msg: 4},
  HIDEKI: {bit: 0x04, msg: 4},
  LACROSSE: {bit: 0x08, msg: 4},
  FS20: {bit: 0x10, msg: 4},
  PROGUARD: {bit: 0x20, msg: 4},
  ROLLERTROL: {bit: 0x40, msg: 4},
  BLINDST14: {bit: 0x80, msg: 4},
  X10: {bit: 0x01, msg: 5},
  ARC: {bit: 0x02, msg: 5},
  AC: {bit: 0x04, msg: 5},
  HOMEEASY: {bit: 0x08, msg: 5},
  MEIANTECH: {bit: 0x10, msg: 5},
  OREGON: {bit: 0x20, msg: 5},
  ATI: {bit: 0x40, msg: 5},
  VISONIC: {bit: 0x80, msg: 5}
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

exports.lighting5 = {
  LIGHTWAVERF: 0,
  EMW100: 1,
  BBSB: 2
}

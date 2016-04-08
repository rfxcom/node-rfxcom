exports.RfxCom = require('./rfxcom');
exports.Lighting1 = require('./lighting1');
exports.Lighting2 = require('./lighting2');
exports.Lighting3 = require('./lighting3');
exports.Lighting4 = require('./lighting4');
exports.Lighting5 = require('./lighting5');
exports.Lighting6 = require('./lighting6');
exports.Curtain1 = require('./curtain1');

// Bitmap definitions for 'supported protocols' message
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

// Establish reflection mapping (BiMap) for an Array, or throw an error if the array is not reflectable
var reflect = function(array) {
    for (var i = 0; i < array.length; i++) {
        if (isFinite(array[i]) || array.hasOwnProperty(array[i])) {
            throw new Error("Array cannot be reflected: invalid entry array[" + i + "] = " + array[i]);
        }
        array[array[i]] = i;
    }
    return array;
};

// Protocol subtype definitions for each protocol
exports.lighting1 = reflect(['X10', 'ARC', 'ELRO', 'WAVEMAN', 'CHACON', 'IMPULS', 'RISING_SUN',
                             'PHILIPS_SBC', 'ENERGENIE_ENER010', 'ENERGENIE_5_GANG', 'COCO']);
exports.lighting1.transmitter = exports.Lighting1;
Object.freeze(exports.lighting1);

exports.lighting2 = reflect(['AC', 'HOMEEASY_EU', 'ANSLUT', 'KAMBROOK']);
exports.lighting2.transmitter = exports.Lighting2;
Object.freeze(exports.lighting2);

exports.lighting3 = reflect(['KOPPLA']);
exports.lighting3.transmitter = exports.Lighting3;
Object.freeze(exports.lighting3);

exports.lighting4 = reflect(['PT2262']);
exports.lighting4.transmitter = exports.Lighting4;
Object.freeze(exports.lighting4);

exports.lighting5 = reflect(['LIGHTWAVERF', 'EMW100', 'BBSB', 'MDREMOTE', 'CONRAD', 'LIVOLO', 'TRC02']);
exports.lighting5.transmitter = exports.Lighting5;
Object.freeze(exports.lighting5);

exports.lighting6 = reflect(['BLYSS']);
exports.lighting6.transmitter = exports.Lighting6;
Object.freeze(exports.lighting6);

exports.curtain1 = reflect(['HARRISON']);
exports.curtain1.transmitter = exports.Curtain1;
Object.freeze(exports.curtain1);

exports.elec23 = reflect(['ELEC23_UNUSED', 'CM119_160', 'CM180']);
Object.freeze(exports.elec23);

// Various definitions
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
  NORMAL: 0,
  COMFORT: 1,
  DRY: 2,
  WET: 3
};

exports.forecast = {
  NO_FORECAST: 0,
  SUNNY: 1,
  PARTLY_CLOUDY: 2,
  CLOUDY: 3,
  RAIN: 4
};

exports.rfxsensor = {
  TEMP: 0,
  AD: 1,
  VOLTAGE: 2,
  MESSAGE: 3
};

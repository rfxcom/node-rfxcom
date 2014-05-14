exports.RfxCom = require('./rfxcom');
exports.Lighting1 = require('./lighting1');
exports.Lighting2 = require('./lighting2');
exports.Lighting5 = require('./lighting5');
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

// Protocol subtype definitions for each protocol
exports.lighting1 = {
    X10: 0,
    ARC: 1,
    ELRO: 2,                // Tx only
    WAVEMAN: 3,             // Tx only
    CHACON: 4,              // Tx only
    IMPULS: 5,              // Tx only
    RISING_SUN: 6,          // Tx only
    PHILIPS_SBC: 7,         // Tx only
    ENERGENIE_ENER010: 8,   // Tx only
    ENERGENIE_5_GANG:9,     // Tx only
    COCO: 10                // Tx only
};

exports.lighting2 = {
    AC: 0,
    HOMEEASY_EU: 1,
    ANSLUT: 2
};

exports.lighting3 = {
    KOPPLA: 0               // Tx only
};

exports.lighting4 = {
    PT2262: 0
};

exports.lighting5 = {
    LIGHTWAVERF: 0,
    EMW100: 1,              // Tx only
    BBSB: 2,
    MDREMOTE: 3,            // Tx only
    CONRAD: 4,
    LIVOLO: 5,              // Tx only
    TRC02: 6
};

exports.lighting6 = {
    BLYSS: 0
};

exports.chime = {
    BYRON: 0
};

exports.fan = {
    SIEMENS_SF01: 0         // Tx only
};

exports.curtain1 = {
    HARRISON: 0             // Tx only
};

exports.blinds1 = {
    BLINDS_T0: 0,           // Tx only
    BLINDS_T1: 1,
    BLINDS_T2: 2,
    BLINDS_T3: 3,
    BLINDS_T4: 4,
    BLINDS_T5: 5,
    BLINDS_T6: 6,
    BLINDS_T7: 7
};

exports.elec23 = {
    CM119_160: 1,
    CM180: 2
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

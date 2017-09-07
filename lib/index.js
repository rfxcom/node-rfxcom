exports.RfxCom = require('./rfxcom');
exports.Transmitter = require('./transmitter');
exports.Lighting1 = require('./lighting1');
exports.Lighting2 = require('./lighting2');
exports.Lighting3 = require('./lighting3');
exports.Lighting4 = require('./lighting4');
exports.Lighting5 = require('./lighting5');
exports.Lighting6 = require('./lighting6');
exports.Blinds1 = require('./blinds1');
exports.Chime1 = require('./chime1');
exports.Fan = require('./fan');
exports.Curtain1 = require('./curtain1');
exports.Rfy = require('./rfy');
exports.HomeConfort = require('./homeConfort');
exports.Security1 = require('./security1');

exports.Camera1 = require('./camera1');
exports.Remote = require('./remote');
exports.Thermostat1 = require('./thermostat1');
exports.Thermostat2 = require('./thermostat2');
exports.Thermostat3 = require('./thermostat3');
exports.Thermostat4 = require('./thermostat4');
exports.Radiator1 = require('./radiator1');

// Bitmap definitions for 'supported protocols' message
exports.protocols = {
    BLYSS: {bit: 0x01, msg: 3},
    RUBICSON: {bit: 0x02, msg: 3},
    FINEOFFSET: {bit: 0x04, msg: 3},
    LIGHTING4: {bit: 0x08, msg: 3},
    RSL: {bit: 0x10, msg: 3},
    BYRONSX: {bit: 0x20, msg: 3},
    IMAGINTRONIX: {bit: 0x40, msg: 3},
    UNDECODED: {bit: 0x80, msg: 3},

    MERTIK: {bit: 0x01, msg: 4},
    LIGHTWAVERF: {bit: 0x02, msg: 4},
    HIDEKI: {bit: 0x04, msg: 4},
    LACROSSE: {bit: 0x08, msg: 4},
    FS20: {bit: 0x10, msg: 4},
    PROGUARD: {bit: 0x20, msg: 4},
    BLINDST0: {bit: 0x40, msg: 4},
    BLINDST1: {bit: 0x80, msg: 4},

    X10: {bit: 0x01, msg: 5},
    ARC: {bit: 0x02, msg: 5},
    AC: {bit: 0x04, msg: 5},
    HOMEEASY: {bit: 0x08, msg: 5},
    MEIANTECH: {bit: 0x10, msg: 5},
    OREGON: {bit: 0x20, msg: 5},
    ATI: {bit: 0x40, msg: 5},
    VISONIC: {bit: 0x80, msg: 5},

    KEELOQ: {bit: 0x01, msg: 6},
    HOMECONFORT: {bit: 0x02, msg: 6}
};

// Establish reflection mapping (BiMap) for an Array, or throw an error if the array is not reflectable
const reflect = function(array) {
    for (let i = 0; i < array.length; i++) {
        if (isFinite(array[i]) || array.hasOwnProperty(array[i])) {
            throw new Error("Array cannot be reflected: invalid entry array[" + i + "] = " + array[i]);
        }
        array[array[i]] = i;
    }
    return array;
};

exports.transmitterPacketTypes = ["blinds1", "camera1", "chime1", "curtain1", "fan", "homeConfort", "lighting1",
    "lighting2", "lighting3", "lighting4", "lighting5", "lighting6", "radiator1", "remote", "rfy", "security1",
    "thermostat1", "thermostat2", "thermostat3", "thermostat4"];

// Protocol subtype definitions for each protocol

// Packet type 0x10
exports.lighting1 = reflect(['X10', 'ARC', 'ELRO', 'WAVEMAN', 'CHACON', 'IMPULS', 'RISING_SUN',
                             'PHILIPS_SBC', 'ENERGENIE_ENER010', 'ENERGENIE_5_GANG', 'COCO', 'HQ']);
exports.lighting1.transmitter = exports.Lighting1;
Object.freeze(exports.lighting1);

// Packet type 0x11
exports.lighting2 = reflect(['AC', 'HOMEEASY_EU', 'ANSLUT', 'KAMBROOK']);
exports.lighting2.transmitter = exports.Lighting2;
Object.freeze(exports.lighting2);

// Packet type 0x12
exports.lighting3 = reflect(['KOPPLA']);
exports.lighting3.transmitter = exports.Lighting3;
Object.freeze(exports.lighting3);

// Packet type 0x13
exports.lighting4 = reflect(['PT2262']);
exports.lighting4.transmitter = exports.Lighting4;
Object.freeze(exports.lighting4);

// Packet type 0x14
exports.lighting5 = reflect(['LIGHTWAVERF', 'EMW100', 'BBSB', 'MDREMOTE', 'CONRAD', 'LIVOLO', 'TRC02', 'AOKE',
                             'TRC02_2', 'EURODOMEST', 'LIVOLO_APPLIANCE', 'RGB432W', 'MDREMOTE_107', 'LEGRAND',
                             'AVANTEK', 'IT', 'MDREMOTE_108', 'KANGTAI']);
exports.lighting5.transmitter = exports.Lighting5;
Object.freeze(exports.lighting5);

// Packet type 0x15
exports.lighting6 = reflect(['BLYSS']);
exports.lighting6.transmitter = exports.Lighting6;
Object.freeze(exports.lighting6);

// Packet type 0x16
exports.chime1 = reflect(['BYRON_SX', 'BYRON_MP001', 'SELECT_PLUS', 'CHIME_UNUSED', 'ENVIVO']);
exports.chime1.transmitter = exports.Chime1;
Object.freeze(exports.chime1);

// Packet type 0x17
exports.fan = reflect(['SIEMENS_SF01', 'ITHO_CVE_RFT', 'LUCCI_AIR', 'SEAV_TXS4', 'WESTINGHOUSE_7226640']);
exports.fan.transmitter = exports.Fan;
Object.freeze(exports.fan);

// Packet type 0x18
exports.curtain1 = reflect(['HARRISON']);
exports.curtain1.transmitter = exports.Curtain1;
Object.freeze(exports.curtain1);

// Packet type 0x19
exports.blinds1 = reflect(['BLINDS_T0', 'BLINDS_T1', 'BLINDS_T2', 'BLINDS_T3', 'BLINDS_T4',
                           'BLINDS_T5', 'BLINDS_T6', 'BLINDS_T7', 'BLINDS_T8', 'BLINDS_T9',
                           'BLINDS_T10', 'BLINDS_T11', 'BLINDS_T12', 'BLINDS_T13']);
exports.blinds1.transmitter = exports.Blinds1;
Object.freeze(exports.blinds1);

// Packet type 0x1a
exports.rfy = reflect(['RFY', 'RFYEXT', 'RFY_RESERVED', 'ASA']);
exports.rfy.transmitter = exports.Rfy;
Object.freeze(exports.rfy);

// Packet type 0x1a
exports.homeConfort = reflect(['TEL_010']);
exports.homeConfort.transmitter = exports.HomeConfort;
Object.freeze(exports.homeConfort);

// Packet type 0x20
exports.security1 = reflect(['X10_DOOR', 'X10_PIR', 'X10_SECURITY', 'KD101', 'POWERCODE_DOOR', 'POWERCODE_PIR',
                             'CODE_SECURE', 'POWERCODE_AUX', 'MEIANTECH', 'SA30', 'RM174RF']);
exports.security1.transmitter = exports.Security1;
Object.freeze(exports.security1);

// Packet type 0x28
exports.camera1 = reflect(['X10_NINJA']);
exports.camera1.transmitter = exports.Camera1;
Object.freeze(exports.camera1);

// Packet type 0x30
exports.remote = reflect(['ATI_REMOTE_WONDER', 'ATI_REMOTE_WONDER_PLUS', 'MEDION', 'X10_PC_REMOTE', 'ATI_REMOTE_WONDER_2']);
exports.remote.transmitter = exports.Remote;
Object.freeze(exports.remote);

// Packet type 0x40
exports.thermostat1 = reflect(['DIGIMAX_TLX7506', 'DIGIMAX_SHORT']);
exports.thermostat1.transmitter = exports.Thermostat1;
Object.freeze(exports.thermostat1);

// Packet type 0x41
exports.thermostat2 = reflect(['HE105', 'RTS10_RFS10_TLX1206']);
exports.thermostat2.transmitter = exports.Thermostat2;
Object.freeze(exports.thermostat2);

// Packet type 0x42
exports.thermostat3 = reflect(['G6R_H4T1', 'G6R_H4TB', 'G6R_H4TD', 'G6R_H4S']);
exports.thermostat3.transmitter = exports.Thermostat3;
Object.freeze(exports.thermostat3);

// Packet type 0x43
exports.thermostat4 = reflect(['MCZ_PELLET_STOVE_1_FAN', 'MCZ_PELLET_STOVE_2_FAN', 'MCZ_PELLET_STOVE_3_FAN']);
exports.thermostat4.transmitter = exports.Thermostat4;
Object.freeze(exports.thermostat4);

// Packet type 0x44
exports.radiator1 = reflect(['SMARTWARES']);
exports.radiator1.transmitter = exports.Radiator1;
Object.freeze(exports.radiator1);

// Packet type 0x4e
exports.bbq1 = reflect(['BBQ_UNUSED', 'MAVERICK']);
Object.freeze(exports.bbq1);

// Packet type 0x4f
exports.temperatureRain1 = reflect(['TEMPERATURE_RAIN_UNUSED', 'ALECTO_WS1200']);
Object.freeze(exports.temperatureRain1);

// Packet type 0x50
exports.temperature1 = reflect(['TEMPERATURE_UNUSED', 'TEMP1', 'TEMP2', 'TEMP3', 'TEMP4', 'TEMP5', 'TEMP6', 'TEMP7',
                                'TEMP8', 'TEMP9', 'TEMP10', 'TEMP11', 'TEMP12']);
Object.freeze(exports.temperature1);

// Packet type 0x51
exports.humidity1 = reflect(['HUMIDITY_UNUSED', 'HUM1', 'HUM2', 'HUM3']);
Object.freeze(exports.humidity1);

// Packet type 0x52
exports.temperatureHumidity1 = reflect(['TEMPERATURE_HUMIDITY_UNUSED', 'TH1', 'TH2', 'TH3', 'TH4', 'TH5', 'TH6', 'TH7',
                                        'TH8', 'TH9', 'TH10', 'TH11', 'TH12', 'TH13', 'TH14']);
Object.freeze(exports.temperatureHumidity1);

// Packet type 0x54
exports.tempHumBaro1 = reflect(['TEMP_HUM_BARO_UNUSED', 'THB1', 'THB2']);
Object.freeze(exports.tempHumBaro1);

// Packet type 0x55
exports.rain1 = reflect(['RAIN_UNUSED', 'RAIN1', 'RAIN2', 'RAIN3', 'RAIN4', 'RAIN5', 'RAIN6', 'RAIN7']);
Object.freeze(exports.rain1);

// Packet type 0x56
exports.wind1 = reflect(['WIND_UNUSED', 'WIND1', 'WIND2', 'WIND3', 'WIND4', 'WIND5', 'WIND6', 'WIND7']);
Object.freeze(exports.wind1);

// Packet type 0x57
exports.uv1 = reflect(['UV_UNUSED', 'UV1', 'UV2', 'UV3']);
Object.freeze(exports.uv1);

// Packet type 0x58
exports.dateTime = reflect(['DT_UNUSED', 'DT1']);
Object.freeze(exports.dateTime);

// Packet type 0x59
exports.elec1 = reflect(['ELEC1_UNUSED', 'CM113']);
Object.freeze(exports.elec1);

// Packet type 0x5a
exports.elec23 = reflect(['ELEC23_UNUSED', 'CM119_160', 'CM180']);
Object.freeze(exports.elec23);

// Packet type 0x5b
exports.elec4 = reflect(['ELEC4_UNUSED', 'CM180I']);
Object.freeze(exports.elec4);

// Packet type 0x5c
exports.elec5 = reflect(['ELEC5_UNUSED', 'REVOLT']);
Object.freeze(exports.elec5);

// Packet type 0x5d
exports.weight1 = reflect(['WEIGHT_UNUSED', 'WEIGHT1', 'WEIGHT2']);
Object.freeze(exports.weight1);

// Packet type 0x60
exports.cartelectronic = reflect(['CARTELECTRONIC_UNUSED', 'CARTELECTRONIC_TIC', 'CARTELECTRONIC_ENCODER']);
Object.freeze(exports.cartelectronic);

// Packet type 0x70
exports.rfxSensor = reflect(['RFX_TEMPERATURE', 'RFX_ADC', 'RFX_V', 'RFX_MESSAGE']);
Object.freeze(exports.rfxSensor);

// Packet type 0x71
exports.rfxMeter = reflect(['RFX_METER0', 'RFX_METER1', 'RFX_METER2', 'RFX_METER3', 'RFX_METER4', 'RFX_METER5',
                             'RFX_METER6','RFX_METER7', 'RFX_METER8', 'RFX_METER9', 'RFX_METER10', 'RFX_METER11',
                             'RFX_METER12', 'RFX_METER13', 'RFX_METER14', 'RFX_METER15']);
Object.freeze(exports.rfxMeter);

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

// Codes used in "response" events
exports.responseCode = {
    OK: 0x00,
    TX_DELAYED: 0x01,
    TX_LOCK_FAILED: 0x02,
    ILLEGAL_AC_ADDRESS: 0x03,
    UNKNOWN_COMMAND: 0x04,
    UNKNOWN_REMOTE_ID: 0x05,
    TIMEOUT: 0x06
};

// Remote control command tables

exports.commands = [{ // ATI_REMOTE_WONDER
    0:   "A",
    1:   "B",
    2:   "power",
    3:   "TV",
    4:   "DVD",
    5:   "?",
    6:   "Guide",
    7:   "Drag",
    8:   "VOL+",
    9:   "VOL-",
    10:  "MUTE",
    11:  "CHAN+",
    12:  "CHAN-",
    13:  "1",
    14:  "2",
    15:  "3",
    16:  "4",
    17:  "5",
    18:  "6",
    19:  "7",
    20:  "8",
    21:  "9",
    22:  "txt",
    23:  "0",
    24:  "snapshot ESC",
    25:  "C",
    26:  "^",
    27:  "D",
    28:  "TV/RADIO",
    29:  "<",
    30:  "OK",
    31:  ">",
    32:  "<-",
    33:  "E",
    34:  "v",
    35:  "F",
    36:  "Rewind",
    37:  "Play",
    38:  "Fast forward",
    39:  "Record",
    40:  "Stop",
    41:  "Pause",
    44:  "TV",
    45:  "VCR",
    46:  "RADIO",
    47:  "TV Preview",
    48:  "Channel list",
    49:  "Video Desktop",
    50:  "red",
    51:  "green",
    52:  "yellow",
    53:  "blue",
    54:  "rename TAB",
    55:  "Acquire image",
    56:  "edit image",
    57:  "Full screen",
    58:  "DVD Audio",
    112: "Cursor-left",
    113: "Cursor-right",
    114: "Cursor-up",
    115: "Cursor-down",
    116: "Cursor-up-left",
    117: "Cursor-up-right",
    118: "Cursor-down-right",
    119: "Cursor-down-left",
    120: "V",
    121: "V-End",
    124: "X",
    125: "X-End"
}, { // ATI_REMOTE_WONDER_PLUS
    0:   "A",
    1:   "B",
    2:   "power",
    3:   "TV",
    4:   "DVD",
    5:   "?",
    6:   "Guide",
    7:   "Drag",
    8:   "VOL+",
    9:   "VOL-",
    10:  "MUTE",
    11:  "CHAN+",
    12:  "CHAN-",
    13:  "1",
    14:  "2",
    15:  "3",
    16:  "4",
    17:  "5",
    18:  "6",
    19:  "7",
    20:  "8",
    21:  "9",
    22:  "txt",
    23:  "0",
    24:  "Open Setup Menu",
    25:  "C",
    26:  "^",
    27:  "D",
    28:  "FM",
    29:  "<",
    30:  "OK",
    31:  ">",
    32:  "Max/Restore Window",
    33:  "E",
    34:  "v",
    35:  "F",
    36:  "Rewind",
    37:  "Play",
    38:  "Fast forward",
    39:  "Record",
    40:  "Stop",
    41:  "Pause",
    42:  "TV2",
    43:  "Clock",
    44:  "TV",
    45:  "ATI",
    46:  "RADIO",
    47:  "TV Preview",
    48:  "Channel list",
    49:  "Video Desktop",
    50:  "red",
    51:  "green",
    52:  "yellow",
    53:  "blue",
    54:  "rename TAB",
    55:  "Acquire image",
    56:  "edit image",
    57:  "Full screen",
    58:  "DVD Audio",
    112: "Cursor-left",
    113: "Cursor-right",
    114: "Cursor-up",
    115: "Cursor-down",
    116: "Cursor-up-left",
    117: "Cursor-up-right",
    118: "Cursor-down-right",
    119: "Cursor-down-left",
    120: "Left Mouse Button",
    121: "V-End",
    124: "Right Mouse Button",
    125: "X-End"
}, { // MEDION
    0:   "Mute",
    1:   "B",
    2:   "power",
    3:   "TV",
    4:   "DVD",
    5:   "Photo",
    6:   "Music",
    7:   "Drag",
    8:   "VOL-",
    9:   "VOL+",
    10:  "MUTE",
    11:  "CHAN+",
    12:  "CHAN-",
    13:  "1",
    14:  "2",
    15:  "3",
    16:  "4",
    17:  "5",
    18:  "6",
    19:  "7",
    20:  "8",
    21:  "9",
    22:  "txt",
    23:  "0",
    24:  "snapshot ESC",
    25:  "DVD MENU",
    26:  "^",
    27:  "Setup",
    28:  "TV/RADIO",
    29:  "<",
    30:  "OK",
    31:  ">",
    32:  "<-",
    33:  "E",
    34:  "v",
    35:  "F",
    36:  "Rewind",
    37:  "Play",
    38:  "Fast forward",
    39:  "Record",
    40:  "Stop",
    41:  "Pause",
    44:  "TV",
    45:  "VCR",
    46:  "RADIO",
    47:  "TV Preview",
    48:  "Channel list",
    49:  "Video Desktop",
    50:  "red",
    51:  "green",
    52:  "yellow",
    53:  "blue",
    54:  "rename TAB",
    55:  "Acquire image",
    56:  "edit image",
    57:  "Full screen",
    58:  "DVD Audio",
    112: "Cursor-left",
    113: "Cursor-right",
    114: "Cursor-up",
    115: "Cursor-down",
    116: "Cursor-up-left",
    117: "Cursor-up-right",
    118: "Cursor-down-right",
    119: "Cursor-down-left",
    120: "V",
    121: "V-End",
    124: "X",
    125: "X-End"
}, { // X10_PC_REMOTE
    2:   "0",
    18:  "8",
    34:  "4",
    56:  "Rewind",
    58:  "Info",
    64:  "CHAN+",
    66:  "2",
    82:  "Ent",
    96:  "VOL+",
    98:  "6",
    99:  "Stop",
    100: "Pause",
    112: "Cursor-left",
    113: "Cursor-right",
    114: "Cursor-up",
    115: "Cursor-down",
    116: "Cursor-up-left",
    117: "Cursor-up-right",
    118: "Cursor-down-right",
    119: "Cursor-down-left",
    120: "left mouse",
    121: "left mouse-End",
    123: "Drag",
    124: "right mouse",
    125: "right mouse-End",
    130: "1",
    143: "9",
    160: "MUTE",
    162: "5",
    176: "Play",
    182: "Menu",
    184: "Fast Forward",
    186: "A+B",
    192: "CHAN-",
    194: "3",
    201: "Exit",
    209: "MP3",
    210: "DVD",
    211: "CD",
    212: "PC / Shift-4",
    213: "Shift-5",
    214: "Shift-Ent",
    215: "Shift-Teletext",
    216: "Text",
    217: "Shift-Text",
    224: "VOL-",
    226: "7",
    242: "Teletext",
    255: "Record"
}, { // ATI_REMOTE_WONDER_2
    0:   "A",
    1:   "B",
    2:   "power",
    3:   "TV",
    4:   "DVD",
    5:   "?",
    6:   "¿",
    7:   "Drag",
    8:   "VOL+",
    9:   "VOL-",
    10:  "MUTE",
    11:  "CHAN+",
    12:  "CHAN-",
    13:  "1",
    14:  "2",
    15:  "3",
    16:  "4",
    17:  "5",
    18:  "6",
    19:  "7",
    20:  "8",
    21:  "9",
    22:  "txt",
    23:  "0",
    24:  "Open Setup Menu",
    25:  "C",
    26:  "^",
    27:  "D",
    28:  "TV/RADIO",
    29:  "<",
    30:  "OK",
    31:  ">",
    32:  "Max/Restore Window",
    33:  "E",
    34:  "v",
    35:  "F",
    36:  "Rewind",
    37:  "Play",
    38:  "Fast forward",
    39:  "Record",
    40:  "Stop",
    41:  "Pause",
    45:  "ATI",
    59:  "PC",
    60:  "AUX1",
    61:  "AUX2",
    62:  "AUX3",
    63:  "AUX4",
    112: "Cursor-left",
    113: "Cursor-right",
    114: "Cursor-up",
    115: "Cursor-down",
    116: "Cursor-up-left",
    117: "Cursor-up-right",
    118: "Cursor-down-right",
    119: "Cursor-down-left",
    120: "Left Mouse Button",
    124: "Right Mouse Button"
}];
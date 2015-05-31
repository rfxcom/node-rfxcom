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

exports.chime1 = reflect(['BYRON']);
Object.freeze(exports.chime1);

exports.fan1 = reflect(['SIEMENS_SF01']);
Object.freeze(exports.fan1);

exports.curtain1 = reflect(['HARRISON']);
exports.curtain1.transmitter = exports.Curtain1;
Object.freeze(exports.curtain1);

exports.blinds1 = reflect(['BLINDS_T0', 'BLINDS_T1', 'BLINDS_T2', 'BLINDS_T3', 'BLINDS_T4', 'BLINDS_T5',
                           'BLINDS_T6','BLINDS_T7']);
Object.freeze(exports.blinds1);

exports.security1 = reflect(['X10_DOOR', 'X10_PIR', 'X10_SECURITY', 'KD101', 'POWERCODE_DOOR', 'POWERCODE_PIR',
                             'CODE_SECURE', 'POWERCODE_AUX', 'MEIANTECH', 'SA30']);
Object.freeze(exports.security1);

exports.camera1 = reflect(['X10_NINJA']);
Object.freeze(exports.camera1);

exports.bbq1 = reflect(['BBQ_UNUSED', 'MAVERICK']);
Object.freeze(exports.bbq1);

exports.temperatureRain1 = reflect(['TEMPERATURE_RAIN_UNUSED','ALECTO']);
Object.freeze(exports.temperatureRain1);

exports.temperature1 = reflect(['TEMPERATURE_UNUSED', 'TEMP1', 'TEMP2', 'TEMP3', 'TEMP4', 'TEMP5', 'TEMP6', 'TEMP7',
                                'TEMP8', 'TEMP9', 'TEMP10']);
Object.freeze(exports.temperature1);

exports.humidity1 = reflect(['HUMIDITY_UNUSED', 'HUM1', 'HUM2']);
Object.freeze(exports.humidity1);

exports.temperatureHumidity1 = reflect(['TEMPERATURE_HUMIDITY_UNUSED', 'TH1', 'TH2', 'TH3', 'TH4', 'TH5', 'TH6', 'TH7',
                                        'TH8', 'TH9', 'TH10', 'TH11']);
Object.freeze(exports.temperatureHumidity1);

exports.tempHumBaro1 = reflect(['TEMP_HUM_BARO_UNUSED', 'THB1', 'THB2']);
Object.freeze(exports.tempHumBaro1);

exports.rain1 = reflect(['RAIN_UNUSED', 'RAIN1', 'RAIN2', 'RAIN3', 'RAIN4', 'RAIN5', 'RAIN6']);
Object.freeze(exports.rain1);

exports.wind1 = reflect(['WIND_UNUSED', 'WIND1', 'WIND2', 'WIND3', 'WIND4', 'WIND5', 'WIND6']);
Object.freeze(exports.wind1);

exports.uv1 = reflect(['UV_UNUSED', 'UV1', 'UV2', 'UV3']);
Object.freeze(exports.uv1);

exports.elec1 = reflect(['ELEC1_UNUSED', 'CM113']);
Object.freeze(exports.elec1);

exports.elec23 = reflect(['ELEC23_UNUSED', 'CM119_160', 'CM180']);
Object.freeze(exports.elec23);

exports.elec4 = reflect(['ELEC4_UNUSED', 'CM180I']);
Object.freeze(exports.elec4);

exports.elec5 = reflect(['ELEC5_UNUSED', 'REVOLT']);
Object.freeze(exports.elec5);

exports.weight1 = reflect(['WEIGHT_UNUSED', 'WEIGHT1', 'WEIGHT2']);
Object.freeze(exports.weight1);

exports.rfxSensor1 = reflect(['RFX_TEMPERATURE', 'RFX_ADC', 'RFX_V', 'RFX_MESSAGE']);
Object.freeze(exports.rfxSensor1);

exports.rfxMeter1 = reflect(['RFX_METER0', 'RFX_METER1', 'RFX_METER2', 'RFX_METER3', 'RFX_METER4', 'RFX_METER5',
                             'RFX_METER6','RFX_METER7', 'RFX_METER8', 'RFX_METER9', 'RFX_METER10', 'RFX_METER11',
                             'RFX_METER12', 'RFX_METER13', 'RFX_METER14', 'RFX_METER15']);
Object.freeze(exports.rfxMeter1);

exports.humidity = reflect(['NORMAL', 'COMFORT', 'DRY', 'WET']);
Object.freeze(exports.humidity);

exports.forecast = reflect(['NO_FORECAST', 'SUNNY', 'PARTLY_CLOUDY', 'CLOUDY', 'RAIN']);
Object.freeze(exports.forecast);

// Various definitions
exports.rfxsensor = {
    TEMP: 0,
    AD: 1,
    VOLTAGE: 2,
    MESSAGE: 3
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

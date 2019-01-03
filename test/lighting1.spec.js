/* global require: false, beforeEach: false, describe: false, it: false, expect: false,
   spyOn: false, console: false
*/
const rfxcom = require('../lib'),
    util = require('util'),
    matchers = require('./matchers'),
    FakeSerialPort = require('./helper');

describe('Lighting1 class', function () {
    let lighting1,
        fakeSerialPort,
        device;
    beforeEach(function () {
        this.addMatchers({
            toHaveSent: matchers.toHaveSent
        });
        fakeSerialPort = new FakeSerialPort();
        device = new rfxcom.RfxCom('/dev/ttyUSB0', {
            port: fakeSerialPort
        });
        device.connected = true;
    });
    afterEach(function () {
        device.acknowledge.forEach(acknowledge => {if (typeof acknowledge === "function") {acknowledge()}});
    });
    describe('instantiation', function () {
        it('should throw an error if no subtype is specified', function () {
            expect(function () {
                lighting1 = new rfxcom.Lighting1(device);
            }).toThrow("Must provide a subtype.");
        });
    });
    describe('.chime', function () {
        beforeEach(function () {
            lighting1 = new rfxcom.Lighting1(device, rfxcom.lighting1.ARC);
        });
        it('should send the correct bytes to the serialport', function (done) {
            let sentCommandId = NaN;
            lighting1.chime('C14', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x07, 0x10, 0x01, 0x00, 0x43, 0x0E, 0x07, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should accept an array deviceId', function (done) {
            let sentCommandId = NaN;
            lighting1.chime(['C', '14'], function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x07, 0x10, 0x01, 0x00, 0x43, 0x0E, 0x07, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should log the bytes being sent in debug mode', function (done) {
            const debugDevice = new rfxcom.RfxCom('/dev/ttyUSB0', {
                    port:  fakeSerialPort,
                    debug: true
                }),
                debug = new rfxcom.Lighting1(debugDevice, rfxcom.lighting1.ARC);
            debugDevice.connected = true;
            const utilLogSpy = spyOn(util, 'log');
            debug.chime('C14', done);
            expect(utilLogSpy).toHaveBeenCalledWith('[rfxcom] on /dev/ttyUSB0 - Sent    : 07,10,01,00,43,0E,07,00');
            debugDevice.acknowledge[0]();
        });
    });
    describe('.program', function () {
        beforeEach(function () {
            lighting1 = new rfxcom.Lighting1(device, rfxcom.lighting1.OASE_FM);
        });
        it('should send the correct bytes to the serialport', function (done) {
            let sentCommandId = NaN;
            lighting1.program('C1', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x07, 0x10, 0x0C, 0x00, 0x43, 0x01, 0x04, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should accept an array deviceId', function (done) {
            let sentCommandId = NaN;
            lighting1.program(['C', '1'], function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x07, 0x10, 0x0C, 0x00, 0x43, 0x01, 0x04, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should log the bytes being sent in debug mode', function (done) {
            const debugDevice = new rfxcom.RfxCom('/dev/ttyUSB0', {
                    port:  fakeSerialPort,
                    debug: true
                }),
                debug = new rfxcom.Lighting1(debugDevice, rfxcom.lighting1.OASE_FM);
            debugDevice.connected = true;
            const utilLogSpy = spyOn(util, 'log');
            debug.program('C1', done);
            expect(utilLogSpy).toHaveBeenCalledWith('[rfxcom] on /dev/ttyUSB0 - Sent    : 07,10,0C,00,43,01,04,00');
            debugDevice.acknowledge[0]();
        });
    });
    describe('.unsupportedCommands', function () {
        beforeEach(function () {
            lighting1 = new rfxcom.Lighting1(device, rfxcom.lighting1.IMPULS);
        });
        it('should reject a group command', function () {
            expect(function () {
                lighting1.switchOn('C0')
            }).toThrow("Device does not support group on/off commands");
        });
        it('should reject a program command', function () {
            expect(function () {
                lighting1.program('C0')
            }).toThrow("Device does not support program()");
        });
    });
    describe('.lampCommands', function () {
        beforeEach(function () {
            lighting1 = new rfxcom.Lighting1(device, rfxcom.lighting1.X10);
        });
        it('should accept an array deviceId', function (done) {
            let sentCommandId = NaN;
            lighting1.switchOn(['C', '14'], function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x07, 0x10, 0x00, 0x00, 0x43, 0x0E, 0x01, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should accept a group command', function (done) {
            let sentCommandId = NaN;
            lighting1.switchOff(['C', '0'], function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x07, 0x10, 0x00, 0x00, 0x43, 0x00, 0x05, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should accept a dim command', function (done) {
            let sentCommandId = NaN;
            lighting1.decreaseLevel(['C', '2'], function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x07, 0x10, 0x00, 0x00, 0x43, 0x02, 0x02, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should accept a dim command with a room number', function (done) {
            let sentCommandId = NaN;
            lighting1.decreaseLevel(['C', '2'], 1, function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x07, 0x10, 0x00, 0x00, 0x43, 0x02, 0x02, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should accept a bright command', function (done) {
            let sentCommandId = NaN;
            lighting1.increaseLevel(['C', '2'], function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x07, 0x10, 0x00, 0x00, 0x43, 0x02, 0x03, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should accept a bright command with a room number', function (done) {
            let sentCommandId = NaN;
            lighting1.increaseLevel(['C', '2'], 1, function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x07, 0x10, 0x00, 0x00, 0x43, 0x02, 0x03, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should reject a group bright command', function () {
            expect(function () {
                lighting1.increaseLevel(['C', '0'])
            }).toThrow("Device does not support group dim/bright commands");
        });
    });
    describe('.X10 address checking', function () {
        beforeEach(function () {
            lighting1 = new rfxcom.Lighting1(device, rfxcom.lighting1.X10);
        });
        it('should reject an invalid house code', function () {
            expect(function () {
                lighting1.switchOn(['Q', '1'])
            }).toThrow("Invalid house code 'Q'");
        });
        it('should reject an invalid unit code', function () {
            expect(function () {
                lighting1.switchOn(['P', '65'])
            }).toThrow("Invalid unit code 65");
        });
        it('should reject an badly formatted address', function () {
            expect(function () {
                lighting1.switchOn(['0x556', 'B', '1'])
            }).toThrow("Invalid deviceId format");
        });
    });
    describe('.CHACON address checking', function () {
        beforeEach(function () {
            lighting1 = new rfxcom.Lighting1(device, rfxcom.lighting1.CHACON);
        });
        it('should accept the highest house & unit codes', function (done) {
            let sentCommandId = NaN;
            lighting1.switchOn(['C', '4'], function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x07, 0x10, 0x04, 0x00, 0x43, 0x04, 0x01, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should reject an invalid house code', function () {
            expect(function () {
                lighting1.switchOn(['D', '1'])
            }).toThrow("Invalid house code 'D'");
        });
        it('should reject an invalid unit code', function () {
            expect(function () {
                lighting1.switchOn(['A', '5'])
            }).toThrow("Invalid unit code 5");
        });
    });
    describe('.COCO address checking', function () {
        beforeEach(function () {
            lighting1 = new rfxcom.Lighting1(device, rfxcom.lighting1.COCO);
        });
        it('should accept the highest house & unit codes', function (done) {
            let sentCommandId = NaN;
            lighting1.switchOn(['D', '4'], function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x07, 0x10, 0x0a, 0x00, 0x44, 0x04, 0x01, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should reject an invalid house code', function () {
            expect(function () {
                lighting1.switchOn(['E', '1'])
            }).toThrow("Invalid house code 'E'");
        });
        it('should reject an invalid unit code', function () {
            expect(function () {
                lighting1.switchOn(['A', '5'])
            }).toThrow("Invalid unit code 5");
        });
    });
    describe('.IMPULS address checking', function () {
        beforeEach(function () {
            lighting1 = new rfxcom.Lighting1(device, rfxcom.lighting1.IMPULS);
        });
        it('should accept the highest house & unit codes', function (done) {
            let sentCommandId = NaN;
            lighting1.switchOn(['P', '64'], function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x07, 0x10, 0x05, 0x00, 0x50, 0x40, 0x01, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should reject an invalid house code', function () {
            expect(function () {
                lighting1.switchOn(['Q', '1'])
            }).toThrow("Invalid house code 'Q'");
        });
        it('should reject an invalid unit code', function () {
            expect(function () {
                lighting1.switchOn(['A', '65'])
            }).toThrow("Invalid unit code 65");
        });
    });
    describe('.PHILIPS_SBC address checking', function () {
        beforeEach(function () {
            lighting1 = new rfxcom.Lighting1(device, rfxcom.lighting1.PHILIPS_SBC);
        });
        it('should accept the highest house & unit codes', function (done) {
            let sentCommandId = NaN;
            lighting1.switchOn(['P', '8'], function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x07, 0x10, 0x07, 0x00, 0x50, 0x08, 0x01, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should reject an invalid house code', function () {
            expect(function () {
                lighting1.switchOn(['Q', '1'])
            }).toThrow("Invalid house code 'Q'");
        });
        it('should reject an invalid unit code', function () {
            expect(function () {
                lighting1.switchOn(['A', '9'])
            }).toThrow("Invalid unit code 9");
        });
    });
    describe('.ENERGENIE_5_GANG address checking', function () {
        beforeEach(function () {
            lighting1 = new rfxcom.Lighting1(device, rfxcom.lighting1.ENERGENIE_5_GANG);
        });
        it('should accept the highest house & unit codes', function (done) {
            let sentCommandId = NaN;
            lighting1.switchOn(['P', '10'], function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x07, 0x10, 0x09, 0x00, 0x50, 0x0a, 0x01, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should reject an invalid house code', function () {
            expect(function () {
                lighting1.switchOn(['Q', '1'])
            }).toThrow("Invalid house code 'Q'");
        });
        it('should reject an invalid unit code', function () {
            expect(function () {
                lighting1.switchOn(['A', '11'])
            }).toThrow("Invalid unit code 11");
        });
    });
    describe('.HQ address checking', function () {
        beforeEach(function () {
            lighting1 = new rfxcom.Lighting1(device, rfxcom.lighting1.HQ);
        });
        it('should accept the highest house & unit codes', function (done) {
            let sentCommandId = NaN;
            lighting1.switchOn(['D', '16'], function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x07, 0x10, 0x0b, 0x00, 0x44, 0x10, 0x01, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should reject an invalid house code', function () {
            expect(function () {
                lighting1.switchOn(['E', '1'])
            }).toThrow("Invalid house code 'E'");
        });
        it('should reject an invalid unit code', function () {
            expect(function () {
                lighting1.switchOn(['A', '65'])
            }).toThrow("Invalid unit code 65");
        });
    });
    describe('.OASE_FM address checking', function () {
        beforeEach(function () {
            lighting1 = new rfxcom.Lighting1(device, rfxcom.lighting1.OASE_FM);
        });
        it('should accept the highest house & unit codes', function (done) {
            let sentCommandId = NaN;
            lighting1.switchOn(['P', '3'], function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x07, 0x10, 0x0c, 0x00, 0x50, 0x03, 0x01, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should reject an invalid house code', function () {
            expect(function () {
                lighting1.switchOn(['Q', '1'])
            }).toThrow("Invalid house code 'Q'");
        });
        it('should reject an invalid unit code', function () {
            expect(function () {
                lighting1.switchOn(['A', '4'])
            }).toThrow("Invalid unit code 4");
        });
    });
});

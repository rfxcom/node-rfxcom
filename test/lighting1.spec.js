/* global require: false, beforeEach: false, describe: false, it: false, expect: false,
   spyOn: false, console: false
*/
var rfxcom = require('../lib'),
    matchers = require('./matchers'),
    FakeSerialPort = require('./helper');

describe('Lighting1 class', function () {
    var lighting1,
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
        if (typeof device.acknowledge[0] == "function") {
            device.acknowledge[0]();
        }
    });
    describe('instantiation', function () {
        it('should throw an error if no subtype is specified', function () {
            expect(function () {
                lighting1 = new rfxcom.Lighting1(device);
            }).toThrow(new Error('Must provide a subtype.'));
        });
    });
    describe('.chime', function () {
        beforeEach(function () {
            lighting1 = new rfxcom.Lighting1(device, rfxcom.lighting1.ARC);
        });
        it('should send the correct bytes to the serialport', function (done) {
            var sentCommandId;
            lighting1.chime('C14', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x07, 0x10, 0x01, 0x00, 0x43, 0x0E, 0x07, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should accept an array deviceId', function (done) {
            var sentCommandId;
            lighting1.chime(['C', '14'], function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x07, 0x10, 0x01, 0x00, 0x43, 0x0E, 0x07, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should log the bytes being sent in debug mode', function (done) {
            var debugDevice = new rfxcom.RfxCom('/dev/ttyUSB0', {
                    port:  fakeSerialPort,
                    debug: true
                }),
                debug = new rfxcom.Lighting1(debugDevice, rfxcom.lighting1.ARC);
            debugDevice.connected = true;
            var consoleSpy = spyOn(console, 'log');
            debug.chime('C14', done);
            expect(consoleSpy).toHaveBeenCalledWith('[rfxcom] on /dev/ttyUSB0 - Sent    : %s', ['07', '10', '01', '00', '43', '0E', '07', '00']);
            debugDevice.acknowledge[0]();
        });
    });
    describe('.unsupportedCommands', function () {
        beforeEach(function () {
            lighting1 = new rfxcom.Lighting1(device, rfxcom.lighting1.IMPULS);
        });
        it('should reject a group command', function () {
            var sentCommandId;
            expect(function () {
                lighting1.switchOn('C0')
            }).toThrow(new Error("Device does not support group on/off commands"));
        });
    });
    describe('.lampCommands', function () {
        beforeEach(function () {
            lighting1 = new rfxcom.Lighting1(device, rfxcom.lighting1.X10);
        });
        it('should accept an array deviceId', function (done) {
            var sentCommandId;
            lighting1.switchOn(['C', '14'], function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x07, 0x10, 0x00, 0x00, 0x43, 0x0E, 0x01, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should accept a group command', function (done) {
            var sentCommandId;
            lighting1.switchOff(['C', '0'], function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x07, 0x10, 0x00, 0x00, 0x43, 0x00, 0x05, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should accept a dim command', function (done) {
            var sentCommandId;
            lighting1.decreaseLevel(['C', '2'], function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x07, 0x10, 0x00, 0x00, 0x43, 0x02, 0x02, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should accept a bright command', function (done) {
            var sentCommandId;
            lighting1.increaseLevel(['C', '2'], function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x07, 0x10, 0x00, 0x00, 0x43, 0x02, 0x03, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should reject a group bright command', function () {
            var sentCommandId;
            expect(function () {
                lighting1.increaseLevel(['C', '0'])
            }).toThrow(new Error("Device does not support group dim/bright commands"));
        });
    });
    describe('.X10 adress checking', function () {
        beforeEach(function () {
            lighting1 = new rfxcom.Lighting1(device, rfxcom.lighting1.X10);
        });
        it('should reject an invalid house code', function () {
            var sentCommandId;
            expect(function () {
                lighting1.switchOn(['Q', '1'])
            }).toThrow(new Error("Invalid house code 'Q'"));
        });
        it('should reject an invalid unit code', function () {
            var sentCommandId;
            expect(function () {
                lighting1.switchOn(['P', '65'])
            }).toThrow(new Error("Invalid unit code 65"));
        });
        it('should reject an badly formatted address', function () {
            var sentCommandId;
            expect(function () {
                lighting1.switchOn(['0x556', 'B', '1'])
            }).toThrow(new Error("Invalid deviceId format"));
        });
    });
    describe('.CHACON adress checking', function () {
        beforeEach(function () {
            lighting1 = new rfxcom.Lighting1(device, rfxcom.lighting1.CHACON);
        });
        it('should accept the highest house & unit codes', function (done) {
            var sentCommandId;
            lighting1.switchOn(['C', '4'], function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x07, 0x10, 0x04, 0x00, 0x43, 0x04, 0x01, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should reject an invalid house code', function () {
            var sentCommandId;
            expect(function () {
                lighting1.switchOn(['D', '1'])
            }).toThrow(new Error("Invalid house code 'D'"));
        });
        it('should reject an invalid unit code', function () {
            var sentCommandId;
            expect(function () {
                lighting1.switchOn(['A', '5'])
            }).toThrow(new Error("Invalid unit code 5"));
        });
    });
    describe('.COCO adress checking', function () {
        beforeEach(function () {
            lighting1 = new rfxcom.Lighting1(device, rfxcom.lighting1.COCO);
        });
        it('should accept the highest house & unit codes', function (done) {
            var sentCommandId;
            lighting1.switchOn(['D', '4'], function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x07, 0x10, 0x0a, 0x00, 0x44, 0x04, 0x01, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should reject an invalid house code', function () {
            var sentCommandId;
            expect(function () {
                lighting1.switchOn(['E', '1'])
            }).toThrow(new Error("Invalid house code 'E'"));
        });
        it('should reject an invalid unit code', function () {
            var sentCommandId;
            expect(function () {
                lighting1.switchOn(['A', '5'])
            }).toThrow(new Error("Invalid unit code 5"));
        });
    });
    describe('.IMPULS adress checking', function () {
        beforeEach(function () {
            lighting1 = new rfxcom.Lighting1(device, rfxcom.lighting1.IMPULS);
        });
        it('should accept the highest house & unit codes', function (done) {
            var sentCommandId;
            lighting1.switchOn(['P', '64'], function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x07, 0x10, 0x05, 0x00, 0x50, 0x40, 0x01, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should reject an invalid house code', function () {
            var sentCommandId;
            expect(function () {
                lighting1.switchOn(['Q', '1'])
            }).toThrow(new Error("Invalid house code 'Q'"));
        });
        it('should reject an invalid unit code', function () {
            var sentCommandId;
            expect(function () {
                lighting1.switchOn(['A', '65'])
            }).toThrow(new Error("Invalid unit code 65"));
        });
    });
    describe('.PHILIPS_SBC adress checking', function () {
        beforeEach(function () {
            lighting1 = new rfxcom.Lighting1(device, rfxcom.lighting1.PHILIPS_SBC);
        });
        it('should accept the highest house & unit codes', function (done) {
            var sentCommandId;
            lighting1.switchOn(['P', '8'], function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x07, 0x10, 0x07, 0x00, 0x50, 0x08, 0x01, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should reject an invalid house code', function () {
            var sentCommandId;
            expect(function () {
                lighting1.switchOn(['Q', '1'])
            }).toThrow(new Error("Invalid house code 'Q'"));
        });
        it('should reject an invalid unit code', function () {
            var sentCommandId;
            expect(function () {
                lighting1.switchOn(['A', '9'])
            }).toThrow(new Error("Invalid unit code 9"));
        });
    });
    describe('.ENERGENIE_5_GANG adress checking', function () {
        beforeEach(function () {
            lighting1 = new rfxcom.Lighting1(device, rfxcom.lighting1.ENERGENIE_5_GANG);
        });
        it('should accept the highest house & unit codes', function (done) {
            var sentCommandId;
            lighting1.switchOn(['P', '10'], function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x07, 0x10, 0x09, 0x00, 0x50, 0x0a, 0x01, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should reject an invalid house code', function () {
            var sentCommandId;
            expect(function () {
                lighting1.switchOn(['Q', '1'])
            }).toThrow(new Error("Invalid house code 'Q'"));
        });
        it('should reject an invalid unit code', function () {
            var sentCommandId;
            expect(function () {
                lighting1.switchOn(['A', '11'])
            }).toThrow(new Error("Invalid unit code 11"));
        });
    });
});

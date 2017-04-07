/* global require: false, beforeEach: false, describe: false, it: false, expect: false */
var rfxcom = require('../lib'),
    matchers = require('./matchers'),
    FakeSerialPort = require('./helper');

beforeEach(function () {
    this.addMatchers({
        toHaveSent: matchers.toHaveSent
    });
});

describe('Lighting5 class', function () {
    var lighting5,
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
        if (typeof device.acknowledge[0] === "function") {
            device.acknowledge[0]();
        }
    });
    describe('instantiation', function () {
        it('should throw an error if no subtype is specified', function () {
            expect(function () {
                lighting5 = new rfxcom.Lighting5(device);
            }).toThrow("Must provide a subtype.");
        });
    });
    describe('.switchOn', function () {
        beforeEach(function () {
            lighting5 = new rfxcom.Lighting5(device, rfxcom.lighting5.LIGHTWAVERF);
        });
        it('should send the correct bytes to the serialport', function (done) {
            var sentCommandId = NaN;
            lighting5.switchOn('0xF09AC8/1', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x0A, 0x14, 0x00, 0x00, 0xF0, 0x9A, 0xC8, 0x01, 0x01, 0x1F, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should accept an array deviceId', function (done) {
            var sentCommandId = NaN;
            lighting5.switchOn(['0xF09AC8', '1'], function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x0A, 0x14, 0x00, 0x00, 0xF0, 0x9A, 0xC8, 0x01, 0x01, 0x1F, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should throw an exception with an invalid deviceId', function () {
            expect(function () {
                lighting5.switchOn('0xF09AC8');
            }).toThrow("Invalid deviceId format");
        });
        it('should handle mood lighting', function (done) {
            lighting5.switchOn('0xF09AC8/1', {
                mood: 0x03
            }, function () {
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x0A, 0x14, 0x00, 0x00, 0xF0, 0x9A, 0xC8, 0x01, 0x05, 0x1F, 0x00]);
        });
        it('should throw an exception with an invalid mood value', function () {
            expect(function () {
                lighting5.switchOn('0xF09AC8/1', {
                    mood: 6
                });
            }).toThrow("Invalid mood value must be in range 1-5.");
        });
        it('should send the level if one is specified', function (done) {
            lighting5.switchOn('0xF09AC8/1', {
                level: 0x10
            }, function () {
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x0A, 0x14, 0x00, 0x00, 0xF0, 0x9A, 0xC8, 0x01, 0x10, 0x10, 0x00]);
        });
        it('should handle no callback', function () {
            lighting5.switchOn('0xF09AC8/1', {
                level: 0x10
            });
            expect(fakeSerialPort).toHaveSent([0x0A, 0x14, 0x00, 0x00, 0xF0, 0x9A, 0xC8, 0x01, 0x10, 0x10, 0x00]);
        });
        it('should log the bytes being sent in debug mode', function (done) {
            var debugDevice = new rfxcom.RfxCom('/dev/ttyUSB0', {
                    port:  fakeSerialPort,
                    debug: true
                }),
                debug = new rfxcom.Lighting5(debugDevice, rfxcom.lighting5.LIGHTWAVERF);
            debugDevice.connected = true;
            var consoleSpy = spyOn(console, 'log');
            debug.switchOn('0xF09AC8/1', {
                level: 0x10
            }, function () {
                done();
            });
            expect(consoleSpy).toHaveBeenCalledWith('[rfxcom] on /dev/ttyUSB0 - Sent    : 0A,14,00,00,F0,9A,C8,01,10,10,00');
            debugDevice.acknowledge[0]();
        });
    });
    describe('.switchOff', function () {
        beforeEach(function () {
            lighting5 = new rfxcom.Lighting5(device, rfxcom.lighting5.EMW100);
        });
        it('should send the correct bytes to the serialport', function (done) {
            var sentCommandId = NaN;
            lighting5.switchOff('0xAC8/1', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x0A, 0x14, 0x01, 0x00, 0x00, 0x0A, 0xC8, 0x01, 0x00, 0x00, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should handle no callback', function () {
            lighting5.switchOff('0xAC8/1');
            expect(fakeSerialPort).toHaveSent([0x0A, 0x14, 0x01, 0x00, 0x00, 0x0A, 0xC8, 0x01, 0x00, 0x00, 0x00]);
        });
    });
    describe('.setLevel', function () {
        beforeEach(function () {
            lighting5 = new rfxcom.Lighting5(device, rfxcom.lighting5.LIGHTWAVERF);
        });
        it('should handle a setLevel command', function (done) {
            lighting5.setLevel('0xF09AC8/1', 0x10, function () {
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x0A, 0x14, 0x00, 0x00, 0xF0, 0x9A, 0xC8, 0x01, 0x10, 0x10, 0x00]);
        });
        it('should throw an exception with an invalid level', function () {
            expect(function () {
                lighting5.setLevel('0xF09AC8/1', 32);
            }).toThrow("Invalid level: value must be in range 0-31");
        });
    });
    describe('.setMood', function () {
        beforeEach(function () {
            lighting5 = new rfxcom.Lighting5(device, rfxcom.lighting5.LIGHTWAVERF);
        });
        it('should handle a setMood command', function (done) {
            lighting5.setMood('0xF09AC8/1', 0x03, function () {
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x0A, 0x14, 0x00, 0x00, 0xF0, 0x9A, 0xC8, 0x01, 0x05, 0x1F, 0x00]);
        });
        it('should throw an exception with an invalid mood value', function () {
            expect(function () {
                lighting5.setMood('0xF09AC8/1', 6);
            }).toThrow("Invalid mood value must be in range 1-5.");
        });
    });
    describe('.LIGHTWAVERF.errorChecking', function () {
        beforeEach(function () {
            lighting5 = new rfxcom.Lighting5(device, rfxcom.lighting5.LIGHTWAVERF);
        });
        it('should accept the highest address and unit code values', function (done) {
            var sentCommandId = NaN;
            lighting5.switchOn('0xFFFFFF/16', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x0A, 0x14, 0x00, 0x00, 0xff, 0xff, 0xff, 0x10, 0x01, 0x1F, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should throw an exception with an badly formatted address', function () {
            expect(function () {
                lighting5.switchOn('0xF09AC8');
            }).toThrow("Invalid deviceId format");
        });
        it('should throw an exception with an invalid unit code', function () {
            expect(function () {
                lighting5.switchOn('0xFFFFFF/17');
            }).toThrow("Invalid unit code 17");
        });
        it('should throw an exception with an increaseLevel command', function () {
            expect(function () {
                lighting5.increaseLevel('0xFFFFFF/16');
            }).toThrow("Device does not support increaseLevel()");
        });
        it('should throw an exception with a decreaseLevel command', function () {
            expect(function () {
                lighting5.decreaseLevel('0xFFFFFF/16');
            }).toThrow("Device does not support decreaseLevel()");
        });
        it('should throw an exception with a toggleOnOff command', function () {
            expect(function () {
                lighting5.toggleOnOff('0xFFFFFF/16');
            }).toThrow("Device does not support toggleOnOff()");
        });
        it('should throw an exception with a program command', function () {
            expect(function () {
                lighting5.program('0xFFFFFF/16');
            }).toThrow("Device does not support program()");
        });
    });
    describe('.EMW100.errorChecking', function () {
        beforeEach(function () {
            lighting5 = new rfxcom.Lighting5(device, rfxcom.lighting5.EMW100);
        });
        it('should accept the highest address and unit code values', function (done) {
            var sentCommandId = NaN;
            lighting5.switchOn('0x3FFF/4', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x0A, 0x14, 0x01, 0x00, 0x00, 0x3f, 0xff, 0x04, 0x01, 0x1F, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should throw an exception with an invalid address', function () {
            expect(function () {
                lighting5.switchOn('0xFFFFFF/4');
            }).toThrow("Address 0xffffff outside valid range");
        });
        it('should throw an exception with an invalid unit number', function () {
            expect(function () {
                lighting5.switchOn('0x3FF/5');
            }).toThrow("Invalid unit code 5");
        });
        it('should throw an exception with a setLevel command', function () {
            expect(function () {
                lighting5.setLevel('0x3FFF/4');
            }).toThrow("Device does not support setLevel()");
        });
    });
    describe('.BBSB.addressChecking', function () {
        beforeEach(function () {
            lighting5 = new rfxcom.Lighting5(device, rfxcom.lighting5.BBSB);
        });
        it('should accept the highest address and unit code values', function (done) {
            var sentCommandId = NaN;
            lighting5.switchOn('0x7FFFF/6', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x0A, 0x14, 0x02, 0x00, 0x07, 0xff, 0xff, 0x06, 0x01, 0x1F, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should throw an exception with an invalid address', function () {
            expect(function () {
                lighting5.switchOn('0xFFFFFF/4');
            }).toThrow("Address 0xffffff outside valid range");
        });
        it('should throw an exception with an invalid unit number', function () {
            expect(function () {
                lighting5.switchOn('0x7FFF/7');
            }).toThrow("Invalid unit code 7");
        });
    });
    describe('.MDREMOTE.addressChecking', function () {
        beforeEach(function () {
            lighting5 = new rfxcom.Lighting5(device, rfxcom.lighting5.MDREMOTE);
        });
        it('should accept the highest address value', function (done) {
            var sentCommandId = NaN;
            lighting5.switchOn('0xFFFF', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x0A, 0x14, 0x03, 0x00, 0x00, 0xff, 0xff, 0x01, 0x01, 0x1F, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should throw an exception with an invalid address', function () {
            expect(function () {
                lighting5.switchOn('0xFFFFFF');
            }).toThrow("Address 0xffffff outside valid range");
        });
        it('should throw an exception when the deviceId includes a unit number', function () {
            expect(function () {
                lighting5.switchOn('0xFFF/7');
            }).toThrow("Invalid deviceId format");
        });
    });
    describe('.CONRAD.addressChecking', function () {
        beforeEach(function () {
            lighting5 = new rfxcom.Lighting5(device, rfxcom.lighting5.CONRAD);
        });
        it('should accept the highest address value', function (done) {
            var sentCommandId = NaN;
            lighting5.switchOn('0xFFFFFF/16', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x0A, 0x14, 0x04, 0x00, 0xff, 0xff, 0xff, 0x10, 0x01, 0x1F, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should throw an exception with an invalid unit number', function () {
            expect(function () {
                lighting5.switchOn('0xFFFFFF/17');
            }).toThrow("Invalid unit code 17");
        });
    });
    describe('.LIVOLO.addressChecking', function () {
        beforeEach(function () {
            lighting5 = new rfxcom.Lighting5(device, rfxcom.lighting5.LIVOLO);
        });
        it('should accept the highest address value', function (done) {
            var sentCommandId = NaN;
            lighting5.switchOn('0xFFFF', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x0A, 0x14, 0x05, 0x00, 0x00, 0xff, 0xff, 0x01, 0x01, 0x1F, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should throw an exception with an invalid address', function () {
            expect(function () {
                lighting5.switchOn('0xFFFFFF');
            }).toThrow("Address 0xffffff outside valid range");
        });
        it('should throw an exception when the deviceId includes a unit number', function () {
            expect(function () {
                lighting5.switchOn('0xFFF/7');
            }).toThrow("Invalid deviceId format");
        });
    });
    describe('.TRC02.addressChecking', function () {
        beforeEach(function () {
            lighting5 = new rfxcom.Lighting5(device, rfxcom.lighting5.TRC02);
        });
        it('should accept the highest address value', function (done) {
            var sentCommandId = NaN;
            lighting5.switchOn('0xFFFFFF', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x0A, 0x14, 0x06, 0x00, 0xff, 0xff, 0xff, 0x01, 0x01, 0x1F, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should throw an exception with an invalid address', function () {
            expect(function () {
                lighting5.switchOn('0x0');
            }).toThrow("Address 0x0 outside valid range");
        });
        it('should throw an exception when the deviceId includes a unit number', function () {
            expect(function () {
                lighting5.switchOn('0xFFF/7');
            }).toThrow("Invalid deviceId format");
        });
    });
    describe('.LIVOLO.specificCommands', function () {
        beforeEach(function () {
            lighting5 = new rfxcom.Lighting5(device, rfxcom.lighting5.LIVOLO);
        });
        it('should accept an increaseLevel command', function (done) {
            lighting5.increaseLevel('0xFFFF', function () {
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x0A, 0x14, 0x05, 0x00, 0x00, 0xff, 0xff, 0x01, 0x02, 0x00, 0x00]);
        });
        it('should accept a decreaseLevel command', function (done) {
            lighting5.decreaseLevel('0xFFFF', function () {
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x0A, 0x14, 0x05, 0x00, 0x00, 0xff, 0xff, 0x01, 0x03, 0x00, 0x00]);
        });
        it('should accept a toggleOnOff command', function (done) {
            lighting5.toggleOnOff('0xFFFF', function () {
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x0A, 0x14, 0x05, 0x00, 0x00, 0xff, 0xff, 0x01, 0x01, 0x00, 0x00]);
        });
        it('should accept a switchOff command', function (done) {
            lighting5.switchOff('0xFFFF', function () {
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x0A, 0x14, 0x05, 0x00, 0x00, 0xff, 0xff, 0x01, 0x00, 0x00, 0x00]);
        });
    });
    describe('.EMW100.specificCommands', function () {
        beforeEach(function () {
            lighting5 = new rfxcom.Lighting5(device, rfxcom.lighting5.EMW100);
        });
        it('should accept a program command', function (done) {
            lighting5.program('0x3FFF/1', function () {
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x0A, 0x14, 0x01, 0x00, 0x00, 0x3f, 0xff, 0x01, 0x02, 0x00, 0x00]);
        });
    });
});

const rfxcom = require('../lib'),
    util = require('util'),
    matchers = require('./matchers'),
    FakeSerialPort = require('./helper');

describe('Chime1 class', function () {
    let chime1,
        fakeSerialPort,
        device;
    beforeEach(function () {
        jasmine.addMatchers({
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
                chime1 = new rfxcom.Chime1(device);
            }).toThrow(new Error(("Must provide a subtype.")));
        });
    });
    describe('.chime', function () {
        beforeEach(function () {
            chime1 = new rfxcom.Chime1(device, rfxcom.chime1.BYRON_SX);
        });
        it('should send the correct bytes to the serialport', function (done) {
            let sentCommandId = NaN;
            chime1.chime('0x2a', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x07, 0x16, 0x00, 0x00, 0x00, 0x2A, 0x05, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should accept an array deviceId', function (done) {
            let sentCommandId = NaN;
            chime1.chime(['0x2a'], function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x07, 0x16, 0x00, 0x00, 0x00, 0x2A, 0x05, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should log the bytes being sent in debug mode', function (done) {
            const debugDevice = new rfxcom.RfxCom('/dev/ttyUSB0', {
                    port:  fakeSerialPort,
                    debug: true
                }),
                debug = new rfxcom.Chime1(debugDevice, rfxcom.chime1.BYRON_SX);
            debugDevice.connected = true;
            const debugLogSpy = spyOn(debugDevice, 'debugLog');
            debug.chime('0x2a', done);
            expect(debugLogSpy).toHaveBeenCalledWith('Sent    : 07,16,00,00,00,2A,05,00');
            debugDevice.acknowledge[0]();
        });
        it('should accept a valid tone number', function (done) {
            let sentCommandId = NaN;
            chime1.chime('0x2a', 0x0d, function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x07, 0x16, 0x00, 0x00, 0x00, 0x2A, 0x0D, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should throw an error with an invalid tone number', function () {
            expect(function () {
                chime1.chime('0x2a', -1)
            }).toThrow(new Error(("Invalid tone: value must be in range 0-15")));
        });
        it('should throw an error with an invalid device ID', function () {
            expect(function () {
                chime1.chime('0x23a')
            }).toThrow(new Error(("Device ID 0x23a outside valid range")));
        });
        it('should throw an error with an invalid device ID format', function () {
            expect(function () {
                chime1.chime('0x23/0xa')
            }).toThrow(new Error(("Invalid device ID format")));
        });
    });
    describe('.chime', function () {
        beforeEach(function () {
            chime1 = new rfxcom.Chime1(device, rfxcom.chime1.BYRON_MP001);
        });
        it('should send the correct bytes to the serialport', function (done) {
            let sentCommandId = NaN;
            chime1.chime('101000', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x07, 0x16, 0x01, 0x00, 0x11, 0x5F, 0x54, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should throw an error with an invalid device ID format', function () {
            expect(function () {
                chime1.chime('10100')
            }).toThrow(new Error(("Invalid device ID format")));
        });
        it('should throw an error with an invalid device ID format', function () {
            expect(function () {
                chime1.chime('10100x')
            }).toThrow(new Error(("Invalid device ID format")));
        });
    });
    describe('.chime', function () {
        beforeEach(function () {
            chime1 = new rfxcom.Chime1(device, rfxcom.chime1.SELECT_PLUS);
        });
        it('should send the correct bytes to the serialport', function (done) {
            let sentCommandId = NaN;
            chime1.chime('0x3ff', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x07, 0x16, 0x02, 0x00, 0x00, 0x03, 0xFF, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should accept the highest allowed address', function (done) {
            let sentCommandId = NaN;
            chime1.chime('0x3ffff', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x07, 0x16, 0x02, 0x00, 0x03, 0xFF, 0xFF, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should throw an error with an invalid device ID', function () {
            expect(function () {
                chime1.chime('0x40000')
            }).toThrow(new Error(("Device ID 0x40000 outside valid range")));
        });
    });
    describe('.chime', function () {
        beforeEach(function () {
            chime1 = new rfxcom.Chime1(device, rfxcom.chime1.BYRON_BY);
        });
        it('should send the correct bytes to the serialport', function (done) {
            let sentCommandId = NaN;
            chime1.chime('0x3ff', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x07, 0x16, 0x03, 0x00, 0x01, 0xFF, 0x85, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should accept a sound code of 0', function (done) {
            let sentCommandId = NaN;
            chime1.chime('0x3ff', 0, function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x07, 0x16, 0x03, 0x00, 0x01, 0xFF, 0x80, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should accept a sound code of 7', function (done) {
            let sentCommandId = NaN;
            chime1.chime('0x103ff', 7, function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x07, 0x16, 0x03, 0x00, 0x81, 0xFF, 0x87, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should throw an error with an invalid sound code', function () {
            expect(function () {
                chime1.chime('0x103ff', 9)
            }).toThrow(new Error(("Invalid tone: value must be in range 0-7")));
        });
        it('should accept an address of 0x0', function (done) {
            let sentCommandId = NaN;
            chime1.chime('0x0', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x07, 0x16, 0x03, 0x00, 0x00, 0x00, 0x05, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should accept the highest allowed address', function (done) {
            let sentCommandId = NaN;
            chime1.chime('0x1ffff', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x07, 0x16, 0x03, 0x00, 0xFF, 0xFF, 0x85, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should throw an error with an invalid device ID', function () {
            expect(function () {
                chime1.chime('0x20000')
            }).toThrow(new Error(("Device ID 0x20000 outside valid range")));
        });
    });
    describe('.chime', function () {
        beforeEach(function () {
            chime1 = new rfxcom.Chime1(device, rfxcom.chime1.ENVIVO);
        });
        it('should send the correct bytes to the serialport', function (done) {
            let sentCommandId = NaN;
            chime1.chime('0x3ff', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x07, 0x16, 0x04, 0x00, 0x00, 0x03, 0xFF, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should accept an address of 0x0', function (done) {
            let sentCommandId = NaN;
            chime1.chime('0x0', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x07, 0x16, 0x04, 0x00, 0x00, 0x00, 0x00, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should accept the highest allowed address', function (done) {
            let sentCommandId = NaN;
            chime1.chime('0xffff', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x07, 0x16, 0x04, 0x00, 0x00, 0xFF, 0xFF, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should throw an error with an invalid address', function () {
            expect(function () {
                chime1.chime('0x1000000')
            }).toThrow(new Error(("Device ID 0x1000000 outside valid range")));
        });
        it('should throw an error with an invalid device ID', function () {
            expect(function () {
                chime1.chime('0x400/1')
            }).toThrow(new Error(("Invalid device ID format")));
        });
    });
    describe('.chime', function () {
        beforeEach(function () {
            chime1 = new rfxcom.Chime1(device, rfxcom.chime1.ALFAWISE);
        });
        it('should send the correct bytes to the serialport', function (done) {
            let sentCommandId = NaN;
            chime1.chime('0x3ff', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x07, 0x16, 0x05, 0x00, 0x00, 0x03, 0xFF, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should accept an address of 0x0', function (done) {
            let sentCommandId = NaN;
            chime1.chime('0x0', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x07, 0x16, 0x05, 0x00, 0x00, 0x00, 0x00, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should accept the highest allowed address', function (done) {
            let sentCommandId = NaN;
            chime1.chime('0xffffff', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x07, 0x16, 0x05, 0x00, 0xFF, 0xFF, 0xFF, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should throw an error with an invalid address', function () {
            expect(function () {
                chime1.chime('0x1000000')
            }).toThrow(new Error(("Device ID 0x1000000 outside valid range")));
        });
        it('should throw an error with an invalid device ID', function () {
            expect(function () {
                chime1.chime('0x400/1')
            }).toThrow(new Error(("Invalid device ID format")));
        });
    });
});
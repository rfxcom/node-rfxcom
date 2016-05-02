var rfxcom = require('../lib'),
    matchers = require('./matchers'),
    FakeSerialPort = require('./helper');

describe('Chime1 class', function () {
    var chime1,
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
    });
    describe('instantiation', function () {
        it('should throw an error if no subtype is specified', function () {
            expect(function () {
                chime1 = new rfxcom.Chime1(device);
            }).toThrow(new Error('Must provide a subtype.'));
        });
    });
    describe('.chime', function () {
        beforeEach(function () {
            chime1 = new rfxcom.Chime1(device, rfxcom.chime1.BYRON_SX);
        });
        it('should send the correct bytes to the serialport', function (done) {
            var sentCommandId;
            chime1.chime('0x2a', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x07, 0x16, 0x00, 0x00, 0x00, 0x2A, 0x05, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should accept an array deviceId', function (done) {
            var sentCommandId;
            chime1.chime(['0x2a'], function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x07, 0x16, 0x00, 0x00, 0x00, 0x2A, 0x05, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should log the bytes being sent in debug mode', function (done) {
            var debugDevice = new rfxcom.RfxCom('/dev/ttyUSB0', {
                    port:  fakeSerialPort,
                    debug: true
                }),
                debug = new rfxcom.Chime1(debugDevice, rfxcom.chime1.BYRON_SX);

            var consoleSpy = spyOn(console, 'log');
            debug.chime('0x2a', done);
            expect(consoleSpy).toHaveBeenCalledWith('[rfxcom] on /dev/ttyUSB0 - Sent    : %s', ['07', '16', '00', '00', '00', '2A', '05', '00']);
        });
        it('should accept a valid tone number', function (done) {
            var sentCommandId;
            chime1.chime('0x2a', 0x0d, function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x07, 0x16, 0x00, 0x00, 0x00, 0x2A, 0x0D, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should throw an error with an invalid tone number', function () {
            var sentCommandId;
            expect(function () {
                chime1.chime('0x2a', -1)
            }).toThrow(new Error("Invalid tone: value must be in range 0-15"));
        });
        it('should throw an error with an invalid device ID', function () {
            var sentCommandId;
            expect(function () {
                chime1.chime('0x23a')
            }).toThrow(new Error("Device ID 0x23a outside valid range"));
        });
        it('should throw an error with an invalid device ID format', function () {
            var sentCommandId;
            expect(function () {
                chime1.chime('0x23/0xa')
            }).toThrow(new Error("Invalid device ID format"));
        });
    });
    describe('.chime', function () {
        beforeEach(function () {
            chime1 = new rfxcom.Chime1(device, rfxcom.chime1.BYRON_MP001);
        });
        it('should send the correct bytes to the serialport', function (done) {
            var sentCommandId;
            chime1.chime('101000', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x07, 0x16, 0x01, 0x00, 0x11, 0x5F, 0x54, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should throw an error with an invalid device ID format', function () {
            var sentCommandId;
            expect(function () {
                chime1.chime('10100')
            }).toThrow(new Error("Invalid device ID format"));
        });
        it('should throw an error with an invalid device ID format', function () {
            var sentCommandId;
            expect(function () {
                chime1.chime('10100x')
            }).toThrow(new Error("Invalid device ID format"));
        });
    });
    describe('.chime', function () {
        beforeEach(function () {
            chime1 = new rfxcom.Chime1(device, rfxcom.chime1.SELECT_PLUS);
        });
        it('should send the correct bytes to the serialport', function (done) {
            var sentCommandId;
            chime1.chime('0x3ff', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x07, 0x16, 0x02, 0x00, 0x00, 0x03, 0xFF, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should accept the highest allowed address', function (done) {
            var sentCommandId;
            chime1.chime('0x3fffff', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x07, 0x16, 0x02, 0x00, 0x3f, 0xFF, 0xFF, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should throw an error with an invalid device ID', function () {
            var sentCommandId;
            expect(function () {
                chime1.chime('0x400000')
            }).toThrow(new Error("Device ID 0x400000 outside valid range"));
        });
    });
    describe('.chime', function () {
        beforeEach(function () {
            chime1 = new rfxcom.Chime1(device, rfxcom.chime1.ENVIVO);
        });
        it('should send the correct bytes to the serialport', function (done) {
            var sentCommandId;
            chime1.chime('0x3ff', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x07, 0x16, 0x04, 0x00, 0x00, 0x03, 0xFF, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should send the correct bytes to the serialport', function (done) {
            var sentCommandId;
            chime1.chime('0xffffff', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x07, 0x16, 0x04, 0x00, 0xFF, 0xFF, 0xFF, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should throw an error with an invalid device ID', function () {
            var sentCommandId;
            expect(function () {
                chime1.chime('0x400/1')
            }).toThrow(new Error("Invalid device ID format"));
        });
    });
});
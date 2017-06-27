/* global require: false, beforeEach: false, describe: false, it: false, expect: false,
   spyOn: false, console: false
*/
var rfxcom = require('../lib'),
    matchers = require('./matchers'),
    FakeSerialPort = require('./helper');

describe('Curtain1 class', function () {
    var curtain1,
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
    describe('.open', function () {
        beforeEach(function () {
            curtain1 = new rfxcom.Curtain1(device, rfxcom.curtain1.HARRISON);
        });
        it('should send the correct bytes to the serialport', function (done) {
            var sentCommandId = NaN;
            curtain1.open('A1', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x07, 0x18, 0x00, 0x00, 0x41, 0x01, 0x00, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should accept an array deviceId', function (done) {
            var sentCommandId = NaN;
            curtain1.open(['A', '1'], function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x07, 0x18, 0x00, 0x00, 0x41, 0x01, 0x00, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should log the bytes being sent in debug mode', function (done) {
            var debugDevice = new rfxcom.RfxCom('/dev/ttyUSB0', {
                    port:  fakeSerialPort,
                    debug: true
                }),
                curtain = new rfxcom.Curtain1(debugDevice, rfxcom.curtain1.HARRISON),
                consoleSpy = spyOn(console, 'log');
            debugDevice.connected = true;
            curtain.open('a1', done);
            expect(consoleSpy).toHaveBeenCalledWith('[rfxcom] on /dev/ttyUSB0 - Sent    : 07,18,00,00,41,01,00,00');
            debugDevice.acknowledge[0]();
        });
        it('should throw an exception with an invalid format deviceId', function () {
            expect(function () {
                curtain1.open(['A', '1', 1]);
            }).toThrow("Invalid deviceId format");
        });
        it('should throw an exception with houseCode < \'A\'', function () {
            expect(function () {
                curtain1.open(['@', '1']);
            }).toThrow("Invalid house code '@'");
        });
        it('should accept house code \'P\'', function (done) {
            var sentCommandId = NaN;
            curtain1.open('P1', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x07, 0x18, 0x00, 0x00, 0x50, 0x01, 0x00, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should throw an exception with houseCode > \'P\'', function () {
            expect(function () {
                curtain1.open(['q', '1']);
            }).toThrow("Invalid house code 'q'");
        });
        it('should throw an exception with unitCode < 1', function () {
            expect(function () {
                curtain1.open(['d', '0']);
            }).toThrow("Invalid unit code 0");
        });
        it('should throw an exception with a unitCode > 16', function () {
            expect(function () {
                curtain1.open(['d', '17']);
            }).toThrow("Invalid unit code 17");
        });
        it('should handle no callback', function () {
            curtain1.open('A16');
            expect(fakeSerialPort).toHaveSent([0x07, 0x18, 0x00, 0x00, 0x41, 0x10, 0x00, 0x00]);
        });
    });
    describe('.close', function () {
        beforeEach(function () {
            curtain1 = new rfxcom.Curtain1(device, rfxcom.curtain1.HARRISON);
        });
        it('should send the correct bytes to the serialport', function (done) {
            var sentCommandId = NaN;
            curtain1.close('E1', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x07, 0x18, 0x00, 0x00, 0x45, 0x01, 0x01, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
    });
    describe('.stop', function () {
        beforeEach(function () {
            curtain1 = new rfxcom.Curtain1(device, rfxcom.curtain1.HARRISON);
        });
        it('should send the correct bytes to the serialport', function (done) {
            var sentCommandId = NaN;
            curtain1.stop('A01', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x07, 0x18, 0x00, 0x00, 0x41, 0x01, 0x02, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
    });
    describe('.program', function () {
        beforeEach(function () {
            curtain1 = new rfxcom.Curtain1(device, rfxcom.curtain1.HARRISON);
        });
        it('should send the correct bytes to the serialport', function (done) {
            var sentCommandId = NaN;
            curtain1.program('A01', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x07, 0x18, 0x00, 0x00, 0x41, 0x01, 0x03, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
    });

});

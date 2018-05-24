/* global require: false, beforeEach: false, describe: false, it: false, expect: false */
const rfxcom = require('../lib'),
    util = require('util'),
    matchers = require('./matchers'),
    FakeSerialPort = require('./helper');

beforeEach(function () {
    this.addMatchers({
        toHaveSent: matchers.toHaveSent
    });
});

describe('Lighting6 class', function () {
    var lighting6,
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
                lighting6 = new rfxcom.Lighting6(device);
            }).toThrow("Must provide a subtype.");
        });
    });
    describe('.switchOn', function () {
        beforeEach(function () {
            lighting6 = new rfxcom.Lighting6(device, rfxcom.lighting6.BLYSS);
        });
        it('should send the correct bytes to the serialport', function (done) {
            var sentCommandId = NaN;
            lighting6.switchOn('0xF09A/B/1', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x0b, 0x15, 0x00, 0x00, 0xF0, 0x9A, 0x42, 0x01, 0x00, 0x00, 0x00, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should log the bytes being sent in debug mode', function (done) {
            var debugDevice = new rfxcom.RfxCom('/dev/ttyUSB0', {
                    port:  fakeSerialPort,
                    debug: true
                }),
                debug = new rfxcom.Lighting6(debugDevice, rfxcom.lighting6.BLYSS);
            debugDevice.connected = true;
            const utilLogSpy = spyOn(util, 'log');
            debug.switchOn('0xF09A/B/1', function () {
                done();
            });
            expect(utilLogSpy).toHaveBeenCalledWith('[rfxcom] on /dev/ttyUSB0 - Sent    : 0B,15,00,00,F0,9A,42,01,00,00,00,00');
            debugDevice.acknowledge[0]();
        });
        it('should accept an array address', function (done) {
            var sentCommandId = NaN;
            lighting6.switchOff(['0xF09A', 'B', '1'], function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x0b, 0x15, 0x00, 0x00, 0xF0, 0x9A, 0x42, 0x01, 0x01, 0x00, 0x00, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should accept an group address to switch off', function (done) {
            var sentCommandId = NaN;
            lighting6.switchOff(['0xF09A', 'B', '0'], function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x0b, 0x15, 0x00, 0x00, 0xF0, 0x9A, 0x42, 0x00, 0x03, 0x00, 0x00, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should accept an group address to switch on', function (done) {
            var sentCommandId = NaN;
            lighting6.switchOn(['0xF09A', 'B', '0'], function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x0b, 0x15, 0x00, 0x00, 0xF0, 0x9A, 0x42, 0x00, 0x02, 0x00, 0x00, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should accept the highest ID, group code & unit code numbers', function (done) {
            var sentCommandId = NaN;
            lighting6.switchOn(['0xFFFF', 'P', '5'], function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x0b, 0x15, 0x00, 0x00, 0xff, 0xff, 0x50, 0x05, 0x00, 0x00, 0x00, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should throw an exception with an invalid group code', function () {
            expect(function () {
                lighting6.switchOn(['0xFFFF', 'Q', '5']);
            }).toThrow("Invalid group code 'Q'");
        });
        it('should throw an exception with an invalid unit code', function () {
            expect(function () {
                lighting6.switchOn(['0xFFFF', 'P', '6']);
            }).toThrow("Invalid unit number 6");
        });
        it('should throw an exception with a badly formatted deviceId', function () {
            expect(function () {
                lighting6.switchOn('0xF09AC8');
            }).toThrow("Invalid deviceId format");
        });
    });
});

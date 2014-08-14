/* global require: false, beforeEach: false, describe: false, it: false, expect: false */
var rfxcom = require('../lib'),
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
    });
    describe('instantiation', function () {
        it('should throw an error if no subtype is specified', function () {
            expect(function () {
                lighting6 = new rfxcom.Lighting6(device);
            }).toThrow(new Error('Must provide a subtype.'));
        });
    });
    describe('.switchOn', function () {
        beforeEach(function () {
            lighting6 = new rfxcom.Lighting6(device, rfxcom.lighting6.BLYSS);
        });
        it('should send the correct bytes to the serialport', function (done) {
            var sentCommandId;
            lighting6.switchOn('0xF09A/B/1', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x0b, 0x15, 0x00, 0x00, 0xF0, 0x9A, 0x42, 0x01, 0x00, 0x00, 0x00, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should accept an array address', function (done) {
            var sentCommandId;
            lighting6.switchOff(['0xF09A', 'B', '1'], function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x0b, 0x15, 0x00, 0x00, 0xF0, 0x9A, 0x42, 0x01, 0x01, 0x00, 0x00, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should accept an group address to switch off', function (done) {
            var sentCommandId;
            lighting6.switchOff(['0xF09A', 'B', '0'], function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x0b, 0x15, 0x00, 0x00, 0xF0, 0x9A, 0x42, 0x00, 0x03, 0x00, 0x00, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should accept an group address to switch on', function (done) {
            var sentCommandId;
            lighting6.switchOn(['0xF09A', 'B', '0'], function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x0b, 0x15, 0x00, 0x00, 0xF0, 0x9A, 0x42, 0x00, 0x02, 0x00, 0x00, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should accept the highest ID, group code & unit code numbers', function (done) {
            var sentCommandId;
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
            }).toThrow(new Error("Invalid group code 'Q'"));
        });
        it('should throw an exception with an invalid unit code', function () {
            expect(function () {
                lighting6.switchOn(['0xFFFF', 'P', '6']);
            }).toThrow(new Error("Invalid unit number 6"));
        });
        it('should throw an exception with a badly formatted deviceId', function () {
            expect(function () {
                lighting6.switchOn('0xF09AC8');
            }).toThrow(new Error('Invalid deviceId format'));
        });
    });
});

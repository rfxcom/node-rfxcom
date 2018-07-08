/* global require: false, beforeEach: false, describe: false, it: false, expect: false,
   spyOn: false, console: false
*/
const rfxcom = require('../lib'),
    util = require('util'),
    matchers = require('./matchers'),
    FakeSerialPort = require('./helper');

describe('Lighting2 class', function () {
    let lighting2,
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
                lighting2 = new rfxcom.Lighting2(device);
            }).toThrow("Must provide a subtype.");
        });
    });
    describe('.switchOn', function () {
        beforeEach(function () {
            lighting2 = new rfxcom.Lighting2(device, rfxcom.lighting2.ANSLUT);
        });
        it('should send the correct bytes to the serialport', function (done) {
            let sentCommandId = NaN;
            lighting2.switchOn('0x03FFFFFF/1', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x0B, 0x11, 0x02, 0x00, 0x03, 0xFF, 0xFF, 0xFF, 0x01, 0x01, 0x0F, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should accept an array deviceId', function (done) {
            let sentCommandId = NaN;
            lighting2.switchOn(['0x03FFFFFF', '1'], function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x0B, 0x11, 0x02, 0x00, 0x03, 0xFF, 0xFF, 0xFF, 0x01, 0x01, 0x0F, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should handle a group address correctly', function (done) {
            let sentCommandId = NaN;
            lighting2.switchOn(['0x03FFFFFF', '0'], function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x0B, 0x11, 0x02, 0x00, 0x03, 0xFF, 0xFF, 0xFF, 0x01, 0x04, 0x0F, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should log the bytes being sent in debug mode', function (done) {
            const debugDevice = new rfxcom.RfxCom('/dev/ttyUSB0', {
                    port:  fakeSerialPort,
                    debug: true
                }),
                debugLight = new rfxcom.Lighting2(debugDevice, rfxcom.lighting2.ANSLUT);
            debugDevice.connected = true;
            const utilLogSpy = spyOn(util, 'log');
            debugLight.switchOn('0x03FFFFFF/1', done);
            expect(utilLogSpy).toHaveBeenCalledWith('[rfxcom] on /dev/ttyUSB0 - Sent    : 0B,11,02,00,03,FF,FF,FF,01,01,0F,00');
            debugDevice.acknowledge[0]();
        });
        it('should throw an exception with a badly formatted deviceId', function () {
            expect(function () {
                lighting2.switchOn('0xF09AC8');
            }).toThrow("Invalid deviceId format");
        });
        it('should throw an exception with an invalid deviceId', function () {
            expect(function () {
                lighting2.switchOn('0x0FF09AC8/1');
            }).toThrow("Device ID 0xff09ac8 outside valid range");
        });
        it('should handle no callback', function () {
            lighting2.switchOn('0x03FFFFFF/1');
            expect(fakeSerialPort).toHaveSent([0x0b, 0x11, 2, 0, 3, 0xff, 0xff, 0xff, 1, 1, 0xf, 0]);
        });
    });
    describe('.switchOff', function () {
        beforeEach(function () {
            lighting2 = new rfxcom.Lighting2(device, rfxcom.lighting2.ANSLUT);
        });
        it('should send the correct bytes to the serialport', function (done) {
            let sentCommandId = NaN;
            lighting2.switchOff('0x03FFFFFF/1', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x0b, 0x11, 2, 0, 3, 0xff, 0xff, 0xff, 1, 0, 0, 0]);
            expect(sentCommandId).toEqual(0);
        });
        it('should handle a group address correctly', function (done) {
            let sentCommandId = NaN;
            lighting2.switchOff(['0x03FFFFFF', '0'], function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x0B, 0x11, 0x02, 0x00, 0x03, 0xFF, 0xFF, 0xFF, 0x01, 0x03, 0x00, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should handle no callback', function () {
            lighting2.switchOff('0x03FFFFFF/1');
            expect(fakeSerialPort).toHaveSent([0x0b, 0x11, 2, 0, 3, 0xff, 0xff, 0xff, 1, 0, 0, 0]);
        });
    });
    describe('.setLevel', function () {
        beforeEach(function () {
            lighting2 = new rfxcom.Lighting2(device, rfxcom.lighting2.ANSLUT);
        });
        it('should send the correct bytes to the serialport', function (done) {
            let sentCommandId = NaN;
            lighting2.setLevel('0x03FFFFFF/1', 7, function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0xb, 0x11, 2, 0, 3, 0xff, 0xff, 0xff, 1, 2, 7, 0]);
            expect(sentCommandId).toEqual(0);
        });
        it('should handle a group address correctly', function (done) {
            let sentCommandId = NaN;
            lighting2.setLevel(['0x03FFFFFF', '0'], 7, function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x0B, 0x11, 0x02, 0x00, 0x03, 0xFF, 0xFF, 0xFF, 0x01, 0x05, 0x07, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should throw an exception with an invalid level value', function () {
            expect(function () {
                lighting2.setLevel('0x03FFFFFF/1', 0x10);
            }).toThrow("Invalid level: value must be in range 0-15");
        });
        it('should handle no callback', function () {
            lighting2.setLevel('0x03FFFFFF/1', 5);
            expect(fakeSerialPort).toHaveSent([0x0b, 0x11, 2, 0, 3, 0xff, 0xff, 0xff, 1, 2, 5, 0]);
        });
    });
    describe('.kambrook', function () {
        beforeEach(function () {
            lighting2 = new rfxcom.Lighting2(device, rfxcom.lighting2.KAMBROOK);
        });
        it('should send the correct bytes to the serialport for switchOn', function (done) {
            let sentCommandId = NaN;
            lighting2.switchOn('A/0xFFFFFF/1', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x0B, 0x11, 0x03, 0x00, 0x00, 0xFF, 0xFF, 0xFF, 0x01, 0x01, 0x0F, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should send the correct bytes to the serialport for switchOff', function (done) {
            let sentCommandId = NaN;
            lighting2.switchOff(['A', '0xFFFFFF', '1'], function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x0B, 0x11, 0x03, 0x00, 0x00, 0xFF, 0xFF, 0xFF, 0x01, 0x00, 0x00, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should throw an exception with a group address', function () {
            expect(function () {
                lighting2.switchOn('A/0xFFFFFF/0');
            }).toThrow("Subtype doesn't support group commands");
        });
        it('should throw an exception with a badly formatted deviceId', function () {
            expect(function () {
                lighting2.switchOn('0xF09AC8');
            }).toThrow("Invalid deviceId format");
        });
        it('should throw an exception with an invalid house code', function () {
            expect(function () {
                lighting2.switchOn('q/0xFFFFFF/1');
            }).toThrow("Invalid house code 'q'");
        });
        it('should throw an exception with an invalid remote ID', function () {
            expect(function () {
                lighting2.switchOn('A/0x1FFFFFF/1');
            }).toThrow("Remote ID 0x1ffffff outside valid range");
        });
        it('should throw an exception with an invalid unit code', function () {
            expect(function () {
                lighting2.switchOn('A/0xFFFFFF/42');
            }).toThrow("Invalid unit code 42");
        });
    });
});

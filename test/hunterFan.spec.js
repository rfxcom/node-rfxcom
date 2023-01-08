const rfxcom = require('../lib'),
    matchers = require('./matchers'),
    FakeSerialPort = require('./helper');

describe('HunterFan class', function () {
    let hunterFan = {},
        fakeSerialPort = {},
        device = {};
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
        device.acknowledge.forEach(acknowledge => {
            if (typeof acknowledge === "function") {
                acknowledge()
            }
        });
    });
    describe('HUNTER_FAN', function () {
        beforeEach(function () {
            hunterFan = new rfxcom.HunterFan(device, rfxcom.hunterFan.HUNTER_FAN);
        });
        describe('commands:', function () {
            describe('switchOff()', function () {
                it('should send the correct bytes to the serialport for switchOff', function (done) {
                    let sentCommandId = NaN;
                    hunterFan.switchOff('0x123456789abc', function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x0B, 0x1F, 0x00, 0x00, 0x12, 0x34, 0x56, 0x78, 0x9a, 0xbc, 0x01, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
            });
            describe('setSpeed()', function () {
                it('should send the correct bytes to the serialport for speed 0', function (done) {
                    let sentCommandId = NaN;
                    hunterFan.setSpeed('0x123456789abc', 0, function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x0B, 0x1F, 0x00, 0x00, 0x12, 0x34, 0x56, 0x78, 0x9a, 0xbc, 0x01, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
                it('should send the correct bytes to the serialport for speed 1', function (done) {
                    let sentCommandId = NaN;
                    hunterFan.setSpeed('0x123456789abc', 1, function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x0B, 0x1F, 0x00, 0x00, 0x12, 0x34, 0x56, 0x78, 0x9a, 0xbc, 0x03, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
                it('should send the correct bytes to the serialport for speed 2', function (done) {
                    let sentCommandId = NaN;
                    hunterFan.setSpeed('0x123456789abc', 2, function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x0B, 0x1F, 0x00, 0x00, 0x12, 0x34, 0x56, 0x78, 0x9a, 0xbc, 0x04, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
                it('should send the correct bytes to the serialport for speed 3', function (done) {
                    let sentCommandId = NaN;
                    hunterFan.setSpeed('0x123456789abc', 3, function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x0B, 0x1F, 0x00, 0x00, 0x12, 0x34, 0x56, 0x78, 0x9a, 0xbc, 0x05, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
            });
            describe('toggleLightOnOff()', function () {
                it('should send the correct bytes to the serialport for toggleLightOnOff', function (done) {
                    let sentCommandId = NaN;
                    hunterFan.toggleLightOnOff('0x123456789abc', function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x0B, 0x1F, 0x00, 0x00, 0x12, 0x34, 0x56, 0x78, 0x9a, 0xbc, 0x02, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
            });
            describe('program()', function () {
                it('should send the correct bytes to the serialport for program', function (done) {
                    let sentCommandId = NaN;
                    hunterFan.program('0x123456789abc', function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x0B, 0x1F, 0x00, 0x00, 0x12, 0x34, 0x56, 0x78, 0x9a, 0xbc, 0x06, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
            });
        });
        describe('address checking:', function () {
            it('should throw an exception with an invalid deviceId format', function () {
                expect(function () {
                    hunterFan.toggleLightOnOff('0x1/A/2');
                }).toThrow(new Error(("Invalid deviceId format")));
            });
            it('should accept the highest address value', function (done) {
                let sentCommandId = NaN;
                hunterFan.toggleLightOnOff('0xffffffffffff', function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0B, 0x1F, 0x00, 0x00, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0x02, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should accept the lowest address value', function (done) {
                let sentCommandId = NaN;
                hunterFan.toggleLightOnOff('0x1', function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0B, 0x1F, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01, 0x02, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should throw an exception with an invalid address 0x1000000000000', function () {
                expect(function () {
                    hunterFan.toggleLightOnOff('0x1000000000000');
                }).toThrow(new Error(("Address 0x1000000000000 outside valid range")));
            });
            it('should throw an exception with an invalid address 0', function () {
                expect(function () {
                    hunterFan.toggleLightOnOff('0');
                }).toThrow(new Error(("Address 0x0 outside valid range")));
            });
            it('should throw an exception with an invalid address -1', function () {
                expect(function () {
                    hunterFan.toggleLightOnOff('-1');
                }).toThrow(new Error(("Address -0x1 outside valid range")));
            });
        });
    });
});
/**
 * Created by max on 12/07/2017.
 */
const rfxcom = require('../lib'),
    matchers = require('./matchers'),
    FakeSerialPort = require('./helper');

describe('Thermostat2 class', function () {
    let thermostat = {},
        fakeSerialPort = {},
        device = {};
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
    describe('HE105', function () {
        beforeEach(function () {
            thermostat = new rfxcom.Thermostat2(device, rfxcom.thermostat2.HE105);
        });
        describe('commands', function () {
            describe('switchOn()', function () {
                it('should send the correct bytes to the serialport', function (done) {
                    let sentCommandId = NaN;
                    thermostat.switchOn('0x12', function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x06, 0x41, 0x00, 0x00, 0x12, 0x01, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
            });
            describe('switchOff()', function () {
                it('should send the correct bytes to the serialport', function (done) {
                    let sentCommandId = NaN;
                    thermostat.switchOff('0x12', function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x06, 0x41, 0x00, 0x00, 0x12, 0x00, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
            });
            describe('program()', function () {
                it('should throw an error with an invalid temperature', function () {
                    expect(function () {
                        thermostat.program('0x12');
                    }).toThrow("Device does not support program()");
                });

            });
        });
        describe('address checking', function () {
            it('should throw an exception with an invalid deviceId format', function () {
                expect(function () {
                    thermostat.switchOn('0x1234/A');
                }).toThrow("Invalid deviceId format");
            });
            it('should accept the highest address', function (done) {
                let sentCommandId = NaN;
                thermostat.switchOn('0x1f', function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x06, 0x41, 0x00, 0x00, 0x1f, 0x01, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should accept the lowest address', function (done) {
                let sentCommandId = NaN;
                thermostat.switchOn('0x0', function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x06, 0x41, 0x00, 0x00, 0x00, 0x01, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should throw an exception with an invalid address 0x20', function () {
                expect(function () {
                    thermostat.switchOn('0x20');
                }).toThrow("Address 0x20 outside valid range");
            });
        });
    });
    describe('RTS10_RFS10_TLX1206', function () {
        beforeEach(function () {
            thermostat = new rfxcom.Thermostat2(device, rfxcom.thermostat2.RTS10_RFS10_TLX1206);
        });
        describe('commands', function () {
            describe('switchOn()', function () {
                it('should send the correct bytes to the serialport', function (done) {
                    let sentCommandId = NaN;
                    thermostat.switchOn('0x12', function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x06, 0x41, 0x01, 0x00, 0x12, 0x01, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
            });
            describe('switchOff()', function () {
                it('should send the correct bytes to the serialport', function (done) {
                    let sentCommandId = NaN;
                    thermostat.switchOff('0x12', function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x06, 0x41, 0x01, 0x00, 0x12, 0x00, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
            });
            describe('program()', function () {
                it('should send the correct bytes to the serialport', function (done) {
                    let sentCommandId = NaN;
                    thermostat.program('0x12', function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x06, 0x41, 0x01, 0x00, 0x12, 0x02, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
            });
        });
        describe('address checking', function () {
            it('should throw an exception with an invalid deviceId format', function () {
                expect(function () {
                    thermostat.switchOn('0x1234/A');
                }).toThrow("Invalid deviceId format");
            });
            it('should accept the highest address', function (done) {
                let sentCommandId = NaN;
                thermostat.switchOn('0x1f', function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x06, 0x41, 0x01, 0x00, 0x1f, 0x01, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should accept the lowest address', function (done) {
                let sentCommandId = NaN;
                thermostat.switchOn('0x0', function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x06, 0x41, 0x01, 0x00, 0x00, 0x01, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should throw an exception with an invalid address 0x20', function () {
                expect(function () {
                    thermostat.switchOn('0x20');
                }).toThrow("Address 0x20 outside valid range");
            });
        });
    });
});
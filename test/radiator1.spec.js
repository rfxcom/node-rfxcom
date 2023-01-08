/**
 * Created by max on 14/07/2017.
 */
const rfxcom = require('../lib'),
    matchers = require('./matchers'),
    FakeSerialPort = require('./helper');

describe('Radiator1 class', function () {
    let radiator = {},
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
        device.acknowledge.forEach(acknowledge => {if (typeof acknowledge === "function") {acknowledge()}});
    });
    describe('SMARTWARES', function () {
        beforeEach(function () {
            radiator = new rfxcom.Radiator1(device, rfxcom.radiator1.SMARTWARES);
        });
        describe('commands', function () {
            describe('setNightMode()', function () {
                it('should send the correct bytes to the serialport', function (done) {
                    let sentCommandId = NaN;
                    radiator.setNightMode('0x1234567/8', function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x0c, 0x48, 0x00, 0x00, 0x01, 0x23, 0x45, 0x67, 0x08, 0x00, 0x00, 0x00, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
            });
            describe('setDayMode()', function () {
                it('should send the correct bytes to the serialport', function (done) {
                    let sentCommandId = NaN;
                    radiator.setDayMode('0x1234567/8', function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x0c, 0x48, 0x00, 0x00, 0x01, 0x23, 0x45, 0x67, 0x08, 0x01, 0x00, 0x00, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
            });
            describe('setTemperature()', function () {
                it('should send the correct bytes to the serialport with a valid setpoint', function (done) {
                    let sentCommandId = NaN;
                    radiator.setTemperature('0x1234567/8', 22.0, function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x0c, 0x48, 0x00, 0x00, 0x01, 0x23, 0x45, 0x67, 0x08, 0x02, 0x16, 0x00, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
                it('should send the correct bytes to the serialport with a half-integral setpoint', function (done) {
                    let sentCommandId = NaN;
                    radiator.setTemperature('0x1234567/8', 22.5, function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x0c, 0x48, 0x00, 0x00, 0x01, 0x23, 0x45, 0x67, 0x08, 0x02, 0x16, 0x05, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
                it('should limit the setpoint to a minimum of 5˚C', function (done) {
                    let sentCommandId = NaN;
                    radiator.setTemperature('0x1234567/8', 0.0, function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x0c, 0x48, 0x00, 0x00, 0x01, 0x23, 0x45, 0x67, 0x08, 0x02, 0x05, 0x00, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
                it('should limit the setpoint to a maximum of 28˚C', function (done) {
                    let sentCommandId = NaN;
                    radiator.setTemperature('0x1234567/8', 50.0, function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x0c, 0x48, 0x00, 0x00, 0x01, 0x23, 0x45, 0x67, 0x08, 0x02, 0x1C, 0x00, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
                it('should throw an exception with a missing setpoint', function () {
                    expect(function () {
                        radiator.setTemperature('0x1234567/8');
                    }).toThrow(new Error(("Invalid temperature: must be a number in range 5.0-28.0")));
                });
                it('should throw an exception with a setpoint in the wrong format', function () {
                    expect(function () {
                        radiator.setTemperature('0x1234567/8', "28.2");
                    }).toThrow(new Error(("Invalid temperature: must be a number in range 5.0-28.0")));
                });
            });
        });
        describe('address checking', function () {
            it('should throw an exception with an invalid deviceId format', function () {
                expect(function () {
                    radiator.setDayMode('0x1234');
                }).toThrow(new Error(("Invalid deviceId format")));
            });
            it('should accept the highest address & unit code', function (done) {
                let sentCommandId = NaN;
                radiator.setDayMode('0x3ffffff/16', function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0c, 0x48, 0x00, 0x00, 0x03, 0xff, 0xff, 0xff, 0x10, 0x01, 0x00, 0x00, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should accept the lowest address & unit code', function (done) {
                let sentCommandId = NaN;
                radiator.setDayMode('0x1/1', function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0c, 0x48, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01, 0x01, 0x01, 0x00, 0x00, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should throw an exception with an invalid address 0x4000000', function () {
                expect(function () {
                    radiator.setDayMode('0x4000000/8');
                }).toThrow(new Error(("Address 0x4000000 outside valid range")));
            });
            it('should throw an exception with an invalid address 0x0', function () {
                expect(function () {
                    radiator.setDayMode('0x0/8');
                }).toThrow(new Error(("Address 0x0 outside valid range")));
            });
            it('should throw an exception with an invalid unit code 0', function () {
                expect(function () {
                    radiator.setDayMode('0x1234567/0');
                }).toThrow(new Error(("Invalid unit code 0")));
            });
            it('should throw an exception with an invalid unit code 17', function () {
                expect(function () {
                    radiator.setDayMode('0x1234567/17');
                }).toThrow(new Error(("Invalid unit code 17")));
            });
        });
    });
});
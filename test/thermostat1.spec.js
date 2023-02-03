/**
 * Created by max on 12/07/2017.
 */
const rfxcom = require('../lib'),
    matchers = require('./matchers'),
    FakeSerialPort = require('./helper');

describe('Thermostat1 class', function () {
    let thermostat = {},
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
    describe('DIGIMAX_TLX7506', function () {
        beforeEach(function () {
            thermostat = new rfxcom.Thermostat1(device, rfxcom.thermostat1.DIGIMAX_TLX7506);
        });
        describe('commands', function () {
            describe('sendMessage()', function () {
                it('should send the correct bytes to the serialport', function (done) {
                    let sentCommandId = NaN;
                    thermostat.sendMessage('0x1234', {temperature:24.5, setpoint:22.5, status:2, mode:0}, function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x09, 0x40, 0x00, 0x00, 0x12, 0x34, 0x19, 0x17, 0x02, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
                it('should handle string "mode" and "status" parameters', function (done) {
                    let sentCommandId = NaN;
                    thermostat.sendMessage('0x1234', {temperature:24.5, setpoint:22.5, status:"No Demand", mode:"Heating"}, function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x09, 0x40, 0x00, 0x00, 0x12, 0x34, 0x19, 0x17, 0x02, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
                it('should throw an error with an invalid temperature', function () {
                    expect(function () {
                        thermostat.sendMessage('0x1234', {temperature:99, setpoint:22.5, status:2, mode:0});
                    }).toThrow(new Error(("Invalid parameter temperature: must be in range 0-50")));
                });
                it('should throw an error with an invalid setpoint', function () {
                    expect(function () {
                        thermostat.sendMessage('0x1234', {temperature:24.5, setpoint:47, status:2, mode:0});
                    }).toThrow(new Error(("Invalid parameter setpoint: must be in range 5-45")));
                });
                it('should throw an error with an invalid status', function () {
                    expect(function () {
                        thermostat.sendMessage('0x1234', {temperature:24.5, setpoint:22.5, status:5, mode:0});
                    }).toThrow(new Error(("Invalid parameter status: must be in range 0-3")));
                });
                it('should throw an error with an invalid mode', function () {
                    expect(function () {
                        thermostat.sendMessage('0x1234', {temperature:24.5, setpoint:22.5, status:2, mode:-1});
                    }).toThrow(new Error(("Invalid parameter mode: must be 0 or 1")));
                });
            });
        });
        describe('address checking', function () {
            it('should throw an exception with an invalid deviceId format', function () {
                expect(function () {
                    thermostat.sendMessage('0x1234/A', {temperature:24.5, setpoint:22.5, status:2, mode:0});
                }).toThrow(new Error(("Invalid deviceId format")));
            });
            it('should accept the highest address', function (done) {
                let sentCommandId = NaN;
                thermostat.sendMessage('0xffff', {temperature:24.5, setpoint:22.5, status:2, mode:0}, function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x09, 0x40, 0x00, 0x00, 0xff, 0xff, 0x19, 0x17, 0x02, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should accept the lowest address', function (done) {
                let sentCommandId = NaN;
                thermostat.sendMessage('0x0', {temperature:24.5, setpoint:22.5, status:2, mode:0}, function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x09, 0x40, 0x00, 0x00, 0x00, 0x00, 0x19, 0x17, 0x02, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should throw an exception with an invalid address 0x10000', function () {
                expect(function () {
                    thermostat.sendMessage('0x10000', {temperature:24.5, setpoint:22.5, status:2, mode:0});
                }).toThrow(new Error(("Address 0x10000 outside valid range")));
            });
        });
    });
    describe('DIGIMAX_SHORT', function () {
        beforeEach(function () {
            thermostat = new rfxcom.Thermostat1(device, rfxcom.thermostat1.DIGIMAX_SHORT);
        });
        describe('commands', function () {
            describe('sendMessage()', function () {
                it('should send the correct bytes to the serialport', function (done) {
                    let sentCommandId = NaN;
                    thermostat.sendMessage('0x1234', {temperature:24.5, setpoint:22.5, status:2, mode:0}, function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x09, 0x40, 0x01, 0x00, 0x12, 0x34, 0x19, 0x00, 0x02, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
                it('should throw an error with an invalid temperature', function () {
                    expect(function () {
                        thermostat.sendMessage('0x1234', {temperature:99, setpoint:22.5, status:2, mode:0});
                    }).toThrow(new Error(("Invalid parameter temperature: must be in range 0-50")));
                });
                it('should not throw an error with an invalid setpoint', function (done) {
                    let sentCommandId = NaN;
                    thermostat.sendMessage('0x1234', {temperature:24.5, setpoint:47, status:2, mode:0}, function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x09, 0x40, 0x01, 0x00, 0x12, 0x34, 0x19, 0x00, 0x02, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
                it('should throw an error with an invalid status', function () {
                    expect(function () {
                        thermostat.sendMessage('0x1234', {temperature:24.5, setpoint:22.5, status:5, mode:0});
                    }).toThrow(new Error(("Invalid parameter status: must be in range 0-3")));
                });
                it('should throw an error with an invalid mode', function () {
                    expect(function () {
                        thermostat.sendMessage('0x1234', {temperature:24.5, setpoint:22.5, status:2, mode:-1});
                    }).toThrow(new Error(("Invalid parameter mode: must be 0 or 1")));
                });
            });
        });
        describe('address checking', function () {
            it('should throw an exception with an invalid deviceId format', function () {
                expect(function () {
                    thermostat.sendMessage('0x1234/A', {temperature:24.5, setpoint:22.5, status:2, mode:0});
                }).toThrow(new Error(("Invalid deviceId format")));
            });
            it('should accept the highest address', function (done) {
                let sentCommandId = NaN;
                thermostat.sendMessage('0xffff', {temperature:24.5, setpoint:22.5, status:2, mode:0}, function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x09, 0x40, 0x01, 0x00, 0xff, 0xff, 0x19, 0x00, 0x02, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should accept the lowest address', function (done) {
                let sentCommandId = NaN;
                thermostat.sendMessage('0x0', {temperature:24.5, setpoint:22.5, status:2, mode:0}, function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x09, 0x40, 0x01, 0x00, 0x00, 0x00, 0x19, 0x00, 0x02, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should throw an exception with an invalid address 0x10000', function () {
                expect(function () {
                    thermostat.sendMessage('0x10000', {temperature:24.5, setpoint:22.5, status:2, mode:0});
                }).toThrow(new Error(("Address 0x10000 outside valid range")));
            });
        });
    });
});

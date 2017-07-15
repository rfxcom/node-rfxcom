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
    describe('DIGIMAX_TLX7506', function () {
        beforeEach(function () {
            thermostat = new rfxcom.Thermostat1(device, rfxcom.thermostat1.DIGIMAX_TLX7506);
        });
        describe('commands', function () {
            describe('sendMessage()', function () {
                it('should send the correct bytes to the serialport', function (done) {
                    let sentCommandId = NaN;
                    thermostat.sendMessage('0x1234', 24.5, 22.5, 2, 0, function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x09, 0x40, 0x00, 0x00, 0x12, 0x34, 0x19, 0x17, 0x02, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
                it('should throw an error with an invalid temperature', function () {
                    expect(function () {
                        thermostat.sendMessage('0x1234', 99, 22.5, 2, 0);
                    }).toThrow("Invalid temperature: must be in range 0-50");
                });
                it('should throw an error with an invalid setpoint', function () {
                    expect(function () {
                        thermostat.sendMessage('0x1234', 24.5, 47, 2, 0);
                    }).toThrow("Invalid setpoint: must be in range 5-45");
                });
                it('should throw an error with an invalid status code', function () {
                    expect(function () {
                        thermostat.sendMessage('0x1234', 24.5, 22.5, 5, 0);
                    }).toThrow("Invalid status code: must be in range 0-3");
                });
                it('should throw an error with an invalid mode', function () {
                    expect(function () {
                        thermostat.sendMessage('0x1234', 24.5, 22.5, 2, -1);
                    }).toThrow("Invalid mode: must be 0 or 1");
                });
            });
        });
        describe('address checking', function () {
            it('should throw an exception with an invalid deviceId format', function () {
                expect(function () {
                    thermostat.sendMessage('0x1234/A', 24.5, 22.5, 2, 0);
                }).toThrow("Invalid deviceId format");
            });
            it('should accept the highest address', function (done) {
                let sentCommandId = NaN;
                thermostat.sendMessage('0xffff', 24.5, 22.5, 2, 0, function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x09, 0x40, 0x00, 0x00, 0xff, 0xff, 0x19, 0x17, 0x02, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should accept the lowest address', function (done) {
                let sentCommandId = NaN;
                thermostat.sendMessage('0x0', 24.5, 22.5, 2, 0, function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x09, 0x40, 0x00, 0x00, 0x00, 0x00, 0x19, 0x17, 0x02, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should throw an exception with an invalid address 0x10000', function () {
                expect(function () {
                    thermostat.sendMessage('0x10000', 24.5, 22.5, 2, 0);
                }).toThrow("Address 0x10000 outside valid range");
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
                    thermostat.sendMessage('0x1234', 24.5, 22.5, 2, 0, function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x09, 0x40, 0x01, 0x00, 0x12, 0x34, 0x19, 0x00, 0x02, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
                it('should throw an error with an invalid temperature', function () {
                    expect(function () {
                        thermostat.sendMessage('0x1234', 99, 22.5, 2, 0);
                    }).toThrow("Invalid temperature: must be in range 0-50");
                });
                it('should throw an error with an invalid setpoint', function () {
                    expect(function () {
                        thermostat.sendMessage('0x1234', 24.5, 47, 2, 0);
                    }).toThrow("Invalid setpoint: must be in range 5-45");
                });
                it('should throw an error with an invalid status code', function () {
                    expect(function () {
                        thermostat.sendMessage('0x1234', 24.5, 22.5, 5, 0);
                    }).toThrow("Invalid status code: must be in range 0-3");
                });
                it('should throw an error with an invalid mode', function () {
                    expect(function () {
                        thermostat.sendMessage('0x1234', 24.5, 22.5, 2, -1);
                    }).toThrow("Invalid mode: must be 0 or 1");
                });
            });
        });
        describe('address checking', function () {
            it('should throw an exception with an invalid deviceId format', function () {
                expect(function () {
                    thermostat.sendMessage('0x1234/A', 24.5, 22.5, 2, 0);
                }).toThrow("Invalid deviceId format");
            });
            it('should accept the highest address', function (done) {
                let sentCommandId = NaN;
                thermostat.sendMessage('0xffff', 24.5, 22.5, 2, 0, function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x09, 0x40, 0x01, 0x00, 0xff, 0xff, 0x19, 0x00, 0x02, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should accept the lowest address', function (done) {
                let sentCommandId = NaN;
                thermostat.sendMessage('0x0', 24.5, 22.5, 2, 0, function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x09, 0x40, 0x01, 0x00, 0x00, 0x00, 0x19, 0x00, 0x02, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should throw an exception with an invalid address 0x10000', function () {
                expect(function () {
                    thermostat.sendMessage('0x10000', 24.5, 22.5, 2, 0);
                }).toThrow("Address 0x10000 outside valid range");
            });
        });
    });
});

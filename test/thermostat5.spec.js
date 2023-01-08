/**
 * Created by max on 13/07/2017.
 */
const rfxcom = require('../lib'),
    matchers = require('./matchers'),
    FakeSerialPort = require('./helper');

describe('Thermostat5 class', function () {
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
    describe('GAZCO_RF290A', function () {
        beforeEach(function () {
            thermostat = new rfxcom.Thermostat5(device, rfxcom.thermostat5.GAZCO_RF290A);
        });
        describe('address checking', function () {
            const params = {mode: "Off"};
            it('should throw an exception with an invalid deviceId format', function () {
                expect(function () {
                    thermostat.sendMessage('0x1234/A', params);
                }).toThrow(new Error(("Invalid deviceId format")));
            });
            it('should accept the lowest address', function (done) {
                let sentCommandId = NaN;
                thermostat.sendMessage('0x1', params, function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0d, 0x44, 0x00, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x0e, 0x00, 0x00, 0x00, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should accept the highest address', function (done) {
                let sentCommandId = NaN;
                thermostat.sendMessage('0xffff', params, function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0d, 0x44, 0x00, 0x00, 0xff, 0xff, 0x00, 0x01, 0x00, 0x0e, 0x00, 0x00, 0x00, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should throw an exception with an invalid address 0x10000', function () {
                expect(function () {
                    thermostat.sendMessage('0x10000', params);
                }).toThrow(new Error(("Address 0x10000 outside valid range")));
            });
            it('should throw an exception with an invalid address 0x0', function () {
                expect(function () {
                    thermostat.sendMessage('0x0', params);
                }).toThrow(new Error(("Address 0x0 outside valid range")));
            });
        });
        describe('commands', function () {
            it('should throw an exception with a missing params', function () {
                expect(function() {
                    thermostat.sendMessage('0x1234');
                }).toThrow(new Error(("Missing params")));
            });
            it('should throw an exception with a missing mode', function () {
                const
                    params = {
                        flameBrightness: 0,
                        flameColour: 1,
                        fuelBrightness: 0,
                        fuelColour: 1,
                    };
                expect(function() {
                    thermostat.sendMessage('0x1234', params);
                }).toThrow(new Error(("mode parameter must be specified")));
            });
            it('should throw an exception with an invalid mode', function () {
                const
                    params = {
                        mode: 42,
                        flameBrightness: 0,
                        flameColour: 1,
                        fuelBrightness: 0,
                        fuelColour: 1,
                    };
                expect(function() {
                    thermostat.sendMessage('0x1234', params);
                }).toThrow(new Error(("Invalid parameter mode: must be in range 0-4")));
            });
            it('should throw an exception with an invalid mode string', function () {
                const
                    params = {
                        mode: "I am invalid!",
                        flameBrightness: 0,
                        flameColour: 1,
                        fuelBrightness: 0,
                        fuelColour: 1
                    };
                expect(function() {
                    thermostat.sendMessage('0x1234', params);
                }).toThrow(new Error(("Invalid parameter mode: 'I am invalid!'")));
            });
            it('should send the correct bytes to the serialport with all parameters at minimum values', function (done) {
                const
                    params = {
                        mode: 0,
                        flameBrightness: 0,
                        flameColour: 1,
                        fuelBrightness: 0,
                        fuelColour: 1
                    };
                let sentCommandId = NaN;
                thermostat.sendMessage('0x1234', params, function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0d, 0x44, 0x00, 0x00, 0x12, 0x34, 0x00, 0x01, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should send the correct bytes to the serialport with all parameters at maximum values', function (done) {
                const
                    params = {
                        mode: 4,
                        flameBrightness: 5,
                        flameColour: 3,
                        fuelBrightness: 5,
                        fuelColour: 14
                    };
                let sentCommandId = NaN;
                thermostat.sendMessage('0x1234', params, function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0d, 0x44, 0x00, 0x00, 0x12, 0x34, 0x04, 0x03, 0x05, 0x0e, 0x05, 0x00, 0x00, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should throw an exception with flame brightness = -1', function () {
                const
                    params = {
                        mode: "Standby",
                        flameBrightness: -1,
                        flameColour: 1,
                        fuelBrightness: 0,
                        fuelColour: 1
                    };
                expect(function() {
                    thermostat.sendMessage('0x1234', params);
                }).toThrow(new Error(("Invalid parameter flameBrightness: must be in range 0-5")));
            });
            it('should throw an exception with flame brightness = 6', function () {
                const
                    params = {
                        mode: "Low",
                        flameBrightness: 6,
                        flameColour: 1,
                        fuelBrightness: 0,
                        fuelColour: 1
                    };
                expect(function() {
                    thermostat.sendMessage('0x1234', params);
                }).toThrow(new Error(("Invalid parameter flameBrightness: must be in range 0-5")));
            });
            it('should throw an exception with flame colour = 0', function () {
                const
                    params = {
                        mode: "High",
                        flameBrightness: 2,
                        flameColour: 0,
                        fuelBrightness: 0,
                        fuelColour: 1
                    };
                expect(function() {
                    thermostat.sendMessage('0x1234', params);
                }).toThrow(new Error(("Invalid parameter flameColour: must be in range 1-3")));
            });
            it('should throw an exception with flame colour = 4', function () {
                const
                    params = {
                        mode: "Off",
                        flameBrightness: 2,
                        flameColour: 4,
                        fuelBrightness: 0,
                        fuelColour: 1
                    };
                expect(function() {
                    thermostat.sendMessage('0x1234', params);
                }).toThrow(new Error(("Invalid parameter flameColour: must be in range 1-3")));
            });
            it('should throw an exception with fuel brightness = -1', function () {
                const
                    params = {
                        mode: "Standby",
                        flameBrightness: 2,
                        flameColour: 2,
                        fuelBrightness: -1,
                        fuelColour: 1
                    };
                expect(function() {
                    thermostat.sendMessage('0x1234', params);
                }).toThrow(new Error(("Invalid parameter fuelBrightness: must be in range 0-5")));
            });
            it('should throw an exception with fuel brightness = 6', function () {
                const
                    params = {
                        mode: "Low",
                        flameBrightness: 2,
                        flameColour: 2,
                        fuelBrightness: 6,
                        fuelColour: 1
                    };
                expect(function() {
                    thermostat.sendMessage('0x1234', params);
                }).toThrow(new Error(("Invalid parameter fuelBrightness: must be in range 0-5")));
            });
            it('should throw an exception with fuel colour = 0', function () {
                const
                    params = {
                        mode: "High",
                        flameBrightness: 2,
                        flameColour: 2,
                        fuelBrightness: 2,
                        fuelColour: 0
                    };
                expect(function() {
                    thermostat.sendMessage('0x1234', params);
                }).toThrow(new Error(("Invalid parameter fuelColour: must be in range 1-14")));
            });
            it('should throw an exception with fuel colour = 15', function () {
                const
                    params = {
                        mode: "Off",
                        flameBrightness: 2,
                        flameColour: 2,
                        fuelBrightness: 2,
                        fuelColour: 15
                    };
                expect(function() {
                    thermostat.sendMessage('0x1234', params);
                }).toThrow(new Error(("Invalid parameter fuelColour: must be in range 1-14")));
            });
            it('should accept a numeric mode value 1', function (done) {
                let sentCommandId = NaN;
                thermostat.sendMessage('0x1234', {mode: 1}, function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0d, 0x44, 0x00, 0x00, 0x12, 0x34, 0x01, 0x01, 0x00, 0x0e, 0x00, 0x00, 0x00, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should accept a numeric mode value 2', function (done) {
                let sentCommandId = NaN;
                thermostat.sendMessage('0x1234', {mode: 2}, function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0d, 0x44, 0x00, 0x00, 0x12, 0x34, 0x02, 0x01, 0x00, 0x0e, 0x00, 0x00, 0x00, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should accept a numeric mode value 3', function (done) {
                let sentCommandId = NaN;
                thermostat.sendMessage('0x1234', {mode: 3}, function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0d, 0x44, 0x00, 0x00, 0x12, 0x34, 0x03, 0x01, 0x00, 0x0e, 0x00, 0x00, 0x00, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should accept a numeric mode value 4', function (done) {
                let sentCommandId = NaN;
                thermostat.sendMessage('0x1234', {mode: 4}, function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0d, 0x44, 0x00, 0x00, 0x12, 0x34, 0x04, 0x01, 0x00, 0x0e, 0x00, 0x00, 0x00, 0x00]);
                expect(sentCommandId).toEqual(0);
            });

        });
    });
});

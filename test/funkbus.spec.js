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

describe('FunkBus class', function () {
    let funkBus,
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
                funkBus = new rfxcom.FunkBus(device);
            }).toThrow("Must provide a subtype.");
        });
    });
    describe('INSTA', function () {
        beforeEach(function () {
            funkBus = new rfxcom.FunkBus(device, rfxcom.funkbus.INSTA);
        });
        describe('switchOn', function () {
            it('should send the correct bytes to the serialport', function (done) {
                let sentCommandId = NaN;
                funkBus.switchOn('0xF09A/B/1', function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0b, 0x1e, 0x01, 0x00, 0xF0, 0x9A, 0x42, 0x01, 0x01, 0x00, 0x00, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should log the bytes being sent in debug mode', function (done) {
                const debugDevice = new rfxcom.RfxCom('/dev/ttyUSB0', {
                        port:  fakeSerialPort,
                        debug: true
                    }),
                    debug = new rfxcom.FunkBus(debugDevice, rfxcom.funkbus.INSTA);
                debugDevice.connected = true;
                const utilLogSpy = spyOn(util, 'log');
                debug.switchOn('0xF09A/B/1', function () {
                    done();
                });
                expect(utilLogSpy).toHaveBeenCalledWith('[rfxcom] on /dev/ttyUSB0 - Sent    : 0B,1E,01,00,F0,9A,42,01,01,00,00,00');
                debugDevice.acknowledge[0]();
            });
            it('should accept an array address', function (done) {
                let sentCommandId = NaN;
                funkBus.switchOn(['0xF09A', 'B', '1'], function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0b, 0x1e, 0x01, 0x00, 0xF0, 0x9A, 0x42, 0x01, 0x01, 0x00, 0x00, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should throw an exception with a group address', function () {
                expect(function () {
                    funkBus.switchOn(['0xF09A', 'B', '0']);
                }).toThrow("Device doesn't support group commands");
            });
        });
        describe('switchOff', function () {
            it('should send the correct bytes to the serialport', function (done) {
                let sentCommandId = NaN;
                funkBus.switchOff('0xF09A/B/1', function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0b, 0x1e, 0x01, 0x00, 0xF0, 0x9A, 0x42, 0x01, 0x00, 0x00, 0x00, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should throw an exception with a group address', function () {
                expect(function () {
                    funkBus.switchOff('0xF09A/B/0');
                }).toThrow("Device doesn't support group commands");
            });
        });
        describe('inceaseLevel', function () {
            it('should send the correct bytes to the serialport', function (done) {
                let sentCommandId = NaN;
                funkBus.increaseLevel('0xF09A/B/1', function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0b, 0x1e, 0x01, 0x00, 0xF0, 0x9A, 0x42, 0x01, 0x01, 0x01, 0x00, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should throw an exception with a group address', function () {
                expect(function () {
                    funkBus.increaseLevel('0xF09A/B/0');
                }).toThrow("Device doesn't support group commands");
            });
        });
        describe('deceaseLevel', function () {
            it('should send the correct bytes to the serialport', function (done) {
                let sentCommandId = NaN;
                funkBus.decreaseLevel('0xF09A/B/1', function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0b, 0x1e, 0x01, 0x00, 0xF0, 0x9A, 0x42, 0x01, 0x00, 0x01, 0x00, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should throw an exception with a group address', function () {
                expect(function () {
                    funkBus.decreaseLevel('0xF09A/B/0');
                }).toThrow("Device doesn't support group commands");
            });
        });
        describe('setScene', function () {
            it('should throw an unsupported command exception', function () {
                expect(function () {
                    funkBus.setScene('0xF09A/B/0');
                }).toThrow("Device doesn't support command \"Scene\"");
            });
        });
        describe('buttonPress', function () {
            it('should send the correct bytes to the serialport for an "Up" command', function (done) {
                let sentCommandId = NaN;
                funkBus.buttonPress('0xF09A/B', "Up", 1, 0.1, function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0b, 0x1e, 0x01, 0x00, 0xF0, 0x9A, 0x42, 0x01, 0x01, 0x00, 0x00, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should send the correct bytes to the serialport for a "+" command', function (done) {
                let sentCommandId = NaN;
                funkBus.buttonPress('0xF09A/B', "+", 1, 0.1, function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0b, 0x1e, 0x01, 0x00, 0xF0, 0x9A, 0x42, 0x01, 0x01, 0x00, 0x00, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should ignore an invalid channel in deviceId', function (done) {
                let sentCommandId = NaN;
                funkBus.buttonPress('0xF09A/B/10', "Up", 1, 0.1, function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0b, 0x1e, 0x01, 0x00, 0xF0, 0x9A, 0x42, 0x01, 0x01, 0x00, 0x00, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should accept a 0.0 second buttonPressTime', function (done) {
                let sentCommandId = NaN;
                funkBus.buttonPress('0xF09A/B', "Up", 1, 0.0, function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0b, 0x1e, 0x01, 0x00, 0xF0, 0x9A, 0x42, 0x01, 0x01, 0x00, 0x00, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should accept a 5.0 second buttonPressTime', function (done) {
                let sentCommandId = NaN;
                funkBus.buttonPress('0xF09A/B', "Up", 1, 5.0, function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0b, 0x1e, 0x01, 0x00, 0xF0, 0x9A, 0x42, 0x01, 0x01, 0x11, 0x00, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should accept a 12.0 second buttonPressTime', function (done) {
                let sentCommandId = NaN;
                funkBus.buttonPress('0xF09A/B', "Up", 1, 12.0, function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0b, 0x1e, 0x01, 0x00, 0xF0, 0x9A, 0x42, 0x01, 0x01, 0x2D, 0x00, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should throw an exception with an invalid buttonPressTime', function () {
                expect(function () {
                    funkBus.buttonPress('0xF09A/B', "Up", 1, -0.01);
                }).toThrow("Invalid buttonPressTime: value must be in range 0.0 - 12.0 seconds.");
                expect(function () {
                    funkBus.buttonPress('0xF09A/B', "Up", 1, 12.2);
                }).toThrow("Invalid buttonPressTime: value must be in range 0.0 - 12.0 seconds.");
            });
            it('should accept buttonNumber values from 1 to 8', function (done) {
                let sentCommandId = NaN;
                funkBus.buttonPress('0xF09A/B', "Up", 8, 1.0, function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0b, 0x1e, 0x01, 0x00, 0xF0, 0x9A, 0x42, 0x08, 0x01, 0x01, 0x00, 0x00]);
                expect(sentCommandId).toEqual(0);
                expect(function () {
                    funkBus.buttonPress('0xF09A/B', "Up", 9, 1.0);
                }).toThrow("Invalid channel: value must be in range 1-8");
                expect(function () {
                    funkBus.buttonPress('0xF09A/B', "Up", 0, 1.0);
                }).toThrow("Device doesn't support group commands");
                expect(function () {
                    funkBus.buttonPress('0xF09A/B', "Up", NaN, 1.0);
                }).toThrow("Invalid channel: value must be in range 1-8");
            });
            it('should send the correct bytes to the serialport for a "Down" command', function (done) {
                let sentCommandId = NaN;
                funkBus.buttonPress('0xF09A/B', "Down", 1, 0.1, function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0b, 0x1e, 0x01, 0x00, 0xF0, 0x9A, 0x42, 0x01, 0x00, 0x00, 0x00, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should send the correct bytes to the serialport for a "-" command', function (done) {
                let sentCommandId = NaN;
                funkBus.buttonPress('0xF09A/B', "-", 1, 0.1, function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0b, 0x1e, 0x01, 0x00, 0xF0, 0x9A, 0x42, 0x01, 0x00, 0x00, 0x00, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should throw an exception for "All On"', function () {
                expect(function () {
                    funkBus.buttonPress('0xF09A/B/0', "All On", 1, 0.0);
                }).toThrow("Device doesn't support command \"All On\"");
            });
            it('should throw an exception for "All Off"', function () {
                expect(function () {
                    funkBus.buttonPress('0xF09A/B/0', "All Off", 1, 0.0);
                }).toThrow("Device doesn't support command \"All Off\"");
            });
            it('should throw an exception for "Master Up"', function () {
                expect(function () {
                    funkBus.buttonPress('0xF09A/B/0', "Master Up", 1, 0.0);
                }).toThrow("Device doesn't support command \"Master Up\"");
            });
            it('should throw an exception for "Master +"', function () {
                expect(function () {
                    funkBus.buttonPress('0xF09A/B/0', "Master +", 1, 0.0);
                }).toThrow("Device doesn't support command \"Master +\"");
            });
            it('should throw an exception for "Master Down"', function () {
                expect(function () {
                    funkBus.buttonPress('0xF09A/B/0', "Master Down", 1, 0.0);
                }).toThrow("Device doesn't support command \"Master Down\"");
            });
            it('should throw an exception for "Master -"', function () {
                expect(function () {
                    funkBus.buttonPress('0xF09A/B/0', "Master -", 1, 0.0);
                }).toThrow("Device doesn't support command \"Master -\"");
            });
            it('should throw an exception for "Scene"', function () {
                expect(function () {
                    funkBus.buttonPress('0xF09A/B/0', "Scene", 1, 0.0);
                }).toThrow("Device doesn't support command \"Scene\"");
            });
        });
    });
    describe('GIRA', function () {
        beforeEach(function () {
            funkBus = new rfxcom.FunkBus(device, rfxcom.funkbus.GIRA);
        });
        describe('switchOn', function () {
            it('should send the correct bytes to the serialport', function (done) {
                let sentCommandId = NaN;
                funkBus.switchOn('0xF09A/B/1', function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0b, 0x1e, 0x00, 0x00, 0xF0, 0x9A, 0x42, 0x01, 0x01, 0x00, 0x00, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should accept a group address', function (done) {
                let sentCommandId = NaN;
                funkBus.switchOn('0xF09A/B/0', function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0b, 0x1e, 0x00, 0x00, 0xF0, 0x9A, 0x42, 0x00, 0x03, 0x00, 0x00, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
        });
        describe('switchOff', function () {
            it('should send the correct bytes to the serialport', function (done) {
                let sentCommandId = NaN;
                funkBus.switchOff('0xF09A/B/1', function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0b, 0x1e, 0x00, 0x00, 0xF0, 0x9A, 0x42, 0x01, 0x00, 0x00, 0x00, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should accept a group address', function (done) {
                let sentCommandId = NaN;
                funkBus.switchOff('0xF09A/B/0', function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0b, 0x1e, 0x00, 0x00, 0xF0, 0x9A, 0x42, 0x00, 0x02, 0x00, 0x00, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
        });
        describe('inceaseLevel', function () {
            it('should send the correct bytes to the serialport', function (done) {
                let sentCommandId = NaN;
                funkBus.increaseLevel('0xF09A/B/1', function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0b, 0x1e, 0x00, 0x00, 0xF0, 0x9A, 0x42, 0x01, 0x01, 0x01, 0x00, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should accept a group address', function (done) {
                let sentCommandId = NaN;
                funkBus.increaseLevel('0xF09A/B/0', function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0b, 0x1e, 0x00, 0x00, 0xF0, 0x9A, 0x42, 0x00, 0x06, 0x00, 0x00, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
        });
        describe('deceaseLevel', function () {
            it('should send the correct bytes to the serialport', function (done) {
                let sentCommandId = NaN;
                funkBus.decreaseLevel('0xF09A/B/1', function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0b, 0x1e, 0x00, 0x00, 0xF0, 0x9A, 0x42, 0x01, 0x00, 0x01, 0x00, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should accept a group address', function (done) {
                let sentCommandId = NaN;
                funkBus.decreaseLevel('0xF09A/B/0', function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0b, 0x1e, 0x00, 0x00, 0xF0, 0x9A, 0x42, 0x00, 0x05, 0x00, 0x00, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
        });
        describe('setScene', function () {
            it('should send the correct bytes to the serialport', function (done) {
                let sentCommandId = NaN;
                funkBus.setScene('0xF09A/B/1', 2, function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0b, 0x1e, 0x00, 0x00, 0xF0, 0x9A, 0x42, 0x02, 0x04, 0x00, 0x00, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should ignore a room number if one is supplied', function (done) {
                let sentCommandId = NaN;
                funkBus.setScene('0xF09A/B/1', 2, 17, function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0b, 0x1e, 0x00, 0x00, 0xF0, 0x9A, 0x42, 0x02, 0x04, 0x00, 0x00, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should throw an exception with an invalid scene number 0', function () {
                expect(function () {
                    funkBus.setScene('0xF09A/B/1', 0);
                }).toThrow("Invalid scene number 0");
            });
            it('should throw an exception with an invalid scene number 6', function () {
                expect(function () {
                    funkBus.setScene('0xF09A/B/1', 6);
                }).toThrow("Invalid scene number 6");
            });
        });
        describe('buttonPress', function () {
            it('should send the correct bytes to the serialport for an "Up" command', function (done) {
                let sentCommandId = NaN;
                funkBus.buttonPress('0xF09A/B', "Up", 1, 0.1, function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0b, 0x1e, 0x00, 0x00, 0xF0, 0x9A, 0x42, 0x01, 0x01, 0x00, 0x00, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should send the correct bytes to the serialport for a "+" command', function (done) {
                let sentCommandId = NaN;
                funkBus.buttonPress('0xF09A/B', "Up", 1, 0.1, function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0b, 0x1e, 0x00, 0x00, 0xF0, 0x9A, 0x42, 0x01, 0x01, 0x00, 0x00, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should ignore an invalid channel in deviceId', function (done) {
                let sentCommandId = NaN;
                funkBus.buttonPress('0xF09A/B/10', "Up", 1, 0.1, function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0b, 0x1e, 0x00, 0x00, 0xF0, 0x9A, 0x42, 0x01, 0x01, 0x00, 0x00, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should accept a 0.0 second buttonPressTime', function (done) {
                let sentCommandId = NaN;
                funkBus.buttonPress('0xF09A/B', "Up", 1, 0.0, function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0b, 0x1e, 0x00, 0x00, 0xF0, 0x9A, 0x42, 0x01, 0x01, 0x00, 0x00, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should accept a 5.0 second buttonPressTime', function (done) {
                let sentCommandId = NaN;
                funkBus.buttonPress('0xF09A/B', "Up", 1, 5.0, function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0b, 0x1e, 0x00, 0x00, 0xF0, 0x9A, 0x42, 0x01, 0x01, 0x11, 0x00, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should accept a 12.0 second buttonPressTime', function (done) {
                let sentCommandId = NaN;
                funkBus.buttonPress('0xF09A/B', "Up", 1, 12.0, function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0b, 0x1e, 0x00, 0x00, 0xF0, 0x9A, 0x42, 0x01, 0x01, 0x2D, 0x00, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should throw an exception with an invalid buttonPressTime', function () {
                expect(function () {
                    funkBus.buttonPress('0xF09A/B', "Up", 1, -0.01);
                }).toThrow("Invalid buttonPressTime: value must be in range 0.0 - 12.0 seconds.");
                expect(function () {
                    funkBus.buttonPress('0xF09A/B', "Up", 1, 12.2);
                }).toThrow("Invalid buttonPressTime: value must be in range 0.0 - 12.0 seconds.");
            });
            it('should accept buttonNumber values from 1 to 8', function (done) {
                let sentCommandId = NaN;
                funkBus.buttonPress('0xF09A/B', "Up", 8, 1.0, function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0b, 0x1e, 0x00, 0x00, 0xF0, 0x9A, 0x42, 0x08, 0x01, 0x01, 0x00, 0x00]);
                expect(sentCommandId).toEqual(0);
                expect(function () {
                    funkBus.buttonPress('0xF09A/B', "Up", 9, 1.0);
                }).toThrow("Invalid channel: value must be in range 1-8");
                expect(function () {
                    funkBus.buttonPress('0xF09A/B', "Up", 0, 1.0);
                }).toThrow("Device doesn't support group commands");
            });
            it('should send the correct bytes to the serialport for a "Down" command', function (done) {
                let sentCommandId = NaN;
                funkBus.buttonPress('0xF09A/B', "Down", 1, 0.1, function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0b, 0x1e, 0x00, 0x00, 0xF0, 0x9A, 0x42, 0x01, 0x00, 0x00, 0x00, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should send the correct bytes to the serialport for a "-" command', function (done) {
                let sentCommandId = NaN;
                funkBus.buttonPress('0xF09A/B', "-", 1, 0.1, function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0b, 0x1e, 0x00, 0x00, 0xF0, 0x9A, 0x42, 0x01, 0x00, 0x00, 0x00, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should send the correct bytes to the serialport for an "All On" command', function (done) {
                let sentCommandId = NaN;
                funkBus.buttonPress('0xF09A/B', "All On", 1, 4.5, function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0b, 0x1e, 0x00, 0x00, 0xF0, 0x9A, 0x42, 0x00, 0x03, 0x0f, 0x00, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should send the correct bytes to the serialport for an "All Off" command', function (done) {
                let sentCommandId = NaN;
                funkBus.buttonPress('0xF09A/B', "All Off", 4, 0.5, function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0b, 0x1e, 0x00, 0x00, 0xF0, 0x9A, 0x42, 0x00, 0x02, 0x00, 0x00, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should send the correct bytes to the serialport for a "Scene" command', function (done) {
                let sentCommandId = NaN;
                funkBus.buttonPress('0xF09A/B', "Scene", 2, 0.5, function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0b, 0x1e, 0x00, 0x00, 0xF0, 0x9A, 0x42, 0x02, 0x04, 0x00, 0x00, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should send the correct bytes to the serialport for a "Master Up" command', function (done) {
                let sentCommandId = NaN;
                funkBus.buttonPress('0xF09A/B', "Master Up", 0, 0.5, function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0b, 0x1e, 0x00, 0x00, 0xF0, 0x9A, 0x42, 0x00, 0x06, 0x00, 0x00, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should send the correct bytes to the serialport for a "Master +" command', function (done) {
                let sentCommandId = NaN;
                funkBus.buttonPress('0xF09A/B', "Master +", 0, 0.5, function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0b, 0x1e, 0x00, 0x00, 0xF0, 0x9A, 0x42, 0x00, 0x06, 0x00, 0x00, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should send the correct bytes to the serialport for a "Master Down" command', function (done) {
                let sentCommandId = NaN;
                funkBus.buttonPress('0xF09A/B', "Master Down", 0, 0.5, function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0b, 0x1e, 0x00, 0x00, 0xF0, 0x9A, 0x42, 0x00, 0x05, 0x00, 0x00, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should send the correct bytes to the serialport for a "Master -" command', function (done) {
                let sentCommandId = NaN;
                funkBus.buttonPress('0xF09A/B', "Master -", 0, 0.5, function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0b, 0x1e, 0x00, 0x00, 0xF0, 0x9A, 0x42, 0x00, 0x05, 0x00, 0x00, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
        });
    });
    describe('address checking', function () {
        beforeEach(function () {
            funkBus = new rfxcom.FunkBus(device, rfxcom.funkbus.INSTA);
        });
        it('should accept the lowest ID, group code & channel code numbers', function (done) {
            let sentCommandId = NaN;
            funkBus.switchOn(['0x0000', 'a', '1'], function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x0b, 0x1e, 0x01, 0x00, 0x00, 0x00, 0x41, 0x01, 0x01, 0x00, 0x00, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should accept the highest ID, group code & channel code numbers', function (done) {
            let sentCommandId = NaN;
            funkBus.switchOn(['0xFFFF', 'C', '8'], function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x0b, 0x1e, 0x01, 0x00, 0xff, 0xff, 0x43, 0x08, 0x01, 0x00, 0x00, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should throw an exception with an invalid channel code', function () {
            expect(function () {
                funkBus.switchOn(['0xFFFF', 'A', '9']);
            }).toThrow("Invalid channel: value must be in range 1-8");
        });
        it('should throw an exception with an invalid group', function () {
            expect(function () {
                funkBus.switchOn(['0xFFFF', 'D', '1']);
            }).toThrow("Invalid group code 'D'");
        });
        it('should throw an exception with an invalid ID', function () {
            expect(function () {
                funkBus.switchOn(['0xFFFFFF', 'A', '1']);
            }).toThrow("Device ID 0xffffff outside valid range");
        });
        it('should throw an exception with a badly formatted deviceId', function () {
            expect(function () {
                funkBus.switchOn('0xF09AC8');
            }).toThrow("Invalid deviceId format");
        });
    });
});

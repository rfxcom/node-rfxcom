const rfxcom = require('../lib'),
    util = require('util'),
    matchers = require('./matchers'),
    FakeSerialPort = require('./helper');

describe('Blinds2 class', function () {
    let blinds2,
        fakeSerialPort,
        device;
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

    describe('instantiation', function () {
        it('should throw an error if no subtype is specified', function () {
            expect(function () {
                blinds2 = new rfxcom.Blinds2(device);
            }).toThrow(new Error(("Must provide a subtype.")));
        });
    });

    describe('.BREL_DOOYA', function() {
        beforeEach(function () {
            blinds2 = new rfxcom.Blinds2(device, rfxcom.blinds2.BREL_DOOYA);
        });
        describe('commands', function() {
            it('should send the correct bytes for an open() command to the serialport', function (done) {
                let sentCommandId = NaN;
                blinds2.open('0x12345678/9', function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0c, 0x31, 0x00, 0x00, 0x12, 0x34, 0x56, 0x78, 0x08, 0x00, 0x00, 0x00, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should accept an array deviceId', function (done) {
                let sentCommandId = NaN;
                blinds2.open(['0x12345678', '9'], function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0c, 0x31, 0x00, 0x00, 0x12, 0x34, 0x56, 0x78, 0x08, 0x00, 0x00, 0x00, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should log the bytes being sent in debug mode', function (done) {
                const debugDevice = new rfxcom.RfxCom('/dev/ttyUSB0', {
                        port:  fakeSerialPort,
                        debug: true
                    }),
                    debug = new rfxcom.Blinds2(debugDevice, rfxcom.blinds2.BREL_DOOYA);
                debugDevice.connected = true;
                const debugLogSpy = spyOn(debugDevice, 'debugLog');
                debug.open('0x12345678/9', done);
                expect(debugLogSpy).toHaveBeenCalledWith('Sent    : 0C,31,00,00,12,34,56,78,08,00,00,00,00');
                debugDevice.acknowledge[0]();
            });
            it('should send the correct bytes for a close() command to the serialport', function (done) {
                let sentCommandId = NaN;
                blinds2.close('0x12345678/9', function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0c, 0x31, 0x00, 0x00, 0x12, 0x34, 0x56, 0x78, 0x08, 0x01, 0x00, 0x00, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should send the correct bytes for a stop() command to the serialport', function (done) {
                let sentCommandId = NaN;
                blinds2.stop('0x12345678/9', function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0c, 0x31, 0x00, 0x00, 0x12, 0x34, 0x56, 0x78, 0x08, 0x02, 0x00, 0x00, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should send the correct bytes for a confirm() command to the serialport', function (done) {
                let sentCommandId = NaN;
                blinds2.confirm('0x12345678/9', function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0c, 0x31, 0x00, 0x00, 0x12, 0x34, 0x56, 0x78, 0x08, 0x03, 0x00, 0x00, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should send the correct bytes for a setPercent() command to the serialport', function (done) {
                let sentCommandId = NaN;
                blinds2.setPercent('0x12345678/9', 73, function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0c, 0x31, 0x00, 0x00, 0x12, 0x34, 0x56, 0x78, 0x08, 0x04, 0x49, 0x00, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should handle a missing parameter for a setPercent() command', function (done) {
                let sentCommandId = NaN;
                blinds2.setPercent('0x12345678/9', function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0c, 0x31, 0x00, 0x00, 0x12, 0x34, 0x56, 0x78, 0x08, 0x04, 0x32, 0x00, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should send the correct bytes for a setAngle() command to the serialport', function (done) {
                let sentCommandId = NaN;
                blinds2.setAngle('0x12345678/9', 37, function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0c, 0x31, 0x00, 0x00, 0x12, 0x34, 0x56, 0x78, 0x08, 0x05, 0x00, 0x25, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should handle a missing parameter for a setAngle() command ', function (done) {
                let sentCommandId = NaN;
                blinds2.setAngle('0x12345678/9', function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0c, 0x31, 0x00, 0x00, 0x12, 0x34, 0x56, 0x78, 0x08, 0x05, 0x00, 0x5A, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should send the correct bytes for a setPercentAndAngle() command to the serialport', function (done) {
                let sentCommandId = NaN;
                blinds2.setPercentAndAngle('0x12345678/9', 73, 37, function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0c, 0x31, 0x00, 0x00, 0x12, 0x34, 0x56, 0x78, 0x08, 0x06, 0x49, 0x25, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should handle one missing parameter for a setPercentAndAngle() command', function (done) {
                let sentCommandId = NaN;
                blinds2.setPercentAndAngle('0x12345678/9', 73, function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0c, 0x31, 0x00, 0x00, 0x12, 0x34, 0x56, 0x78, 0x08, 0x06, 0x49, 0x5A, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should handle two missing parameters for a setPercentAndAngle() command', function (done) {
                let sentCommandId = NaN;
                blinds2.setPercentAndAngle('0x12345678/9', function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0c, 0x31, 0x00, 0x00, 0x12, 0x34, 0x56, 0x78, 0x08, 0x06, 0x32, 0x5A, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
        });
        describe('address checking', function() {
            it('should accept address = 0x1', function (done) {
                let sentCommandId = NaN;
                blinds2.open('0x1/9', function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0c, 0x31, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01, 0x08, 0x00, 0x00, 0x00, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should accept address = 0xffffffff', function (done) {
                let sentCommandId = NaN;
                blinds2.open('0xffffffff/9', function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0c, 0x31, 0x00, 0x00, 0xFF, 0xFF, 0xFF, 0xFF, 0x08, 0x00, 0x00, 0x00, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should throw an error for address < 1', function () {
                expect(function () {
                    blinds2.open('0x0/9')
                }).toThrow(new Error(("Address 0x0 outside valid range")));
            });
            it('should throw an error for address > 0xffffffff', function () {
                expect(function () {
                    blinds2.open('0x100000000/9')
                }).toThrow(new Error(("Address 0x100000000 outside valid range")));
            });
            it('should accept unit code 1', function (done) {
                let sentCommandId = NaN;
                blinds2.open('0x12345678/1', function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0c, 0x31, 0x00, 0x00, 0x12, 0x34, 0x56, 0x78, 0x00, 0x00, 0x00, 0x00, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should accept unit code 16', function (done) {
                let sentCommandId = NaN;
                blinds2.open('0x12345678/16', function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0c, 0x31, 0x00, 0x00, 0x12, 0x34, 0x56, 0x78, 0x0F, 0x00, 0x00, 0x00, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should accept a group command', function (done) {
                let sentCommandId = NaN;
                blinds2.open('0x12345678/0', function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0c, 0x31, 0x00, 0x00, 0x12, 0x34, 0x56, 0x78, 0x10, 0x00, 0x00, 0x00, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should throw an error for unit code > 16', function () {
                expect(function () {
                    blinds2.open('0x12345678/17')
                }).toThrow(new Error(("Invalid unit code 17")));
            });
            it('should throw an error for unit code < 0', function () {
                expect(function () {
                    blinds2.open('0x12345678/-1')
                }).toThrow(new Error(("Invalid unit code -1")));
            });
            it('should throw an error for a missing unit code', function () {
                expect(function () {
                    blinds2.open('0x12345678')
                }).toThrow(new Error(("Invalid deviceId format")));
            });
            it('should throw an error for a malformed ID', function () {
                expect(function () {
                    blinds2.open('0x1/234/567/8')
                }).toThrow(new Error(("Invalid deviceId format")));
            });
          });
    });
});

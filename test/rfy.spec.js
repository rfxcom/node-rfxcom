/* global require: false, beforeEach: false, describe: false, it: false, expect: false,
   spyOn: false, console: false
*/
var rfxcom = require('../lib'),
    matchers = require('./matchers'),
    FakeSerialPort = require('./helper');

describe('Rfy class', function () {
    var rfy,
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
        if (typeof device.acknowledge[0] === "function") {
            device.acknowledge[0]();
        }
    });
    describe("subtype RFY", function () {
        describe('stop()', function () {
            beforeEach(function () {
                rfy = new rfxcom.Rfy(device, rfxcom.rfy.RFY);
            });
            it('should send the correct bytes to the serialport', function (done) {
                var sentCommandId = NaN;
                rfy.stop('0x010203/02', function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0c, 0x1a, 0x00, 0x00, 0x01, 0x02, 0x03, 0x02, 0x00, 0x00, 0x00, 0x00, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should log the bytes being sent in debug mode', function (done) {
                var debugDevice = new rfxcom.RfxCom('/dev/ttyUSB0', {
                        port:  fakeSerialPort,
                        debug: true
                    }),
                    rfyd = new rfxcom.Rfy(debugDevice, rfxcom.rfy.RFY),
                    consoleSpy = spyOn(console, 'log');
                debugDevice.connected = true;
                rfyd.stop('0x010203/01', done);
                expect(consoleSpy).toHaveBeenCalledWith('[rfxcom] on /dev/ttyUSB0 - Sent    : 0C,1A,00,00,01,02,03,01,00,00,00,00,00');
                debugDevice.acknowledge[0]();
            });
            it('should handle no callback', function () {
                rfy.stop('0x010203/01');
                expect(fakeSerialPort).toHaveSent([0x0c, 0x1a, 0x00, 0x00, 0x01, 0x02, 0x03, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00]);
            });
            it('should throw an exception with an invalid deviceId format', function () {
                expect(function () {
                    rfy.stop('01020301');
                }).toThrow("Invalid deviceId format");
            });
            it('should throw an exception with an address less than the minimum allowed', function () {
                expect(function () {
                    rfy.stop('0x0/1');
                }).toThrow("Address 0x0 outside valid range");
            });
            it('should accept the lowest valid address', function (done) {
                var sentCommandId = NaN;
                rfy.stop('0x01/2', function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0c, 0x1a, 0x00, 0x00, 0x00, 0x00, 0x01, 0x02, 0x00, 0x00, 0x00, 0x00, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should accept the highest valid address', function (done) {
                var sentCommandId = NaN;
                rfy.stop('0x0fffff/2', function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0c, 0x1a, 0x00, 0x00, 0x0f, 0xff, 0xff, 0x02, 0x00, 0x00, 0x00, 0x00, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should throw an exception with an address greater than the maximum allowed', function () {
                expect(function () {
                    rfy.stop('0x100000/1');
                }).toThrow("Address 0x100000 outside valid range");
            });
            it('should accept the lowest valid unit code', function (done) {
                var sentCommandId = NaN;
                rfy.stop('0x010203/0', function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0c, 0x1a, 0x00, 0x00, 0x01, 0x02, 0x03, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should accept the highest valid unit code', function (done) {
                var sentCommandId = NaN;
                rfy.stop('0x010203/4', function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0c, 0x1a, 0x00, 0x00, 0x01, 0x02, 0x03, 0x04, 0x00, 0x00, 0x00, 0x00, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should throw an exception with an invalid unit code', function () {
                expect(function () {
                    rfy.stop('0x010203/5');
                }).toThrow("Invalid unit code 5");
            });
        });
        describe('up()', function () {
            beforeEach(function () {
                rfy = new rfxcom.Rfy(device, rfxcom.rfy.RFY);
            });
            it('should send the correct bytes to the serialport', function (done) {
                var sentCommandId = NaN;
                rfy.up('0x010203/01', function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0c, 0x1a, 0x00, 0x00, 0x01, 0x02, 0x03, 0x01, 0x01, 0x00, 0x00, 0x00, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
        });
        describe('down()', function () {
            beforeEach(function () {
                rfy = new rfxcom.Rfy(device, rfxcom.rfy.RFY);
            });
            it('should send the correct bytes to the serialport', function (done) {
                var sentCommandId = NaN;
                rfy.down('0x010203/01', function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0c, 0x1a, 0x00, 0x00, 0x01, 0x02, 0x03, 0x01, 0x03, 0x00, 0x00, 0x00, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
        });
        describe('list()', function () {
            beforeEach(function () {
                rfy = new rfxcom.Rfy(device, rfxcom.rfy.RFY);
            });
            it('should send the correct bytes to the serialport', function (done) {
                var sentCommandId = NaN;
                rfy.listRemotes(function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0c, 0x1a, 0x00, 0x00, 0x00, 0x00, 0x01, 0x01, 0x06, 0x00, 0x00, 0x00, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
        });
        describe('eraseall()', function () {
            beforeEach(function () {
                rfy = new rfxcom.Rfy(device, rfxcom.rfy.RFY);
            });
            it('should send the correct bytes to the serialport', function (done) {
                var sentCommandId = NaN;
                rfy.eraseAll(function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0c, 0x1a, 0x00, 0x00, 0x00, 0x00, 0x01, 0x01, 0x0e, 0x00, 0x00, 0x00, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
        });
        describe('erase()', function () {
            beforeEach(function () {
                rfy = new rfxcom.Rfy(device, rfxcom.rfy.RFY);
            });
            it('should send the correct bytes to the serialport', function (done) {
                var sentCommandId = NaN;
                rfy.erase('0x010203/01', function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0c, 0x1a, 0x00, 0x00, 0x01, 0x02, 0x03, 0x01, 0x0d, 0x00, 0x00, 0x00, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
        });
        describe('program()', function () {
            beforeEach(function () {
                rfy = new rfxcom.Rfy(device, rfxcom.rfy.RFY);
            });
            it('should send the correct bytes to the serialport', function (done) {
                var sentCommandId = NaN;
                rfy.program('0x010203/01', function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0c, 0x1a, 0x00, 0x00, 0x01, 0x02, 0x03, 0x01, 0x07, 0x00, 0x00, 0x00, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
        });
        describe('venetianOpenUS()', function () {
            beforeEach(function () {
                rfy = new rfxcom.Rfy(device, rfxcom.rfy.RFY);
            });
            it('should send the correct bytes to the serialport', function (done) {
                var sentCommandId = NaN;
                rfy.venetianOpenUS('0x010203/01', function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0c, 0x1a, 0x00, 0x00, 0x01, 0x02, 0x03, 0x01, 0x0f, 0x00, 0x00, 0x00, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
        });
        describe('venetianCloseUS()', function () {
            beforeEach(function () {
                rfy = new rfxcom.Rfy(device, rfxcom.rfy.RFY);
            });
            it('should send the correct bytes to the serialport', function (done) {
                var sentCommandId = NaN;
                rfy.venetianCloseUS('0x010203/01', function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0c, 0x1a, 0x00, 0x00, 0x01, 0x02, 0x03, 0x01, 0x10, 0x00, 0x00, 0x00, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
        });
        describe('venetianIncreaseAngleUS()', function () {
            beforeEach(function () {
                rfy = new rfxcom.Rfy(device, rfxcom.rfy.RFY);
            });
            it('should send the correct bytes to the serialport', function (done) {
                var sentCommandId = NaN;
                rfy.venetianIncreaseAngleUS('0x010203/01', function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0c, 0x1a, 0x00, 0x00, 0x01, 0x02, 0x03, 0x01, 0x11, 0x00, 0x00, 0x00, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
        });
        describe('venetianDecreaseAngleUS()', function () {
            beforeEach(function () {
                rfy = new rfxcom.Rfy(device, rfxcom.rfy.RFY);
            });
            it('should send the correct bytes to the serialport', function (done) {
                var sentCommandId = NaN;
                rfy.venetianDecreaseAngleUS('0x010203/01', function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0c, 0x1a, 0x00, 0x00, 0x01, 0x02, 0x03, 0x01, 0x12, 0x00, 0x00, 0x00, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
        });
        describe('venetianOpenEU()', function () {
            beforeEach(function () {
                rfy = new rfxcom.Rfy(device, rfxcom.rfy.RFY);
            });
            it('should send the correct bytes to the serialport', function (done) {
                var sentCommandId = NaN;
                rfy.venetianOpenEU('0x010203/01', function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0c, 0x1a, 0x00, 0x00, 0x01, 0x02, 0x03, 0x01, 0x11, 0x00, 0x00, 0x00, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
        });
        describe('venetianCloseEU()', function () {
            beforeEach(function () {
                rfy = new rfxcom.Rfy(device, rfxcom.rfy.RFY);
            });
            it('should send the correct bytes to the serialport', function (done) {
                var sentCommandId = NaN;
                rfy.venetianCloseEU('0x010203/01', function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0c, 0x1a, 0x00, 0x00, 0x01, 0x02, 0x03, 0x01, 0x12, 0x00, 0x00, 0x00, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
        });
        describe('venetianIncreaseAngleEU()', function () {
            beforeEach(function () {
                rfy = new rfxcom.Rfy(device, rfxcom.rfy.RFY);
            });
            it('should send the correct bytes to the serialport', function (done) {
                var sentCommandId = NaN;
                rfy.venetianIncreaseAngleEU('0x010203/01', function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0c, 0x1a, 0x00, 0x00, 0x01, 0x02, 0x03, 0x01, 0x0f, 0x00, 0x00, 0x00, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
        });
        describe('venetianDecreaseAngleEU()', function () {
            beforeEach(function () {
                rfy = new rfxcom.Rfy(device, rfxcom.rfy.RFY);
            });
            it('should send the correct bytes to the serialport', function (done) {
                var sentCommandId = NaN;
                rfy.venetianDecreaseAngleEU('0x010203/01', function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0c, 0x1a, 0x00, 0x00, 0x01, 0x02, 0x03, 0x01, 0x10, 0x00, 0x00, 0x00, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
        });
        describe('enableSunSensor()', function () {
            beforeEach(function () {
                rfy = new rfxcom.Rfy(device, rfxcom.rfy.RFY);
            });
            it('should send the correct bytes to the serialport', function (done) {
                var sentCommandId = NaN;
                rfy.enableSunSensor('0x010203/01', function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0c, 0x1a, 0x00, 0x00, 0x01, 0x02, 0x03, 0x01, 0x13, 0x00, 0x00, 0x00, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
        });
        describe('disableSunSensor()', function () {
            beforeEach(function () {
                rfy = new rfxcom.Rfy(device, rfxcom.rfy.RFY);
            });
            it('should send the correct bytes to the serialport', function (done) {
                var sentCommandId = NaN;
                rfy.disableSunSensor('0x010203/01', function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0c, 0x1a, 0x00, 0x00, 0x01, 0x02, 0x03, 0x01, 0x14, 0x00, 0x00, 0x00, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
        });
        describe('do()', function () {
            beforeEach(function () {
                rfy = new rfxcom.Rfy(device, rfxcom.rfy.RFY);
            });
            it('should send the correct bytes to the serialport', function (done) {
                var sentCommandId = NaN;
                rfy.doCommand('0x010203/01', "stop", function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0c, 0x1a, 0x00, 0x00, 0x01, 0x02, 0x03, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should send the correct bytes to the serialport', function (done) {
                var sentCommandId = NaN;
                rfy.doCommand('0x010203/01', "up", function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0c, 0x1a, 0x00, 0x00, 0x01, 0x02, 0x03, 0x01, 0x01, 0x00, 0x00, 0x00, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should send the correct bytes to the serialport', function (done) {
                var sentCommandId = NaN;
                rfy.doCommand('0x010203/01', "upstop", function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0c, 0x1a, 0x00, 0x00, 0x01, 0x02, 0x03, 0x01, 0x02, 0x00, 0x00, 0x00, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should send the correct bytes to the serialport', function (done) {
                var sentCommandId = NaN;
                rfy.doCommand('0x010203/01', "down", function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0c, 0x1a, 0x00, 0x00, 0x01, 0x02, 0x03, 0x01, 0x03, 0x00, 0x00, 0x00, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should send the correct bytes to the serialport', function (done) {
                var sentCommandId = NaN;
                rfy.doCommand('0x010203/01', "downstop", function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0c, 0x1a, 0x00, 0x00, 0x01, 0x02, 0x03, 0x01, 0x04, 0x00, 0x00, 0x00, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should send the correct bytes to the serialport', function (done) {
                var sentCommandId = NaN;
                rfy.doCommand('0x010203/01', "updown", function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0c, 0x1a, 0x00, 0x00, 0x01, 0x02, 0x03, 0x01, 0x05, 0x00, 0x00, 0x00, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should send the correct bytes to the serialport', function (done) {
                var sentCommandId = NaN;
                rfy.doCommand('0x010203/01', "listRemotes", function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0c, 0x1a, 0x00, 0x00, 0x00, 0x00, 0x01, 0x01, 0x06, 0x00, 0x00, 0x00, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should send the correct bytes to the serialport', function (done) {
                var sentCommandId = NaN;
                rfy.doCommand('0x010203/01', "program", function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0c, 0x1a, 0x00, 0x00, 0x01, 0x02, 0x03, 0x01, 0x07, 0x00, 0x00, 0x00, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should send the correct bytes to the serialport', function (done) {
                var sentCommandId = NaN;
                rfy.doCommand('0x010203/01', "program2sec", function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0c, 0x1a, 0x00, 0x00, 0x01, 0x02, 0x03, 0x01, 0x08, 0x00, 0x00, 0x00, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should send the correct bytes to the serialport', function (done) {
                var sentCommandId = NaN;
                rfy.doCommand('0x010203/01', "program7sec", function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0c, 0x1a, 0x00, 0x00, 0x01, 0x02, 0x03, 0x01, 0x09, 0x00, 0x00, 0x00, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should send the correct bytes to the serialport', function (done) {
                var sentCommandId = NaN;
                rfy.doCommand('0x010203/01', "stop2sec", function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0c, 0x1a, 0x00, 0x00, 0x01, 0x02, 0x03, 0x01, 0x0a, 0x00, 0x00, 0x00, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should send the correct bytes to the serialport', function (done) {
                var sentCommandId = NaN;
                rfy.doCommand('0x010203/01', "stop5sec", function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0c, 0x1a, 0x00, 0x00, 0x01, 0x02, 0x03, 0x01, 0x0b, 0x00, 0x00, 0x00, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should send the correct bytes to the serialport', function (done) {
                var sentCommandId = NaN;
                rfy.doCommand('0x010203/01', "updown5sec", function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0c, 0x1a, 0x00, 0x00, 0x01, 0x02, 0x03, 0x01, 0x0c, 0x00, 0x00, 0x00, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should send the correct bytes to the serialport', function (done) {
                var sentCommandId = NaN;
                rfy.doCommand('0x010203/01', "erasethis", function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0c, 0x1a, 0x00, 0x00, 0x01, 0x02, 0x03, 0x01, 0x0d, 0x00, 0x00, 0x00, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should send the correct bytes to the serialport', function (done) {
                var sentCommandId = NaN;
                rfy.doCommand('0x010203/01', "eraseall", function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0c, 0x1a, 0x00, 0x00, 0x01, 0x02, 0x03, 0x01, 0x0e, 0x00, 0x00, 0x00, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should send the correct bytes to the serialport', function (done) {
                var sentCommandId = NaN;
                rfy.doCommand('0x010203/01', "up05sec", function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0c, 0x1a, 0x00, 0x00, 0x01, 0x02, 0x03, 0x01, 0x0f, 0x00, 0x00, 0x00, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should send the correct bytes to the serialport', function (done) {
                var sentCommandId = NaN;
                rfy.doCommand('0x010203/01', "down05sec", function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0c, 0x1a, 0x00, 0x00, 0x01, 0x02, 0x03, 0x01, 0x10, 0x00, 0x00, 0x00, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should send the correct bytes to the serialport', function (done) {
                var sentCommandId = NaN;
                rfy.doCommand('0x010203/01', "up2sec", function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0c, 0x1a, 0x00, 0x00, 0x01, 0x02, 0x03, 0x01, 0x11, 0x00, 0x00, 0x00, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should send the correct bytes to the serialport', function (done) {
                var sentCommandId = NaN;
                rfy.doCommand('0x010203/01', "down2sec", function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0c, 0x1a, 0x00, 0x00, 0x01, 0x02, 0x03, 0x01, 0x12, 0x00, 0x00, 0x00, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should send the correct bytes to the serialport', function (done) {
                var sentCommandId = NaN;
                rfy.doCommand('0x010203/01', "sunwindenable", function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0c, 0x1a, 0x00, 0x00, 0x01, 0x02, 0x03, 0x01, 0x13, 0x00, 0x00, 0x00, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should send the correct bytes to the serialport', function (done) {
                var sentCommandId = NaN;
                rfy.doCommand('0x010203/01', "sundisable", function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0c, 0x1a, 0x00, 0x00, 0x01, 0x02, 0x03, 0x01, 0x14, 0x00, 0x00, 0x00, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should throw an exception with an invalid command string', function () {
                expect(function () {
                    rfy.doCommand('0x010203/5', "INVALID_COMMAND");
                }).toThrow("Unknown command 'INVALID_COMMAND'");
            });
            it('should throw an exception with an invalid command number', function () {
                expect(function () {
                    rfy.doCommand('0x010203/5', -1);
                }).toThrow("Invalid command number -1");
            });
            it('should send the correct bytes to the serialport', function (done) {
                var sentCommandId = NaN;
                rfy.doCommand('0x010203/01', 0, function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0c, 0x1a, 0x00, 0x00, 0x01, 0x02, 0x03, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should round command numbers to the nearest integer', function (done) {
                var sentCommandId = NaN;
                rfy.doCommand('0x010203/01', 0.499, function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0c, 0x1a, 0x00, 0x00, 0x01, 0x02, 0x03, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should send the correct bytes to the serialport', function (done) {
                var sentCommandId = NaN;
                rfy.doCommand('0x010203/01', 0x14, function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0c, 0x1a, 0x00, 0x00, 0x01, 0x02, 0x03, 0x01, 0x14, 0x00, 0x00, 0x00, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should throw an exception with an invalid command number', function () {
                expect(function () {
                    rfy.doCommand('0x010203/5', 0x15);
                }).toThrow("Invalid command number 21");
            });
        });
    });
    describe("subtype RFYEXT", function () {
        describe('stop()', function () {
            beforeEach(function () {
                rfy = new rfxcom.Rfy(device, rfxcom.rfy.RFYEXT);
            });
            it('should send the correct bytes to the serialport', function (done) {
                var sentCommandId = NaN;
                rfy.stop('0x010203/02', function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0c, 0x1a, 0x01, 0x00, 0x01, 0x02, 0x03, 0x02, 0x00, 0x00, 0x00, 0x00, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should log the bytes being sent in debug mode', function (done) {
                var debugDevice = new rfxcom.RfxCom('/dev/ttyUSB0', {
                        port:  fakeSerialPort,
                        debug: true
                    }),
                    rfyd = new rfxcom.Rfy(debugDevice, rfxcom.rfy.RFY),
                    consoleSpy = spyOn(console, 'log');
                debugDevice.connected = true;
                rfyd.stop('0x010203/01', done);
                expect(consoleSpy).toHaveBeenCalledWith('[rfxcom] on /dev/ttyUSB0 - Sent    : 0C,1A,00,00,01,02,03,01,00,00,00,00,00');
                debugDevice.acknowledge[0]();
            });
            it('should handle no callback', function () {
                rfy.stop('0x010203/01');
                expect(fakeSerialPort).toHaveSent([0x0c, 0x1a, 0x01, 0x00, 0x01, 0x02, 0x03, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00]);
            });
            it('should throw an exception with an invalid deviceId format', function () {
                expect(function () {
                    rfy.stop('01020301');
                }).toThrow("Invalid deviceId format");
            });
            it('should throw an exception with an address less than the minimum allowed', function () {
                expect(function () {
                    rfy.stop('0x0/1');
                }).toThrow("Address 0x0 outside valid range");
            });
            it('should accept the lowest valid address', function (done) {
                var sentCommandId = NaN;
                rfy.stop('0x01/2', function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0c, 0x1a, 0x01, 0x00, 0x00, 0x00, 0x01, 0x02, 0x00, 0x00, 0x00, 0x00, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should accept the highest valid address', function (done) {
                var sentCommandId = NaN;
                rfy.stop('0x0fffff/2', function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0c, 0x1a, 0x01, 0x00, 0x0f, 0xff, 0xff, 0x02, 0x00, 0x00, 0x00, 0x00, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should throw an exception with an address greater than the maximum allowed', function () {
                expect(function () {
                    rfy.stop('0x100000/1');
                }).toThrow("Address 0x100000 outside valid range");
            });
            it('should accept the lowest valid unit code', function (done) {
                var sentCommandId = NaN;
                rfy.stop('0x010203/0', function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0c, 0x1a, 0x01, 0x00, 0x01, 0x02, 0x03, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should accept the highest valid unit code', function (done) {
                var sentCommandId = NaN;
                rfy.stop('0x010203/15', function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0c, 0x1a, 0x01, 0x00, 0x01, 0x02, 0x03, 0x0f, 0x00, 0x00, 0x00, 0x00, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should throw an exception with an invalid unit code', function () {
                expect(function () {
                    rfy.stop('0x010203/0x10');
                }).toThrow("Invalid unit code 0x10");
            });
        });
        describe('up()', function () {
            beforeEach(function () {
                rfy = new rfxcom.Rfy(device, rfxcom.rfy.RFYEXT);
            });
            it('should send the correct bytes to the serialport', function (done) {
                var sentCommandId = NaN;
                rfy.up('0x010203/01', function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0c, 0x1a, 0x01, 0x00, 0x01, 0x02, 0x03, 0x01, 0x01, 0x00, 0x00, 0x00, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
        });
        describe('down()', function () {
            beforeEach(function () {
                rfy = new rfxcom.Rfy(device, rfxcom.rfy.RFYEXT);
            });
            it('should send the correct bytes to the serialport', function (done) {
                var sentCommandId = NaN;
                rfy.down('0x010203/01', function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0c, 0x1a, 0x01, 0x00, 0x01, 0x02, 0x03, 0x01, 0x03, 0x00, 0x00, 0x00, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
        });
        describe('list()', function () {
            beforeEach(function () {
                rfy = new rfxcom.Rfy(device, rfxcom.rfy.RFYEXT);
            });
            it('should send the correct bytes to the serialport', function (done) {
                var sentCommandId = NaN;
                rfy.listRemotes(function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0c, 0x1a, 0x01, 0x00, 0x00, 0x00, 0x01, 0x01, 0x06, 0x00, 0x00, 0x00, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
        });
        describe('eraseall()', function () {
            beforeEach(function () {
                rfy = new rfxcom.Rfy(device, rfxcom.rfy.RFYEXT);
            });
            it('should send the correct bytes to the serialport', function (done) {
                var sentCommandId = NaN;
                rfy.eraseAll(function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0c, 0x1a, 0x01, 0x00, 0x00, 0x00, 0x01, 0x01, 0x0e, 0x00, 0x00, 0x00, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
        });
        describe('erase()', function () {
            beforeEach(function () {
                rfy = new rfxcom.Rfy(device, rfxcom.rfy.RFYEXT);
            });
            it('should send the correct bytes to the serialport', function (done) {
                var sentCommandId = NaN;
                rfy.erase('0x010203/01', function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0c, 0x1a, 0x01, 0x00, 0x01, 0x02, 0x03, 0x01, 0x0d, 0x00, 0x00, 0x00, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
        });
        describe('program()', function () {
            beforeEach(function () {
                rfy = new rfxcom.Rfy(device, rfxcom.rfy.RFYEXT);
            });
            it('should send the correct bytes to the serialport', function (done) {
                var sentCommandId = NaN;
                rfy.program('0x010203/01', function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0c, 0x1a, 0x01, 0x00, 0x01, 0x02, 0x03, 0x01, 0x07, 0x00, 0x00, 0x00, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
        });
        describe('venetianOpenUS()', function () {
            beforeEach(function () {
                rfy = new rfxcom.Rfy(device, rfxcom.rfy.RFYEXT);
            });
            it('should send the correct bytes to the serialport', function (done) {
                var sentCommandId = NaN;
                rfy.venetianOpenUS('0x010203/01', function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0c, 0x1a, 0x01, 0x00, 0x01, 0x02, 0x03, 0x01, 0x0f, 0x00, 0x00, 0x00, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
        });
        describe('venetianCloseUS()', function () {
            beforeEach(function () {
                rfy = new rfxcom.Rfy(device, rfxcom.rfy.RFYEXT);
            });
            it('should send the correct bytes to the serialport', function (done) {
                var sentCommandId = NaN;
                rfy.venetianCloseUS('0x010203/01', function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0c, 0x1a, 0x01, 0x00, 0x01, 0x02, 0x03, 0x01, 0x10, 0x00, 0x00, 0x00, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
        });
        describe('venetianIncreaseAngleUS()', function () {
            beforeEach(function () {
                rfy = new rfxcom.Rfy(device, rfxcom.rfy.RFYEXT);
            });
            it('should send the correct bytes to the serialport', function (done) {
                var sentCommandId = NaN;
                rfy.venetianIncreaseAngleUS('0x010203/01', function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0c, 0x1a, 0x01, 0x00, 0x01, 0x02, 0x03, 0x01, 0x11, 0x00, 0x00, 0x00, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
        });
        describe('venetianDecreaseAngleUS()', function () {
            beforeEach(function () {
                rfy = new rfxcom.Rfy(device, rfxcom.rfy.RFYEXT);
            });
            it('should send the correct bytes to the serialport', function (done) {
                var sentCommandId = NaN;
                rfy.venetianDecreaseAngleUS('0x010203/01', function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0c, 0x1a, 0x01, 0x00, 0x01, 0x02, 0x03, 0x01, 0x12, 0x00, 0x00, 0x00, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
        });
        describe('venetianOpenEU()', function () {
            beforeEach(function () {
                rfy = new rfxcom.Rfy(device, rfxcom.rfy.RFYEXT);
            });
            it('should send the correct bytes to the serialport', function (done) {
                var sentCommandId = NaN;
                rfy.venetianOpenEU('0x010203/01', function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0c, 0x1a, 0x01, 0x00, 0x01, 0x02, 0x03, 0x01, 0x11, 0x00, 0x00, 0x00, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
        });
        describe('venetianCloseEU()', function () {
            beforeEach(function () {
                rfy = new rfxcom.Rfy(device, rfxcom.rfy.RFYEXT);
            });
            it('should send the correct bytes to the serialport', function (done) {
                var sentCommandId = NaN;
                rfy.venetianCloseEU('0x010203/01', function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0c, 0x1a, 0x01, 0x00, 0x01, 0x02, 0x03, 0x01, 0x12, 0x00, 0x00, 0x00, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
        });
        describe('venetianIncreaseAngleEU()', function () {
            beforeEach(function () {
                rfy = new rfxcom.Rfy(device, rfxcom.rfy.RFYEXT);
            });
            it('should send the correct bytes to the serialport', function (done) {
                var sentCommandId = NaN;
                rfy.venetianIncreaseAngleEU('0x010203/01', function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0c, 0x1a, 0x01, 0x00, 0x01, 0x02, 0x03, 0x01, 0x0f, 0x00, 0x00, 0x00, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
        });
        describe('venetianDecreaseAngleEU()', function () {
            beforeEach(function () {
                rfy = new rfxcom.Rfy(device, rfxcom.rfy.RFYEXT);
            });
            it('should send the correct bytes to the serialport', function (done) {
                var sentCommandId = NaN;
                rfy.venetianDecreaseAngleEU('0x010203/01', function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0c, 0x1a, 0x01, 0x00, 0x01, 0x02, 0x03, 0x01, 0x10, 0x00, 0x00, 0x00, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
        });
        describe('enableSunSensor()', function () {
            beforeEach(function () {
                rfy = new rfxcom.Rfy(device, rfxcom.rfy.RFYEXT);
            });
            it('should send the correct bytes to the serialport', function (done) {
                var sentCommandId = NaN;
                rfy.enableSunSensor('0x010203/01', function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0c, 0x1a, 0x01, 0x00, 0x01, 0x02, 0x03, 0x01, 0x13, 0x00, 0x00, 0x00, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
        });
        describe('disableSunSensor()', function () {
            beforeEach(function () {
                rfy = new rfxcom.Rfy(device, rfxcom.rfy.RFYEXT);
            });
            it('should send the correct bytes to the serialport', function (done) {
                var sentCommandId = NaN;
                rfy.disableSunSensor('0x010203/01', function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0c, 0x1a, 0x01, 0x00, 0x01, 0x02, 0x03, 0x01, 0x14, 0x00, 0x00, 0x00, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
        });
        describe('do()', function () {
            beforeEach(function () {
                rfy = new rfxcom.Rfy(device, rfxcom.rfy.RFYEXT);
            });
            it('should send the correct bytes to the serialport', function (done) {
                var sentCommandId = NaN;
                rfy.doCommand('0x010203/01', "stop", function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0c, 0x1a, 0x01, 0x00, 0x01, 0x02, 0x03, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should send the correct bytes to the serialport', function (done) {
                var sentCommandId = NaN;
                rfy.doCommand('0x010203/01', "up", function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0c, 0x1a, 0x01, 0x00, 0x01, 0x02, 0x03, 0x01, 0x01, 0x00, 0x00, 0x00, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should send the correct bytes to the serialport', function (done) {
                var sentCommandId = NaN;
                rfy.doCommand('0x010203/01', "upstop", function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0c, 0x1a, 0x01, 0x00, 0x01, 0x02, 0x03, 0x01, 0x02, 0x00, 0x00, 0x00, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should send the correct bytes to the serialport', function (done) {
                var sentCommandId = NaN;
                rfy.doCommand('0x010203/01', "down", function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0c, 0x1a, 0x01, 0x00, 0x01, 0x02, 0x03, 0x01, 0x03, 0x00, 0x00, 0x00, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should send the correct bytes to the serialport', function (done) {
                var sentCommandId = NaN;
                rfy.doCommand('0x010203/01', "downstop", function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0c, 0x1a, 0x01, 0x00, 0x01, 0x02, 0x03, 0x01, 0x04, 0x00, 0x00, 0x00, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should send the correct bytes to the serialport', function (done) {
                var sentCommandId = NaN;
                rfy.doCommand('0x010203/01', "updown", function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0c, 0x1a, 0x01, 0x00, 0x01, 0x02, 0x03, 0x01, 0x05, 0x00, 0x00, 0x00, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should send the correct bytes to the serialport', function (done) {
                var sentCommandId = NaN;
                rfy.doCommand('0x010203/01', "listRemotes", function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0c, 0x1a, 0x01, 0x00, 0x00, 0x00, 0x01, 0x01, 0x06, 0x00, 0x00, 0x00, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should send the correct bytes to the serialport', function (done) {
                var sentCommandId = NaN;
                rfy.doCommand('0x010203/01', "program", function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0c, 0x1a, 0x01, 0x00, 0x01, 0x02, 0x03, 0x01, 0x07, 0x00, 0x00, 0x00, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should send the correct bytes to the serialport', function (done) {
                var sentCommandId = NaN;
                rfy.doCommand('0x010203/01', "program2sec", function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0c, 0x1a, 0x01, 0x00, 0x01, 0x02, 0x03, 0x01, 0x08, 0x00, 0x00, 0x00, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should send the correct bytes to the serialport', function (done) {
                var sentCommandId = NaN;
                rfy.doCommand('0x010203/01', "program7sec", function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0c, 0x1a, 0x01, 0x00, 0x01, 0x02, 0x03, 0x01, 0x09, 0x00, 0x00, 0x00, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should send the correct bytes to the serialport', function (done) {
                var sentCommandId = NaN;
                rfy.doCommand('0x010203/01', "stop2sec", function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0c, 0x1a, 0x01, 0x00, 0x01, 0x02, 0x03, 0x01, 0x0a, 0x00, 0x00, 0x00, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should send the correct bytes to the serialport', function (done) {
                var sentCommandId = NaN;
                rfy.doCommand('0x010203/01', "stop5sec", function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0c, 0x1a, 0x01, 0x00, 0x01, 0x02, 0x03, 0x01, 0x0b, 0x00, 0x00, 0x00, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should send the correct bytes to the serialport', function (done) {
                var sentCommandId = NaN;
                rfy.doCommand('0x010203/01', "updown5sec", function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0c, 0x1a, 0x01, 0x00, 0x01, 0x02, 0x03, 0x01, 0x0c, 0x00, 0x00, 0x00, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should send the correct bytes to the serialport', function (done) {
                var sentCommandId = NaN;
                rfy.doCommand('0x010203/01', "erasethis", function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0c, 0x1a, 0x01, 0x00, 0x01, 0x02, 0x03, 0x01, 0x0d, 0x00, 0x00, 0x00, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should send the correct bytes to the serialport', function (done) {
                var sentCommandId = NaN;
                rfy.doCommand('0x010203/01', "eraseall", function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0c, 0x1a, 0x01, 0x00, 0x01, 0x02, 0x03, 0x01, 0x0e, 0x00, 0x00, 0x00, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should send the correct bytes to the serialport', function (done) {
                var sentCommandId = NaN;
                rfy.doCommand('0x010203/01', "up05sec", function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0c, 0x1a, 0x01, 0x00, 0x01, 0x02, 0x03, 0x01, 0x0f, 0x00, 0x00, 0x00, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should send the correct bytes to the serialport', function (done) {
                var sentCommandId = NaN;
                rfy.doCommand('0x010203/01', "down05sec", function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0c, 0x1a, 0x01, 0x00, 0x01, 0x02, 0x03, 0x01, 0x10, 0x00, 0x00, 0x00, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should send the correct bytes to the serialport', function (done) {
                var sentCommandId = NaN;
                rfy.doCommand('0x010203/01', "up2sec", function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0c, 0x1a, 0x01, 0x00, 0x01, 0x02, 0x03, 0x01, 0x11, 0x00, 0x00, 0x00, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should send the correct bytes to the serialport', function (done) {
                var sentCommandId = NaN;
                rfy.doCommand('0x010203/01', "down2sec", function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0c, 0x1a, 0x01, 0x00, 0x01, 0x02, 0x03, 0x01, 0x12, 0x00, 0x00, 0x00, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should send the correct bytes to the serialport', function (done) {
                var sentCommandId = NaN;
                rfy.doCommand('0x010203/01', "sunwindenable", function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0c, 0x1a, 0x01, 0x00, 0x01, 0x02, 0x03, 0x01, 0x13, 0x00, 0x00, 0x00, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should send the correct bytes to the serialport', function (done) {
                var sentCommandId = NaN;
                rfy.doCommand('0x010203/01', "sundisable", function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0c, 0x1a, 0x01, 0x00, 0x01, 0x02, 0x03, 0x01, 0x14, 0x00, 0x00, 0x00, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should throw an exception with an invalid command string', function () {
                expect(function () {
                    rfy.doCommand('0x010203/5', "INVALID_COMMAND");
                }).toThrow("Unknown command 'INVALID_COMMAND'");
            });
            it('should throw an exception with an invalid command number', function () {
                expect(function () {
                    rfy.doCommand('0x010203/5', -1);
                }).toThrow("Invalid command number -1");
            });
            it('should send the correct bytes to the serialport', function (done) {
                var sentCommandId = NaN;
                rfy.doCommand('0x010203/01', 0, function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0c, 0x1a, 0x01, 0x00, 0x01, 0x02, 0x03, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should round command numbers to the nearest integer', function (done) {
                var sentCommandId = NaN;
                rfy.doCommand('0x010203/01', 0.499, function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0c, 0x1a, 0x01, 0x00, 0x01, 0x02, 0x03, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should send the correct bytes to the serialport', function (done) {
                var sentCommandId = NaN;
                rfy.doCommand('0x010203/01', 0x14, function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0c, 0x1a, 0x01, 0x00, 0x01, 0x02, 0x03, 0x01, 0x14, 0x00, 0x00, 0x00, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should throw an exception with an invalid command number', function () {
                expect(function () {
                    rfy.doCommand('0x010203/5', 0x15);
                }).toThrow("Invalid command number 21");
            });
        });
    });
    describe("subtype ASA", function () {
        describe('stop()', function () {
            beforeEach(function () {
                rfy = new rfxcom.Rfy(device, rfxcom.rfy.ASA);
            });
            it('should send the correct bytes to the serialport', function (done) {
                var sentCommandId = NaN;
                rfy.stop('0x010203/02', function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0c, 0x1a, 0x03, 0x00, 0x01, 0x02, 0x03, 0x02, 0x00, 0x00, 0x00, 0x00, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should log the bytes being sent in debug mode', function (done) {
                var debugDevice = new rfxcom.RfxCom('/dev/ttyUSB0', {
                        port:  fakeSerialPort,
                        debug: true
                    }),
                    rfyd = new rfxcom.Rfy(debugDevice, rfxcom.rfy.RFY),
                    consoleSpy = spyOn(console, 'log');
                debugDevice.connected = true;
                rfyd.stop('0x010203/01', done);
                expect(consoleSpy).toHaveBeenCalledWith('[rfxcom] on /dev/ttyUSB0 - Sent    : 0C,1A,00,00,01,02,03,01,00,00,00,00,00');
                debugDevice.acknowledge[0]();
            });
            it('should handle no callback', function () {
                rfy.stop('0x010203/01');
                expect(fakeSerialPort).toHaveSent([0x0c, 0x1a, 0x03, 0x00, 0x01, 0x02, 0x03, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00]);
            });
            it('should throw an exception with an invalid deviceId format', function () {
                expect(function () {
                    rfy.stop('01020301');
                }).toThrow("Invalid deviceId format");
            });
            it('should throw an exception with an address less than the minimum allowed', function () {
                expect(function () {
                    rfy.stop('0x0/1');
                }).toThrow("Address 0x0 outside valid range");
            });
            it('should accept the lowest valid address', function (done) {
                var sentCommandId = NaN;
                rfy.stop('0x01/2', function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0c, 0x1a, 0x03, 0x00, 0x00, 0x00, 0x01, 0x02, 0x00, 0x00, 0x00, 0x00, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should accept the highest valid address', function (done) {
                var sentCommandId = NaN;
                rfy.stop('0x0fffff/2', function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0c, 0x1a, 0x03, 0x00, 0x0f, 0xff, 0xff, 0x02, 0x00, 0x00, 0x00, 0x00, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should throw an exception with an address greater than the maximum allowed', function () {
                expect(function () {
                    rfy.stop('0x100000/1');
                }).toThrow("Address 0x100000 outside valid range");
            });
            it('should throw an exception with a unit code less than the minimum allowed', function () {
                expect(function () {
                    rfy.stop('0x010203/0');
                }).toThrow("Invalid unit code 0");
            });
            it('should accept the lowest valid unit code', function (done) {
                var sentCommandId = NaN;
                rfy.stop('0x010203/1', function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0c, 0x1a, 0x03, 0x00, 0x01, 0x02, 0x03, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should accept the highest valid unit code', function (done) {
                var sentCommandId = NaN;
                rfy.stop('0x010203/5', function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0c, 0x1a, 0x03, 0x00, 0x01, 0x02, 0x03, 0x05, 0x00, 0x00, 0x00, 0x00, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should throw an exception with an invalid unit code', function () {
                expect(function () {
                    rfy.stop('0x010203/0x6');
                }).toThrow("Invalid unit code 0x6");
            });
        });
        describe('up()', function () {
            beforeEach(function () {
                rfy = new rfxcom.Rfy(device, rfxcom.rfy.ASA);
            });
            it('should send the correct bytes to the serialport', function (done) {
                var sentCommandId = NaN;
                rfy.up('0x010203/01', function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0c, 0x1a, 0x03, 0x00, 0x01, 0x02, 0x03, 0x01, 0x01, 0x00, 0x00, 0x00, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
        });
        describe('down()', function () {
            beforeEach(function () {
                rfy = new rfxcom.Rfy(device, rfxcom.rfy.ASA);
            });
            it('should send the correct bytes to the serialport', function (done) {
                var sentCommandId = NaN;
                rfy.down('0x010203/01', function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0c, 0x1a, 0x03, 0x00, 0x01, 0x02, 0x03, 0x01, 0x03, 0x00, 0x00, 0x00, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
        });
        describe('list()', function () {
            beforeEach(function () {
                rfy = new rfxcom.Rfy(device, rfxcom.rfy.ASA);
            });
            it('should send the correct bytes to the serialport', function (done) {
                var sentCommandId = NaN;
                rfy.listRemotes(function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0c, 0x1a, 0x03, 0x00, 0x00, 0x00, 0x01, 0x01, 0x06, 0x00, 0x00, 0x00, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
        });
        describe('eraseall()', function () {
            beforeEach(function () {
                rfy = new rfxcom.Rfy(device, rfxcom.rfy.ASA);
            });
            it('should send the correct bytes to the serialport', function (done) {
                var sentCommandId = NaN;
                rfy.eraseAll(function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0c, 0x1a, 0x03, 0x00, 0x00, 0x00, 0x01, 0x01, 0x0e, 0x00, 0x00, 0x00, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
        });
        describe('erase()', function () {
            beforeEach(function () {
                rfy = new rfxcom.Rfy(device, rfxcom.rfy.ASA);
            });
            it('should send the correct bytes to the serialport', function (done) {
                var sentCommandId = NaN;
                rfy.erase('0x010203/01', function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0c, 0x1a, 0x03, 0x00, 0x01, 0x02, 0x03, 0x01, 0x0d, 0x00, 0x00, 0x00, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
        });
        describe('program()', function () {
            beforeEach(function () {
                rfy = new rfxcom.Rfy(device, rfxcom.rfy.ASA);
            });
            it('should send the correct bytes to the serialport', function (done) {
                var sentCommandId = NaN;
                rfy.program('0x010203/01', function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0c, 0x1a, 0x03, 0x00, 0x01, 0x02, 0x03, 0x01, 0x07, 0x00, 0x00, 0x00, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
        });
        describe('venetianOpenUS()', function () {
            beforeEach(function () {
                rfy = new rfxcom.Rfy(device, rfxcom.rfy.ASA);
            });
            it('should throw an exception', function () {
                expect(function () {
                    rfy.venetianOpenUS('0x010203/01');
                }).toThrow("ASA: Venetian blinds commands not supported");
            });
        });
        describe('venetianCloseUS()', function () {
            beforeEach(function () {
                rfy = new rfxcom.Rfy(device, rfxcom.rfy.ASA);
            });
            it('should throw an exception', function () {
                expect(function () {
                    rfy.venetianCloseUS('0x010203/01');
                }).toThrow("ASA: Venetian blinds commands not supported");
            });
        });
        describe('venetianIncreaseAngleUS()', function () {
            beforeEach(function () {
                rfy = new rfxcom.Rfy(device, rfxcom.rfy.ASA);
            });
            it('should throw an exception', function () {
                expect(function () {
                    rfy.venetianIncreaseAngleUS('0x010203/01');
                }).toThrow("ASA: Venetian blinds commands not supported");
            });
        });
        describe('venetianDecreaseAngleUS()', function () {
            beforeEach(function () {
                rfy = new rfxcom.Rfy(device, rfxcom.rfy.ASA);
            });
            it('should throw an exception', function () {
                expect(function () {
                    rfy.venetianDecreaseAngleUS('0x010203/01');
                }).toThrow("ASA: Venetian blinds commands not supported");
            });
        });
        describe('venetianOpenEU()', function () {
            beforeEach(function () {
                rfy = new rfxcom.Rfy(device, rfxcom.rfy.ASA);
            });
            it('should throw an exception', function () {
                expect(function () {
                    rfy.venetianOpenEU('0x010203/01');
                }).toThrow("ASA: Venetian blinds commands not supported");
            });
        });
        describe('venetianCloseEU()', function () {
            beforeEach(function () {
                rfy = new rfxcom.Rfy(device, rfxcom.rfy.ASA);
            });
            it('should throw an exception', function () {
                expect(function () {
                    rfy.venetianCloseEU('0x010203/01');
                }).toThrow("ASA: Venetian blinds commands not supported");
            });
        });
        describe('venetianIncreaseAngleEU()', function () {
            beforeEach(function () {
                rfy = new rfxcom.Rfy(device, rfxcom.rfy.ASA);
            });
            it('should throw an exception', function () {
                expect(function () {
                    rfy.venetianIncreaseAngleEU('0x010203/01');
                }).toThrow("ASA: Venetian blinds commands not supported");
            });
        });
        describe('venetianDecreaseAngleEU()', function () {
            beforeEach(function () {
                rfy = new rfxcom.Rfy(device, rfxcom.rfy.ASA);
            });
            it('should throw an exception', function () {
                expect(function () {
                    rfy.venetianDecreaseAngleEU('0x010203/01');
                }).toThrow("ASA: Venetian blinds commands not supported");
            });
        });
        describe('enableSunSensor()', function () {
            beforeEach(function () {
                rfy = new rfxcom.Rfy(device, rfxcom.rfy.ASA);
            });
            it('should send the correct bytes to the serialport', function (done) {
                var sentCommandId = NaN;
                rfy.enableSunSensor('0x010203/01', function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0c, 0x1a, 0x03, 0x00, 0x01, 0x02, 0x03, 0x01, 0x13, 0x00, 0x00, 0x00, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
        });
        describe('disableSunSensor()', function () {
            beforeEach(function () {
                rfy = new rfxcom.Rfy(device, rfxcom.rfy.ASA);
            });
            it('should send the correct bytes to the serialport', function (done) {
                var sentCommandId = NaN;
                rfy.disableSunSensor('0x010203/01', function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0c, 0x1a, 0x03, 0x00, 0x01, 0x02, 0x03, 0x01, 0x14, 0x00, 0x00, 0x00, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
        });
        describe('do()', function () {
            beforeEach(function () {
                rfy = new rfxcom.Rfy(device, rfxcom.rfy.ASA);
            });
            it('should send the correct bytes to the serialport', function (done) {
                var sentCommandId = NaN;
                rfy.doCommand('0x010203/01', "stop", function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0c, 0x1a, 0x03, 0x00, 0x01, 0x02, 0x03, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should send the correct bytes to the serialport', function (done) {
                var sentCommandId = NaN;
                rfy.doCommand('0x010203/01', "up", function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0c, 0x1a, 0x03, 0x00, 0x01, 0x02, 0x03, 0x01, 0x01, 0x00, 0x00, 0x00, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should send the correct bytes to the serialport', function (done) {
                var sentCommandId = NaN;
                rfy.doCommand('0x010203/01', "upstop", function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0c, 0x1a, 0x03, 0x00, 0x01, 0x02, 0x03, 0x01, 0x02, 0x00, 0x00, 0x00, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should send the correct bytes to the serialport', function (done) {
                var sentCommandId = NaN;
                rfy.doCommand('0x010203/01', "down", function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0c, 0x1a, 0x03, 0x00, 0x01, 0x02, 0x03, 0x01, 0x03, 0x00, 0x00, 0x00, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should send the correct bytes to the serialport', function (done) {
                var sentCommandId = NaN;
                rfy.doCommand('0x010203/01', "downstop", function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0c, 0x1a, 0x03, 0x00, 0x01, 0x02, 0x03, 0x01, 0x04, 0x00, 0x00, 0x00, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should send the correct bytes to the serialport', function (done) {
                var sentCommandId = NaN;
                rfy.doCommand('0x010203/01', "updown", function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0c, 0x1a, 0x03, 0x00, 0x01, 0x02, 0x03, 0x01, 0x05, 0x00, 0x00, 0x00, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should send the correct bytes to the serialport', function (done) {
                var sentCommandId = NaN;
                rfy.doCommand('0x010203/01', "listRemotes", function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0c, 0x1a, 0x03, 0x00, 0x00, 0x00, 0x01, 0x01, 0x06, 0x00, 0x00, 0x00, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should send the correct bytes to the serialport', function (done) {
                var sentCommandId = NaN;
                rfy.doCommand('0x010203/01', "program", function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0c, 0x1a, 0x03, 0x00, 0x01, 0x02, 0x03, 0x01, 0x07, 0x00, 0x00, 0x00, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should send the correct bytes to the serialport', function (done) {
                var sentCommandId = NaN;
                rfy.doCommand('0x010203/01', "program2sec", function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0c, 0x1a, 0x03, 0x00, 0x01, 0x02, 0x03, 0x01, 0x08, 0x00, 0x00, 0x00, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should send the correct bytes to the serialport', function (done) {
                var sentCommandId = NaN;
                rfy.doCommand('0x010203/01', "program7sec", function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0c, 0x1a, 0x03, 0x00, 0x01, 0x02, 0x03, 0x01, 0x09, 0x00, 0x00, 0x00, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should send the correct bytes to the serialport', function (done) {
                var sentCommandId = NaN;
                rfy.doCommand('0x010203/01', "stop2sec", function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0c, 0x1a, 0x03, 0x00, 0x01, 0x02, 0x03, 0x01, 0x0a, 0x00, 0x00, 0x00, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should send the correct bytes to the serialport', function (done) {
                var sentCommandId = NaN;
                rfy.doCommand('0x010203/01', "stop5sec", function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0c, 0x1a, 0x03, 0x00, 0x01, 0x02, 0x03, 0x01, 0x0b, 0x00, 0x00, 0x00, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should send the correct bytes to the serialport', function (done) {
                var sentCommandId = NaN;
                rfy.doCommand('0x010203/01', "updown5sec", function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0c, 0x1a, 0x03, 0x00, 0x01, 0x02, 0x03, 0x01, 0x0c, 0x00, 0x00, 0x00, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should send the correct bytes to the serialport', function (done) {
                var sentCommandId = NaN;
                rfy.doCommand('0x010203/01', "erasethis", function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0c, 0x1a, 0x03, 0x00, 0x01, 0x02, 0x03, 0x01, 0x0d, 0x00, 0x00, 0x00, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should send the correct bytes to the serialport', function (done) {
                var sentCommandId = NaN;
                rfy.doCommand('0x010203/01', "eraseall", function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0c, 0x1a, 0x03, 0x00, 0x01, 0x02, 0x03, 0x01, 0x0e, 0x00, 0x00, 0x00, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should send the correct bytes to the serialport', function (done) {
                var sentCommandId = NaN;
                rfy.doCommand('0x010203/01', "up05sec", function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0c, 0x1a, 0x03, 0x00, 0x01, 0x02, 0x03, 0x01, 0x0f, 0x00, 0x00, 0x00, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should send the correct bytes to the serialport', function (done) {
                var sentCommandId = NaN;
                rfy.doCommand('0x010203/01', "down05sec", function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0c, 0x1a, 0x03, 0x00, 0x01, 0x02, 0x03, 0x01, 0x10, 0x00, 0x00, 0x00, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should send the correct bytes to the serialport', function (done) {
                var sentCommandId = NaN;
                rfy.doCommand('0x010203/01', "up2sec", function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0c, 0x1a, 0x03, 0x00, 0x01, 0x02, 0x03, 0x01, 0x11, 0x00, 0x00, 0x00, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should send the correct bytes to the serialport', function (done) {
                var sentCommandId = NaN;
                rfy.doCommand('0x010203/01', "down2sec", function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0c, 0x1a, 0x03, 0x00, 0x01, 0x02, 0x03, 0x01, 0x12, 0x00, 0x00, 0x00, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should send the correct bytes to the serialport', function (done) {
                var sentCommandId = NaN;
                rfy.doCommand('0x010203/01', "sunwindenable", function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0c, 0x1a, 0x03, 0x00, 0x01, 0x02, 0x03, 0x01, 0x13, 0x00, 0x00, 0x00, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should send the correct bytes to the serialport', function (done) {
                var sentCommandId = NaN;
                rfy.doCommand('0x010203/01', "sundisable", function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0c, 0x1a, 0x03, 0x00, 0x01, 0x02, 0x03, 0x01, 0x14, 0x00, 0x00, 0x00, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should throw an exception with an invalid command string', function () {
                expect(function () {
                    rfy.doCommand('0x010203/5', "INVALID_COMMAND");
                }).toThrow("Unknown command 'INVALID_COMMAND'");
            });
            it('should throw an exception with an invalid command number', function () {
                expect(function () {
                    rfy.doCommand('0x010203/5', -1);
                }).toThrow("Invalid command number -1");
            });
            it('should send the correct bytes to the serialport', function (done) {
                var sentCommandId = NaN;
                rfy.doCommand('0x010203/01', 0, function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0c, 0x1a, 0x03, 0x00, 0x01, 0x02, 0x03, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should round command numbers to the nearest integer', function (done) {
                var sentCommandId = NaN;
                rfy.doCommand('0x010203/01', 0.499, function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0c, 0x1a, 0x03, 0x00, 0x01, 0x02, 0x03, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should send the correct bytes to the serialport', function (done) {
                var sentCommandId = NaN;
                rfy.doCommand('0x010203/01', 0x14, function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0c, 0x1a, 0x03, 0x00, 0x01, 0x02, 0x03, 0x01, 0x14, 0x00, 0x00, 0x00, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should throw an exception with an invalid command number', function () {
                expect(function () {
                    rfy.doCommand('0x010203/5', 0x15);
                }).toThrow("Invalid command number 21");
            });
        });
    });
});

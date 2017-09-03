/**
 * Created by max on 30/06/2017.
 */
/* global require: false, beforeEach: false, describe: false, it: false, expect: false,
   spyOn: false, console: false
*/
var rfxcom = require('../lib'),
    matchers = require('./matchers'),
    FakeSerialPort = require('./helper');

describe('HomeConfort class', function () {
    var homeConfort,
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
    describe('TEL_010', function () {
        beforeEach(function () {
            homeConfort = new rfxcom.HomeConfort(device, rfxcom.homeConfort.TEL_010);
        });
        describe('commands', function () {
            describe('switchOn()', function () {
                it('should send the correct bytes to the serialport', function (done) {
                    var sentCommandId = NaN;
                    homeConfort.switchOn('0x1234/A/1', function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x0C, 0x1B, 0x00, 0x00, 0x00, 0x12, 0x34, 0x41, 0x01, 0x01, 0x00, 0x00, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
                it('should handle a group command', function (done) {
                    var sentCommandId = NaN;
                    homeConfort.switchOn('0x1234/A/0', function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x0C, 0x1B, 0x00, 0x00, 0x00, 0x12, 0x34, 0x41, 0x00, 0x03, 0x00, 0x00, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
            });
            describe('switchOff()', function () {
                it('should send the correct bytes to the serialport', function (done) {
                    var sentCommandId = NaN;
                    homeConfort.switchOff('0x1234/A/1', function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x0C, 0x1B, 0x00, 0x00, 0x00, 0x12, 0x34, 0x41, 0x01, 0x00, 0x00, 0x00, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
                it('should handle a group command', function (done) {
                    var sentCommandId = NaN;
                    homeConfort.switchOff('0x1234/A/0', function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x0C, 0x1B, 0x00, 0x00, 0x00, 0x12, 0x34, 0x41, 0x00, 0x02, 0x00, 0x00, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
            });
        });
        describe('address checking', function () {
            it('should throw an exception with an invalid deviceId format', function () {
                expect(function () {
                    homeConfort.switchOn('0x3FFF');
                }).toThrow("Invalid deviceId format");
            });
            it('should accept the highest address, house and unit code values', function (done) {
                var sentCommandId = NaN;
                homeConfort.switchOn('0x7FFFF/D/4', function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0C, 0x1B, 0x00, 0x00, 0x07, 0xff, 0xff, 0x44, 0x04, 0x01, 0x00, 0x00, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should accept the lowest address and unit code values', function (done) {
                var sentCommandId = NaN;
                homeConfort.switchOn('0x1/A/1', function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0C, 0x1B, 0x00, 0x00, 0x00, 0x00, 0x01, 0x41, 0x01, 0x01, 0x00, 0x00, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should throw an exception with an invalid unit number 5', function () {
                expect(function () {
                    homeConfort.switchOn('0x7FFF/D/7');
                }).toThrow("Invalid unit code 7");
            });
            it('should throw an exception with an invalid unit number -1', function () {
                expect(function () {
                    homeConfort.switchOn('0x7FFF/D/-1');
                }).toThrow("Invalid unit code -1");
            });
            it('should throw an exception with an invalid house code E', function () {
                expect(function () {
                    homeConfort.switchOn('0x7FFF/E/1');
                }).toThrow("Invalid house code 'E'");
            });
            it('should throw an exception with an invalid unit number @', function () {
                expect(function () {
                    homeConfort.switchOn('0x7FFF/@/-1');
                }).toThrow("Invalid house code '@'");
            });
            it('should throw an exception with an invalid address 0x80000', function () {
                expect(function () {
                    homeConfort.switchOn('0x80000/A/4');
                }).toThrow("Address 0x80000 outside valid range");
            });
            it('should throw an exception with an invalid address 0x0', function () {
                expect(function () {
                    homeConfort.switchOn('0x0/A/4');
                }).toThrow("Address 0x0 outside valid range");
            });
        });
    })
});

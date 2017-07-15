/**
 * Created by max on 12/07/2017.
 */

const rfxcom = require('../lib'),
    matchers = require('./matchers'),
    FakeSerialPort = require('./helper');

describe('Camera1 class', function () {
    let camera = {},
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
    describe('X10_NINJA', function () {
        beforeEach(function () {
            camera = new rfxcom.Camera1(device, rfxcom.camera1.X10_NINJA);
        });
        describe('commands', function () {
            describe('panLeft()', function () {
                it('should send the correct bytes to the serialport', function (done) {
                    let sentCommandId = NaN;
                    camera.panLeft('A', function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x06, 0x28, 0x00, 0x00, 0x41, 0x00, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
            });
            describe('panRight()', function () {
                it('should send the correct bytes to the serialport', function (done) {
                    let sentCommandId = NaN;
                    camera.panRight('A', function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x06, 0x28, 0x00, 0x00, 0x41, 0x01, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
            });
            describe('tiltUp()', function () {
                it('should send the correct bytes to the serialport', function (done) {
                    let sentCommandId = NaN;
                    camera.tiltUp('A', function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x06, 0x28, 0x00, 0x00, 0x41, 0x02, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
            });
            describe('tiltDown()', function () {
                it('should send the correct bytes to the serialport', function (done) {
                    let sentCommandId = NaN;
                    camera.tiltDown('A', function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x06, 0x28, 0x00, 0x00, 0x41, 0x03, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
            });
            describe('goToPosition()', function () {
                it('should send the correct bytes to the serialport for position 0', function (done) {
                    let sentCommandId = NaN;
                    camera.goToPosition('A', 0, function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x06, 0x28, 0x00, 0x00, 0x41, 0x0c, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
                it('should send the correct bytes to the serialport for position 1', function (done) {
                    let sentCommandId = NaN;
                    camera.goToPosition('A', 1, function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x06, 0x28, 0x00, 0x00, 0x41, 0x04, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
                it('should send the correct bytes to the serialport for position 2', function (done) {
                    let sentCommandId = NaN;
                    camera.goToPosition('A', 2, function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x06, 0x28, 0x00, 0x00, 0x41, 0x06, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
                it('should send the correct bytes to the serialport for position 3', function (done) {
                    let sentCommandId = NaN;
                    camera.goToPosition('A', 3, function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x06, 0x28, 0x00, 0x00, 0x41, 0x08, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
                it('should send the correct bytes to the serialport for position 4', function (done) {
                    let sentCommandId = NaN;
                    camera.goToPosition('A', 4, function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x06, 0x28, 0x00, 0x00, 0x41, 0x0a, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
                it('should throw an error for position < 0', function () {
                    expect(function () {
                        camera.goToPosition('A', -1);
                    }).toThrow("Invalid position: value must be in range 0-4");
                });
                it('should throw an error for position > 4', function () {
                    expect(function () {
                        camera.goToPosition('A', 5);
                    }).toThrow("Invalid position: value must be in range 0-4");
                });
            });
            describe('programPosition()', function () {
                it('should send the correct bytes to the serialport for position 0', function (done) {
                    let sentCommandId = NaN;
                    camera.programPosition('A', 0, function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x06, 0x28, 0x00, 0x00, 0x41, 0x0d, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
                it('should send the correct bytes to the serialport for position 1', function (done) {
                    let sentCommandId = NaN;
                    camera.programPosition('A', 1, function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x06, 0x28, 0x00, 0x00, 0x41, 0x05, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
                it('should send the correct bytes to the serialport for position 2', function (done) {
                    let sentCommandId = NaN;
                    camera.programPosition('A', 2, function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x06, 0x28, 0x00, 0x00, 0x41, 0x07, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
                it('should send the correct bytes to the serialport for position 3', function (done) {
                    let sentCommandId = NaN;
                    camera.programPosition('A', 3, function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x06, 0x28, 0x00, 0x00, 0x41, 0x09, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
                it('should send the correct bytes to the serialport for position 4', function (done) {
                    let sentCommandId = NaN;
                    camera.programPosition('A', 4, function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x06, 0x28, 0x00, 0x00, 0x41, 0x0b, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
                it('should throw an error for position < 0', function () {
                    expect(function () {
                        camera.programPosition('A', -1);
                    }).toThrow("Invalid position: value must be in range 0-4");
                });
                it('should throw an error for position > 4', function () {
                    expect(function () {
                        camera.programPosition('A', 5);
                    }).toThrow("Invalid position: value must be in range 0-4");
                });
            });
            describe('sweep()', function () {
                it('should send the correct bytes to the serialport', function (done) {
                    let sentCommandId = NaN;
                    camera.sweep('A', function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x06, 0x28, 0x00, 0x00, 0x41, 0x0e, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
            });
            describe('programSweep()', function () {
                it('should send the correct bytes to the serialport', function (done) {
                    let sentCommandId = NaN;
                    camera.programSweep('A', function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x06, 0x28, 0x00, 0x00, 0x41, 0x0f, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
            });
        });
        describe('address checking', function () {
            it('should throw an exception with an invalid deviceId format', function () {
                expect(function () {
                    camera.panLeft('0x1234/A');
                }).toThrow("Invalid deviceId format");
            });
            it('should accept the highest house code', function (done) {
                let sentCommandId = NaN;
                camera.panLeft('P', function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x06, 0x28, 0x00, 0x00, 0x50, 0x00, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should accept the lowest house code', function (done) {
                let sentCommandId = NaN;
                camera.panLeft('A', function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x06, 0x28, 0x00, 0x00, 0x41, 0x00, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should throw an exception with an invalid house code "@"', function () {
                expect(function () {
                    camera.panLeft('@');
                }).toThrow("Invalid house code '@'");
            });
            it('should throw an exception with an invalid address "Q"', function () {
                expect(function () {
                    camera.panLeft('Q');
                }).toThrow("Invalid house code 'Q'");
            });
        });
    });
});

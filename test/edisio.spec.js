const rfxcom = require('../lib'),
    util = require('util'),
    matchers = require('./matchers'),
    FakeSerialPort = require('./helper');

beforeEach(function () {
    this.addMatchers({
        toHaveSent: matchers.toHaveSent
    });
});

describe('Edisio class', function () {
    let edisio,
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
        device.acknowledge.forEach(acknowledge => {
            if (typeof acknowledge === "function") {
                acknowledge()
            }
        });
    });
    describe('instantiation', function () {
        it('should throw an error if no subtype is specified', function () {
            expect(function () {
                edisio = new rfxcom.Edisio(device);
            }).toThrow("Must provide a subtype.");
        });
    });
    describe('EDISIO_CONTROLLER', function () {
        beforeEach(function () {
            edisio = new rfxcom.Edisio(device, rfxcom.edisio.EDISIO_CONTROLLER);
        });
        describe('commands', function () {
            describe('switchOff()', function () {
                it('should send the correct bytes to the serialport', function (done) {
                    let sentCommandId = NaN;
                    edisio.switchOff('0x12345678/9', function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x11, 0x1c, 0x00, 0x00, 0x12, 0x34, 0x56, 0x78, 0x09,
                        0x00, 0x00, 0x00, 0x00, 0x00, 0x05, 0x00, 0x00, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
            });
            describe('switchOn()', function () {
                it('should send the correct bytes to the serialport', function (done) {
                    let sentCommandId = NaN;
                    edisio.switchOn('0x12345678/9', function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x11, 0x1c, 0x00, 0x00, 0x12, 0x34, 0x56, 0x78, 0x09,
                        0x01, 0x00, 0x00, 0x00, 0x00, 0x05, 0x00, 0x00, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
            });
            describe('toggleOnOff()', function () {
                it('should send the correct bytes to the serialport', function (done) {
                    let sentCommandId = NaN;
                    edisio.toggleOnOff('0x12345678/9', function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x11, 0x1c, 0x00, 0x00, 0x12, 0x34, 0x56, 0x78, 0x09,
                        0x02, 0x00, 0x00, 0x00, 0x00, 0x05, 0x00, 0x00, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
            });
            describe('setLevel()', function () {
                it('should send the correct bytes to the serialport', function (done) {
                    let sentCommandId = NaN;
                    edisio.setLevel('0x12345678/9', 17, function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x11, 0x1c, 0x00, 0x00, 0x12, 0x34, 0x56, 0x78, 0x09,
                        0x03, 0x11, 0x00, 0x00, 0x00, 0x05, 0x00, 0x00, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
                it('should accept level 0', function (done) {
                    let sentCommandId = NaN;
                    edisio.setLevel('0x12345678/9', 0, function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x11, 0x1c, 0x00, 0x00, 0x12, 0x34, 0x56, 0x78, 0x09,
                        0x03, 0x00, 0x00, 0x00, 0x00, 0x05, 0x00, 0x00, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
                it('should accept level 100', function (done) {
                    let sentCommandId = NaN;
                    edisio.setLevel('0x12345678/9', 100, function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x11, 0x1c, 0x00, 0x00, 0x12, 0x34, 0x56, 0x78, 0x09,
                        0x03, 0x64, 0x00, 0x00, 0x00, 0x05, 0x00, 0x00, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
                it('should throw an error for level -1', function () {
                    expect(function () {
                        edisio.setLevel('0x12345678/9', -1);
                    }).toThrow("Dim level must be in the range 0-100");
                });
                it('should throw an error for level 101', function () {
                    expect(function () {
                        edisio.setLevel('0x12345678/9', -1);
                    }).toThrow("Dim level must be in the range 0-100");
                });
            });
            describe('increaseLevel()', function () {
                it('should send the correct bytes to the serialport', function (done) {
                    let sentCommandId = NaN;
                    edisio.increaseLevel('0x12345678/9', function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x11, 0x1c, 0x00, 0x00, 0x12, 0x34, 0x56, 0x78, 0x09,
                        0x04, 0x00, 0x00, 0x00, 0x00, 0x05, 0x00, 0x00, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
            });
            describe('decreaseLevel()', function () {
                it('should send the correct bytes to the serialport', function (done) {
                    let sentCommandId = NaN;
                    edisio.decreaseLevel('0x12345678/9', function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x11, 0x1c, 0x00, 0x00, 0x12, 0x34, 0x56, 0x78, 0x09,
                        0x05, 0x00, 0x00, 0x00, 0x00, 0x05, 0x00, 0x00, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
            });
            describe('toggleDimming()', function () {
                it('should send the correct bytes to the serialport', function (done) {
                    let sentCommandId = NaN;
                    edisio.toggleDimming('0x12345678/9', function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x11, 0x1c, 0x00, 0x00, 0x12, 0x34, 0x56, 0x78, 0x09,
                        0x06, 0x00, 0x00, 0x00, 0x00, 0x05, 0x00, 0x00, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
            });
            describe('stopDimming()', function () {
                it('should send the correct bytes to the serialport', function (done) {
                    let sentCommandId = NaN;
                    edisio.stopDimming('0x12345678/9', function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x11, 0x1c, 0x00, 0x00, 0x12, 0x34, 0x56, 0x78, 0x09,
                        0x07, 0x00, 0x00, 0x00, 0x00, 0x05, 0x00, 0x00, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
            });
            describe('setColour()', function () {
                it('should send the correct bytes to the serialport', function (done) {
                    let sentCommandId = NaN;
                    edisio.setColour('0x12345678/9', {R: 1, G: 2, B: 3}, function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x11, 0x1c, 0x00, 0x00, 0x12, 0x34, 0x56, 0x78, 0x09,
                        0x08, 0x00, 0x01, 0x02, 0x03, 0x05, 0x00, 0x00, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
                it('should accept {R: 0, G: 0, B: 0}', function (done) {
                    let sentCommandId = NaN;
                    edisio.setColour('0x12345678/9', {R: 0, G: 0, B: 0}, function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x11, 0x1c, 0x00, 0x00, 0x12, 0x34, 0x56, 0x78, 0x09,
                        0x08, 0x00, 0x00, 0x00, 0x00, 0x05, 0x00, 0x00, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
                it('should accept {R: 255, G: 255, B: 255}', function (done) {
                    let sentCommandId = NaN;
                    edisio.setColour('0x12345678/9', {R: 255, G: 255, B: 255}, function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x11, 0x1c, 0x00, 0x00, 0x12, 0x34, 0x56, 0x78, 0x09,
                        0x08, 0x00, 0xff, 0xff, 0xff, 0x05, 0x00, 0x00, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
                it('should throw an error for {R: 0, G: -1, B: 0}', function () {
                    expect(function () {
                        edisio.setColour('0x12345678/9', {R: 0, G: -1, B: 0});
                    }).toThrow("Colour RGB values must be in the range 0-255");
                });
                it('should throw an error for {R: 255, G: 256, B: 255}', function () {
                    expect(function () {
                        edisio.setColour('0x12345678/9', {R: 255, G: 256, B: 255});
                    }).toThrow("Colour RGB values must be in the range 0-255");
                });
                it('should throw an error for a malformed colour parameter', function () {
                    expect(function () {
                        edisio.setColour('0x12345678/9', {R: 255, B: 255});
                    }).toThrow("Colour must be an object with fields R, G, B");
                });
            });
            describe('program()', function () {
                it('should send the correct bytes to the serialport', function (done) {
                    let sentCommandId = NaN;
                    edisio.program('0x12345678/9', function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x11, 0x1c, 0x00, 0x00, 0x12, 0x34, 0x56, 0x78, 0x09,
                        0x09, 0x00, 0x00, 0x00, 0x00, 0x05, 0x00, 0x00, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
            });
            describe('open()', function () {
                it('should send the correct bytes to the serialport', function (done) {
                    let sentCommandId = NaN;
                    edisio.open('0x12345678/9', function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x11, 0x1c, 0x00, 0x00, 0x12, 0x34, 0x56, 0x78, 0x09,
                        0x0a, 0x00, 0x00, 0x00, 0x00, 0x05, 0x00, 0x00, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
            });
            describe('stop()', function () {
                it('should send the correct bytes to the serialport', function (done) {
                    let sentCommandId = NaN;
                    edisio.stop('0x12345678/9', function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x11, 0x1c, 0x00, 0x00, 0x12, 0x34, 0x56, 0x78, 0x09,
                        0xb, 0x00, 0x00, 0x00, 0x00, 0x05, 0x00, 0x00, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
            });
            describe('close()', function () {
                it('should send the correct bytes to the serialport', function (done) {
                    let sentCommandId = NaN;
                    edisio.close('0x12345678/9', function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x11, 0x1c, 0x00, 0x00, 0x12, 0x34, 0x56, 0x78, 0x09,
                        0x0c, 0x00, 0x00, 0x00, 0x00, 0x05, 0x00, 0x00, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
            });
            describe('sendContactNormal()', function () {
                it('should send the correct bytes to the serialport', function (done) {
                    let sentCommandId = NaN;
                    edisio.sendContactNormal('0x12345678/9', function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x11, 0x1c, 0x00, 0x00, 0x12, 0x34, 0x56, 0x78, 0x09,
                        0x0d, 0x00, 0x00, 0x00, 0x00, 0x05, 0x00, 0x00, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
            });
            describe('sendContactAlert()', function () {
                it('should send the correct bytes to the serialport', function (done) {
                    let sentCommandId = NaN;
                    edisio.sendContactAlert('0x12345678/9', function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x11, 0x1c, 0x00, 0x00, 0x12, 0x34, 0x56, 0x78, 0x09,
                        0x0e, 0x00, 0x00, 0x00, 0x00, 0x05, 0x00, 0x00, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
            });
            describe('address checking', function () {
                it('should throw an exception with an invalid deviceId format', function () {
                    expect(function () {
                        edisio.switchOff('0x12345678');
                    }).toThrow("Invalid deviceId format");
                });
                it('should accept the highest address & unit code', function (done) {
                    let sentCommandId = NaN;
                    edisio.switchOff('0xffffffff/16', function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x11, 0x1c, 0x00, 0x00, 0xff, 0xff, 0xff, 0xff, 0x10,
                        0x00, 0x00, 0x00, 0x00, 0x00, 0x05, 0x00, 0x00, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
                it('should accept the lowest address & unit code', function (done) {
                    let sentCommandId = NaN;
                    edisio.switchOff('0x1/1', function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x11, 0x1c, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01, 0x01,
                        0x00, 0x00, 0x00, 0x00, 0x00, 0x05, 0x00, 0x00, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
                it('should throw an exception with a unitCode of 0 (group address)', function () {
                    expect(function () {
                        edisio.switchOff('0x12345678/0');
                    }).toThrow("Subtype doesn't support group commands");
                });
                it('should throw an exception with a unitCode of -1', function () {
                    expect(function () {
                        edisio.switchOff('0x12345678/-1');
                    }).toThrow("Invalid unit code -1");
                });
                it('should throw an exception with a unitCode of 17', function () {
                    expect(function () {
                        edisio.switchOff('0x12345678/17');
                    }).toThrow("Invalid unit code 17");
                });
                it('should throw an exception with an address of 0x0', function () {
                    expect(function () {
                        edisio.switchOff('0x0/1');
                    }).toThrow("Address 0x0 outside valid range");
                });
                it('should throw an exception with an address of 0x1ffffffff', function () {
                    expect(function () {
                        edisio.switchOff('0x1ffffffff/1');
                    }).toThrow("Address 0x1ffffffff outside valid range");
                });
            });
        });
    });
});

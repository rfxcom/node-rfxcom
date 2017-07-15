/**
 * Created by max on 12/07/2017.
 */
const rfxcom = require('../lib'),
    matchers = require('./matchers'),
    FakeSerialPort = require('./helper');

describe('Remote class', function () {
    let remote = {},
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
    describe('ATI_REMOTE_WONDER', function () {
        beforeEach(function () {
            remote = new rfxcom.Remote(device, rfxcom.remote.ATI_REMOTE_WONDER);
        });
        describe('commands', function () {
            describe('buttonPress()', function () {
                it('should send the correct bytes to the serialport for a numeric button code 8', function (done) {
                    let sentCommandId = NaN;
                    remote.buttonPress('0x12', 8, function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x06, 0x30, 0x00, 0x00, 0x12, 0x08, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
                it('should send the correct bytes to the serialport an exact string match', function (done) {
                    let sentCommandId = NaN;
                    remote.buttonPress('0x12', 'VOL+', function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x06, 0x30, 0x00, 0x00, 0x12, 0x08, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
                it('should send the correct bytes to the serialport a case-insensitive string match', function (done) {
                    let sentCommandId = NaN;
                    remote.buttonPress('0x12', 'Vol+', function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x06, 0x30, 0x00, 0x00, 0x12, 0x08, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
                it('should throw an error for position < 0', function () {
                    expect(function () {
                        remote.buttonPress('0x12', 'No such button');
                    }).toThrow("Invalid button name 'No such button'");
                });
                it('should throw an error for a numeric button code > 255', function () {
                    expect(function () {
                        remote.buttonPress('0x12', 500);
                    }).toThrow("Invalid button: value must be in range 0-255");
                });
                it('should throw an error for a numeric button code < 0', function () {
                    expect(function () {
                        remote.buttonPress('0x12', -500);
                    }).toThrow("Invalid button: value must be in range 0-255");
                });
            });
        });
        describe('address checking', function () {
            it('should throw an exception with an invalid deviceId format', function () {
                expect(function () {
                    remote.buttonPress('0x1234/A', 8);
                }).toThrow("Invalid deviceId format");
            });
            it('should accept the highest address', function (done) {
                let sentCommandId = NaN;
                remote.buttonPress('0xff', 8, function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x06, 0x30, 0x00, 0x00, 0xff, 0x08, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should accept the lowest address', function (done) {
                let sentCommandId = NaN;
                remote.buttonPress('0x00', 8, function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x06, 0x30, 0x00, 0x00, 0x00, 0x08, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should throw an exception with an invalid address 0x100', function () {
                expect(function () {
                    remote.buttonPress('0x100', 8);
                }).toThrow("Address 0x100 outside valid range");
            });
        });
    });
    describe('ATI_REMOTE_WONDER_PLUS', function () {
        beforeEach(function () {
            remote = new rfxcom.Remote(device, rfxcom.remote.ATI_REMOTE_WONDER_PLUS);
        });
        describe('commands', function () {
            describe('buttonPress()', function () {
                it('should send the correct bytes to the serialport for a numeric button code 8', function (done) {
                    let sentCommandId = NaN;
                    remote.buttonPress('0x12', 8, function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x06, 0x30, 0x01, 0x00, 0x12, 0x08, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
                it('should send the correct bytes to the serialport an exact string match', function (done) {
                    let sentCommandId = NaN;
                    remote.buttonPress('0x12', 'VOL+', function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x06, 0x30, 0x01, 0x00, 0x12, 0x08, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
                it('should send the correct bytes to the serialport a case-insensitive string match', function (done) {
                    let sentCommandId = NaN;
                    remote.buttonPress('0x12', 'Vol+', function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x06, 0x30, 0x01, 0x00, 0x12, 0x08, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
                it('should throw an error for position < 0', function () {
                    expect(function () {
                        remote.buttonPress('0x12', 'No such button');
                    }).toThrow("Invalid button name 'No such button'");
                });
                it('should throw an error for a numeric button code > 255', function () {
                    expect(function () {
                        remote.buttonPress('0x12', 500);
                    }).toThrow("Invalid button: value must be in range 0-255");
                });
                it('should throw an error for a numeric button code < 0', function () {
                    expect(function () {
                        remote.buttonPress('0x12', -500);
                    }).toThrow("Invalid button: value must be in range 0-255");
                });
            });
        });
        describe('address checking', function () {
            it('should throw an exception with an invalid deviceId format', function () {
                expect(function () {
                    remote.buttonPress('0x1234/A', 8);
                }).toThrow("Invalid deviceId format");
            });
            it('should accept the highest address', function (done) {
                let sentCommandId = NaN;
                remote.buttonPress('0xff', 8, function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x06, 0x30, 0x01, 0x00, 0xff, 0x08, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should accept the lowest address', function (done) {
                let sentCommandId = NaN;
                remote.buttonPress('0x00', 8, function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x06, 0x30, 0x01, 0x00, 0x00, 0x08, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should throw an exception with an invalid address 0x100', function () {
                expect(function () {
                    remote.buttonPress('0x100', 8);
                }).toThrow("Address 0x100 outside valid range");
            });
        });
    });
    describe('MEDION', function () {
        beforeEach(function () {
            remote = new rfxcom.Remote(device, rfxcom.remote.MEDION);
        });
        describe('commands', function () {
            describe('buttonPress()', function () {
                it('should send the correct bytes to the serialport for a numeric button code 9', function (done) {
                    let sentCommandId = NaN;
                    remote.buttonPress('0x12', 9, function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x06, 0x30, 0x02, 0x00, 0x12, 0x09, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
                it('should send the correct bytes to the serialport an exact string match', function (done) {
                    let sentCommandId = NaN;
                    remote.buttonPress('0x12', 'VOL+', function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x06, 0x30, 0x02, 0x00, 0x12, 0x09, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
                it('should send the correct bytes to the serialport a case-insensitive string match', function (done) {
                    let sentCommandId = NaN;
                    remote.buttonPress('0x12', 'Vol+', function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x06, 0x30, 0x02, 0x00, 0x12, 0x09, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
                it('should throw an error for position < 0', function () {
                    expect(function () {
                        remote.buttonPress('0x12', 'No such button');
                    }).toThrow("Invalid button name 'No such button'");
                });
                it('should throw an error for a numeric button code > 255', function () {
                    expect(function () {
                        remote.buttonPress('0x12', 500);
                    }).toThrow("Invalid button: value must be in range 0-255");
                });
                it('should throw an error for a numeric button code < 0', function () {
                    expect(function () {
                        remote.buttonPress('0x12', -500);
                    }).toThrow("Invalid button: value must be in range 0-255");
                });
            });
        });
        describe('address checking', function () {
            it('should throw an exception with an invalid deviceId format', function () {
                expect(function () {
                    remote.buttonPress('0x1234/A', 8);
                }).toThrow("Invalid deviceId format");
            });
            it('should accept the highest address', function (done) {
                let sentCommandId = NaN;
                remote.buttonPress('0xff', 9, function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x06, 0x30, 0x02, 0x00, 0xff, 0x09, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should accept the lowest address', function (done) {
                let sentCommandId = NaN;
                remote.buttonPress('0x00', 9, function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x06, 0x30, 0x02, 0x00, 0x00, 0x09, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should throw an exception with an invalid address 0x100', function () {
                expect(function () {
                    remote.buttonPress('0x100', 8);
                }).toThrow("Address 0x100 outside valid range");
            });
        });
    });
    describe('X10_PC_REMOTE', function () {
        beforeEach(function () {
            remote = new rfxcom.Remote(device, rfxcom.remote.X10_PC_REMOTE);
        });
        describe('commands', function () {
            describe('buttonPress()', function () {
                it('should send the correct bytes to the serialport for a numeric button code 96', function (done) {
                    let sentCommandId = NaN;
                    remote.buttonPress('0x12', 96, function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x06, 0x30, 0x03, 0x00, 0x12, 0x60, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
                it('should send the correct bytes to the serialport an exact string match', function (done) {
                    let sentCommandId = NaN;
                    remote.buttonPress('0x12', 'VOL+', function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x06, 0x30, 0x03, 0x00, 0x12, 0x60, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
                it('should send the correct bytes to the serialport a case-insensitive string match', function (done) {
                    let sentCommandId = NaN;
                    remote.buttonPress('0x12', 'Vol+', function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x06, 0x30, 0x03, 0x00, 0x12, 0x60, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
                it('should throw an error for position < 0', function () {
                    expect(function () {
                        remote.buttonPress('0x12', 'No such button');
                    }).toThrow("Invalid button name 'No such button'");
                });
                it('should throw an error for a numeric button code > 255', function () {
                    expect(function () {
                        remote.buttonPress('0x12', 500);
                    }).toThrow("Invalid button: value must be in range 0-255");
                });
                it('should throw an error for a numeric button code < 0', function () {
                    expect(function () {
                        remote.buttonPress('0x12', -500);
                    }).toThrow("Invalid button: value must be in range 0-255");
                });
            });
        });
        describe('address checking', function () {
            it('should throw an exception with an invalid deviceId format', function () {
                expect(function () {
                    remote.buttonPress('0x1234/A', 96);
                }).toThrow("Invalid deviceId format");
            });
            it('should accept the highest address', function (done) {
                let sentCommandId = NaN;
                remote.buttonPress('0xff', 96, function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x06, 0x30, 0x03, 0x00, 0xff, 0x60, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should accept the lowest address', function (done) {
                let sentCommandId = NaN;
                remote.buttonPress('0x00', 96, function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x06, 0x30, 0x03, 0x00, 0x00, 0x60, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should throw an exception with an invalid address 0x100', function () {
                expect(function () {
                    remote.buttonPress('0x100', 8);
                }).toThrow("Address 0x100 outside valid range");
            });
        });
    });
    describe('ATI_REMOTE_WONDER_2', function () {
        beforeEach(function () {
            remote = new rfxcom.Remote(device, rfxcom.remote.ATI_REMOTE_WONDER_2);
        });
        describe('commands', function () {
            describe('buttonPress()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        remote.buttonPress('0x12', 'VOL+');
                    }).toThrow("Device does not support buttonPress()");
                });
            });
        });
        describe('address checking', function () {
        });
    });
});

/**
 * Created by max on 11/07/2017.
 */
const rfxcom = require('../lib'),
    matchers = require('./matchers'),
    FakeSerialPort = require('./helper');

describe('Security1 class', function () {
    let security = {},
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
        device.acknowledge.forEach(acknowledge => {if (typeof acknowledge === "function") {acknowledge()}});
    });
    describe('X10_DOOR', function () {
        beforeEach(function () {
            security = new rfxcom.Security1(device, rfxcom.security1.X10_DOOR);
        });
        describe('commands', function () {
            describe('sendStatus', function () {
                it('should send the correct bytes to the serialport', function (done) {
                    let sentCommandId = NaN;
                    security.sendStatus('0x1234', 0, function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x08, 0x20, 0x00, 0x00, 0x12, 0x00, 0x34, 0x00, 0x00]);
                    expect(sentCommandId).toEqual(0);
                })
            });
            describe('sendPanic', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        security.sendPanic('0x1234');
                    }).toThrow("Device does not support sendPanic()");
                });
            });
            describe('cancelPanic', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        security.cancelPanic('0x1234');
                    }).toThrow("Device does not support cancelPanic()");
                });
            });
            describe('armSystemAway', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        security.armSystemAway('0x1234');
                    }).toThrow("Device does not support armSystemAway()");
                });
            });
            describe('armSystemAwayWithDelay', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        security.armSystemAwayWithDelay('0x1234');
                    }).toThrow("Device does not support armSystemAwayWithDelay()");
                });
            });
            describe('armSystemHome', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        security.armSystemHome('0x1234');
                    }).toThrow("Device does not support armSystemHome()");
                });
            });
            describe('armSystemHomeWithDelay', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        security.armSystemHomeWithDelay('0x1234');
                    }).toThrow("Device does not support armSystemHomeWithDelay()");
                });
            });
            describe('disarmSystem', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        security.disarmSystem('0x1234');
                    }).toThrow("Device does not support disarmSystem()");
                });
            });
            describe('switchOnLight', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        security.switchOnLight('0x1234', 1);
                    }).toThrow("Device does not support switchOnLight()");
                });
            });
            describe('switchOffLight', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        security.switchOffLight('0x1234', 1);
                    }).toThrow("Device does not support switchOffLight()");
                });
            });
        });
        describe('address checking', function () {
            it('should throw an exception with an invalid deviceId format', function () {
                expect(function () {
                    security.sendStatus('0x1234/A');
                }).toThrow("Invalid deviceId format");
            });
            it('should accept the highest address value', function (done) {
                let sentCommandId = NaN;
                security.sendStatus('0xffff', 0, function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x08, 0x20, 0x00, 0x00, 0xff, 0x00, 0xff, 0x00, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should accept the lowest address value', function (done) {
                let sentCommandId = NaN;
                security.sendStatus('0x0', 0, function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x08, 0x20, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should throw an exception with an invalid address 0x10000', function () {
                expect(function () {
                    security.sendStatus('0x10000');
                }).toThrow("Address 0x10000 outside valid range");
            });
        })
    });
    describe('X10_PIR', function () {
        beforeEach(function () {
            security = new rfxcom.Security1(device, rfxcom.security1.X10_PIR);
        });
        describe('commands', function () {
            describe('sendStatus', function () {
                it('should send the correct bytes to the serialport', function (done) {
                    let sentCommandId = NaN;
                    security.sendStatus('0x1234', 1, function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x08, 0x20, 0x01, 0x00, 0x12, 0x00, 0x34, 0x01, 0x00]);
                    expect(sentCommandId).toEqual(0);
                })
            });
            describe('sendPanic', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        security.sendPanic('0x1234');
                    }).toThrow("Device does not support sendPanic()");
                });
            });
            describe('cancelPanic', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        security.cancelPanic('0x1234');
                    }).toThrow("Device does not support cancelPanic()");
                });
            });
            describe('armSystemAway', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        security.armSystemAway('0x1234');
                    }).toThrow("Device does not support armSystemAway()");
                });
            });
            describe('armSystemAwayWithDelay', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        security.armSystemAwayWithDelay('0x1234');
                    }).toThrow("Device does not support armSystemAwayWithDelay()");
                });
            });
            describe('armSystemHome', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        security.armSystemHome('0x1234');
                    }).toThrow("Device does not support armSystemHome()");
                });
            });
            describe('armSystemHomeWithDelay', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        security.armSystemHomeWithDelay('0x1234');
                    }).toThrow("Device does not support armSystemHomeWithDelay()");
                });
            });
            describe('disarmSystem', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        security.disarmSystem('0x1234');
                    }).toThrow("Device does not support disarmSystem()");
                });
            });
            describe('switchOnLight', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        security.switchOnLight('0x1234', 1);
                    }).toThrow("Device does not support switchOnLight()");
                });
            });
            describe('switchOffLight', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        security.switchOffLight('0x1234', 1);
                    }).toThrow("Device does not support switchOffLight()");
                });
            });
        });
        describe('address checking', function () {
            it('should throw an exception with an invalid deviceId format', function () {
                expect(function () {
                    security.sendStatus('0x1234/A');
                }).toThrow("Invalid deviceId format");
            });
            it('should accept the highest address value', function (done) {
                let sentCommandId = NaN;
                security.sendStatus('0xffff', 1, function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x08, 0x20, 0x01, 0x00, 0xff, 0x00, 0xff, 0x01, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should accept the lowest address value', function (done) {
                let sentCommandId = NaN;
                security.sendStatus('0x0', 1, function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x08, 0x20, 0x01, 0x00, 0x00, 0x00, 0x00, 0x01, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should throw an exception with an invalid address 0x10000', function () {
                expect(function () {
                    security.sendStatus('0x10000');
                }).toThrow("Address 0x10000 outside valid range");
            });
        })
    });
    describe('X10_SECURITY', function () {
        beforeEach(function () {
            security = new rfxcom.Security1(device, rfxcom.security1.X10_SECURITY);
        });
        describe('commands', function () {
            describe('sendStatus', function () {
                it('should send the correct bytes to the serialport', function (done) {
                    let sentCommandId = NaN;
                    security.sendStatus('0x1234', 1, function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x08, 0x20, 0x02, 0x00, 0x12, 0x00, 0x34, 0x01, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
            });
            describe('sendPanic', function () {
                it('should send the correct bytes to the serialport', function (done) {
                    let sentCommandId = NaN;
                    security.sendPanic('0x1234', function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x08, 0x20, 0x02, 0x00, 0x12, 0x00, 0x34, 0x06, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
            });
            describe('cancelPanic', function () {
                it('should send the correct bytes to the serialport', function (done) {
                    let sentCommandId = NaN;
                    security.cancelPanic('0x1234', function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x08, 0x20, 0x02, 0x00, 0x12, 0x00, 0x34, 0x07, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
            });
            describe('armSystemAway', function () {
                it('should send the correct bytes to the serialport', function (done) {
                    let sentCommandId = NaN;
                    security.armSystemAway('0x1234', function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x08, 0x20, 0x02, 0x00, 0x12, 0x00, 0x34, 0x09, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
            });
            describe('armSystemAwayWithDelay', function () {
                it('should send the correct bytes to the serialport', function (done) {
                    let sentCommandId = NaN;
                    security.armSystemAwayWithDelay('0x1234', function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x08, 0x20, 0x02, 0x00, 0x12, 0x00, 0x34, 0x0a, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
            });
            describe('armSystemHome', function () {
                it('should send the correct bytes to the serialport', function (done) {
                    let sentCommandId = NaN;
                    security.armSystemHome('0x1234', function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x08, 0x20, 0x02, 0x00, 0x12, 0x00, 0x34, 0x0b, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
            });
            describe('armSystemHomeWithDelay', function () {
                it('should send the correct bytes to the serialport', function (done) {
                    let sentCommandId = NaN;
                    security.armSystemHomeWithDelay('0x1234', function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x08, 0x20, 0x02, 0x00, 0x12, 0x00, 0x34, 0x0c, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
            });
            describe('disarmSystem', function () {
                it('should send the correct bytes to the serialport', function (done) {
                    let sentCommandId = NaN;
                    security.disarmSystem('0x1234', function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x08, 0x20, 0x02, 0x00, 0x12, 0x00, 0x34, 0x0d, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
            });
            describe('switchOnLight', function () {
                it('should send the correct bytes to the serialport for channel 1', function (done) {
                    let sentCommandId = NaN;
                    security.switchOnLight('0x1234', 1, function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x08, 0x20, 0x02, 0x00, 0x12, 0x00, 0x34, 0x11, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
                it('should send the correct bytes to the serialport for channel 2', function (done) {
                    let sentCommandId = NaN;
                    security.switchOnLight('0x1234', 2, function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x08, 0x20, 0x02, 0x00, 0x12, 0x00, 0x34, 0x13, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
                it('should throw an exception for channel 3', function () {
                    expect(function () {
                        security.switchOnLight('0x1234', 3);
                    }).toThrow("Invalid channel: value must be in range 1-2");
                });
                describe('switchOffLight', function () {
                    it('should send the correct bytes to the serialport for channel 1', function (done) {
                        let sentCommandId = NaN;
                        security.switchOffLight('0x1234', 1, function (err, response, cmdId) {
                            sentCommandId = cmdId;
                            done();
                        });
                        expect(fakeSerialPort).toHaveSent([0x08, 0x20, 0x02, 0x00, 0x12, 0x00, 0x34, 0x10, 0x00]);
                        expect(sentCommandId).toEqual(0);
                    });
                    it('should send the correct bytes to the serialport for channel 2', function (done) {
                        let sentCommandId = NaN;
                        security.switchOffLight('0x1234', 2, function (err, response, cmdId) {
                            sentCommandId = cmdId;
                            done();
                        });
                        expect(fakeSerialPort).toHaveSent([0x08, 0x20, 0x02, 0x00, 0x12, 0x00, 0x34, 0x12, 0x00]);
                        expect(sentCommandId).toEqual(0);
                    });
                    it('should throw an exception for channel 3', function () {
                        expect(function () {
                            security.switchOffLight('0x1234', 3);
                        }).toThrow("Invalid channel: value must be in range 1-2");
                    });
                });
            });
        });
        describe('address checking', function () {
            it('should throw an exception with an invalid deviceId format', function () {
                expect(function () {
                    security.sendStatus('0x1234/A');
                }).toThrow("Invalid deviceId format");
            });
            it('should accept the highest address value', function (done) {
                let sentCommandId = NaN;
                security.sendStatus('0xffff', 1, function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x08, 0x20, 0x02, 0x00, 0xff, 0x00, 0xff, 0x01, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should accept the lowest address value', function (done) {
                let sentCommandId = NaN;
                security.sendStatus('0x0', 1, function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x08, 0x20, 0x02, 0x00, 0x00, 0x00, 0x00, 0x01, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should throw an exception with an invalid address 0x10000', function () {
                expect(function () {
                    security.sendStatus('0x10000');
                }).toThrow("Address 0x10000 outside valid range");
            });
        })
    });
    describe('KD101', function () {
        beforeEach(function () {
            security = new rfxcom.Security1(device, rfxcom.security1.KD101);
        });
        describe('commands', function () {
            describe('sendStatus', function () {
                it('should send the correct bytes to the serialport', function (done) {
                    let sentCommandId = NaN;
                    security.sendStatus('0x1234', 1, function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x08, 0x20, 0x03, 0x00, 0x12, 0x34, 0x00, 0x01, 0x00]);
                    expect(sentCommandId).toEqual(0);
                })
            });
            describe('sendPanic', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        security.sendPanic('0x1234');
                    }).toThrow("Device does not support sendPanic()");
                });
            });
            describe('cancelPanic', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        security.cancelPanic('0x1234');
                    }).toThrow("Device does not support cancelPanic()");
                });
            });
            describe('armSystemAway', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        security.armSystemAway('0x1234');
                    }).toThrow("Device does not support armSystemAway()");
                });
            });
            describe('armSystemAwayWithDelay', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        security.armSystemAwayWithDelay('0x1234');
                    }).toThrow("Device does not support armSystemAwayWithDelay()");
                });
            });
            describe('armSystemHome', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        security.armSystemHome('0x1234');
                    }).toThrow("Device does not support armSystemHome()");
                });
            });
            describe('armSystemHomeWithDelay', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        security.armSystemHomeWithDelay('0x1234');
                    }).toThrow("Device does not support armSystemHomeWithDelay()");
                });
            });
            describe('disarmSystem', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        security.disarmSystem('0x1234');
                    }).toThrow("Device does not support disarmSystem()");
                });
            });
            describe('switchOnLight', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        security.switchOnLight('0x1234', 1);
                    }).toThrow("Device does not support switchOnLight()");
                });
            });
            describe('switchOffLight', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        security.switchOffLight('0x1234', 1);
                    }).toThrow("Device does not support switchOffLight()");
                });
            });
        });
        describe('address checking', function () {
            it('should throw an exception with an invalid deviceId format', function () {
                expect(function () {
                    security.sendStatus('0x1234/A');
                }).toThrow("Invalid deviceId format");
            });
            it('should accept the highest address value', function (done) {
                let sentCommandId = NaN;
                security.sendStatus('0xffff', 1, function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x08, 0x20, 0x03, 0x00, 0xff, 0xff, 0x00, 0x01, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should accept the lowest address value', function (done) {
                let sentCommandId = NaN;
                security.sendStatus('0x0', 1, function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x08, 0x20, 0x03, 0x00, 0x00, 0x00, 0x00, 0x01, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should throw an exception with an invalid address 0x10000', function () {
                expect(function () {
                    security.sendStatus('0x10000');
                }).toThrow("Address 0x10000 outside valid range");
            });
        })
    });
    describe('POWERCODE_DOOR', function () {
        beforeEach(function () {
            security = new rfxcom.Security1(device, rfxcom.security1.POWERCODE_DOOR);
        });
        describe('commands', function () {
            describe('sendStatus', function () {
                it('should send the correct bytes to the serialport', function (done) {
                    let sentCommandId = NaN;
                    security.sendStatus('0x123456', 1, function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x08, 0x20, 0x04, 0x00, 0x12, 0x34, 0x56, 0x01, 0x00]);
                    expect(sentCommandId).toEqual(0);
                })
            });
            describe('sendPanic', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        security.sendPanic('0x1234');
                    }).toThrow("Device does not support sendPanic()");
                });
            });
            describe('cancelPanic', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        security.cancelPanic('0x1234');
                    }).toThrow("Device does not support cancelPanic()");
                });
            });
            describe('armSystemAway', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        security.armSystemAway('0x1234');
                    }).toThrow("Device does not support armSystemAway()");
                });
            });
            describe('armSystemAwayWithDelay', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        security.armSystemAwayWithDelay('0x1234');
                    }).toThrow("Device does not support armSystemAwayWithDelay()");
                });
            });
            describe('armSystemHome', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        security.armSystemHome('0x1234');
                    }).toThrow("Device does not support armSystemHome()");
                });
            });
            describe('armSystemHomeWithDelay', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        security.armSystemHomeWithDelay('0x1234');
                    }).toThrow("Device does not support armSystemHomeWithDelay()");
                });
            });
            describe('disarmSystem', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        security.disarmSystem('0x1234');
                    }).toThrow("Device does not support disarmSystem()");
                });
            });
            describe('switchOnLight', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        security.switchOnLight('0x1234', 1);
                    }).toThrow("Device does not support switchOnLight()");
                });
            });
            describe('switchOffLight', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        security.switchOffLight('0x1234', 1);
                    }).toThrow("Device does not support switchOffLight()");
                });
            });
        });
        describe('address checking', function () {
            it('should throw an exception with an invalid deviceId format', function () {
                expect(function () {
                    security.sendStatus('0x1234/A');
                }).toThrow("Invalid deviceId format");
            });
            it('should accept the highest address value', function (done) {
                let sentCommandId = NaN;
                security.sendStatus('0xffffff', 1, function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x08, 0x20, 0x04, 0x00, 0xff, 0xff, 0xff, 0x01, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should accept the lowest address value', function (done) {
                let sentCommandId = NaN;
                security.sendStatus('0x0', 1, function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x08, 0x20, 0x04, 0x00, 0x00, 0x00, 0x00, 0x01, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should throw an exception with an invalid address 0x1000000', function () {
                expect(function () {
                    security.sendStatus('0x1000000');
                }).toThrow("Address 0x1000000 outside valid range");
            });
        })
    });
    describe('POWERCODE_PIR', function () {
        beforeEach(function () {
            security = new rfxcom.Security1(device, rfxcom.security1.POWERCODE_PIR);
        });
        describe('commands', function () {
            describe('sendStatus', function () {
                it('should send the correct bytes to the serialport', function (done) {
                    let sentCommandId = NaN;
                    security.sendStatus('0x123456', 1, function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x08, 0x20, 0x05, 0x00, 0x12, 0x34, 0x56, 0x01, 0x00]);
                    expect(sentCommandId).toEqual(0);
                })
            });
            describe('sendPanic', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        security.sendPanic('0x1234');
                    }).toThrow("Device does not support sendPanic()");
                });
            });
            describe('cancelPanic', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        security.cancelPanic('0x1234');
                    }).toThrow("Device does not support cancelPanic()");
                });
            });
            describe('armSystemAway', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        security.armSystemAway('0x1234');
                    }).toThrow("Device does not support armSystemAway()");
                });
            });
            describe('armSystemAwayWithDelay', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        security.armSystemAwayWithDelay('0x1234');
                    }).toThrow("Device does not support armSystemAwayWithDelay()");
                });
            });
            describe('armSystemHome', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        security.armSystemHome('0x1234');
                    }).toThrow("Device does not support armSystemHome()");
                });
            });
            describe('armSystemHomeWithDelay', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        security.armSystemHomeWithDelay('0x1234');
                    }).toThrow("Device does not support armSystemHomeWithDelay()");
                });
            });
            describe('disarmSystem', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        security.disarmSystem('0x1234');
                    }).toThrow("Device does not support disarmSystem()");
                });
            });
            describe('switchOnLight', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        security.switchOnLight('0x1234', 1);
                    }).toThrow("Device does not support switchOnLight()");
                });
            });
            describe('switchOffLight', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        security.switchOffLight('0x1234', 1);
                    }).toThrow("Device does not support switchOffLight()");
                });
            });
        });
        describe('address checking', function () {
            it('should throw an exception with an invalid deviceId format', function () {
                expect(function () {
                    security.sendStatus('0x1234/A');
                }).toThrow("Invalid deviceId format");
            });
            it('should accept the highest address value', function (done) {
                let sentCommandId = NaN;
                security.sendStatus('0xffffff', 1, function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x08, 0x20, 0x05, 0x00, 0xff, 0xff, 0xff, 0x01, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should accept the lowest address value', function (done) {
                let sentCommandId = NaN;
                security.sendStatus('0x0', 1, function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x08, 0x20, 0x05, 0x00, 0x00, 0x00, 0x00, 0x01, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should throw an exception with an invalid address 0x1000000', function () {
                expect(function () {
                    security.sendStatus('0x1000000');
                }).toThrow("Address 0x1000000 outside valid range");
            });
        })
    });
    describe('CODE_SECURE', function () {
        beforeEach(function () {
            security = new rfxcom.Security1(device, rfxcom.security1.CODE_SECURE);
        });
        describe('commands', function () {
            describe('sendStatus', function () {
                it('should send the correct bytes to the serialport', function (done) {
                    let sentCommandId = NaN;
                    security.sendStatus('0x123456', 1, function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x08, 0x20, 0x06, 0x00, 0x12, 0x34, 0x56, 0x01, 0x00]);
                    expect(sentCommandId).toEqual(0);
                })
            });
            describe('sendPanic', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        security.sendPanic('0x1234');
                    }).toThrow("Device does not support sendPanic()");
                });
            });
            describe('cancelPanic', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        security.cancelPanic('0x1234');
                    }).toThrow("Device does not support cancelPanic()");
                });
            });
            describe('armSystemAway', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        security.armSystemAway('0x1234');
                    }).toThrow("Device does not support armSystemAway()");
                });
            });
            describe('armSystemAwayWithDelay', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        security.armSystemAwayWithDelay('0x1234');
                    }).toThrow("Device does not support armSystemAwayWithDelay()");
                });
            });
            describe('armSystemHome', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        security.armSystemHome('0x1234');
                    }).toThrow("Device does not support armSystemHome()");
                });
            });
            describe('armSystemHomeWithDelay', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        security.armSystemHomeWithDelay('0x1234');
                    }).toThrow("Device does not support armSystemHomeWithDelay()");
                });
            });
            describe('disarmSystem', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        security.disarmSystem('0x1234');
                    }).toThrow("Device does not support disarmSystem()");
                });
            });
            describe('switchOnLight', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        security.switchOnLight('0x1234', 1);
                    }).toThrow("Device does not support switchOnLight()");
                });
            });
            describe('switchOffLight', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        security.switchOffLight('0x1234', 1);
                    }).toThrow("Device does not support switchOffLight()");
                });
            });
        });
        describe('address checking', function () {
            it('should throw an exception with an invalid deviceId format', function () {
                expect(function () {
                    security.sendStatus('0x1234/A');
                }).toThrow("Invalid deviceId format");
            });
            it('should accept the highest address value', function (done) {
                let sentCommandId = NaN;
                security.sendStatus('0xffffff', 1, function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x08, 0x20, 0x06, 0x00, 0xff, 0xff, 0xff, 0x01, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should accept the lowest address value', function (done) {
                let sentCommandId = NaN;
                security.sendStatus('0x0', 1, function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x08, 0x20, 0x06, 0x00, 0x00, 0x00, 0x00, 0x01, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should throw an exception with an invalid address 0x1000000', function () {
                expect(function () {
                    security.sendStatus('0x1000000');
                }).toThrow("Address 0x1000000 outside valid range");
            });
        })
    });
    describe('POWERCODE_AUX', function () {
        beforeEach(function () {
            security = new rfxcom.Security1(device, rfxcom.security1.POWERCODE_AUX);
        });
        describe('commands', function () {
            describe('sendStatus', function () {
                it('should send the correct bytes to the serialport', function (done) {
                    let sentCommandId = NaN;
                    security.sendStatus('0x123456', 1, function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x08, 0x20, 0x07, 0x00, 0x12, 0x34, 0x56, 0x01, 0x00]);
                    expect(sentCommandId).toEqual(0);
                })
            });
            describe('sendPanic', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        security.sendPanic('0x1234');
                    }).toThrow("Device does not support sendPanic()");
                });
            });
            describe('cancelPanic', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        security.cancelPanic('0x1234');
                    }).toThrow("Device does not support cancelPanic()");
                });
            });
            describe('armSystemAway', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        security.armSystemAway('0x1234');
                    }).toThrow("Device does not support armSystemAway()");
                });
            });
            describe('armSystemAwayWithDelay', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        security.armSystemAwayWithDelay('0x1234');
                    }).toThrow("Device does not support armSystemAwayWithDelay()");
                });
            });
            describe('armSystemHome', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        security.armSystemHome('0x1234');
                    }).toThrow("Device does not support armSystemHome()");
                });
            });
            describe('armSystemHomeWithDelay', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        security.armSystemHomeWithDelay('0x1234');
                    }).toThrow("Device does not support armSystemHomeWithDelay()");
                });
            });
            describe('disarmSystem', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        security.disarmSystem('0x1234');
                    }).toThrow("Device does not support disarmSystem()");
                });
            });
            describe('switchOnLight', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        security.switchOnLight('0x1234', 1);
                    }).toThrow("Device does not support switchOnLight()");
                });
            });
            describe('switchOffLight', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        security.switchOffLight('0x1234', 1);
                    }).toThrow("Device does not support switchOffLight()");
                });
            });
        });
        describe('address checking', function () {
            it('should throw an exception with an invalid deviceId format', function () {
                expect(function () {
                    security.sendStatus('0x1234/A');
                }).toThrow("Invalid deviceId format");
            });
            it('should accept the highest address value', function (done) {
                let sentCommandId = NaN;
                security.sendStatus('0xffffff', 1, function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x08, 0x20, 0x07, 0x00, 0xff, 0xff, 0xff, 0x01, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should accept the lowest address value', function (done) {
                let sentCommandId = NaN;
                security.sendStatus('0x0', 1, function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x08, 0x20, 0x07, 0x00, 0x00, 0x00, 0x00, 0x01, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should throw an exception with an invalid address 0x1000000', function () {
                expect(function () {
                    security.sendStatus('0x1000000');
                }).toThrow("Address 0x1000000 outside valid range");
            });
        })
    });
    describe('MEIANTECH', function () {
        beforeEach(function () {
            security = new rfxcom.Security1(device, rfxcom.security1.MEIANTECH);
        });
        describe('commands', function () {
            describe('sendStatus', function () {
                it('should send the correct bytes to the serialport', function (done) {
                    let sentCommandId = NaN;
                    security.sendStatus('0x123456', 1, function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x08, 0x20, 0x08, 0x00, 0x12, 0x34, 0x56, 0x01, 0x00]);
                    expect(sentCommandId).toEqual(0);
                })
            });
            describe('sendPanic', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        security.sendPanic('0x1234');
                    }).toThrow("Device does not support sendPanic()");
                });
            });
            describe('cancelPanic', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        security.cancelPanic('0x1234');
                    }).toThrow("Device does not support cancelPanic()");
                });
            });
            describe('armSystemAway', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        security.armSystemAway('0x1234');
                    }).toThrow("Device does not support armSystemAway()");
                });
            });
            describe('armSystemAwayWithDelay', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        security.armSystemAwayWithDelay('0x1234');
                    }).toThrow("Device does not support armSystemAwayWithDelay()");
                });
            });
            describe('armSystemHome', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        security.armSystemHome('0x1234');
                    }).toThrow("Device does not support armSystemHome()");
                });
            });
            describe('armSystemHomeWithDelay', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        security.armSystemHomeWithDelay('0x1234');
                    }).toThrow("Device does not support armSystemHomeWithDelay()");
                });
            });
            describe('disarmSystem', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        security.disarmSystem('0x1234');
                    }).toThrow("Device does not support disarmSystem()");
                });
            });
            describe('switchOnLight', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        security.switchOnLight('0x1234', 1);
                    }).toThrow("Device does not support switchOnLight()");
                });
            });
            describe('switchOffLight', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        security.switchOffLight('0x1234', 1);
                    }).toThrow("Device does not support switchOffLight()");
                });
            });
        });
        describe('address checking', function () {
            it('should throw an exception with an invalid deviceId format', function () {
                expect(function () {
                    security.sendStatus('0x1234/A');
                }).toThrow("Invalid deviceId format");
            });
            it('should accept the highest address value', function (done) {
                let sentCommandId = NaN;
                security.sendStatus('0xffffff', 1, function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x08, 0x20, 0x08, 0x00, 0xff, 0xff, 0xff, 0x01, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should accept the lowest address value', function (done) {
                let sentCommandId = NaN;
                security.sendStatus('0x0', 1, function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x08, 0x20, 0x08, 0x00, 0x00, 0x00, 0x00, 0x01, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should throw an exception with an invalid address 0x1000000', function () {
                expect(function () {
                    security.sendStatus('0x1000000');
                }).toThrow("Address 0x1000000 outside valid range");
            });
        })
    });
    describe('SA30', function () {
        beforeEach(function () {
            security = new rfxcom.Security1(device, rfxcom.security1.SA30);
        });
        describe('commands', function () {
            describe('sendStatus', function () {
                it('should send the correct bytes to the serialport', function (done) {
                    let sentCommandId = NaN;
                    security.sendStatus('0x1234', 1, function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x08, 0x20, 0x09, 0x00, 0x12, 0x34, 0x00, 0x01, 0x00]);
                    expect(sentCommandId).toEqual(0);
                })
            });
            describe('sendPanic', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        security.sendPanic('0x1234');
                    }).toThrow("Device does not support sendPanic()");
                });
            });
            describe('cancelPanic', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        security.cancelPanic('0x1234');
                    }).toThrow("Device does not support cancelPanic()");
                });
            });
            describe('armSystemAway', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        security.armSystemAway('0x1234');
                    }).toThrow("Device does not support armSystemAway()");
                });
            });
            describe('armSystemAwayWithDelay', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        security.armSystemAwayWithDelay('0x1234');
                    }).toThrow("Device does not support armSystemAwayWithDelay()");
                });
            });
            describe('armSystemHome', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        security.armSystemHome('0x1234');
                    }).toThrow("Device does not support armSystemHome()");
                });
            });
            describe('armSystemHomeWithDelay', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        security.armSystemHomeWithDelay('0x1234');
                    }).toThrow("Device does not support armSystemHomeWithDelay()");
                });
            });
            describe('disarmSystem', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        security.disarmSystem('0x1234');
                    }).toThrow("Device does not support disarmSystem()");
                });
            });
            describe('switchOnLight', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        security.switchOnLight('0x1234', 1);
                    }).toThrow("Device does not support switchOnLight()");
                });
            });
            describe('switchOffLight', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        security.switchOffLight('0x1234', 1);
                    }).toThrow("Device does not support switchOffLight()");
                });
            });
        });
        describe('address checking', function () {
            it('should throw an exception with an invalid deviceId format', function () {
                expect(function () {
                    security.sendStatus('0x1234/A');
                }).toThrow("Invalid deviceId format");
            });
            it('should accept the highest address value', function (done) {
                let sentCommandId = NaN;
                security.sendStatus('0xffff', 1, function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x08, 0x20, 0x09, 0x00, 0xff, 0xff, 0x00, 0x01, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should accept the lowest address value', function (done) {
                let sentCommandId = NaN;
                security.sendStatus('0x0', 1, function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x08, 0x20, 0x09, 0x00, 0x00, 0x00, 0x00, 0x01, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should throw an exception with an invalid address 0x10000', function () {
                expect(function () {
                    security.sendStatus('0x10000');
                }).toThrow("Address 0x10000 outside valid range");
            });
        })
    });
    describe('RM174RF', function () {
        beforeEach(function () {
            security = new rfxcom.Security1(device, rfxcom.security1.RM174RF);
        });
        describe('commands', function () {
            describe('sendStatus', function () {
                it('should send the correct bytes to the serialport', function (done) {
                    let sentCommandId = NaN;
                    security.sendStatus('0x123456', 1, function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x08, 0x20, 0x0a, 0x00, 0x12, 0x34, 0x56, 0x01, 0x00]);
                    expect(sentCommandId).toEqual(0);
                })
            });
            describe('sendPanic', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        security.sendPanic('0x1234');
                    }).toThrow("Device does not support sendPanic()");
                });
            });
            describe('cancelPanic', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        security.cancelPanic('0x1234');
                    }).toThrow("Device does not support cancelPanic()");
                });
            });
            describe('armSystemAway', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        security.armSystemAway('0x1234');
                    }).toThrow("Device does not support armSystemAway()");
                });
            });
            describe('armSystemAwayWithDelay', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        security.armSystemAwayWithDelay('0x1234');
                    }).toThrow("Device does not support armSystemAwayWithDelay()");
                });
            });
            describe('armSystemHome', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        security.armSystemHome('0x1234');
                    }).toThrow("Device does not support armSystemHome()");
                });
            });
            describe('armSystemHomeWithDelay', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        security.armSystemHomeWithDelay('0x1234');
                    }).toThrow("Device does not support armSystemHomeWithDelay()");
                });
            });
            describe('disarmSystem', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        security.disarmSystem('0x1234');
                    }).toThrow("Device does not support disarmSystem()");
                });
            });
            describe('switchOnLight', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        security.switchOnLight('0x1234', 1);
                    }).toThrow("Device does not support switchOnLight()");
                });
            });
            describe('switchOffLight', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        security.switchOffLight('0x1234', 1);
                    }).toThrow("Device does not support switchOffLight()");
                });
            });
        });
        describe('address checking', function () {
            it('should throw an exception with an invalid deviceId format', function () {
                expect(function () {
                    security.sendStatus('0x1234/A');
                }).toThrow("Invalid deviceId format");
            });
            it('should accept the highest address value', function (done) {
                let sentCommandId = NaN;
                security.sendStatus('0x3fffff', 1, function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x08, 0x20, 0x0a, 0x00, 0x3f, 0xff, 0xff, 0x01, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should accept the lowest address value', function (done) {
                let sentCommandId = NaN;
                security.sendStatus('0x1', 1, function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x08, 0x20, 0x0a, 0x00, 0x00, 0x00, 0x01, 0x01, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should throw an exception with an invalid address 0x4000000', function () {
                expect(function () {
                    security.sendStatus('0x4000000');
                }).toThrow("Address 0x4000000 outside valid range");
            });
            it('should throw an exception with an invalid address 0x0', function () {
                expect(function () {
                    security.sendStatus('0x0');
                }).toThrow("Address 0x0 outside valid range");
            });
        })
    });
});

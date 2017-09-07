/* global require: false, beforeEach: false, describe: false, it: false, expect: false */
const rfxcom = require('../lib'),
    matchers = require('./matchers'),
    FakeSerialPort = require('./helper');

beforeEach(function () {
    this.addMatchers({
        toHaveSent: matchers.toHaveSent
    });
});

describe('Lighting5 class', function () {
    let lighting5,
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
                lighting5 = new rfxcom.Lighting5(device);
            }).toThrow("Must provide a subtype.");
        });
    });
    describe('LIGHTWAVERF', function () {
        beforeEach(function () {
            lighting5 = new rfxcom.Lighting5(device, rfxcom.lighting5.LIGHTWAVERF);
        });
        describe('commands', function () {
            describe('switchOn()', function () {
                it('should send the correct bytes to the serialport', function (done) {
                    let sentCommandId = NaN;
                    lighting5.switchOn('0xF09AC8/1', function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x0A, 0x14, 0x00, 0x00, 0xF0, 0x9A, 0xC8, 0x01, 0x01, 0x1F, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
                it('should accept an array deviceId', function (done) {
                    let sentCommandId = NaN;
                    lighting5.switchOn(['0xF09AC8', '1'], function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x0A, 0x14, 0x00, 0x00, 0xF0, 0x9A, 0xC8, 0x01, 0x01, 0x1F, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
                it('should handle no callback', function () {
                    lighting5.switchOn('0xF09AC8/1');
                    expect(fakeSerialPort).toHaveSent([0x0A, 0x14, 0x00, 0x00, 0xF0, 0x9A, 0xC8, 0x01, 0x01, 0x1f, 0x00]);
                });
                it('should log the bytes being sent in debug mode', function (done) {
                    const debugDevice = new rfxcom.RfxCom('/dev/ttyUSB0', {
                            port:  fakeSerialPort,
                            debug: true
                        }),
                        debug = new rfxcom.Lighting5(debugDevice, rfxcom.lighting5.LIGHTWAVERF);
                    debugDevice.connected = true;
                    const consoleSpy = spyOn(console, 'log');
                    debug.switchOn('0xF09AC8/1', function () {
                        done();
                    });
                    expect(consoleSpy).toHaveBeenCalledWith('[rfxcom] on /dev/ttyUSB0 - Sent    : 0A,14,00,00,F0,9A,C8,01,01,1F,00');
                    debugDevice.acknowledge[0]();
                });
                it('should throw an exception with a group address', function () {
                    expect(function () {
                        lighting5.switchOn('0xF09AC8/0');
                    }).toThrow("Subtype doesn't support Group On");
                });
            });
            describe('switchOff()', function () {
                it('should send the correct bytes to the serialport', function (done) {
                    let sentCommandId = NaN;
                    lighting5.switchOff('0xAC8/1', function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x0A, 0x14, 0x00, 0x00, 0x00, 0x0A, 0xC8, 0x01, 0x00, 0x00, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
                it('should handle a group address', function () {
                    lighting5.switchOff('0xAC8/0');
                    expect(fakeSerialPort).toHaveSent([0x0A, 0x14, 0x00, 0x00, 0x00, 0x0A, 0xC8, 0x00, 0x02, 0x00, 0x00]);
                });
            });
            describe('toggleOnOff()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.toggleOnOff('0xF09AC8/1');
                    }).toThrow("Device does not support toggleOnOff()");
                })
            });
            describe('setLevel()', function () {
                it('should send the correct bytes to the serial port', function (done) {
                    lighting5.setLevel('0xF09AC8/1', 0x10, function () {
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x0A, 0x14, 0x00, 0x00, 0xF0, 0x9A, 0xC8, 0x01, 0x10, 0x10, 0x00]);
                });
                it('should throw an exception with an invalid level 32', function () {
                    expect(function () {
                        lighting5.setLevel('0xF09AC8/1', 32);
                    }).toThrow("Invalid level: value must be in range 0-31");
                });
                it('should throw an exception with an invalid level -1', function () {
                    expect(function () {
                        lighting5.setLevel('0xF09AC8/1', -1);
                    }).toThrow("Invalid level: value must be in range 0-31");
                });
                it('should throw an exception with a group address', function () {
                    expect(function () {
                        lighting5.setLevel('0xF09AC8/0');
                    }).toThrow("Group command must be On, Off, or Lock");
                });
            });
            describe('increaseLevel()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.increaseLevel('0xF09AC8/1');
                    }).toThrow("Device does not support increaseLevel()");
                })
            });
            describe('decreaseLevel()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.decreaseLevel('0xF09AC8/1');
                    }).toThrow("Device does not support decreaseLevel()");
                })
            });
            describe('setMood()', function () {
                it('should send the correct bytes to the serial port', function (done) {
                    lighting5.setMood('0xF09AC8/1', 0x03, function () {
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x0A, 0x14, 0x00, 0x00, 0xF0, 0x9A, 0xC8, 0x01, 0x05, 0x1F, 0x00]);
                });
                it('should throw an exception with an invalid mood value 6', function () {
                    expect(function () {
                        lighting5.setMood('0xF09AC8/1', 6);
                    }).toThrow("Invalid mood value must be in range 1-5.");
                });
                it('should throw an exception with an invalid mood value 0', function () {
                    expect(function () {
                        lighting5.setMood('0xF09AC8/1', 0);
                    }).toThrow("Invalid mood value must be in range 1-5.");
                });
                it('should throw an exception with a group address', function () {
                    expect(function () {
                        lighting5.setMood('0xF09AC8/0');
                    }).toThrow("Group command must be On, Off, or Lock");
                });
            });
            describe('program()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.program('0xF09AC8/1');
                    }).toThrow("Device does not support program()");
                })
            });
            describe('relayOpen()', function () {
                it('should send the correct bytes to the serial port', function (done) {
                    lighting5.relayOpen('0xF09AC8/1', function () {
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x0A, 0x14, 0x00, 0x00, 0xF0, 0x9A, 0xC8, 0x01, 0x0F, 0x00, 0x00]);
                });
                it('should throw an exception with a group address', function () {
                    expect(function () {
                        lighting5.relayOpen('0xF09AC8/0');
                    }).toThrow("Group command must be On, Off, or Lock");
                });
            });
            describe('relayClose()', function () {
                it('should send the correct bytes to the serial port', function (done) {
                    lighting5.relayClose('0xF09AC8/1', function () {
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x0A, 0x14, 0x00, 0x00, 0xF0, 0x9A, 0xC8, 0x01, 0x0D, 0x00, 0x00]);
                });
                it('should throw an exception with a group address', function () {
                    expect(function () {
                        lighting5.relayClose('0xF09AC8/0');
                    }).toThrow("Group command must be On, Off, or Lock");
                });
            });
            describe('relayStop()', function () {
                it('should send the correct bytes to the serial port', function (done) {
                    lighting5.relayStop('0xF09AC8/1', function () {
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x0A, 0x14, 0x00, 0x00, 0xF0, 0x9A, 0xC8, 0x01, 0x0E, 0x00, 0x00]);
                });
                it('should throw an exception with a group address', function () {
                    expect(function () {
                        lighting5.relayStop('0xF09AC8/0');
                    }).toThrow("Group command must be On, Off, or Lock");
                });
            });
            describe('increaseColour()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.increaseColour('0xF09AC8/1');
                    }).toThrow("Device does not support increaseColour()");
                })
            });
            describe('decreaseColour()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.decreaseColour('0xF09AC8/1');
                    }).toThrow("Device does not support decreaseColour()");
                })
            });
            describe('setColour()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.setColour('0xF09AC8/1', 7);
                    }).toThrow("Device does not support setColour()");
                })
            });
            describe('setScene()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.setScene('0x1234/1', 1, 1);
                    }).toThrow("Device does not support setScene()");
                });
            });
            describe('lock()', function () {
                it('should send the correct bytes to the serial port', function (done) {
                    lighting5.lock('0xF09AC8/1', function () {
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x0A, 0x14, 0x00, 0x00, 0xF0, 0x9A, 0xC8, 0x01, 0x0b, 0x00, 0x00]);
                });
                it('should handle a group address', function (done) {
                    lighting5.lock('0xF09AC8/0', function () {
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x0A, 0x14, 0x00, 0x00, 0xF0, 0x9A, 0xC8, 0x00, 0x0c, 0x00, 0x00]);
                });
            });
            describe('unlock()', function () {
                it('should send the correct bytes to the serial port', function (done) {
                    lighting5.unlock('0xF09AC8/1', function () {
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x0A, 0x14, 0x00, 0x00, 0xF0, 0x9A, 0xC8, 0x01, 0x0a, 0x00, 0x00]);
                });
                it('should throw an exception with a group address', function () {
                    expect(function () {
                        lighting5.unlock('0xF09AC8/0');
                    }).toThrow("Group command must be On, Off, or Lock");
                });
            });
        });
        describe('address checking', function () {
            it('should throw an exception with an invalid deviceId format', function () {
                expect(function () {
                    lighting5.switchOn('0xF09AC8');
                }).toThrow("Invalid deviceId format");
            });
            it('should accept the highest address and unit code values', function (done) {
                let sentCommandId = NaN;
                lighting5.switchOn('0xFFFFFF/16', function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0A, 0x14, 0x00, 0x00, 0xff, 0xff, 0xff, 0x10, 0x01, 0x1F, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should accept the lowest address and unit code values', function (done) {
                let sentCommandId = NaN;
                lighting5.switchOn('0x000001/1', function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0A, 0x14, 0x00, 0x00, 0x00, 0x00, 0x01, 0x01, 0x01, 0x1F, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should throw an exception with an invalid unit code 17', function () {
                expect(function () {
                    lighting5.switchOn('0xFFFFFF/17');
                }).toThrow("Invalid unit code 17");
            });
            it('should throw an exception with an invalid unit code -1', function () {
                expect(function () {
                    lighting5.switchOn('0xFFFFFF/-1');
                }).toThrow("Invalid unit code -1");
            });
            it('should throw an exception with an invalid address 0x1000000', function () {
                expect(function () {
                    lighting5.switchOn('0x1000000/1');
                }).toThrow("Address 0x1000000 outside valid range");
            });
            it('should throw an exception with an invalid address 0x000000', function () {
                expect(function () {
                    lighting5.switchOn('0x000000/1');
                }).toThrow("Address 0x0 outside valid range");
            });
        });
    });
    describe('EMW100', function () {
        beforeEach(function () {
            lighting5 = new rfxcom.Lighting5(device, rfxcom.lighting5.EMW100);
        });
        describe('commands', function () {
            describe('switchOn()', function () {
                it('should send the correct bytes to the serialport', function (done) {
                    let sentCommandId = NaN;
                    lighting5.switchOn('0x000123/1', function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x0A, 0x14, 0x01, 0x00, 0x00, 0x01, 0x23, 0x01, 0x01, 0x1F, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
                it('should throw an exception with a group address', function () {
                    expect(function () {
                        lighting5.switchOn('0x000123/0');
                    }).toThrow("Subtype doesn't support group commands");
                });
            });
            describe('switchOff()', function () {
                it('should send the correct bytes to the serialport', function (done) {
                    let sentCommandId = NaN;
                    lighting5.switchOff('0x000123/1', function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x0A, 0x14, 0x01, 0x00, 0x00, 0x01, 0x23, 0x01, 0x00, 0x00, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
                it('should throw an exception with a group address', function () {
                    expect(function () {
                        lighting5.switchOff('0x000123/0');
                    }).toThrow("Subtype doesn't support group commands");
                });
            });
            describe('toggleOnOff()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.toggleOnOff('0x000123/1');
                    }).toThrow("Device does not support toggleOnOff()");
                });
            });
            describe('setLevel()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.setLevel('0x000123/1');
                    }).toThrow("Device does not support setLevel()");
                });
            });
            describe('increaseLevel()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.increaseLevel('0x000123/1');
                    }).toThrow("Device does not support increaseLevel()");
                });
            });
            describe('decreaseLevel()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.decreaseLevel('0x000123/1');
                    }).toThrow("Device does not support decreaseLevel()");
                });
            });
            describe('setMood()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.setMood('0x000123/1', 1);
                    }).toThrow("Device does not support setMood()");
                });
            });
            describe('program()', function () {
                it('should accept a program command', function (done) {
                    lighting5.program('0x3FFF/1', function () {
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x0A, 0x14, 0x01, 0x00, 0x00, 0x3f, 0xff, 0x01, 0x02, 0x00, 0x00]);
                });
                it('should throw an exception with a group address', function () {
                    expect(function () {
                        lighting5.program('0x000123/0');
                    }).toThrow("Subtype doesn't support group commands");
                });
            });
            describe('relayOpen()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.relayOpen('0x000123/1');
                    }).toThrow("Device does not support relayOpen()");
                });
            });
            describe('relayClose()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.relayClose('0x000123/1');
                    }).toThrow("Device does not support relayClose()");
                });
            });
            describe('relayStop()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.relayStop('0x000123/1');
                    }).toThrow("Device does not support relayStop()");
                });
            });
            describe('increaseColour()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.increaseColour('0x000123/1');
                    }).toThrow("Device does not support increaseColour()");
                });
            });
            describe('decreaseColour()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.decreaseColour('0x000123/1');
                    }).toThrow("Device does not support decreaseColour()");
                });
            });
            describe('setColour()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.setColour('0x000123/1', 5);
                    }).toThrow("Device does not support setColour()");
                });
            });
            describe('setScene()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.setScene('0x000123/1', 1, 1);
                    }).toThrow("Device does not support setScene()");
                });
            });
            describe('lock()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.lock('0x1234/1');
                    }).toThrow("Device does not support lock()");
                });
            });
            describe('unlock()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.lock('0x1234/1');
                    }).toThrow("Device does not support lock()");
                });
            });
        });
        describe('address checking', function () {
            it('should throw an exception with an invalid deviceId format', function () {
                expect(function () {
                    lighting5.switchOn('0x3FFF');
                }).toThrow("Invalid deviceId format");
            });
            it('should accept the highest address and unit code values', function (done) {
                let sentCommandId = NaN;
                lighting5.switchOn('0x3FFF/4', function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0A, 0x14, 0x01, 0x00, 0x00, 0x3f, 0xff, 0x04, 0x01, 0x1F, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should accept the lowest address and unit code values', function (done) {
                let sentCommandId = NaN;
                lighting5.switchOn('0x1/1', function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0A, 0x14, 0x01, 0x00, 0x00, 0x00, 0x01, 0x01, 0x01, 0x1F, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should throw an exception with an invalid unit number 5', function () {
                expect(function () {
                    lighting5.switchOn('0x3FF/5');
                }).toThrow("Invalid unit code 5");
            });
            it('should throw an exception with an invalid unit number -1', function () {
                expect(function () {
                    lighting5.switchOn('0x3FF/-1');
                }).toThrow("Invalid unit code -1");
            });
            it('should throw an exception with an invalid address 0x4000', function () {
                expect(function () {
                    lighting5.switchOn('0x004000/4');
                }).toThrow("Address 0x4000 outside valid range");
            });
            it('should throw an exception with an invalid address 0x0000', function () {
                expect(function () {
                    lighting5.switchOn('0x000000/4');
                }).toThrow("Address 0x0 outside valid range");
            });
        });
    });
    describe('BBSB', function () {
        beforeEach(function () {
            lighting5 = new rfxcom.Lighting5(device, rfxcom.lighting5.BBSB);
        });
        describe('commands', function () {
            describe('switchOn()', function () {
                it('should send the correct bytes to the serialport', function (done) {
                    let sentCommandId = NaN;
                    lighting5.switchOn('0x012345/1', function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x0A, 0x14, 0x02, 0x00, 0x01, 0x23, 0x45, 0x01, 0x01, 0x1F, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
                it('should handle a group address', function (done) {
                    let sentCommandId = NaN;
                    lighting5.switchOn('0x012345/0', function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x0A, 0x14, 0x02, 0x00, 0x01, 0x23, 0x45, 0x00, 0x03, 0x1F, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
            });
            describe('switchOff()', function () {
                it('should send the correct bytes to the serialport', function (done) {
                    let sentCommandId = NaN;
                    lighting5.switchOff('0x012345/1', function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x0A, 0x14, 0x02, 0x00, 0x01, 0x23, 0x45, 0x01, 0x00, 0x00, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
                it('should handle a group address', function (done) {
                    let sentCommandId = NaN;
                    lighting5.switchOff('0x012345/0', function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x0A, 0x14, 0x02, 0x00, 0x01, 0x23, 0x45, 0x00, 0x02, 0x00, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
            });
            describe('toggleOnOff()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.toggleOnOff('0x012345/1');
                    }).toThrow("Device does not support toggleOnOff()");
                });
            });
            describe('setLevel()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.setLevel('0x012345/1');
                    }).toThrow("Device does not support setLevel()");
                });
            });
            describe('increaseLevel()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.increaseLevel('0x012345/1');
                    }).toThrow("Device does not support increaseLevel()");
                });
            });
            describe('decreaseLevel()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.decreaseLevel('0x012345/1');
                    }).toThrow("Device does not support decreaseLevel()");
                });
            });
            describe('setMood()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.setMood('0x012345/1');
                    }).toThrow("Device does not support setMood()");
                });
            });
            describe('program()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.program('0x012345/1');
                    }).toThrow("Device does not support program()");
                });
            });
            describe('relayOpen()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.relayOpen('0x012345/1');
                    }).toThrow("Device does not support relayOpen()");
                });
            });
            describe('relayClose()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.relayClose('0x012345/1');
                    }).toThrow("Device does not support relayClose()");
                });
            });
            describe('relayStop()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.relayStop('0x012345/1');
                    }).toThrow("Device does not support relayStop()");
                });
            });
            describe('increaseColour()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.increaseColour('0x012345/1');
                    }).toThrow("Device does not support increaseColour()");
                });
            });
            describe('decreaseColour()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.decreaseColour('0x012345/1');
                    }).toThrow("Device does not support decreaseColour()");
                });
            });
            describe('setColour()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.setColour('0x012345/1');
                    }).toThrow("Device does not support setColour()");
                });
            });
            describe('setScene()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.setScene('0x12345/1', 1, 1);
                    }).toThrow("Device does not support setScene()");
                });
            });
            describe('lock()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.lock('0x12345/1');
                    }).toThrow("Device does not support lock()");
                });
            });
            describe('unlock()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.lock('0x12345/1');
                    }).toThrow("Device does not support lock()");
                });
            });
        });
        describe('address checking', function () {
            it('should throw an exception with an invalid deviceId format', function () {
                expect(function () {
                    lighting5.switchOn('0x3FFF');
                }).toThrow("Invalid deviceId format");
            });
            it('should accept the highest address and unit code values', function (done) {
                let sentCommandId = NaN;
                lighting5.switchOn('0x7FFFF/6', function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0A, 0x14, 0x02, 0x00, 0x07, 0xff, 0xff, 0x06, 0x01, 0x1F, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should accept the lowest address and unit code values', function (done) {
                let sentCommandId = NaN;
                lighting5.switchOn('0x00001/1', function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0A, 0x14, 0x02, 0x00, 0x00, 0x00, 0x01, 0x01, 0x01, 0x1F, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should throw an exception with an invalid unit number 7', function () {
                expect(function () {
                    lighting5.switchOn('0x7FFF/7');
                }).toThrow("Invalid unit code 7");
            });
            it('should throw an exception with an invalid unit number -1', function () {
                expect(function () {
                    lighting5.switchOn('0x7FFF/-1');
                }).toThrow("Invalid unit code -1");
            });
            it('should throw an exception with an invalid address 0x80000', function () {
                expect(function () {
                    lighting5.switchOn('0x80000/4');
                }).toThrow("Address 0x80000 outside valid range");
            });
            it('should throw an exception with an invalid address 0x0', function () {
                expect(function () {
                    lighting5.switchOn('0x0/4');
                }).toThrow("Address 0x0 outside valid range");
            });
        });
    });
    describe('MDREMOTE', function () {
        beforeEach(function () {
            lighting5 = new rfxcom.Lighting5(device, rfxcom.lighting5.MDREMOTE);
        });
        describe('commands', function () {
            describe('switchOn()', function () {
                it('should send the correct bytes to the serialport', function (done) {
                    let sentCommandId = NaN;
                    lighting5.switchOn('0x1234', function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x0A, 0x14, 0x03, 0x00, 0x00, 0x12, 0x34, 0x01, 0x01, 0x1F, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
                it('should throw an exception with a group address', function () {
                    expect(function () {
                        lighting5.switchOn('0x1234/0');
                    }).toThrow("Subtype doesn't support group commands");
                });
            });
            describe('switchOff()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.switchOff('0x1234');
                    }).toThrow("Device does not support switchOff()");
                });
            });
            describe('toggleOnOff()', function () {
                it('should send the correct bytes to the serialport', function (done) {
                    let sentCommandId = NaN;
                    lighting5.toggleOnOff('0x1234', function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x0A, 0x14, 0x03, 0x00, 0x00, 0x12, 0x34, 0x01, 0x00, 0x1F, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
                it('should throw an exception with a group address', function () {
                    expect(function () {
                        lighting5.toggleOnOff('0x1234/0');
                    }).toThrow("Subtype doesn't support group commands");
                });
            });
            describe('setLevel()', function () {
                it('should set the lowest level 1', function (done) {
                    let sentCommandId = NaN;
                    lighting5.setLevel('0x1234', 1, function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x0A, 0x14, 0x03, 0x00, 0x00, 0x12, 0x34, 0x01, 0x06, 0x01, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
                it('should set the highest level 3', function (done) {
                    let sentCommandId = NaN;
                    lighting5.setLevel('0x1234', 3, function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x0A, 0x14, 0x03, 0x00, 0x00, 0x12, 0x34, 0x01, 0x04, 0x03, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
                it('should throw an exception with invalid level 0', function () {
                    expect(function () {
                        lighting5.setLevel('0x1234', 0);
                    }).toThrow("Invalid level: value must be in range 1-3");
                });
                it('should throw an exception with invalid level 4', function () {
                    expect(function () {
                        lighting5.setLevel('0x1234', 4);
                    }).toThrow("Invalid level: value must be in range 1-3");
                });
                it('should throw an exception with a group address', function () {
                    expect(function () {
                        lighting5.setLevel('0x1234/0', 2);
                    }).toThrow("Subtype doesn't support group commands");
                });
            });
            describe('increaseLevel()', function () {
                it('should send the correct bytes to the serialport', function (done) {
                    let sentCommandId = NaN;
                    lighting5.increaseLevel('0x1234', function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x0A, 0x14, 0x03, 0x00, 0x00, 0x12, 0x34, 0x01, 0x02, 0x00, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
                it('should throw an exception with a group address', function () {
                    expect(function () {
                        lighting5.increaseLevel('0x1234/0');
                    }).toThrow("Subtype doesn't support group commands");
                });
            });
            describe('decreaseLevel()', function () {
                it('should send the correct bytes to the serialport', function (done) {
                    let sentCommandId = NaN;
                    lighting5.decreaseLevel('0x1234', function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x0A, 0x14, 0x03, 0x00, 0x00, 0x12, 0x34, 0x01, 0x03, 0x00, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
                it('should throw an exception with a group address', function () {
                    expect(function () {
                        lighting5.decreaseLevel('0x1234/0');
                    }).toThrow("Subtype doesn't support group commands");
                });
            });
            describe('setMood()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.setMood('0x1234');
                    }).toThrow("Device does not support setMood()");
                });
            });
            describe('program()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.program('0x1234');
                    }).toThrow("Device does not support program()");
                });
            });
            describe('relayOpen()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.relayOpen('0x1234');
                    }).toThrow("Device does not support relayOpen()");
                });
            });
            describe('relayClose()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.relayClose('0x1234');
                    }).toThrow("Device does not support relayClose()");
                });
            });
            describe('relayStop()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.relayStop('0x1234');
                    }).toThrow("Device does not support relayStop()");
                });
            });
            describe('increaseColour()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.increaseColour('0x1234');
                    }).toThrow("Device does not support increaseColour()");
                });
            });
            describe('decreaseColour()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.decreaseColour('0x1234');
                    }).toThrow("Device does not support decreaseColour()");
                });
            });
            describe('setColour()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.setColour('0x1234');
                    }).toThrow("Device does not support setColour()");
                });
            });
            describe('setScene()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.setScene('0x1234', 1, 1);
                    }).toThrow("Device does not support setScene()");
                });
            });
            describe('lock()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.lock('0x1234');
                    }).toThrow("Device does not support lock()");
                });
            });
            describe('unlock()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.lock('0x1234');
                    }).toThrow("Device does not support lock()");
                });
            });
        });
        describe('address checking', function () {
            it('should throw an exception with an invalid deviceId format', function () {
                expect(function () {
                    lighting5.switchOn('0x3FFF/1/9');
                }).toThrow("Invalid deviceId format");
            });
            it('should accept the highest address', function (done) {
                let sentCommandId = NaN;
                lighting5.switchOn('0xFFFF', function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0A, 0x14, 0x03, 0x00, 0x00, 0xff, 0xff, 0x01, 0x01, 0x1F, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should accept the lowest address', function (done) {
                let sentCommandId = NaN;
                lighting5.switchOn('0x1', function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0A, 0x14, 0x03, 0x00, 0x00, 0x00, 0x01, 0x01, 0x01, 0x1F, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should ignore an invalid unit number 5', function (done) {
                let sentCommandId = NaN;
                lighting5.switchOn('0xFFFF/5', function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0A, 0x14, 0x03, 0x00, 0x00, 0xff, 0xff, 0x05, 0x01, 0x1F, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should throw an exception with an invalid address 0x10000', function () {
                expect(function () {
                    lighting5.switchOn('0x10000');
                }).toThrow("Address 0x10000 outside valid range");
            });
            it('should throw an exception with an invalid address 0x0000', function () {
                expect(function () {
                    lighting5.switchOn('0x000000/4');
                }).toThrow("Address 0x0 outside valid range");
            });
        });
    });
    describe('CONRAD', function () {
        beforeEach(function () {
            lighting5 = new rfxcom.Lighting5(device, rfxcom.lighting5.CONRAD);
        });
        describe('commands', function () {
            describe('switchOn()', function () {
                it('should send the correct bytes to the serialport', function (done) {
                    let sentCommandId = NaN;
                    lighting5.switchOn('0x123456/1', function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x0A, 0x14, 0x04, 0x00, 0x12, 0x34, 0x56, 0x01, 0x01, 0x1F, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
                it('should handle a group address', function (done) {
                    let sentCommandId = NaN;
                    lighting5.switchOn('0x123456/0', function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x0A, 0x14, 0x04, 0x00, 0x12, 0x34, 0x56, 0x00, 0x03, 0x1F, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
            });
            describe('switchOff()', function () {
                it('should send the correct bytes to the serialport', function (done) {
                    let sentCommandId = NaN;
                    lighting5.switchOff('0x123456/1', function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x0A, 0x14, 0x04, 0x00, 0x12, 0x34, 0x56, 0x01, 0x00, 0x00, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
                it('should handle a group address', function (done) {
                    let sentCommandId = NaN;
                    lighting5.switchOff('0x123456/0', function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x0A, 0x14, 0x04, 0x00, 0x12, 0x34, 0x56, 0x00, 0x02, 0x00, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
            });
            describe('toggleOnOff()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.toggleOnOff('0x123456/1');
                    }).toThrow("Device does not support toggleOnOff()");
                });
            });
            describe('setLevel()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.setLevel('0x123456/1');
                    }).toThrow("Device does not support setLevel()");
                });
            });
            describe('increaseLevel()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.increaseLevel('0x123456/1');
                    }).toThrow("Device does not support increaseLevel()");
                });
            });
            describe('decreaseLevel()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.decreaseLevel('0x123456/1');
                    }).toThrow("Device does not support decreaseLevel()");
                });
            });
            describe('setMood()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.setMood('0x123456/1');
                    }).toThrow("Device does not support setMood()");
                });
            });
            describe('program()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.program('0x123456/1');
                    }).toThrow("Device does not support program()");
                });
            });
            describe('relayOpen()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.relayOpen('0x123456/1');
                    }).toThrow("Device does not support relayOpen()");
                });
            });
            describe('relayClose()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.relayClose('0x123456/1');
                    }).toThrow("Device does not support relayClose()");
                });
            });
            describe('relayStop()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.relayStop('0x123456/1');
                    }).toThrow("Device does not support relayStop()");
                });
            });
            describe('increaseColour()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.increaseColour('0x123456/1');
                    }).toThrow("Device does not support increaseColour()");
                });
            });
            describe('decreaseColour()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.decreaseColour('0x123456/1');
                    }).toThrow("Device does not support decreaseColour()");
                });
            });
            describe('setColour()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.setColour('0x123456/1');
                    }).toThrow("Device does not support setColour()");
                });
            });
            describe('setScene()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.setScene('0x123456/1', 1, 1);
                    }).toThrow("Device does not support setScene()");
                });
            });
            describe('lock()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.lock('0x123456/1');
                    }).toThrow("Device does not support lock()");
                });
            });
            describe('unlock()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.lock('0x123456/1');
                    }).toThrow("Device does not support lock()");
                });
            });
        });
        describe('address checking', function () {
            it('should throw an exception with an invalid deviceId format', function () {
                expect(function () {
                    lighting5.switchOn('0x3FFF');
                }).toThrow("Invalid deviceId format");
            });
            it('should accept the highest address and unit code values', function (done) {
                let sentCommandId = NaN;
                lighting5.switchOn('0xFFFFFF/16', function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0A, 0x14, 0x04, 0x00, 0xff, 0xff, 0xff, 0x10, 0x01, 0x1F, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should accept the lowest address and unit code values', function (done) {
                let sentCommandId = NaN;
                lighting5.switchOn('0x00001/1', function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0A, 0x14, 0x04, 0x00, 0x00, 0x00, 0x01, 0x01, 0x01, 0x1F, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should throw an exception with an invalid unit number 17', function () {
                expect(function () {
                    lighting5.switchOn('0x7FFF/17');
                }).toThrow("Invalid unit code 17");
            });
            it('should throw an exception with an invalid unit number -1', function () {
                expect(function () {
                    lighting5.switchOn('0x7FFF/-1');
                }).toThrow("Invalid unit code -1");
            });
            it('should throw an exception with an invalid address 0x1000000', function () {
                expect(function () {
                    lighting5.switchOn('0x1000000/4');
                }).toThrow("Address 0x1000000 outside valid range");
            });
            it('should throw an exception with an invalid address 0x0', function () {
                expect(function () {
                    lighting5.switchOn('0x0/4');
                }).toThrow("Address 0x0 outside valid range");
            });
        });
    });
    describe('LIVOLO', function () {
        beforeEach(function () {
            lighting5 = new rfxcom.Lighting5(device, rfxcom.lighting5.LIVOLO);
        });
        describe('commands', function () {
            describe('switchOn()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.switchOn('0x1234/1');
                    }).toThrow("Device does not support switchOn()");
                });
            });
            describe('switchOff()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.switchOff('0x1234/1');
                    }).toThrow("Device supports switchOff() only for group");
                });
                it('should handle a group address', function (done) {
                    let sentCommandId = NaN;
                    lighting5.switchOff('0x1234/0', function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x0A, 0x14, 0x05, 0x00, 0x00, 0x12, 0x34, 0x00, 0x00, 0x00, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
            });
            describe('toggleOnOff()', function () {
                it('should send the correct bytes to the serial port for unit 1', function (done) {
                    let sentCommandId = NaN;
                    lighting5.toggleOnOff('0x1234/1', function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x0A, 0x14, 0x05, 0x00, 0x00, 0x12, 0x34, 0x01, 0x01, 0x1f, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
                it('should send the correct bytes to the serial port for unit 2', function (done) {
                    let sentCommandId = NaN;
                    lighting5.toggleOnOff('0x1234/2', function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x0A, 0x14, 0x05, 0x00, 0x00, 0x12, 0x34, 0x02, 0x02, 0x1f, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
                it('should send the correct bytes to the serial port for unit 3', function (done) {
                    let sentCommandId = NaN;
                    lighting5.toggleOnOff('0x1234/3', function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x0A, 0x14, 0x05, 0x00, 0x00, 0x12, 0x34, 0x03, 0x03, 0x1f, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
                it('should throw an exception with a group address', function () {
                    expect(function () {
                        lighting5.toggleOnOff('0x1234/0');
                    }).toThrow("Group command must be On or Off");
                });
            });
            describe('setLevel()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.setLevel('0x1234/1');
                    }).toThrow("Device does not support setLevel()");
                });
            });
            describe('increaseLevel()', function () {
                it('should send the correct bytes to the serial port', function (done) {
                    let sentCommandId = NaN;
                    lighting5.increaseLevel('0x1234/1', function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x0A, 0x14, 0x05, 0x00, 0x00, 0x12, 0x34, 0x01, 0x02, 0x00, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
            });
            describe('decreaseLevel()', function () {
                it('should send the correct bytes to the serial port', function (done) {
                    let sentCommandId = NaN;
                    lighting5.decreaseLevel('0x1234/1', function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x0A, 0x14, 0x05, 0x00, 0x00, 0x12, 0x34, 0x01, 0x03, 0x00, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
            });
            describe('setMood()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.setMood('0x1234/1');
                    }).toThrow("Device does not support setMood()");
                });
            });
            describe('program()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.program('0x1234/1');
                    }).toThrow("Device does not support program()");
                });
            });
            describe('relayOpen()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.relayOpen('0x1234/1');
                    }).toThrow("Device does not support relayOpen()");
                });
            });
            describe('relayClose()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.relayClose('0x1234/1');
                    }).toThrow("Device does not support relayClose()");
                });
            });
            describe('relayStop()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.relayStop('0x1234/1');
                    }).toThrow("Device does not support relayStop()");
                });
            });
            describe('increaseColour()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.increaseColour('0x1234/1');
                    }).toThrow("Device does not support increaseColour()");
                });
            });
            describe('decreaseColour()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.decreaseColour('0x1234/1');
                    }).toThrow("Device does not support decreaseColour()");
                });
            });
            describe('setColour()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.setColour('0x1234/1');
                    }).toThrow("Device does not support setColour()");
                });
            });
            describe('setScene()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.setScene('0x1234/1', 1, 1);
                    }).toThrow("Device does not support setScene()");
                });
            });
            describe('lock()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.lock('0x1234/1');
                    }).toThrow("Device does not support lock()");
                });
            });
            describe('unlock()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.lock('0x1234/1');
                    }).toThrow("Device does not support lock()");
                });
            });
        });
        describe('address checking', function () {
            it('should throw an exception with an invalid deviceId format', function () {
                expect(function () {
                    lighting5.toggleOnOff('0x3FFF');
                }).toThrow("Invalid deviceId format");
            });
            it('should accept the highest address and unit code values', function (done) {
                let sentCommandId = NaN;
                lighting5.toggleOnOff('0x7FFF/3', function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0A, 0x14, 0x05, 0x00, 0x00, 0x7f, 0xff, 0x03, 0x03, 0x1F, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should accept the lowest address and unit code values', function (done) {
                let sentCommandId = NaN;
                lighting5.toggleOnOff('0x1/1', function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0A, 0x14, 0x05, 0x00, 0x00, 0x00, 0x01, 0x01, 0x01, 0x1F, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should throw an exception with an invalid unit number 4', function () {
                expect(function () {
                    lighting5.toggleOnOff('0x7FFF/4');
                }).toThrow("Invalid unit code 4");
            });
            it('should throw an exception with an invalid unit number -1', function () {
                expect(function () {
                    lighting5.toggleOnOff('0x7FFF/-1');
                }).toThrow("Invalid unit code -1");
            });
            it('should throw an exception with an invalid address 0x8000', function () {
                expect(function () {
                    lighting5.toggleOnOff('0x8000/1');
                }).toThrow("Address 0x8000 outside valid range");
            });
            it('should throw an exception with an invalid address 0x0000', function () {
                expect(function () {
                    lighting5.toggleOnOff('0x0/1');
                }).toThrow("Address 0x0 outside valid range");
            });
        });
    });
    describe('TRC02', function () {
        beforeEach(function () {
            lighting5 = new rfxcom.Lighting5(device, rfxcom.lighting5.TRC02);
        });
        describe('commands', function () {
            describe('switchOn()', function () {
                it('should send the correct bytes to the serialport', function (done) {
                    let sentCommandId = NaN;
                    lighting5.switchOn('0x123456', function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x0A, 0x14, 0x06, 0x00, 0x12, 0x34, 0x56, 0x01, 0x01, 0x1F, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
                it('should throw an exception with a group address', function () {
                    expect(function () {
                        lighting5.switchOn('0x123456/0');
                    }).toThrow("Subtype doesn't support group commands");
                });
            });
            describe('switchOff()', function () {
                it('should send the correct bytes to the serialport', function (done) {
                    let sentCommandId = NaN;
                    lighting5.switchOff('0x123456', function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x0A, 0x14, 0x06, 0x00, 0x12, 0x34, 0x56, 0x01, 0x00, 0x00, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
                it('should throw an exception with a group address', function () {
                    expect(function () {
                        lighting5.switchOff('0x123456/0');
                    }).toThrow("Subtype doesn't support group commands");
                });
            });
            describe('toggleOnOff()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.toggleOnOff('0x123456');
                    }).toThrow("Device does not support toggleOnOff()");
                });
            });
            describe('setLevel()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.setLevel('0x123456');
                    }).toThrow("Device does not support setLevel()");
                });
            });
            describe('increaseLevel()', function () {
                it('should send the correct bytes to the serialport', function (done) {
                    let sentCommandId = NaN;
                    lighting5.increaseLevel('0x123456', function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x0A, 0x14, 0x06, 0x00, 0x12, 0x34, 0x56, 0x01, 0x02, 0x00, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
                it('should throw an exception with a group address', function () {
                    expect(function () {
                        lighting5.increaseLevel('0x123456/0');
                    }).toThrow("Subtype doesn't support group commands");
                });
            });
            describe('decreaseLevel()', function () {
                it('should send the correct bytes to the serialport', function (done) {
                    let sentCommandId = NaN;
                    lighting5.decreaseLevel('0x123456', function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x0A, 0x14, 0x06, 0x00, 0x12, 0x34, 0x56, 0x01, 0x03, 0x00, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
                it('should throw an exception with a group address', function () {
                    expect(function () {
                        lighting5.decreaseLevel('0x123456/0');
                    }).toThrow("Subtype doesn't support group commands");
                });
            });
            describe('setMood()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.setMood('0x123456');
                    }).toThrow("Device does not support setMood()");
                });
            });
            describe('program()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.program('0x123456');
                    }).toThrow("Device does not support program()");
                });
            });
            describe('relayOpen()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.relayOpen('0x123456');
                    }).toThrow("Device does not support relayOpen()");
                });
            });
            describe('relayClose()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.relayClose('0x123456');
                    }).toThrow("Device does not support relayClose()");
                });
            });
            describe('relayStop()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.relayStop('0x123456');
                    }).toThrow("Device does not support relayStop()");
                });
            });
            describe('increaseColour()', function () {
                it('should send the correct bytes to the serialport', function (done) {
                    let sentCommandId = NaN;
                    lighting5.increaseColour('0x123456', function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x0A, 0x14, 0x06, 0x00, 0x12, 0x34, 0x56, 0x01, 0x04, 0x00, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
                it('should throw an exception with a group address', function () {
                    expect(function () {
                        lighting5.increaseColour('0x123456/0');
                    }).toThrow("Subtype doesn't support group commands");
                });
            });
            describe('decreaseColour()', function () {
                it('should send the correct bytes to the serialport', function (done) {
                    let sentCommandId = NaN;
                    lighting5.decreaseColour('0x123456', function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x0A, 0x14, 0x06, 0x00, 0x12, 0x34, 0x56, 0x01, 0x05, 0x00, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
                it('should throw an exception with a group address', function () {
                    expect(function () {
                        lighting5.decreaseColour('0x123456/0');
                    }).toThrow("Subtype doesn't support group commands");
                });
            });
            describe('setColour()', function () {
                it('should send the correct bytes to the serialport with minimum colour value 0', function (done) {
                    let sentCommandId = NaN;
                    lighting5.setColour('0x123456', 0, function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x0A, 0x14, 0x06, 0x00, 0x12, 0x34, 0x56, 0x01, 0x06, 0x00, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
                it('should send the correct bytes to the serialport with maximum colour value 126', function (done) {
                    let sentCommandId = NaN;
                    lighting5.setColour('0x123456', 126, function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x0A, 0x14, 0x06, 0x00, 0x12, 0x34, 0x56, 0x01, 0x84, 0x7e, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
                it('should throw an exception with invalid colour value -1', function () {
                    expect(function () {
                        lighting5.setColour('0x123456', -1);
                    }).toThrow("Invalid colour: value must be in range 0-126");
                });
                it('should throw an exception with invalid colour value 127', function () {
                    expect(function () {
                        lighting5.setColour('0x123456', 127);
                    }).toThrow("Invalid colour: value must be in range 0-126");
                });
                it('should throw an exception with a group address', function () {
                    expect(function () {
                        lighting5.setColour('0x123456/0');
                    }).toThrow("Subtype doesn't support group commands");
                });
            });
            describe('setScene()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.setScene('0x123456', 1, 1);
                    }).toThrow("Device does not support setScene()");
                });
            });
            describe('lock()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.lock('0x123456');
                    }).toThrow("Device does not support lock()");
                });
            });
            describe('unlock()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.lock('0x123456');
                    }).toThrow("Device does not support lock()");
                });
            });
        });
        describe('address checking', function () {
            it('should throw an exception with an invalid deviceId format', function () {
                expect(function () {
                    lighting5.switchOn('0xFFFFFF/1/1');
                }).toThrow("Invalid deviceId format");
            });
            it('should accept the highest address', function (done) {
                let sentCommandId = NaN;
                lighting5.switchOn('0xFFFFFF', function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0A, 0x14, 0x06, 0x00, 0xff, 0xff, 0xff, 0x01, 0x01, 0x1F, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should accept the lowest address', function (done) {
                let sentCommandId = NaN;
                lighting5.switchOn('0x1', function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0A, 0x14, 0x06, 0x00, 0x00, 0x00, 0x01, 0x01, 0x01, 0x1F, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should ignore a unit number', function (done) {
                let sentCommandId = NaN;
                lighting5.switchOn('0x1/17', function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0A, 0x14, 0x06, 0x00, 0x00, 0x00, 0x01, 0x11, 0x01, 0x1F, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should throw an exception with an invalid address 0x1000000', function () {
                expect(function () {
                    lighting5.switchOn('0x1000000');
                }).toThrow("Address 0x1000000 outside valid range");
            });
            it('should throw an exception with an invalid address 0x0', function () {
                expect(function () {
                    lighting5.switchOn('0x0');
                }).toThrow("Address 0x0 outside valid range");
            });
        });
    });
    describe('AOKE', function () {
        beforeEach(function () {
            lighting5 = new rfxcom.Lighting5(device, rfxcom.lighting5.AOKE);
        });
        describe('commands', function () {
            describe('switchOn()', function () {
                it('should send the correct bytes to the serialport', function (done) {
                    let sentCommandId = NaN;
                    lighting5.switchOn('0x1234', function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x0A, 0x14, 0x07, 0x00, 0x00, 0x12, 0x34, 0x01, 0x01, 0x1F, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
                it('should throw an exception with a group address', function () {
                    expect(function () {
                        lighting5.switchOn('0x1234/0');
                    }).toThrow("Subtype doesn't support group commands");
                });
            });
            describe('switchOff()', function () {
                it('should send the correct bytes to the serialport', function (done) {
                    let sentCommandId = NaN;
                    lighting5.switchOff('0x1234', function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x0A, 0x14, 0x07, 0x00, 0x00, 0x12, 0x34, 0x01, 0x00, 0x00, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
                it('should throw an exception with a group address', function () {
                    expect(function () {
                        lighting5.switchOff('0x1234/0');
                    }).toThrow("Subtype doesn't support group commands");
                });
            });
            describe('toggleOnOff()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.toggleOnOff('0x1234');
                    }).toThrow("Device does not support toggleOnOff()");
                });
            });
            describe('setLevel()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.setLevel('0x1234');
                    }).toThrow("Device does not support setLevel()");
                });
            });
            describe('increaseLevel()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.increaseLevel('0x1234');
                    }).toThrow("Device does not support increaseLevel()");
                });
            });
            describe('decreaseLevel()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.decreaseLevel('0x1234');
                    }).toThrow("Device does not support decreaseLevel()");
                });
            });
            describe('setMood()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.setMood('0x1234', 1);
                    }).toThrow("Device does not support setMood()");
                });
            });
            describe('program()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.program('0x1234');
                    }).toThrow("Device does not support program()");
                });
            });
            describe('relayOpen()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.relayOpen('0x1234');
                    }).toThrow("Device does not support relayOpen()");
                });
            });
            describe('relayClose()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.relayClose('0x1234');
                    }).toThrow("Device does not support relayClose()");
                });
            });
            describe('relayStop()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.relayStop('0x1234');
                    }).toThrow("Device does not support relayStop()");
                });
            });
            describe('increaseColour()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.increaseColour('0x1234');
                    }).toThrow("Device does not support increaseColour()");
                });
            });
            describe('decreaseColour()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.decreaseColour('0x1234');
                    }).toThrow("Device does not support decreaseColour()");
                });
            });
            describe('setColour()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.setColour('0x1234', 5);
                    }).toThrow("Device does not support setColour()");
                });
            });
            describe('setScene()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.setScene('0x1234', 1, 1);
                    }).toThrow("Device does not support setScene()");
                });
            });
            describe('lock()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.lock('0x1234');
                    }).toThrow("Device does not support lock()");
                });
            });
            describe('unlock()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.lock('0x1234');
                    }).toThrow("Device does not support lock()");
                });
            });
        });
        describe('address checking', function () {
            it('should throw an exception with an invalid deviceId format', function () {
                expect(function () {
                    lighting5.switchOn('0x1234/1/1');
                }).toThrow("Invalid deviceId format");
            });
            it('should accept the highest address value', function (done) {
                let sentCommandId = NaN;
                lighting5.switchOn('0xFFFF', function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0A, 0x14, 0x07, 0x00, 0x00, 0xFF, 0xFF, 0x01, 0x01, 0x1F, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should accept the lowest address value', function (done) {
                let sentCommandId = NaN;
                lighting5.switchOn('0x1/1', function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0A, 0x14, 0x07, 0x00, 0x00, 0x00, 0x01, 0x01, 0x01, 0x1F, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should ignore a unit code value', function (done) {
                let sentCommandId = NaN;
                lighting5.switchOn('0x1234/17', function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0A, 0x14, 0x07, 0x00, 0x00, 0x12, 0x34, 0x11, 0x01, 0x1F, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should throw an exception with an invalid address 0x10000', function () {
                expect(function () {
                    lighting5.switchOn('0x10000');
                }).toThrow("Address 0x10000 outside valid range");
            });
            it('should throw an exception with an invalid address 0x0', function () {
                expect(function () {
                    lighting5.switchOn('0x0');
                }).toThrow("Address 0x0 outside valid range");
            });
        });
    });
    describe('TRC02_2', function () {
        beforeEach(function () {
            lighting5 = new rfxcom.Lighting5(device, rfxcom.lighting5.TRC02_2);
        });
        describe('commands', function () {
            describe('switchOn()', function () {
                it('should send the correct bytes to the serialport', function (done) {
                    let sentCommandId = NaN;
                    lighting5.switchOn('0x1234', function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x0A, 0x14, 0x08, 0x00, 0x00, 0x12, 0x34, 0x01, 0x01, 0x1F, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
                it('should throw an exception with a group address', function () {
                    expect(function () {
                        lighting5.switchOn('0x1234/0');
                    }).toThrow("Subtype doesn't support group commands");
                });
            });
            describe('switchOff()', function () {
                it('should send the correct bytes to the serialport', function (done) {
                    let sentCommandId = NaN;
                    lighting5.switchOff('0x1234', function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x0A, 0x14, 0x08, 0x00, 0x00, 0x12, 0x34, 0x01, 0x00, 0x00, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
                it('should throw an exception with a group address', function () {
                    expect(function () {
                        lighting5.switchOff('0x1234/0');
                    }).toThrow("Subtype doesn't support group commands");
                });
            });
            describe('toggleOnOff()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.toggleOnOff('0x1234');
                    }).toThrow("Device does not support toggleOnOff()");
                });
            });
            describe('setLevel()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.setLevel('0x1234');
                    }).toThrow("Device does not support setLevel()");
                });
            });
            describe('increaseLevel()', function () {
                it('should send the correct bytes to the serialport', function (done) {
                    let sentCommandId = NaN;
                    lighting5.increaseLevel('0x1234', function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x0A, 0x14, 0x08, 0x00, 0x00, 0x12, 0x34, 0x01, 0x02, 0x00, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
                it('should throw an exception with a group address', function () {
                    expect(function () {
                        lighting5.increaseLevel('0x1234/0');
                    }).toThrow("Subtype doesn't support group commands");
                });
            });
            describe('decreaseLevel()', function () {
                it('should send the correct bytes to the serialport', function (done) {
                    let sentCommandId = NaN;
                    lighting5.decreaseLevel('0x1234', function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x0A, 0x14, 0x08, 0x00, 0x00, 0x12, 0x34, 0x01, 0x03, 0x00, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
                it('should throw an exception with a group address', function () {
                    expect(function () {
                        lighting5.decreaseLevel('0x1234/0');
                    }).toThrow("Subtype doesn't support group commands");
                });
            });
            describe('setMood()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.setMood('0x1234');
                    }).toThrow("Device does not support setMood()");
                });
            });
            describe('program()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.program('0x1234');
                    }).toThrow("Device does not support program()");
                });
            });
            describe('relayOpen()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.relayOpen('0x1234');
                    }).toThrow("Device does not support relayOpen()");
                });
            });
            describe('relayClose()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.relayClose('0x1234');
                    }).toThrow("Device does not support relayClose()");
                });
            });
            describe('relayStop()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.relayStop('0x1234');
                    }).toThrow("Device does not support relayStop()");
                });
            });
            describe('increaseColour()', function () {
                it('should send the correct bytes to the serialport', function (done) {
                    let sentCommandId = NaN;
                    lighting5.increaseColour('0x1234', function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x0A, 0x14, 0x08, 0x00, 0x00, 0x12, 0x34, 0x01, 0x04, 0x00, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
                it('should throw an exception with a group address', function () {
                    expect(function () {
                        lighting5.increaseColour('0x1234/0');
                    }).toThrow("Subtype doesn't support group commands");
                });
            });
            describe('decreaseColour()', function () {
                it('should send the correct bytes to the serialport', function (done) {
                    let sentCommandId = NaN;
                    lighting5.decreaseColour('0x1234', function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x0A, 0x14, 0x08, 0x00, 0x00, 0x12, 0x34, 0x01, 0x05, 0x00, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
                it('should throw an exception with a group address', function () {
                    expect(function () {
                        lighting5.decreaseColour('0x1234/0');
                    }).toThrow("Subtype doesn't support group commands");
                });
            });
            describe('setColour()', function () {
                it('should send the correct bytes to the serialport with minimum colour value 0', function (done) {
                    let sentCommandId = NaN;
                    lighting5.setColour('0x1234', 0, function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x0A, 0x14, 0x08, 0x00, 0x00, 0x12, 0x34, 0x01, 0x06, 0x00, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
                it('should send the correct bytes to the serialport with maximum colour value 61', function (done) {
                    let sentCommandId = NaN;
                    lighting5.setColour('0x1234', 61, function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x0A, 0x14, 0x08, 0x00, 0x00, 0x12, 0x34, 0x01, 0x43, 0x3d, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
                it('should throw an exception with invalid colour value -1', function () {
                    expect(function () {
                        lighting5.setColour('0x1234', -1);
                    }).toThrow("Invalid colour: value must be in range 0-61");
                });
                it('should throw an exception with invalid colour value 62', function () {
                    expect(function () {
                        lighting5.setColour('0x1234', 62);
                    }).toThrow("Invalid colour: value must be in range 0-61");
                });
                it('should throw an exception with a group address', function () {
                    expect(function () {
                        lighting5.setColour('0x1234/0');
                    }).toThrow("Subtype doesn't support group commands");
                });
            });
            describe('setScene()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.setScene('0x1234', 1, 1);
                    }).toThrow("Device does not support setScene()");
                });
            });
            describe('lock()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.lock('0x1234');
                    }).toThrow("Device does not support lock()");
                });
            });
            describe('unlock()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.lock('0x1234');
                    }).toThrow("Device does not support lock()");
                });
            });
        });
        describe('address checking', function () {
            it('should throw an exception with an invalid deviceId format', function () {
                expect(function () {
                    lighting5.switchOn('0xFFFFFF/1/1');
                }).toThrow("Invalid deviceId format");
            });
            it('should accept the highest address', function (done) {
                let sentCommandId = NaN;
                lighting5.switchOn('0x7FFF', function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0A, 0x14, 0x08, 0x00, 0x00, 0x7f, 0xff, 0x01, 0x01, 0x1F, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should accept the lowest address', function (done) {
                let sentCommandId = NaN;
                lighting5.switchOn('0x1', function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0A, 0x14, 0x08, 0x00, 0x00, 0x00, 0x01, 0x01, 0x01, 0x1F, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should ignore a unit number', function (done) {
                let sentCommandId = NaN;
                lighting5.switchOn('0x1/17', function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0A, 0x14, 0x08, 0x00, 0x00, 0x00, 0x01, 0x11, 0x01, 0x1F, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should throw an exception with an invalid address 0x8000', function () {
                expect(function () {
                    lighting5.switchOn('0x8000');
                }).toThrow("Address 0x8000 outside valid range");
            });
            it('should throw an exception with an invalid address 0x0', function () {
                expect(function () {
                    lighting5.switchOn('0x0');
                }).toThrow("Address 0x0 outside valid range");
            });
        });
    });
    describe('EURODOMEST', function () {
        beforeEach(function () {
            lighting5 = new rfxcom.Lighting5(device, rfxcom.lighting5.EURODOMEST);
        });
        describe('commands', function () {
            describe('switchOn()', function () {
                it('should send the correct bytes to the serialport', function (done) {
                    let sentCommandId = NaN;
                    lighting5.switchOn('0x12345/1', function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x0A, 0x14, 0x09, 0x00, 0x01, 0x23, 0x45, 0x01, 0x01, 0x1F, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
                it('should handle a group address', function (done) {
                    let sentCommandId = NaN;
                    lighting5.switchOn('0x12345/0', function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x0A, 0x14, 0x09, 0x00, 0x01, 0x23, 0x45, 0x00, 0x03, 0x1F, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
            });
            describe('switchOff()', function () {
                it('should send the correct bytes to the serialport', function (done) {
                    let sentCommandId = NaN;
                    lighting5.switchOff('0x12345/1', function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x0A, 0x14, 0x09, 0x00, 0x01, 0x23, 0x45, 0x01, 0x00, 0x00, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
                it('should handle a group address', function (done) {
                    let sentCommandId = NaN;
                    lighting5.switchOff('0x12345/0', function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x0A, 0x14, 0x09, 0x00, 0x01, 0x23, 0x45, 0x00, 0x02, 0x00, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
            });
            describe('toggleOnOff()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.toggleOnOff('0x12345/1');
                    }).toThrow("Device does not support toggleOnOff()");
                });
            });
            describe('setLevel()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.setLevel('0x12345/1');
                    }).toThrow("Device does not support setLevel()");
                });
            });
            describe('increaseLevel()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.increaseLevel('0x12345/1');
                    }).toThrow("Device does not support increaseLevel()");
                });
            });
            describe('decreaseLevel()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.decreaseLevel('0x12345/1');
                    }).toThrow("Device does not support decreaseLevel()");
                });
            });
            describe('setMood()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.setMood('0x12345/1');
                    }).toThrow("Device does not support setMood()");
                });
            });
            describe('program()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.program('0x12345/1');
                    }).toThrow("Device does not support program()");
                });
            });
            describe('relayOpen()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.relayOpen('0x12345/1');
                    }).toThrow("Device does not support relayOpen()");
                });
            });
            describe('relayClose()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.relayClose('0x12345/1');
                    }).toThrow("Device does not support relayClose()");
                });
            });
            describe('relayStop()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.relayStop('0x12345/1');
                    }).toThrow("Device does not support relayStop()");
                });
            });
            describe('increaseColour()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.increaseColour('0x12345/1');
                    }).toThrow("Device does not support increaseColour()");
                });
            });
            describe('decreaseColour()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.decreaseColour('0x12345/1');
                    }).toThrow("Device does not support decreaseColour()");
                });
            });
            describe('setColour()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.setColour('0x12345/1');
                    }).toThrow("Device does not support setColour()");
                });
            });
            describe('setScene()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.setScene('0x12345/1', 1, 1);
                    }).toThrow("Device does not support setScene()");
                });
            });
            describe('lock()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.lock('0x12345/1');
                    }).toThrow("Device does not support lock()");
                });
            });
            describe('unlock()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.lock('0x1234/51');
                    }).toThrow("Device does not support lock()");
                });
            });
        });
        describe('address checking', function () {
            it('should throw an exception with an invalid deviceId format', function () {
                expect(function () {
                    lighting5.switchOn('0x3FFF');
                }).toThrow("Invalid deviceId format");
            });
            it('should accept the highest address and unit code values', function (done) {
                let sentCommandId = NaN;
                lighting5.switchOn('0x7FFFF/4', function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0A, 0x14, 0x09, 0x00, 0x07, 0xff, 0xff, 0x04, 0x01, 0x1F, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should accept the lowest address and unit code values', function (done) {
                let sentCommandId = NaN;
                lighting5.switchOn('0x00001/1', function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0A, 0x14, 0x09, 0x00, 0x00, 0x00, 0x01, 0x01, 0x01, 0x1F, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should throw an exception with an invalid unit number 5', function () {
                expect(function () {
                    lighting5.switchOn('0x7FFF/5');
                }).toThrow("Invalid unit code 5");
            });
            it('should throw an exception with an invalid unit number -1', function () {
                expect(function () {
                    lighting5.switchOn('0x7FFF/-1');
                }).toThrow("Invalid unit code -1");
            });
            it('should throw an exception with an invalid address 0x80000', function () {
                expect(function () {
                    lighting5.switchOn('0x80000/4');
                }).toThrow("Address 0x80000 outside valid range");
            });
            it('should throw an exception with an invalid address 0x0', function () {
                expect(function () {
                    lighting5.switchOn('0x0/4');
                }).toThrow("Address 0x0 outside valid range");
            });
        });
    });
    describe('LIVOLO_APPLIANCE', function () {
        beforeEach(function () {
            lighting5 = new rfxcom.Lighting5(device, rfxcom.lighting5.LIVOLO_APPLIANCE);
        });
        describe('commands', function () {
            describe('switchOn()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.switchOn('0x1234/1');
                    }).toThrow("Device does not support switchOn()");
                });
            });
            describe('switchOff()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.switchOff('0x1234/1');
                    }).toThrow("Device supports switchOff() only for group");
                });
                it('should handle a group address', function (done) {
                    let sentCommandId = NaN;
                    lighting5.switchOff('0x1234/0', function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x0A, 0x14, 0x0A, 0x00, 0x00, 0x12, 0x34, 0x00, 0x00, 0x00, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
            });
            describe('toggleOnOff()', function () {
                it('should send the correct bytes to the serial port', function (done) {
                    let sentCommandId = NaN;
                    lighting5.toggleOnOff('0x1234/1', function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x0A, 0x14, 0x0A, 0x00, 0x00, 0x12, 0x34, 0x01, 0x01, 0x1f, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
                it('should throw an exception with a group address', function () {
                    expect(function () {
                        lighting5.toggleOnOff('0x1234/0');
                    }).toThrow("Group command must be On or Off");
                });
            });
            describe('setLevel()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.setLevel('0x1234/1');
                    }).toThrow("Device does not support setLevel()");
                });
            });
            describe('increaseLevel()', function () {
                it('should send the correct bytes to the serial port for room 1', function (done) {
                    let sentCommandId = NaN;
                    lighting5.increaseLevel('0x1234/1', 1, function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x0A, 0x14, 0x0A, 0x00, 0x00, 0x12, 0x34, 0x01, 0x02, 0x00, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
                it('should send the correct bytes to the serial port for room 2', function (done) {
                    let sentCommandId = NaN;
                    lighting5.increaseLevel('0x1234/1', 2, function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x0A, 0x14, 0x0A, 0x00, 0x00, 0x12, 0x34, 0x01, 0x06, 0x00, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
                it('should throw an exception with an invalid room number', function () {
                    expect(function () {
                        lighting5.increaseLevel('0x1234/1', 0);
                    }).toThrow("Invalid room number 0");
                });
            });
            describe('decreaseLevel()', function () {
                it('should send the correct bytes to the serial port for room 1', function (done) {
                    let sentCommandId = NaN;
                    lighting5.decreaseLevel('0x1234/1', 1, function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x0A, 0x14, 0x0A, 0x00, 0x00, 0x12, 0x34, 0x01, 0x03, 0x00, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
                it('should send the correct bytes to the serial port for room 2', function (done) {
                    let sentCommandId = NaN;
                    lighting5.decreaseLevel('0x1234/1', 2, function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x0A, 0x14, 0x0A, 0x00, 0x00, 0x12, 0x34, 0x01, 0x07, 0x00, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
                it('should throw an exception with an invalid room number', function () {
                    expect(function () {
                        lighting5.decreaseLevel('0x1234/1', 0);
                    }).toThrow("Invalid room number 0");
                });
            });
            describe('setMood()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.setMood('0x1234/1');
                    }).toThrow("Device does not support setMood()");
                });
            });
            describe('program()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.program('0x1234/1');
                    }).toThrow("Device does not support program()");
                });
            });
            describe('relayOpen()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.relayOpen('0x1234/1');
                    }).toThrow("Device does not support relayOpen()");
                });
            });
            describe('relayClose()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.relayClose('0x1234/1');
                    }).toThrow("Device does not support relayClose()");
                });
            });
            describe('relayStop()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.relayStop('0x1234/1');
                    }).toThrow("Device does not support relayStop()");
                });
            });
            describe('increaseColour()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.increaseColour('0x1234/1');
                    }).toThrow("Device does not support increaseColour()");
                });
            });
            describe('decreaseColour()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.decreaseColour('0x1234/1');
                    }).toThrow("Device does not support decreaseColour()");
                });
            });
            describe('setColour()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.setColour('0x1234/1');
                    }).toThrow("Device does not support setColour()");
                });
            });
            describe('setScene()', function () {
                it('should send the correct bytes to the serial port for scene 1, room 1', function (done) {
                    let sentCommandId = NaN;
                    lighting5.setScene('0x1234/1', 1, 1, function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x0A, 0x14, 0x0A, 0x00, 0x00, 0x12, 0x34, 0x01, 0x04, 0x00, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
                it('should send the correct bytes to the serial port for scene 1, room 2', function (done) {
                    let sentCommandId = NaN;
                    lighting5.setScene('0x1234/1', 1, 2, function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x0A, 0x14, 0x0A, 0x00, 0x00, 0x12, 0x34, 0x01, 0x08, 0x00, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
                it('should send the correct bytes to the serial port for scene 2, room 1', function (done) {
                    let sentCommandId = NaN;
                    lighting5.setScene('0x1234/1', 2, 1, function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x0A, 0x14, 0x0A, 0x00, 0x00, 0x12, 0x34, 0x01, 0x05, 0x00, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
                it('should send the correct bytes to the serial port for scene 2, room 2', function (done) {
                    let sentCommandId = NaN;
                    lighting5.setScene('0x1234/1', 2, 2, function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x0A, 0x14, 0x0A, 0x00, 0x00, 0x12, 0x34, 0x01, 0x09, 0x00, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
                it('should throw an exception with an invalid room number', function () {
                    expect(function () {
                        lighting5.setScene('0x1234/1', 1, 0);
                    }).toThrow("Invalid room number 0");
                });
                it('should throw an exception with an invalid scene', function () {
                    expect(function () {
                        lighting5.setScene('0x1234/1', 0, 1);
                    }).toThrow("Invalid scene 0");
                });
            });
            describe('lock()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.lock('0x1234/1');
                    }).toThrow("Device does not support lock()");
                });
            });
            describe('unlock()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.lock('0x1234/1');
                    }).toThrow("Device does not support lock()");
                });
            });
        });
        describe('address checking', function () {
            it('should throw an exception with an invalid deviceId format', function () {
                expect(function () {
                    lighting5.toggleOnOff('0x3FFF');
                }).toThrow("Invalid deviceId format");
            });
            it('should accept the highest address and unit code values', function (done) {
                let sentCommandId = NaN;
                lighting5.toggleOnOff('0x7FFF/10', function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0A, 0x14, 0x0A, 0x00, 0x00, 0x7f, 0xff, 0x0A, 0x01, 0x1F, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should accept the lowest address and unit code values', function (done) {
                let sentCommandId = NaN;
                lighting5.toggleOnOff('0x1/1', function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0A, 0x14, 0x0A, 0x00, 0x00, 0x00, 0x01, 0x01, 0x01, 0x1F, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should throw an exception with an invalid unit number 11', function () {
                expect(function () {
                    lighting5.toggleOnOff('0x7FFF/11');
                }).toThrow("Invalid unit code 11");
            });
            it('should throw an exception with an invalid unit number -1', function () {
                expect(function () {
                    lighting5.toggleOnOff('0x7FFF/-1');
                }).toThrow("Invalid unit code -1");
            });
            it('should throw an exception with an invalid address 0x8000', function () {
                expect(function () {
                    lighting5.toggleOnOff('0x8000/1');
                }).toThrow("Address 0x8000 outside valid range");
            });
            it('should throw an exception with an invalid address 0x0000', function () {
                expect(function () {
                    lighting5.toggleOnOff('0x0/1');
                }).toThrow("Address 0x0 outside valid range");
            });
        });
    });
    describe('RGB432W', function () {
        beforeEach(function () {
            lighting5 = new rfxcom.Lighting5(device, rfxcom.lighting5.RGB432W);
        });
        describe('commands', function () {
            describe('switchOn()', function () {
                it('should send the correct bytes to the serialport', function (done) {
                    let sentCommandId = NaN;
                    lighting5.switchOn('0x1234', function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x0A, 0x14, 0x0B, 0x00, 0x00, 0x12, 0x34, 0x01, 0x01, 0x1F, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
                it('should throw an exception with a group address', function () {
                    expect(function () {
                        lighting5.switchOn('0x1234/0');
                    }).toThrow("Subtype doesn't support group commands");
                });
            });
            describe('switchOff()', function () {
                it('should send the correct bytes to the serialport', function (done) {
                    let sentCommandId = NaN;
                    lighting5.switchOff('0x1234', function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x0A, 0x14, 0x0B, 0x00, 0x00, 0x12, 0x34, 0x01, 0x00, 0x00, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
                it('should throw an exception with a group address', function () {
                    expect(function () {
                        lighting5.switchOff('0x1234/0');
                    }).toThrow("Subtype doesn't support group commands");
                });
            });
            describe('toggleOnOff()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.toggleOnOff('0x1234');
                    }).toThrow("Device does not support toggleOnOff()");
                });
            });
            describe('setLevel()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.setLevel('0x1234');
                    }).toThrow("Device does not support setLevel()");
                });
            });
            describe('increaseLevel()', function () {
                it('should send the correct bytes to the serialport', function (done) {
                    let sentCommandId = NaN;
                    lighting5.increaseLevel('0x1234', function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x0A, 0x14, 0x0B, 0x00, 0x00, 0x12, 0x34, 0x01, 0x02, 0x00, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
                it('should throw an exception with a group address', function () {
                    expect(function () {
                        lighting5.increaseLevel('0x1234/0');
                    }).toThrow("Subtype doesn't support group commands");
                });
            });
            describe('decreaseLevel()', function () {
                it('should send the correct bytes to the serialport', function (done) {
                    let sentCommandId = NaN;
                    lighting5.decreaseLevel('0x1234', function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x0A, 0x14, 0x0B, 0x00, 0x00, 0x12, 0x34, 0x01, 0x03, 0x00, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
                it('should throw an exception with a group address', function () {
                    expect(function () {
                        lighting5.decreaseLevel('0x1234/0');
                    }).toThrow("Subtype doesn't support group commands");
                });
            });
            describe('setMood()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.setMood('0x1234');
                    }).toThrow("Device does not support setMood()");
                });
            });
            describe('program()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.program('0x1234');
                    }).toThrow("Device does not support program()");
                });
            });
            describe('relayOpen()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.relayOpen('0x1234');
                    }).toThrow("Device does not support relayOpen()");
                });
            });
            describe('relayClose()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.relayClose('0x1234');
                    }).toThrow("Device does not support relayClose()");
                });
            });
            describe('relayStop()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.relayStop('0x1234');
                    }).toThrow("Device does not support relayStop()");
                });
            });
            describe('increaseColour()', function () {
                it('should send the correct bytes to the serialport', function (done) {
                    let sentCommandId = NaN;
                    lighting5.increaseColour('0x1234', function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x0A, 0x14, 0x0B, 0x00, 0x00, 0x12, 0x34, 0x01, 0x04, 0x00, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
                it('should throw an exception with a group address', function () {
                    expect(function () {
                        lighting5.increaseColour('0x1234/0');
                    }).toThrow("Subtype doesn't support group commands");
                });
            });
            describe('decreaseColour()', function () {
                it('should send the correct bytes to the serialport', function (done) {
                    let sentCommandId = NaN;
                    lighting5.decreaseColour('0x1234', function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x0A, 0x14, 0x0B, 0x00, 0x00, 0x12, 0x34, 0x01, 0x05, 0x00, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
                it('should throw an exception with a group address', function () {
                    expect(function () {
                        lighting5.decreaseColour('0x1234/0');
                    }).toThrow("Subtype doesn't support group commands");
                });
            });
            describe('setColour()', function () {
                it('should send the correct bytes to the serialport with minimum colour value 0', function (done) {
                    let sentCommandId = NaN;
                    lighting5.setColour('0x1234', 0, function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x0A, 0x14, 0x0B, 0x00, 0x00, 0x12, 0x34, 0x01, 0x06, 0x00, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
                it('should send the correct bytes to the serialport with maximum colour value 126', function (done) {
                    let sentCommandId = NaN;
                    lighting5.setColour('0x1234', 126, function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x0A, 0x14, 0x0B, 0x00, 0x00, 0x12, 0x34, 0x01, 0x84, 0x7E, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
                it('should throw an exception with invalid colour value -1', function () {
                    expect(function () {
                        lighting5.setColour('0x1234', -1);
                    }).toThrow("Invalid colour: value must be in range 0-126");
                });
                it('should throw an exception with invalid colour value 127', function () {
                    expect(function () {
                        lighting5.setColour('0x1234', 127);
                    }).toThrow("Invalid colour: value must be in range 0-126");
                });
                it('should throw an exception with a group address', function () {
                    expect(function () {
                        lighting5.setColour('0x1234/0');
                    }).toThrow("Subtype doesn't support group commands");
                });
            });
            describe('setScene()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.setScene('0x1234', 1, 1);
                    }).toThrow("Device does not support setScene()");
                });
            });
            describe('lock()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.lock('0x1234');
                    }).toThrow("Device does not support lock()");
                });
            });
            describe('unlock()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.lock('0x1234');
                    }).toThrow("Device does not support lock()");
                });
            });
        });
        describe('address checking', function () {
            it('should throw an exception with an invalid deviceId format', function () {
                expect(function () {
                    lighting5.switchOn('0xFFFFFF/1/1');
                }).toThrow("Invalid deviceId format");
            });
            it('should accept the highest address', function (done) {
                let sentCommandId = NaN;
                lighting5.switchOn('0xFFFF', function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0A, 0x14, 0x0B, 0x00, 0x00, 0xff, 0xff, 0x01, 0x01, 0x1F, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should accept the lowest address', function (done) {
                let sentCommandId = NaN;
                lighting5.switchOn('0x1', function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0A, 0x14, 0x0B, 0x00, 0x00, 0x00, 0x01, 0x01, 0x01, 0x1F, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should ignore a unit number', function (done) {
                let sentCommandId = NaN;
                lighting5.switchOn('0x1/17', function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0A, 0x14, 0x0B, 0x00, 0x00, 0x00, 0x01, 0x11, 0x01, 0x1F, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should throw an exception with an invalid address 0x10000', function () {
                expect(function () {
                    lighting5.switchOn('0x10000');
                }).toThrow("Address 0x10000 outside valid range");
            });
            it('should throw an exception with an invalid address 0x0', function () {
                expect(function () {
                    lighting5.switchOn('0x0');
                }).toThrow("Address 0x0 outside valid range");
            });
        });
    });
    describe('MDREMOTE_107', function () {
        beforeEach(function () {
            lighting5 = new rfxcom.Lighting5(device, rfxcom.lighting5.MDREMOTE_107);
        });
        describe('commands', function () {
            describe('switchOn()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.switchOn('0x1234');
                    }).toThrow("Device does not support switchOn()");
                });
            });
            describe('switchOff()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.switchOff('0x1234');
                    }).toThrow("Device does not support switchOff()");
                });
            });
            describe('toggleOnOff()', function () {
                it('should send the correct bytes to the serialport', function (done) {
                    let sentCommandId = NaN;
                    lighting5.toggleOnOff('0x1234', function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x0A, 0x14, 0x0C, 0x00, 0x00, 0x12, 0x34, 0x01, 0x00, 0x1F, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
                it('should throw an exception with a group address', function () {
                    expect(function () {
                        lighting5.toggleOnOff('0x1234/0');
                    }).toThrow("Subtype doesn't support group commands");
                });
            });
            describe('setLevel()', function () {
                it('should set the lowest level 1', function (done) {
                    let sentCommandId = NaN;
                    lighting5.setLevel('0x1234', 1, function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x0A, 0x14, 0x0C, 0x00, 0x00, 0x12, 0x34, 0x01, 0x08, 0x01, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
                it('should set the highest level 6', function (done) {
                    let sentCommandId = NaN;
                    lighting5.setLevel('0x1234', 6, function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x0A, 0x14, 0x0C, 0x00, 0x00, 0x12, 0x34, 0x01, 0x03, 0x06, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
                it('should throw an exception with invalid level 0', function () {
                    expect(function () {
                        lighting5.setLevel('0x1234', 0);
                    }).toThrow("Invalid level: value must be in range 1-6");
                });
                it('should throw an exception with invalid level 7', function () {
                    expect(function () {
                        lighting5.setLevel('0x1234', 7);
                    }).toThrow("Invalid level: value must be in range 1-6");
                });
                it('should throw an exception with a group address', function () {
                    expect(function () {
                        lighting5.setLevel('0x1234/0', 2);
                    }).toThrow("Subtype doesn't support group commands");
                });
            });
            describe('increaseLevel()', function () {
                it('should send the correct bytes to the serialport', function (done) {
                    let sentCommandId = NaN;
                    lighting5.increaseLevel('0x1234', function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x0A, 0x14, 0x0C, 0x00, 0x00, 0x12, 0x34, 0x01, 0x01, 0x00, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
                it('should throw an exception with a group address', function () {
                    expect(function () {
                        lighting5.increaseLevel('0x1234/0');
                    }).toThrow("Subtype doesn't support group commands");
                });
            });
            describe('decreaseLevel()', function () {
                it('should send the correct bytes to the serialport', function (done) {
                    let sentCommandId = NaN;
                    lighting5.decreaseLevel('0x1234', function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x0A, 0x14, 0x0C, 0x00, 0x00, 0x12, 0x34, 0x01, 0x02, 0x00, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
                it('should throw an exception with a group address', function () {
                    expect(function () {
                        lighting5.decreaseLevel('0x1234/0');
                    }).toThrow("Subtype doesn't support group commands");
                });
            });
            describe('setMood()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.setMood('0x1234');
                    }).toThrow("Device does not support setMood()");
                });
            });
            describe('program()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.program('0x1234');
                    }).toThrow("Device does not support program()");
                });
            });
            describe('relayOpen()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.relayOpen('0x1234');
                    }).toThrow("Device does not support relayOpen()");
                });
            });
            describe('relayClose()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.relayClose('0x1234');
                    }).toThrow("Device does not support relayClose()");
                });
            });
            describe('relayStop()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.relayStop('0x1234');
                    }).toThrow("Device does not support relayStop()");
                });
            });
            describe('increaseColour()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.increaseColour('0x1234');
                    }).toThrow("Device does not support increaseColour()");
                });
            });
            describe('decreaseColour()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.decreaseColour('0x1234');
                    }).toThrow("Device does not support decreaseColour()");
                });
            });
            describe('setColour()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.setColour('0x1234');
                    }).toThrow("Device does not support setColour()");
                });
            });
            describe('setScene()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.setScene('0x1234', 1, 1);
                    }).toThrow("Device does not support setScene()");
                });
            });
            describe('lock()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.lock('0x1234');
                    }).toThrow("Device does not support lock()");
                });
            });
            describe('unlock()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.lock('0x1234');
                    }).toThrow("Device does not support lock()");
                });
            });
        });
        describe('address checking', function () {
            it('should throw an exception with an invalid deviceId format', function () {
                expect(function () {
                    lighting5.toggleOnOff('0x3FFF/1/9');
                }).toThrow("Invalid deviceId format");
            });
            it('should accept the highest address', function (done) {
                let sentCommandId = NaN;
                lighting5.toggleOnOff('0xFFFF', function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0A, 0x14, 0x0C, 0x00, 0x00, 0xff, 0xff, 0x01, 0x00, 0x1F, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should accept the lowest address', function (done) {
                let sentCommandId = NaN;
                lighting5.toggleOnOff('0x1', function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0A, 0x14, 0x0C, 0x00, 0x00, 0x00, 0x01, 0x01, 0x00, 0x1F, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should ignore an invalid unit number 5', function (done) {
                let sentCommandId = NaN;
                lighting5.toggleOnOff('0xFFFF/5', function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0A, 0x14, 0x0C, 0x00, 0x00, 0xff, 0xff, 0x05, 0x00, 0x1F, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should throw an exception with an invalid address 0x10000', function () {
                expect(function () {
                    lighting5.toggleOnOff('0x10000');
                }).toThrow("Address 0x10000 outside valid range");
            });
            it('should throw an exception with an invalid address 0x0000', function () {
                expect(function () {
                    lighting5.toggleOnOff('0x000000/4');
                }).toThrow("Address 0x0 outside valid range");
            });
        });
    });
    describe('LEGRAND', function () {
        beforeEach(function () {
            lighting5 = new rfxcom.Lighting5(device, rfxcom.lighting5.LEGRAND);
        });
        describe('commands', function () {
            describe('switchOn()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.switchOn('0x1234');
                    }).toThrow("Device does not support switchOn()");
                });
            });
            describe('switchOff()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.switchOff('0x1234');
                    }).toThrow("Device does not support switchOff()");
                });
            });
            describe('toggleOnOff()', function () {
                it('should send the correct bytes to the serialport', function (done) {
                    let sentCommandId = NaN;
                    lighting5.toggleOnOff('0x1234', function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x0A, 0x14, 0x0D, 0x00, 0x00, 0x12, 0x34, 0x01, 0x00, 0x1F, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
                it('should throw an exception with a group address', function () {
                    expect(function () {
                        lighting5.toggleOnOff('0x1234/0');
                    }).toThrow("Subtype doesn't support group commands");
                });
            });
            describe('setLevel()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.setLevel('0x1234');
                    }).toThrow("Device does not support setLevel()");
                });
            });
            describe('increaseLevel()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.increaseLevel('0x1234');
                    }).toThrow("Device does not support increaseLevel()");
                });
            });
            describe('decreaseLevel()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.decreaseLevel('0x1234');
                    }).toThrow("Device does not support decreaseLevel()");
                });
            });
            describe('setMood()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.setMood('0x1234');
                    }).toThrow("Device does not support setMood()");
                });
            });
            describe('program()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.program('0x1234');
                    }).toThrow("Device does not support program()");
                });
            });
            describe('relayOpen()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.relayOpen('0x1234');
                    }).toThrow("Device does not support relayOpen()");
                });
            });
            describe('relayClose()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.relayClose('0x1234');
                    }).toThrow("Device does not support relayClose()");
                });
            });
            describe('relayStop()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.relayStop('0x1234');
                    }).toThrow("Device does not support relayStop()");
                });
            });
            describe('increaseColour()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.increaseColour('0x1234');
                    }).toThrow("Device does not support increaseColour()");
                });
            });
            describe('decreaseColour()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.decreaseColour('0x1234');
                    }).toThrow("Device does not support decreaseColour()");
                });
            });
            describe('setColour()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.setColour('0x1234');
                    }).toThrow("Device does not support setColour()");
                });
            });
            describe('setScene()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.setScene('0x1234', 1, 1);
                    }).toThrow("Device does not support setScene()");
                });
            });
            describe('lock()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.lock('0x1234');
                    }).toThrow("Device does not support lock()");
                });
            });
            describe('unlock()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.lock('0x1234');
                    }).toThrow("Device does not support lock()");
                });
            });
        });
        describe('address checking', function () {
            it('should throw an exception with an invalid deviceId format', function () {
                expect(function () {
                    lighting5.toggleOnOff('0x3FFF/1/9');
                }).toThrow("Invalid deviceId format");
            });
            it('should accept the highest address', function (done) {
                let sentCommandId = NaN;
                lighting5.toggleOnOff('0xFFFF', function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0A, 0x14, 0x0D, 0x00, 0x00, 0xff, 0xff, 0x01, 0x00, 0x1F, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should accept the lowest address', function (done) {
                let sentCommandId = NaN;
                lighting5.toggleOnOff('0x1', function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0A, 0x14, 0x0D, 0x00, 0x00, 0x00, 0x01, 0x01, 0x00, 0x1F, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should ignore an invalid unit number 5', function (done) {
                let sentCommandId = NaN;
                lighting5.toggleOnOff('0xFFFF/5', function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0A, 0x14, 0x0D, 0x00, 0x00, 0xff, 0xff, 0x05, 0x00, 0x1F, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should throw an exception with an invalid address 0x10000', function () {
                expect(function () {
                    lighting5.toggleOnOff('0x10000');
                }).toThrow("Address 0x10000 outside valid range");
            });
            it('should throw an exception with an invalid address 0x0000', function () {
                expect(function () {
                    lighting5.toggleOnOff('0x000000/4');
                }).toThrow("Address 0x0 outside valid range");
            });
        });
    });
    describe('AVANTEK', function () {
        beforeEach(function () {
            lighting5 = new rfxcom.Lighting5(device, rfxcom.lighting5.AVANTEK);
        });
        describe('commands', function () {
            describe('switchOn()', function () {
                it('should send the correct bytes to the serialport', function (done) {
                    let sentCommandId = NaN;
                    lighting5.switchOn('0x12345/A', function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x0A, 0x14, 0x0E, 0x00, 0x01, 0x23, 0x45, 0x41, 0x01, 0x1F, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
                it('should handle a group address', function (done) {
                    let sentCommandId = NaN;
                    lighting5.switchOn('0x12345/0', function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x0A, 0x14, 0x0E, 0x00, 0x01, 0x23, 0x45, 0x00, 0x03, 0x1F, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
            });
            describe('switchOff()', function () {
                it('should send the correct bytes to the serialport', function (done) {
                    let sentCommandId = NaN;
                    lighting5.switchOff('0x12345/A', function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x0A, 0x14, 0x0E, 0x00, 0x01, 0x23, 0x45, 0x41, 0x00, 0x00, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
                it('should handle a group address', function (done) {
                    let sentCommandId = NaN;
                    lighting5.switchOff('0x12345/0', function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x0A, 0x14, 0x0E, 0x00, 0x01, 0x23, 0x45, 0x00, 0x02, 0x00, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
            });
            describe('toggleOnOff()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.toggleOnOff('0x12345/1');
                    }).toThrow("Device does not support toggleOnOff()");
                });
            });
            describe('setLevel()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.setLevel('0x12345/1');
                    }).toThrow("Device does not support setLevel()");
                });
            });
            describe('increaseLevel()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.increaseLevel('0x12345/1');
                    }).toThrow("Device does not support increaseLevel()");
                });
            });
            describe('decreaseLevel()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.decreaseLevel('0x12345/1');
                    }).toThrow("Device does not support decreaseLevel()");
                });
            });
            describe('setMood()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.setMood('0x12345/1');
                    }).toThrow("Device does not support setMood()");
                });
            });
            describe('program()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.program('0x12345/1');
                    }).toThrow("Device does not support program()");
                });
            });
            describe('relayOpen()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.relayOpen('0x12345/1');
                    }).toThrow("Device does not support relayOpen()");
                });
            });
            describe('relayClose()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.relayClose('0x12345/1');
                    }).toThrow("Device does not support relayClose()");
                });
            });
            describe('relayStop()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.relayStop('0x12345/1');
                    }).toThrow("Device does not support relayStop()");
                });
            });
            describe('increaseColour()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.increaseColour('0x12345/1');
                    }).toThrow("Device does not support increaseColour()");
                });
            });
            describe('decreaseColour()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.decreaseColour('0x12345/1');
                    }).toThrow("Device does not support decreaseColour()");
                });
            });
            describe('setColour()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.setColour('0x12345/1');
                    }).toThrow("Device does not support setColour()");
                });
            });
            describe('setScene()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.setScene('0x12345/1', 1, 1);
                    }).toThrow("Device does not support setScene()");
                });
            });
            describe('lock()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.lock('0x12345/1');
                    }).toThrow("Device does not support lock()");
                });
            });
            describe('unlock()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.lock('0x12345/1');
                    }).toThrow("Device does not support lock()");
                });
            });
        });
        describe('address checking', function () {
            it('should throw an exception with an invalid deviceId format', function () {
                expect(function () {
                    lighting5.switchOn('0x3FFF');
                }).toThrow("Invalid deviceId format");
            });
            it('should accept the highest address and unit code values', function (done) {
                let sentCommandId = NaN;
                lighting5.switchOn('0xFFFFF/E', function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0A, 0x14, 0x0E, 0x00, 0x0f, 0xff, 0xff, 0x45, 0x01, 0x1F, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should accept the highest address and unit code values', function (done) {
                let sentCommandId = NaN;
                lighting5.switchOn('0xFFFFF/e', function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0A, 0x14, 0x0E, 0x00, 0x0f, 0xff, 0xff, 0x45, 0x01, 0x1F, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should accept the lowest address and unit code values', function (done) {
                let sentCommandId = NaN;
                lighting5.switchOn('0x00001/A', function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0A, 0x14, 0x0E, 0x00, 0x00, 0x00, 0x01, 0x41, 0x01, 0x1F, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should accept the lowest address and unit code values', function (done) {
                let sentCommandId = NaN;
                lighting5.switchOn('0x00001/a', function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0A, 0x14, 0x0E, 0x00, 0x00, 0x00, 0x01, 0x41, 0x01, 0x1F, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should throw an exception with an invalid unit number F', function () {
                expect(function () {
                    lighting5.switchOn('0x7FFF/F');
                }).toThrow("Invalid unit code F");
            });
            it('should throw an exception with an invalid unit number @', function () {
                expect(function () {
                    lighting5.switchOn('0x7FFF/@');
                }).toThrow("Invalid unit code @");
            });
            it('should throw an exception with an invalid unit number 1', function () {
                expect(function () {
                    lighting5.switchOn('0x7FFF/1');
                }).toThrow("Invalid unit code 1");
            });
            it('should throw an exception with an invalid address 0x100000', function () {
                expect(function () {
                    lighting5.switchOn('0x100000/a');
                }).toThrow("Address 0x100000 outside valid range");
            });
            it('should throw an exception with an invalid address 0x0', function () {
                expect(function () {
                    lighting5.switchOn('0x0/a');
                }).toThrow("Address 0x0 outside valid range");
            });
        });
    });
    describe('IT', function () {
        beforeEach(function () {
            lighting5 = new rfxcom.Lighting5(device, rfxcom.lighting5.IT);
        });
        describe('commands', function () {
            describe('switchOn()', function () {
                it('should send the correct bytes to the serialport', function (done) {
                    let sentCommandId = NaN;
                    lighting5.switchOn('0x1234/1', function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x0A, 0x14, 0x0F, 0x00, 0x00, 0x12, 0x34, 0x01, 0x01, 0x1F, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
                it('should handle a group address', function (done) {
                    let sentCommandId = NaN;
                    lighting5.switchOn('0x1234/0', function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x0A, 0x14, 0x0F, 0x00, 0x00, 0x12, 0x34, 0x00, 0x03, 0x1F, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
            });
            describe('switchOff()', function () {
                it('should send the correct bytes to the serialport', function (done) {
                    let sentCommandId = NaN;
                    lighting5.switchOff('0x1234/1', function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x0A, 0x14, 0x0F, 0x00, 0x00, 0x12, 0x34, 0x01, 0x00, 0x00, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
                it('should handle a group address', function (done) {
                    let sentCommandId = NaN;
                    lighting5.switchOff('0x1234/0', function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x0A, 0x14, 0x0F, 0x00, 0x00, 0x12, 0x34, 0x00, 0x02, 0x00, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
            });
            describe('toggleOnOff()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.toggleOnOff('0x1234/1');
                    }).toThrow("Device does not support toggleOnOff()");
                });
            });
            describe('setLevel()', function () {
                it('should send the correct bytes to the serial port', function (done) {
                    lighting5.setLevel('0x1234/1', 0x08, function () {
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x0A, 0x14, 0x0F, 0x00, 0x00, 0x12, 0x34, 0x01, 0x10, 0x08, 0x00]);
                });
                it('should throw an exception with an invalid level 9', function () {
                    expect(function () {
                        lighting5.setLevel('0x1234/1', 9);
                    }).toThrow("Invalid level: value must be in range 1-8");
                });
                it('should throw an exception with an invalid level -1', function () {
                    expect(function () {
                        lighting5.setLevel('0x1234/1', -1);
                    }).toThrow("Invalid level: value must be in range 1-8");
                });
                it('should throw an exception with a group address', function () {
                    expect(function () {
                        lighting5.setLevel('0x1234/0', 1);
                    }).toThrow("Group command must be On, Off, or Lock");
                });
            });
            describe('increaseLevel()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.increaseLevel('0x1234/1');
                    }).toThrow("Device does not support increaseLevel()");
                });
            });
            describe('decreaseLevel()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.decreaseLevel('0x1234/1');
                    }).toThrow("Device does not support decreaseLevel()");
                });
            });
            describe('setMood()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.setMood('0x1234/1');
                    }).toThrow("Device does not support setMood()");
                });
            });
            describe('program()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.program('0x1234/1');
                    }).toThrow("Device does not support program()");
                });
            });
            describe('relayOpen()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.relayOpen('0x1234/1');
                    }).toThrow("Device does not support relayOpen()");
                });
            });
            describe('relayClose()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.relayClose('0x1234/1');
                    }).toThrow("Device does not support relayClose()");
                });
            });
            describe('relayStop()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.relayStop('0x1234/1');
                    }).toThrow("Device does not support relayStop()");
                });
            });
            describe('increaseColour()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.increaseColour('0x1234/1');
                    }).toThrow("Device does not support increaseColour()");
                });
            });
            describe('decreaseColour()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.decreaseColour('0x1234/1');
                    }).toThrow("Device does not support decreaseColour()");
                });
            });
            describe('setColour()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.setColour('0x1234/1');
                    }).toThrow("Device does not support setColour()");
                });
            });
            describe('setScene()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.setScene('0x1234/1', 1, 1);
                    }).toThrow("Device does not support setScene()");
                });
            });
            describe('lock()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.lock('0x1234/1');
                    }).toThrow("Device does not support lock()");
                });
            });
            describe('unlock()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.lock('0x1234/1');
                    }).toThrow("Device does not support lock()");
                });
            });
        });
        describe('address checking', function () {
            it('should throw an exception with an invalid deviceId format', function () {
                expect(function () {
                    lighting5.switchOn('0x3FFF');
                }).toThrow("Invalid deviceId format");
            });
            it('should accept the highest address and unit code values', function (done) {
                let sentCommandId = NaN;
                lighting5.switchOn('0xFFFF/4', function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0A, 0x14, 0x0F, 0x00, 0x00, 0xff, 0xff, 0x04, 0x01, 0x1F, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should accept the lowest address and unit code values', function (done) {
                let sentCommandId = NaN;
                lighting5.switchOn('0x00001/1', function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0A, 0x14, 0x0F, 0x00, 0x00, 0x00, 0x01, 0x01, 0x01, 0x1F, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should throw an exception with an invalid unit number 5', function () {
                expect(function () {
                    lighting5.switchOn('0x7FFF/5');
                }).toThrow("Invalid unit code 5");
            });
            it('should throw an exception with an invalid unit number -1', function () {
                expect(function () {
                    lighting5.switchOn('0x7FFF/-1');
                }).toThrow("Invalid unit code -1");
            });
            it('should throw an exception with an invalid address 0x80000', function () {
                expect(function () {
                    lighting5.switchOn('0x10000/4');
                }).toThrow("Address 0x10000 outside valid range");
            });
            it('should throw an exception with an invalid address 0x0', function () {
                expect(function () {
                    lighting5.switchOn('0x0/4');
                }).toThrow("Address 0x0 outside valid range");
            });
        });
    });
    describe('MDREMOTE_108', function () {
        beforeEach(function () {
            lighting5 = new rfxcom.Lighting5(device, rfxcom.lighting5.MDREMOTE_108);
        });
        describe('commands', function () {
            describe('switchOn()', function () {
                it('should send the correct bytes to the serialport', function (done) {
                    let sentCommandId = NaN;
                    lighting5.switchOn('0x1234', function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x0A, 0x14, 0x10, 0x00, 0x00, 0x12, 0x34, 0x01, 0x01, 0x1F, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
                it('should throw an exception with a group address', function () {
                    expect(function () {
                        lighting5.switchOn('0x1234/0');
                    }).toThrow("Subtype doesn't support group commands");
                });
            });
            describe('switchOff()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.switchOff('0x1234');
                    }).toThrow("Device does not support switchOff()");
                });
            });
            describe('toggleOnOff()', function () {
                it('should send the correct bytes to the serialport', function (done) {
                    let sentCommandId = NaN;
                    lighting5.toggleOnOff('0x1234', function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x0A, 0x14, 0x10, 0x00, 0x00, 0x12, 0x34, 0x01, 0x00, 0x1F, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
                it('should throw an exception with a group address', function () {
                    expect(function () {
                        lighting5.toggleOnOff('0x1234/0');
                    }).toThrow("Subtype doesn't support group commands");
                });
            });
            describe('setLevel()', function () {
                it('should set the lowest level 1', function (done) {
                    let sentCommandId = NaN;
                    lighting5.setLevel('0x1234', 1, function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x0A, 0x14, 0x10, 0x00, 0x00, 0x12, 0x34, 0x01, 0x06, 0x01, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
                it('should set the highest level 3', function (done) {
                    let sentCommandId = NaN;
                    lighting5.setLevel('0x1234', 3, function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x0A, 0x14, 0x10, 0x00, 0x00, 0x12, 0x34, 0x01, 0x04, 0x03, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
                it('should throw an exception with invalid level 0', function () {
                    expect(function () {
                        lighting5.setLevel('0x1234', 0);
                    }).toThrow("Invalid level: value must be in range 1-3");
                });
                it('should throw an exception with invalid level 4', function () {
                    expect(function () {
                        lighting5.setLevel('0x1234', 4);
                    }).toThrow("Invalid level: value must be in range 1-3");
                });
                it('should throw an exception with a group address', function () {
                    expect(function () {
                        lighting5.setLevel('0x1234/0', 2);
                    }).toThrow("Subtype doesn't support group commands");
                });
            });
            describe('increaseLevel()', function () {
                it('should send the correct bytes to the serialport', function (done) {
                    let sentCommandId = NaN;
                    lighting5.increaseLevel('0x1234', function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x0A, 0x14, 0x10, 0x00, 0x00, 0x12, 0x34, 0x01, 0x02, 0x00, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
                it('should throw an exception with a group address', function () {
                    expect(function () {
                        lighting5.increaseLevel('0x1234/0');
                    }).toThrow("Subtype doesn't support group commands");
                });
            });
            describe('decreaseLevel()', function () {
                it('should send the correct bytes to the serialport', function (done) {
                    let sentCommandId = NaN;
                    lighting5.decreaseLevel('0x1234', function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x0A, 0x14, 0x10, 0x00, 0x00, 0x12, 0x34, 0x01, 0x03, 0x00, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
                it('should throw an exception with a group address', function () {
                    expect(function () {
                        lighting5.decreaseLevel('0x1234/0');
                    }).toThrow("Subtype doesn't support group commands");
                });
            });
            describe('setMood()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.setMood('0x1234');
                    }).toThrow("Device does not support setMood()");
                });
            });
            describe('program()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.program('0x1234');
                    }).toThrow("Device does not support program()");
                });
            });
            describe('relayOpen()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.relayOpen('0x1234');
                    }).toThrow("Device does not support relayOpen()");
                });
            });
            describe('relayClose()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.relayClose('0x1234');
                    }).toThrow("Device does not support relayClose()");
                });
            });
            describe('relayStop()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.relayStop('0x1234');
                    }).toThrow("Device does not support relayStop()");
                });
            });
            describe('increaseColour()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.increaseColour('0x1234');
                    }).toThrow("Device does not support increaseColour()");
                });
            });
            describe('decreaseColour()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.decreaseColour('0x1234');
                    }).toThrow("Device does not support decreaseColour()");
                });
            });
            describe('setColour()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.setColour('0x1234');
                    }).toThrow("Device does not support setColour()");
                });
            });
            describe('setScene()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.setScene('0x1234', 1, 1);
                    }).toThrow("Device does not support setScene()");
                });
            });
            describe('lock()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.lock('0x1234');
                    }).toThrow("Device does not support lock()");
                });
            });
            describe('unlock()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.lock('0x1234');
                    }).toThrow("Device does not support lock()");
                });
            });
        });
        describe('address checking', function () {
            it('should throw an exception with an invalid deviceId format', function () {
                expect(function () {
                    lighting5.switchOn('0x3FFF/1/9');
                }).toThrow("Invalid deviceId format");
            });
            it('should accept the highest address', function (done) {
                let sentCommandId = NaN;
                lighting5.switchOn('0xFFFF', function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0A, 0x14, 0x10, 0x00, 0x00, 0xff, 0xff, 0x01, 0x01, 0x1F, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should accept the lowest address', function (done) {
                let sentCommandId = NaN;
                lighting5.switchOn('0x1', function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0A, 0x14, 0x10, 0x00, 0x00, 0x00, 0x01, 0x01, 0x01, 0x1F, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should ignore an invalid unit number 5', function (done) {
                let sentCommandId = NaN;
                lighting5.switchOn('0xFFFF/5', function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0A, 0x14, 0x10, 0x00, 0x00, 0xff, 0xff, 0x05, 0x01, 0x1F, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should throw an exception with an invalid address 0x10000', function () {
                expect(function () {
                    lighting5.switchOn('0x10000');
                }).toThrow("Address 0x10000 outside valid range");
            });
            it('should throw an exception with an invalid address 0x0000', function () {
                expect(function () {
                    lighting5.switchOn('0x000000/4');
                }).toThrow("Address 0x0 outside valid range");
            });
        });
    });
    describe('KANGTAI', function () {
        beforeEach(function () {
            lighting5 = new rfxcom.Lighting5(device, rfxcom.lighting5.KANGTAI);
        });
        describe('commands', function () {
            describe('switchOn()', function () {
                it('should send the correct bytes to the serialport', function (done) {
                    let sentCommandId = NaN;
                    lighting5.switchOn('0x1234/1', function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x0A, 0x14, 0x11, 0x00, 0x00, 0x12, 0x34, 0x01, 0x01, 0x1F, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
                it('should handle a group address', function (done) {
                    let sentCommandId = NaN;
                    lighting5.switchOn('0x1234/0', function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x0A, 0x14, 0x11, 0x00, 0x00, 0x12, 0x34, 0x00, 0x03, 0x1F, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
            });
            describe('switchOff()', function () {
                it('should send the correct bytes to the serialport', function (done) {
                    let sentCommandId = NaN;
                    lighting5.switchOff('0x1234/1', function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x0A, 0x14, 0x11, 0x00, 0x00, 0x12, 0x34, 0x01, 0x00, 0x00, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
                it('should handle a group address', function (done) {
                    let sentCommandId = NaN;
                    lighting5.switchOff('0x1234/0', function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x0A, 0x14, 0x11, 0x00, 0x00, 0x12, 0x34, 0x00, 0x02, 0x00, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
            });
            describe('toggleOnOff()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.toggleOnOff('0x1234/1');
                    }).toThrow("Device does not support toggleOnOff()");
                });
            });
            describe('setLevel()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.setLevel('0x1234/1');
                    }).toThrow("Device does not support setLevel()");
                });
            });
            describe('increaseLevel()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.increaseLevel('0x1234/1');
                    }).toThrow("Device does not support increaseLevel()");
                });
            });
            describe('decreaseLevel()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.decreaseLevel('0x1234/1');
                    }).toThrow("Device does not support decreaseLevel()");
                });
            });
            describe('setMood()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.setMood('0x1234/1');
                    }).toThrow("Device does not support setMood()");
                });
            });
            describe('program()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.program('0x1234/1');
                    }).toThrow("Device does not support program()");
                });
            });
            describe('relayOpen()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.relayOpen('0x1234/1');
                    }).toThrow("Device does not support relayOpen()");
                });
            });
            describe('relayClose()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.relayClose('0x1234/1');
                    }).toThrow("Device does not support relayClose()");
                });
            });
            describe('relayStop()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.relayStop('0x1234/1');
                    }).toThrow("Device does not support relayStop()");
                });
            });
            describe('increaseColour()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.increaseColour('0x1234/1');
                    }).toThrow("Device does not support increaseColour()");
                });
            });
            describe('decreaseColour()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.decreaseColour('0x1234/1');
                    }).toThrow("Device does not support decreaseColour()");
                });
            });
            describe('setColour()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.setColour('0x1234/1');
                    }).toThrow("Device does not support setColour()");
                });
            });
            describe('setScene()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.setScene('0x1234/1', 1, 1);
                    }).toThrow("Device does not support setScene()");
                });
            });
            describe('lock()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.lock('0x1234/1');
                    }).toThrow("Device does not support lock()");
                });
            });
            describe('unlock()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        lighting5.lock('0x1234/1');
                    }).toThrow("Device does not support lock()");
                });
            });
        });
        describe('address checking', function () {
            it('should throw an exception with an invalid deviceId format', function () {
                expect(function () {
                    lighting5.switchOn('0x3FFF');
                }).toThrow("Invalid deviceId format");
            });
            it('should accept the highest address and unit code values', function (done) {
                let sentCommandId = NaN;
                lighting5.switchOn('0xFFFF/30', function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0A, 0x14, 0x11, 0x00, 0x00, 0xff, 0xff, 0x1E, 0x01, 0x1F, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should accept the lowest address and unit code values', function (done) {
                let sentCommandId = NaN;
                lighting5.switchOn('0x00001/1', function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0A, 0x14, 0x11, 0x00, 0x00, 0x00, 0x01, 0x01, 0x01, 0x1F, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should throw an exception with an invalid unit number 31', function () {
                expect(function () {
                    lighting5.switchOn('0x7FFF/31');
                }).toThrow("Invalid unit code 31");
            });
            it('should throw an exception with an invalid unit number -1', function () {
                expect(function () {
                    lighting5.switchOn('0x7FFF/-1');
                }).toThrow("Invalid unit code -1");
            });
            it('should throw an exception with an invalid address 0x80000', function () {
                expect(function () {
                    lighting5.switchOn('0x10000/4');
                }).toThrow("Address 0x10000 outside valid range");
            });
            it('should throw an exception with an invalid address 0x0', function () {
                expect(function () {
                    lighting5.switchOn('0x0/4');
                }).toThrow("Address 0x0 outside valid range");
            });
        });
    });
});

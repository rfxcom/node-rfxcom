/**
 * Created by max on 12/07/2017.
 */
const rfxcom = require('../lib'),
    matchers = require('./matchers'),
    FakeSerialPort = require('./helper');

describe('Thermostat3 class', function () {
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
    describe('G6R_H4T1', function () {
        beforeEach(function () {
            thermostat = new rfxcom.Thermostat3(device, rfxcom.thermostat3.G6R_H4T1);
        });
        describe('commands:', function () {
            describe('switchOn()', function () {
                it('should send the correct bytes to the serialport', function (done) {
                    let sentCommandId = NaN;
                    thermostat.switchOn('0x12', function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x08, 0x42, 0x00, 0x00, 0x00, 0x00, 0x12, 0x01, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
            });
            describe('switchOff()', function () {
                it('should send the correct bytes to the serialport', function (done) {
                    let sentCommandId = NaN;
                    thermostat.switchOff('0x12', function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x08, 0x42, 0x00, 0x00, 0x00, 0x00, 0x12, 0x00, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
            });
            describe('switchOn2()', function () {
                it('should throw an unsupported command error', function () {
                    expect(function () {
                        thermostat.switchOn2('0x12');
                    }).toThrow(new Error(("Device does not support switchOn2()")));
                });
            });
            describe('switchOff2()', function () {
                it('should throw an unsupported command error', function () {
                    expect(function () {
                        thermostat.switchOff2('0x12');
                    }).toThrow(new Error(("Device does not support switchOff2()")));
                });
            });
            describe('up()', function () {
                it('should send the correct bytes to the serialport', function (done) {
                    let sentCommandId = NaN;
                    thermostat.up('0x12', function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x08, 0x42, 0x00, 0x00, 0x00, 0x00, 0x12, 0x02, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
            });
            describe('down()', function () {
                it('should send the correct bytes to the serialport', function (done) {
                    let sentCommandId = NaN;
                    thermostat.down('0x12', function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x08, 0x42, 0x00, 0x00, 0x00, 0x00, 0x12, 0x03, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
            });
            describe('runUp()', function () {
                it('should send the correct bytes to the serialport', function (done) {
                    let sentCommandId = NaN;
                    thermostat.runUp('0x12', function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x08, 0x42, 0x00, 0x00, 0x00, 0x00, 0x12, 0x04, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
            });
            describe('runDown()', function () {
                it('should send the correct bytes to the serialport', function (done) {
                    let sentCommandId = NaN;
                    thermostat.runDown('0x12', function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x08, 0x42, 0x00, 0x00, 0x00, 0x00, 0x12, 0x05, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
            });
            describe('stop()', function () {
                it('should send the correct bytes to the serialport', function (done) {
                    let sentCommandId = NaN;
                    thermostat.stop('0x12', function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x08, 0x42, 0x00, 0x00, 0x00, 0x00, 0x12, 0x06, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
            });
        });
        describe('address checking:', function () {
            it('should throw an exception with an invalid deviceId format', function () {
                expect(function () {
                    thermostat.switchOn('0x1234/A');
                }).toThrow(new Error(("Invalid deviceId format")));
            });
            it('should accept the highest address', function (done) {
                let sentCommandId = NaN;
                thermostat.switchOn('0xff', function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x08, 0x42, 0x00, 0x00, 0x00, 0x00, 0xff, 0x01, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should accept the lowest address', function (done) {
                let sentCommandId = NaN;
                thermostat.switchOn('0x0', function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x08, 0x42, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should throw an exception with an invalid address 0x100', function () {
                expect(function () {
                    thermostat.switchOn('0x100');
                }).toThrow(new Error(("Address 0x100 outside valid range")));
            });
        });
    });
    describe('G6R_H4TB', function () {
        beforeEach(function () {
            thermostat = new rfxcom.Thermostat3(device, rfxcom.thermostat3.G6R_H4TB);
        });
        describe('commands:', function () {
            describe('switchOn()', function () {
                it('should send the correct bytes to the serialport', function (done) {
                    let sentCommandId = NaN;
                    thermostat.switchOn('0x12345', function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x08, 0x42, 0x01, 0x00, 0x01, 0x23, 0x45, 0x01, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
            });
            describe('switchOff()', function () {
                it('should send the correct bytes to the serialport', function (done) {
                    let sentCommandId = NaN;
                    thermostat.switchOff('0x12345', function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x08, 0x42, 0x01, 0x00, 0x01, 0x23, 0x45, 0x00, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
            });
            describe('switchOn2()', function () {
                it('should send the correct bytes to the serialport', function (done) {
                    let sentCommandId = NaN;
                    thermostat.switchOn2('0x12345', function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x08, 0x42, 0x01, 0x00, 0x01, 0x23, 0x45, 0x05, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
            });
            describe('switchOff2()', function () {
                it('should send the correct bytes to the serialport', function (done) {
                    let sentCommandId = NaN;
                    thermostat.switchOff2('0x12345', function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x08, 0x42, 0x01, 0x00, 0x01, 0x23, 0x45, 0x04, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
            });
            describe('up()', function () {
                it('should send the correct bytes to the serialport', function (done) {
                    let sentCommandId = NaN;
                    thermostat.up('0x12345', function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x08, 0x42, 0x01, 0x00, 0x01, 0x23, 0x45, 0x02, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
            });
            describe('down()', function () {
                it('should send the correct bytes to the serialport', function (done) {
                    let sentCommandId = NaN;
                    thermostat.down('0x12345', function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x08, 0x42, 0x01, 0x00, 0x01, 0x23, 0x45, 0x03, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
            });
            describe('runUp()', function () {
                it('should throw an unsupported command error', function () {
                    expect(function () {
                        thermostat.runUp('0x12345');
                    }).toThrow(new Error(("Device does not support runUp()")));
                });
            });
            describe('runDown()', function () {
                it('should throw an unsupported command error', function () {
                    expect(function () {
                        thermostat.runDown('0x12345');
                    }).toThrow(new Error(("Device does not support runDown()")));
                });
            });
            describe('stop()', function () {
                it('should throw an unsupported command error', function () {
                    expect(function () {
                        thermostat.stop('0x12345');
                    }).toThrow(new Error(("Device does not support stop()")));
                });
            });
        });
        describe('address checking:', function () {
            it('should throw an exception with an invalid deviceId format', function () {
                expect(function () {
                    thermostat.switchOn('0x1234/A');
                }).toThrow(new Error(("Invalid deviceId format")));
            });
            it('should accept the highest address', function (done) {
                let sentCommandId = NaN;
                thermostat.switchOn('0x3ffff', function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x08, 0x42, 0x01, 0x00, 0x03, 0xff, 0xff, 0x01, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should accept the lowest address', function (done) {
                let sentCommandId = NaN;
                thermostat.switchOn('0x0', function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x08, 0x42, 0x01, 0x00, 0x00, 0x00, 0x00, 0x01, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should throw an exception with an invalid address 0x40000', function () {
                expect(function () {
                    thermostat.switchOn('0x40000');
                }).toThrow(new Error(("Address 0x40000 outside valid range")));
            });
        });
    });
    describe('G6R_H4TD', function () {
        beforeEach(function () {
            thermostat = new rfxcom.Thermostat3(device, rfxcom.thermostat3.G6R_H4TD);
        });
        describe('commands:', function () {
            describe('switchOn()', function () {
                it('should send the correct bytes to the serialport', function (done) {
                    let sentCommandId = NaN;
                    thermostat.switchOn('0x1234', function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x08, 0x42, 0x02, 0x00, 0x00, 0x12, 0x34, 0x01, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
            });
            describe('switchOff()', function () {
                it('should send the correct bytes to the serialport', function (done) {
                    let sentCommandId = NaN;
                    thermostat.switchOff('0x1234', function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x08, 0x42, 0x02, 0x00, 0x00, 0x12, 0x34, 0x00, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
            });
            describe('switchOn2()', function () {
                it('should throw an unsupported command error', function () {
                    expect(function () {
                        thermostat.switchOn2('0x1234');
                    }).toThrow(new Error(("Device does not support switchOn2()")));
                });
            });
            describe('switchOff2()', function () {
                it('should throw an unsupported command error', function () {
                    expect(function () {
                        thermostat.switchOff2('0x1234');
                    }).toThrow(new Error(("Device does not support switchOff2()")));
                });
            });
            describe('up()', function () {
                it('should send the correct bytes to the serialport', function (done) {
                    let sentCommandId = NaN;
                    thermostat.up('0x1234', function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x08, 0x42, 0x02, 0x00, 0x00, 0x12, 0x34, 0x02, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
            });
            describe('down()', function () {
                it('should send the correct bytes to the serialport', function (done) {
                    let sentCommandId = NaN;
                    thermostat.down('0x1234', function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x08, 0x42, 0x02, 0x00, 0x00, 0x12, 0x34, 0x03, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
            });
            describe('runUp()', function () {
                it('should send the correct bytes to the serialport', function (done) {
                    let sentCommandId = NaN;
                    thermostat.runUp('0x1234', function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x08, 0x42, 0x02, 0x00, 0x00, 0x12, 0x34, 0x04, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
            });
            describe('runDown()', function () {
                it('should send the correct bytes to the serialport', function (done) {
                    let sentCommandId = NaN;
                    thermostat.runDown('0x1234', function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x08, 0x42, 0x02, 0x00, 0x00, 0x12, 0x34, 0x05, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
            });
            describe('stop()', function () {
                it('should throw an unsupported command error', function () {
                    expect(function () {
                        thermostat.stop('0x1234');
                    }).toThrow(new Error(("Device does not support stop()")));
                });
            });
        });
        describe('address checking:', function () {
            it('should throw an exception with an invalid deviceId format', function () {
                expect(function () {
                    thermostat.switchOn('0x1234/A');
                }).toThrow(new Error(("Invalid deviceId format")));
            });
            it('should accept the highest address', function (done) {
                let sentCommandId = NaN;
                thermostat.switchOn('0xffff', function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x08, 0x42, 0x02, 0x00, 0x00, 0xff, 0xff, 0x01, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should accept the lowest address', function (done) {
                let sentCommandId = NaN;
                thermostat.switchOn('0x0', function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x08, 0x42, 0x02, 0x00, 0x00, 0x00, 0x00, 0x01, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should throw an exception with an invalid address 0x10000', function () {
                expect(function () {
                    thermostat.switchOn('0x10000');
                }).toThrow(new Error(("Address 0x10000 outside valid range")));
            });
        });
    });
    describe('G6R_H4S', function () {
        beforeEach(function () {
            thermostat = new rfxcom.Thermostat3(device, rfxcom.thermostat3.G6R_H4S);
        });
        describe('commands:', function () {
            describe('switchOn()', function () {
                it('should send the correct bytes to the serialport', function (done) {
                    let sentCommandId = NaN;
                    thermostat.switchOn('0x12345', function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x08, 0x42, 0x03, 0x00, 0x01, 0x23, 0x45, 0x01, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
            });
            describe('switchOff()', function () {
                it('should send the correct bytes to the serialport', function (done) {
                    let sentCommandId = NaN;
                    thermostat.switchOff('0x12345', function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x08, 0x42, 0x03, 0x00, 0x01, 0x23, 0x45, 0x00, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
            });
            describe('switchOn2()', function () {
                it('should throw an unsupported command error', function () {
                    expect(function () {
                        thermostat.switchOn2('0x12345');
                    }).toThrow(new Error(("Device does not support switchOn2()")));
                });
            });
            describe('switchOff2()', function () {
                it('should throw an unsupported command error', function () {
                    expect(function () {
                        thermostat.switchOff2('0x12345');
                    }).toThrow(new Error(("Device does not support switchOff2()")));
                });
            });
            describe('up()', function () {
                it('should send the correct bytes to the serialport', function (done) {
                    let sentCommandId = NaN;
                    thermostat.up('0x12345', function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x08, 0x42, 0x03, 0x00, 0x01, 0x23, 0x45, 0x02, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
            });
            describe('down()', function () {
                it('should send the correct bytes to the serialport', function (done) {
                    let sentCommandId = NaN;
                    thermostat.down('0x12345', function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x08, 0x42, 0x03, 0x00, 0x01, 0x23, 0x45, 0x03, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
            });
            describe('runUp()', function () {
                it('should throw an unsupported command error', function () {
                    expect(function () {
                        thermostat.runUp('0x12345');
                    }).toThrow(new Error(("Device does not support runUp()")));
                });
            });
            describe('runDown()', function () {
                it('should throw an unsupported command error', function () {
                    expect(function () {
                        thermostat.runDown('0x12345');
                    }).toThrow(new Error(("Device does not support runDown()")));
                });
            });
            describe('stop()', function () {
                it('should throw an unsupported command error', function () {
                    expect(function () {
                        thermostat.stop('0x12345');
                    }).toThrow(new Error(("Device does not support stop()")));
                });
            });
        });
        describe('address checking:', function () {
            it('should throw an exception with an invalid deviceId format', function () {
                expect(function () {
                    thermostat.switchOn('0x1234/A');
                }).toThrow(new Error(("Invalid deviceId format")));
            });
            it('should accept the highest address', function (done) {
                let sentCommandId = NaN;
                thermostat.switchOn('0x3ffff', function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x08, 0x42, 0x03, 0x00, 0x03, 0xff, 0xff, 0x01, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should accept the lowest address', function (done) {
                let sentCommandId = NaN;
                thermostat.switchOn('0x0', function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x08, 0x42, 0x03, 0x00, 0x00, 0x00, 0x00, 0x01, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should throw an exception with an invalid address 0x10000', function () {
                expect(function () {
                    thermostat.switchOn('0x40000');
                }).toThrow(new Error(("Address 0x40000 outside valid range")));
            });
        });
    });
    describe('G6R_H3T1', function () {
        beforeEach(function () {
            thermostat = new rfxcom.Thermostat3(device, rfxcom.thermostat3.G6R_H3T1);
        });
        describe('commands:', function () {
            describe('switchOn()', function () {
                it('should send the correct bytes to the serialport', function (done) {
                    let sentCommandId = NaN;
                    thermostat.switchOn('0x12', function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x08, 0x42, 0x04, 0x00, 0x00, 0x00, 0x12, 0x01, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
            });
            describe('switchOff()', function () {
                it('should send the correct bytes to the serialport', function (done) {
                    let sentCommandId = NaN;
                    thermostat.switchOff('0x12', function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x08, 0x42, 0x04, 0x00, 0x00, 0x00, 0x12, 0x00, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
            });
            describe('switchOn2()', function () {
                it('should throw an unsupported command error', function () {
                    expect(function () {
                        thermostat.switchOn2('0x12');
                    }).toThrow(new Error(("Device does not support switchOn2()")));
                });
            });
            describe('switchOff2()', function () {
                it('should throw an unsupported command error', function () {
                    expect(function () {
                        thermostat.switchOff2('0x12');
                    }).toThrow(new Error(("Device does not support switchOff2()")));
                });
            });
            describe('up()', function () {
                it('should send the correct bytes to the serialport', function (done) {
                    let sentCommandId = NaN;
                    thermostat.up('0x12', function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x08, 0x42, 0x04, 0x00, 0x00, 0x00, 0x12, 0x02, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
            });
            describe('down()', function () {
                it('should send the correct bytes to the serialport', function (done) {
                    let sentCommandId = NaN;
                    thermostat.down('0x12', function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x08, 0x42, 0x04, 0x00, 0x00, 0x00, 0x12, 0x03, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
            });
            describe('runUp()', function () {
                it('should send the correct bytes to the serialport', function (done) {
                    let sentCommandId = NaN;
                    thermostat.runUp('0x12', function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x08, 0x42, 0x04, 0x00, 0x00, 0x00, 0x12, 0x04, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
            });
            describe('runDown()', function () {
                it('should send the correct bytes to the serialport', function (done) {
                    let sentCommandId = NaN;
                    thermostat.runDown('0x12', function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x08, 0x42, 0x04, 0x00, 0x00, 0x00, 0x12, 0x05, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
            });
            describe('stop()', function () {
                it('should send the correct bytes to the serialport', function (done) {
                    let sentCommandId = NaN;
                    thermostat.stop('0x12', function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x08, 0x42, 0x04, 0x00, 0x00, 0x00, 0x12, 0x06, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
            });
        });
        describe('address checking:', function () {
            it('should throw an exception with an invalid deviceId format', function () {
                expect(function () {
                    thermostat.switchOn('0x1234/A');
                }).toThrow(new Error(("Invalid deviceId format")));
            });
            it('should accept the highest address', function (done) {
                let sentCommandId = NaN;
                thermostat.switchOn('0xff', function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x08, 0x42, 0x04, 0x00, 0x00, 0x00, 0xff, 0x01, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should accept the lowest address', function (done) {
                let sentCommandId = NaN;
                thermostat.switchOn('0x0', function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x08, 0x42, 0x04, 0x00, 0x00, 0x00, 0x00, 0x01, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should throw an exception with an invalid address 0x100', function () {
                expect(function () {
                    thermostat.switchOn('0x100');
                }).toThrow(new Error(("Address 0x100 outside valid range")));
            });
        });
    });
});

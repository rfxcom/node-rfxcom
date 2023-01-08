/**
 * Created by max on 11/07/2017.
 */

const rfxcom = require('../lib'),
    matchers = require('./matchers'),
    FakeSerialPort = require('./helper');

describe('Fan class', function () {
    let fan = {},
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
    describe('SIEMENS_SF01', function () {
        beforeEach(function () {
            fan = new rfxcom.Fan(device, rfxcom.fan.SIEMENS_SF01);
        });
        describe('commands:', function () {
            describe('buttonPress', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        fan.buttonPress('0x1234', 'T2');
                    }).toThrow("Device does not support buttonPress()");
                });

            });
            describe('setSpeed', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        fan.setSpeed('0x1234');
                    }).toThrow("Device does not support setSpeed()");
                });
            });
            describe('decreaseSpeed()', function () {
                it('should send the correct bytes to the serialport', function (done) {
                    let sentCommandId = NaN;
                    fan.decreaseSpeed('0x1234', function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x08, 0x17, 0x00, 0x00, 0x00, 0x12, 0x34, 0x02, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
            });
            describe('increaseSpeed()', function () {
                it('should send the correct bytes to the serialport', function (done) {
                    let sentCommandId = NaN;
                    fan.increaseSpeed('0x1234', function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x08, 0x17, 0x00, 0x00, 0x00, 0x12, 0x34, 0x04, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
            });
            describe('switchOff', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        fan.switchOff('0x1234');
                    }).toThrow("Device does not support switchOff()");
                });
            });
            describe('startTimer()', function () {
                it('should send the correct bytes to the serialport', function (done) {
                    let sentCommandId = NaN;
                    fan.startTimer('0x1234', function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x08, 0x17, 0x00, 0x00, 0x00, 0x12, 0x34, 0x01, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
            });
            describe('toggleOnOff()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        fan.toggleOnOff('0x1234');
                    }).toThrow("Device does not support toggleOnOff()");
                });
            });
            describe('toggleFanDirection()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        fan.toggleFanDirection('0x1234');
                    }).toThrow("Device does not support toggleFanDirection()");
                });
            });
            describe('setFanDirection()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        fan.setFanDirection('0x1234', 'forward');
                    }).toThrow("Device does not support setFanDirection()");
                });
            });
            describe('toggleLightOnOff()', function () {
                it('should send the correct bytes to the serialport', function (done) {
                    let sentCommandId = NaN;
                    fan.toggleLightOnOff('0x1234', function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x08, 0x17, 0x00, 0x00, 0x00, 0x12, 0x34, 0x06, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
            });
            describe('switchLightOn()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        fan.switchLightOn('0x1234');
                    }).toThrow("Device does not support switchLightOn()");
                });
            });
            describe('switchLightOff()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        fan.switchLightOff('0x1234');
                    }).toThrow("Device does not support switchLightOff()");
                });
            });
            describe('program()', function () {
                it('should send the correct bytes to the serialport', function (done) {
                    let sentCommandId = NaN;
                    fan.program('0x1234', function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x08, 0x17, 0x00, 0x00, 0x00, 0x12, 0x34, 0x03, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
            });
            describe('confirm()', function () {
                it('should send the correct bytes to the serialport', function (done) {
                    let sentCommandId = NaN;
                    fan.confirm('0x1234', function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x08, 0x17, 0x00, 0x00, 0x00, 0x12, 0x34, 0x05, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
            });
            describe('eraseAll', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        fan.eraseAll('0x1234');
                    }).toThrow("Device does not support eraseAll()");
                });
            });
            describe('standby', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        fan.standby('0x1');
                    }).toThrow("Device does not support standby()");
                });
            });
            describe('resetFilter', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        fan.resetFilter('0x1');
                    }).toThrow("Device does not support resetFilter()");
                });
            });
        });
        describe('address checking:', function () {
            it('should throw an exception with an invalid deviceId format', function () {
                expect(function () {
                    fan.startTimer('0x1234/A');
                }).toThrow("Invalid deviceId format");
            });
            it('should accept the highest address value', function (done) {
                let sentCommandId = NaN;
                fan.startTimer('0xffff', function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x08, 0x17, 0x00, 0x00, 0x00, 0xff, 0xff, 0x01, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should accept the lowest address value', function (done) {
                let sentCommandId = NaN;
                fan.startTimer('0x1', function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x08, 0x17, 0x00, 0x00, 0x00, 0x00, 0x01, 0x01, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should throw an exception with an invalid address 0x10000', function () {
                expect(function () {
                    fan.startTimer('0x10000');
                }).toThrow("Address 0x10000 outside valid range");
            });
            it('should throw an exception with an invalid address 0x0', function () {
                expect(function () {
                    fan.startTimer('0x0');
                }).toThrow("Address 0x0 outside valid range");
            });
        });
    });
    describe('ITHO_CVE_RFT', function () {
        beforeEach(function () {
            fan = new rfxcom.Fan(device, rfxcom.fan.ITHO_CVE_RFT);
        });
        describe('commands:', function () {
            describe('buttonPress', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        fan.buttonPress('0x123456', 'T2');
                    }).toThrow("Device does not support buttonPress()");
                });
            });
            describe('setSpeed', function () {
                it('should throw an exception for speed 0', function () {
                    expect(function () {
                        fan.setSpeed('0x123456', 0);
                    }).toThrow("Invalid speed: value must be in range 1-3");
                });
                it('should send the correct bytes to the serialport for speed 1', function (done) {
                    let sentCommandId = NaN;
                    fan.setSpeed('0x123456', 1, function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x08, 0x17, 0x01, 0x00, 0x12, 0x34, 0x56, 0x01, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
                it('should send the correct bytes to the serialport for speed 2', function (done) {
                    let sentCommandId = NaN;
                    fan.setSpeed('0x123456', 2, function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x08, 0x17, 0x01, 0x00, 0x12, 0x34, 0x56, 0x02, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
                it('should send the correct bytes to the serialport for speed 3', function (done) {
                    let sentCommandId = NaN;
                    fan.setSpeed('0x123456', 3, function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x08, 0x17, 0x01, 0x00, 0x12, 0x34, 0x56, 0x03, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
                it('should throw an exception for speed >3', function () {
                    expect(function () {
                        fan.setSpeed('0x123456', 4);
                    }).toThrow("Invalid speed: value must be in range 1-3");
                });
            });
            describe('decreaseSpeed()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        fan.decreaseSpeed('0x123456');
                    }).toThrow("Device does not support decreaseSpeed()");
                });
            });
            describe('increaseSpeed()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        fan.increaseSpeed('0x123456');
                    }).toThrow("Device does not support increaseSpeed()");
                });
            });
            describe('switchOff', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        fan.switchOff('0x123456');
                    }).toThrow("Device does not support switchOff()");
                });
            });
            describe('startTimer()', function () {
                it('should send the correct bytes to the serialport', function (done) {
                    let sentCommandId = NaN;
                    fan.startTimer('0x123456', function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x08, 0x17, 0x01, 0x00, 0x12, 0x34, 0x56, 0x04, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
                it('should ignore the timeout parameter', function (done) {
                    let sentCommandId = NaN;
                    fan.startTimer('0x123456', 1, function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x08, 0x17, 0x01, 0x00, 0x12, 0x34, 0x56, 0x04, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
            });
            describe('toggleOnOff()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        fan.toggleOnOff('0x123456');
                    }).toThrow("Device does not support toggleOnOff()");
                });
            });
            describe('toggleFanDirection()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        fan.toggleFanDirection('0x123456');
                    }).toThrow("Device does not support toggleFanDirection()");
                });
            });
            describe('setFanDirection()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        fan.setFanDirection('0x123456', 'reverse');
                    }).toThrow("Device does not support setFanDirection()");
                });
            });
            describe('toggleLightOnOff()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        fan.toggleLightOnOff('0x123456');
                    }).toThrow("Device does not support toggleLightOnOff()");
                });
            });
            describe('switchLightOn()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        fan.switchLightOn('0x123456');
                    }).toThrow("Device does not support switchLightOn()");
                });
            });
            describe('switchLightOff()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        fan.switchLightOff('0x123456');
                    }).toThrow("Device does not support switchLightOff()");
                });
            });
            describe('program()', function () {
                it('should send the correct bytes to the serialport', function (done) {
                    let sentCommandId = NaN;
                    fan.program('0x123456', function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x08, 0x17, 0x01, 0x00, 0x12, 0x34, 0x56, 0x06, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
            });
            describe('confirm()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        fan.confirm('0x123456');
                    }).toThrow("Device does not support confirm()");
                });
            });
            describe('eraseAll', function () {
                it('should send the correct bytes to the serialport', function (done) {
                    let sentCommandId = NaN;
                    fan.eraseAll('0x123456', function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x08, 0x17, 0x01, 0x00, 0x12, 0x34, 0x56, 0x07, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
            });
            describe('standby', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        fan.standby('0x1');
                    }).toThrow("Device does not support standby()");
                });
            });
            describe('resetFilter', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        fan.resetFilter('0x1');
                    }).toThrow("Device does not support resetFilter()");
                });
            });
        });
        describe('address checking:', function () {
            it('should throw an exception with an invalid deviceId format', function () {
                expect(function () {
                    fan.startTimer('0x1234/A');
                }).toThrow("Invalid deviceId format");
            });
            it('should accept the highest address value', function (done) {
                let sentCommandId = NaN;
                fan.startTimer('0xffffff', function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x08, 0x17, 0x01, 0x00, 0xff, 0xff, 0xff, 0x04, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should accept the lowest address value', function (done) {
                let sentCommandId = NaN;
                fan.startTimer('0x1', function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x08, 0x17, 0x01, 0x00, 0x00, 0x00, 0x01, 0x04, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should throw an exception with an invalid address 0x1000000', function () {
                expect(function () {
                    fan.startTimer('0x1000000');
                }).toThrow("Address 0x1000000 outside valid range");
            });
            it('should throw an exception with an invalid address 0x0', function () {
                expect(function () {
                    fan.startTimer('0x0');
                }).toThrow("Address 0x0 outside valid range");
            });
        });
    });
    describe('LUCCI_AIR', function () {
        beforeEach(function () {
            fan = new rfxcom.Fan(device, rfxcom.fan.LUCCI_AIR);
        });
        describe('commands:', function () {
            describe('buttonPress', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        fan.buttonPress('0x1', 'T2');
                    }).toThrow("Device does not support buttonPress()");
                });
            });
            describe('setSpeed', function () {
                it('should throw an exception for speed <0', function () {
                    expect(function () {
                        fan.setSpeed('0x1', -1);
                    }).toThrow("Invalid speed: value must be in range 0-3");
                });
                it('should send the correct bytes to the serialport for speed 0', function (done) {
                    let sentCommandId = NaN;
                    fan.setSpeed('0x1', 0, function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x08, 0x17, 0x02, 0x00, 0x00, 0x00, 0x01, 0x04, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
                it('should send the correct bytes to the serialport for speed 2', function (done) {
                    let sentCommandId = NaN;
                    fan.setSpeed('0x1', 2, function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x08, 0x17, 0x02, 0x00, 0x00, 0x00, 0x01, 0x02, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
                it('should send the correct bytes to the serialport for speed 3', function (done) {
                    let sentCommandId = NaN;
                    fan.setSpeed('0x1', 3, function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x08, 0x17, 0x02, 0x00, 0x00, 0x00, 0x01, 0x01, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
                it('should throw an exception for speed >3', function () {
                    expect(function () {
                        fan.setSpeed('0x1', 4);
                    }).toThrow("Invalid speed: value must be in range 0-3");
                });
            });
            describe('decreaseSpeed()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        fan.decreaseSpeed('0x1');
                    }).toThrow("Device does not support decreaseSpeed()");
                });
            });
            describe('increaseSpeed()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        fan.increaseSpeed('0x1');
                    }).toThrow("Device does not support increaseSpeed()");
                });
            });
            describe('switchOff', function () {
                it('should send the correct bytes to the serialport', function (done) {
                    let sentCommandId = NaN;
                    fan.switchOff('0x1', function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x08, 0x17, 0x02, 0x00, 0x00, 0x00, 0x01, 0x04, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
            });
            describe('startTimer()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        fan.startTimer('0x1');
                    }).toThrow("Device does not support startTimer()");
                });
            });
            describe('toggleOnOff()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        fan.toggleOnOff('0x1');
                    }).toThrow("Device does not support toggleOnOff()");
                });
            });
            describe('toggleFanDirection()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        fan.toggleFanDirection('0x1');
                    }).toThrow("Device does not support toggleFanDirection()");
                });
            });
            describe('setFanDirection()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        fan.setFanDirection('0x1', 1);
                    }).toThrow("Device does not support setFanDirection()");
                });
            });
            describe('toggleLightOnOff()', function () {
                it('should send the correct bytes to the serialport', function (done) {
                    let sentCommandId = NaN;
                    fan.toggleLightOnOff('0x1', function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x08, 0x17, 0x02, 0x00, 0x00, 0x00, 0x01, 0x05, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
            });
            describe('switchLightOn()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        fan.switchLightOn('0x1');
                    }).toThrow("Device does not support switchLightOn()");
                });
            });
            describe('switchLightOff()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        fan.switchLightOff('0x1', 1);
                    }).toThrow("Device does not support switchLightOff()");
                });
            });
            describe('program()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        fan.program('0x1');
                    }).toThrow("Device does not support program()");
                });
            });
            describe('confirm()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        fan.confirm('0x1');
                    }).toThrow("Device does not support confirm()");
                });
            });
            describe('eraseAll', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        fan.eraseAll('0x1');
                    }).toThrow("Device does not support eraseAll()");
                });
            });
            describe('standby', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        fan.standby('0x1');
                    }).toThrow("Device does not support standby()");
                });
            });
            describe('resetFilter', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        fan.resetFilter('0x1');
                    }).toThrow("Device does not support resetFilter()");
                });
            });
        });
        describe('address checking:', function () {
            it('should throw an exception with an invalid deviceId format', function () {
                expect(function () {
                    fan.switchOff('0x1/A');
                }).toThrow("Invalid deviceId format");
            });
            it('should accept the highest address value', function (done) {
                let sentCommandId = NaN;
                fan.switchOff('0xf', function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x08, 0x17, 0x02, 0x00, 0x00, 0x00, 0x0f, 0x04, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should accept the lowest address value', function (done) {
                let sentCommandId = NaN;
                fan.switchOff('0x0', function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x08, 0x17, 0x02, 0x00, 0x00, 0x00, 0x00, 0x04, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should throw an exception with an invalid address 0x10', function () {
                expect(function () {
                    fan.switchOff('0x10');
                }).toThrow("Address 0x10 outside valid range");
            });
            it('should throw an exception with an invalid address -1', function () {
                expect(function () {
                    fan.switchOff('-1');
                }).toThrow("Address -0x1 outside valid range");
            });
        });
    });
    describe('SEAV_TXS4', function () {
        beforeEach(function () {
            fan = new rfxcom.Fan(device, rfxcom.fan.SEAV_TXS4);
        });
        describe('commands:', function () {
            describe('buttonPress', function () {
                it('should send the correct bytes to the serialport for button "T1"', function (done) {
                    let sentCommandId = NaN;
                    fan.buttonPress('0/10/0010110101/0x5', "T1", function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x08, 0x17, 0x03, 0x00, 0x40, 0x16, 0xa5, 0x01, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
                it('should send the correct bytes to the serialport for button 4', function (done) {
                    let sentCommandId = NaN;
                    fan.buttonPress('0/10/0010110101/0x5', 4, function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x08, 0x17, 0x03, 0x00, 0x40, 0x16, 0xa5, 0x04, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
                it('should throw an exception for an invalid button', function () {
                    expect(function () {
                        fan.buttonPress('0/10/0010110101/0x5', 'invalid');
                    }).toThrow("Invalid button 'invalid'");
                });
            });
            describe('setSpeed', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        fan.setSpeed('0/10/0010110101/0x5');
                    }).toThrow("Device does not support setSpeed()");
                });
            });
            describe('decreaseSpeed()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        fan.decreaseSpeed('0/10/0010110101/0x5');
                    }).toThrow("Device does not support decreaseSpeed()");
                });
            });
            describe('increaseSpeed()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        fan.increaseSpeed('0/10/0010110101/0x5');
                    }).toThrow("Device does not support increaseSpeed()");
                });
            });
            describe('switchOff', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        fan.switchOff('0/10/0010110101/0x5');
                    }).toThrow("Device does not support switchOff()");
                });
            });
            describe('startTimer()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        fan.startTimer('0/10/0010110101/0x5');
                    }).toThrow("Device does not support startTimer()");
                });
            });
            describe('toggleOnOff()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        fan.toggleOnOff('0/10/0010110101/0x5');
                    }).toThrow("Device does not support toggleOnOff()");
                });
            });
            describe('toggleFanDirection()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        fan.toggleFanDirection('0/10/0010110101/0x5');
                    }).toThrow("Device does not support toggleFanDirection()");
                });
            });
            describe('setFanDirection()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        fan.setFanDirection('0/10/0010110101/0x5');
                    }).toThrow("Device does not support setFanDirection()");
                });
            });
            describe('toggleLightOnOff()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        fan.toggleLightOnOff('0/10/0010110101/0x5');
                    }).toThrow("Device does not support toggleLightOnOff()");
                });
            });
            describe('switchLightOn()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        fan.switchLightOn('0/10/0010110101/0x5');
                    }).toThrow("Device does not support switchLightOn()");
                });
            });
            describe('switchLightOff()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        fan.switchLightOff('0/10/0010110101/0x5');
                    }).toThrow("Device does not support switchLightOff()");
                });
            });
            describe('program()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        fan.program('0/10/0010110101/0x5');
                    }).toThrow("Device does not support program()");
                });
            });
            describe('confirm()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        fan.confirm('0/10/0010110101/0x5');
                    }).toThrow("Device does not support confirm()");
                });
            });
            describe('eraseAll', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        fan.eraseAll('0/10/0010110101/0x5');
                    }).toThrow("Device does not support eraseAll()");
                });
            });
            describe('standby', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        fan.standby('0x1');
                    }).toThrow("Device does not support standby()");
                });
            });
            describe('resetFilter', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        fan.resetFilter('0x1');
                    }).toThrow("Device does not support resetFilter()");
                });
            });
        });
        describe('address checking:', function () {
            it('should throw an exception with an invalid deviceId format', function () {
                expect(function () {
                    fan.buttonPress('0x1/A', 'T1');
                }).toThrow("Invalid deviceId format");
            });
            it('should accept the highest J, SW1, SW2 and Remote ID values', function (done) {
                let sentCommandId = NaN;
                fan.buttonPress('1/11/1111111111/0x1f', 'T1', function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x08, 0x17, 0x03, 0x00, 0xe0, 0x7f, 0xff, 0x01, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should accept the lowest J, SW1, SW2 and Remote ID values', function (done) {
                let sentCommandId = NaN;
                fan.buttonPress('0/00/0000000000/0x0', 'T1', function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x08, 0x17, 0x03, 0x00, 0x00, 0x00, 0x00, 0x01, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should throw an exception with an invalid Remote ID 0x20', function () {
                expect(function () {
                    fan.buttonPress('1/11/1111111111/0x20', 'T1');
                }).toThrow("Remote ID 0x20 outside valid range");
            });
            it('should throw an exception with an invalid Remote ID -0x1', function () {
                expect(function () {
                    fan.buttonPress('1/11/1111111111/-0x1', 'T1');
                }).toThrow("Invalid deviceId format");
            });
        });
    });
    describe('WESTINGHOUSE_7226640', function () {
        beforeEach(function () {
            fan = new rfxcom.Fan(device, rfxcom.fan.WESTINGHOUSE_7226640);
        });
        describe('commands:', function () {
            describe('buttonPress', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        fan.buttonPress('0x1', 'T2');
                    }).toThrow("Device does not support buttonPress()");
                });
            });
            describe('setSpeed', function () {
                it('should throw an exception for speed <0', function () {
                    expect(function () {
                        fan.setSpeed('0x1', -1);
                    }).toThrow("Invalid speed: value must be in range 0-3");
                });
                it('should send the correct bytes to the serialport for speed 0', function (done) {
                    let sentCommandId = NaN;
                    fan.setSpeed('0x1', 0, function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x08, 0x17, 0x04, 0x00, 0x00, 0x00, 0x01, 0x04, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
                it('should send the correct bytes to the serialport for speed 2', function (done) {
                    let sentCommandId = NaN;
                    fan.setSpeed('0x1', 2, function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x08, 0x17, 0x04, 0x00, 0x00, 0x00, 0x01, 0x02, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
                it('should send the correct bytes to the serialport for speed 3', function (done) {
                    let sentCommandId = NaN;
                    fan.setSpeed('0x1', 3, function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x08, 0x17, 0x04, 0x00, 0x00, 0x00, 0x01, 0x01, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
                it('should throw an exception for speed >3', function () {
                    expect(function () {
                        fan.setSpeed('0x1', 4);
                    }).toThrow("Invalid speed: value must be in range 0-3");
                });
            });
            describe('decreaseSpeed()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        fan.decreaseSpeed('0x1');
                    }).toThrow("Device does not support decreaseSpeed()");
                });
            });
            describe('increaseSpeed()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        fan.increaseSpeed('0x1');
                    }).toThrow("Device does not support increaseSpeed()");
                });
            });
            describe('switchOff', function () {
                it('should send the correct bytes to the serialport', function (done) {
                    let sentCommandId = NaN;
                    fan.switchOff('0x1', function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x08, 0x17, 0x04, 0x00, 0x00, 0x00, 0x01, 0x04, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
            });
            describe('startTimer()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        fan.startTimer('0x1');
                    }).toThrow("Device does not support startTimer()");
                });
            });
            describe('toggleOnOff()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        fan.toggleOnOff('0x1');
                    }).toThrow("Device does not support toggleOnOff()");
                });
            });
            describe('toggleFanDirection()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        fan.toggleFanDirection('0x1');
                    }).toThrow("Device does not support toggleFanDirection()");
                });
            });
            describe('setFanDirection()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        fan.setFanDirection('0x1', 1);
                    }).toThrow("Device does not support setFanDirection()");
                });
            });
            describe('toggleLightOnOff()', function () {
                it('should send the correct bytes to the serialport', function (done) {
                    let sentCommandId = NaN;
                    fan.toggleLightOnOff('0x1', function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x08, 0x17, 0x04, 0x00, 0x00, 0x00, 0x01, 0x05, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
            });
            describe('switchLightOn()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        fan.switchLightOn('0x1');
                    }).toThrow("Device does not support switchLightOn()");
                });
            });
            describe('switchLightOff()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        fan.switchLightOff('0x1');
                    }).toThrow("Device does not support switchLightOff()");
                });
            });
            describe('program()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        fan.program('0x1');
                    }).toThrow("Device does not support program()");
                });
            });
            describe('confirm()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        fan.confirm('0x1');
                    }).toThrow("Device does not support confirm()");
                });
            });
            describe('eraseAll', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        fan.eraseAll('0x1');
                    }).toThrow("Device does not support eraseAll()");
                });
            });
            describe('standby', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        fan.standby('0x1');
                    }).toThrow("Device does not support standby()");
                });
            });
            describe('resetFilter', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        fan.resetFilter('0x1');
                    }).toThrow("Device does not support resetFilter()");
                });
            });
        });
        describe('address checking:', function () {
            it('should throw an exception with an invalid deviceId format', function () {
                expect(function () {
                    fan.switchOff('0x1/A');
                }).toThrow("Invalid deviceId format");
            });
            it('should accept the highest address value', function (done) {
                let sentCommandId = NaN;
                fan.switchOff('0xf', function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x08, 0x17, 0x04, 0x00, 0x00, 0x00, 0x0f, 0x04, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should accept the lowest address value', function (done) {
                let sentCommandId = NaN;
                fan.switchOff('0x0', function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x08, 0x17, 0x04, 0x00, 0x00, 0x00, 0x00, 0x04, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should throw an exception with an invalid address 0x10', function () {
                expect(function () {
                    fan.switchOff('0x10');
                }).toThrow("Address 0x10 outside valid range");
            });
            it('should throw an exception with an invalid address -1', function () {
                expect(function () {
                    fan.switchOff('-1');
                }).toThrow("Address -0x1 outside valid range");
            });
        });
    });
    describe('LUCCI_AIR_DC', function () {
        beforeEach(function () {
            fan = new rfxcom.Fan(device, rfxcom.fan.LUCCI_AIR_DC);
        });
        describe('commands:', function () {
            describe('buttonPress', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        fan.buttonPress('0x1', 'T2');
                    }).toThrow("Device does not support buttonPress()");
                });
            });
            describe('setSpeed', function () {
                it('should throw an exception for speed 0', function () {
                    expect(function () {
                        fan.setSpeed('0x1', 0);
                    }).toThrow("Invalid speed: value must be in range 1-6");
                });
                it('should send the correct bytes to the serialport for speed 1', function (done) {
                    let sentCommandId = NaN;
                    fan.setSpeed('0x1', 1, function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x08, 0x17, 0x05, 0x00, 0x00, 0x00, 0x01, 0x08, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
                it('should send the correct bytes to the serialport for speed 2', function (done) {
                    let sentCommandId = NaN;
                    fan.setSpeed('0x1', 2, function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x08, 0x17, 0x05, 0x00, 0x00, 0x00, 0x01, 0x09, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
                it('should send the correct bytes to the serialport for speed 4', function (done) {
                    let sentCommandId = NaN;
                    fan.setSpeed('0x1', 4, function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x08, 0x17, 0x05, 0x00, 0x00, 0x00, 0x01, 0x0b, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
                it('should send the correct bytes to the serialport for speed 6', function (done) {
                    let sentCommandId = NaN;
                    fan.setSpeed('0x1', 6, function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x08, 0x17, 0x05, 0x00, 0x00, 0x00, 0x01, 0x0d, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
                it('should throw an exception for speed >6', function () {
                    expect(function () {
                        fan.setSpeed('0x1', 7);
                    }).toThrow("Invalid speed: value must be in range 1-6");
                });
            });
            describe('decreaseSpeed()', function () {
                it('should send the correct bytes to the serialport', function (done) {
                    let sentCommandId = NaN;
                    fan.decreaseSpeed('0x1', function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x08, 0x17, 0x05, 0x00, 0x00, 0x00, 0x01, 0x03, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
            });
            describe('increaseSpeed()', function () {
                it('should send the correct bytes to the serialport', function (done) {
                    let sentCommandId = NaN;
                    fan.increaseSpeed('0x1', function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x08, 0x17, 0x05, 0x00, 0x00, 0x00, 0x01, 0x02, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
            });
            describe('switchOff', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        fan.switchOff('0x1', 1);
                    }).toThrow("Device does not support switchOff()");
                });
            });
            describe('startTimer()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        fan.startTimer('0x1');
                    }).toThrow("Device does not support startTimer()");
                });
            });
            describe('toggleOnOff()', function () {
                it('should send the correct bytes to the serialport', function (done) {
                    let sentCommandId = NaN;
                    fan.toggleOnOff('0x1', function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x08, 0x17, 0x05, 0x00, 0x00, 0x00, 0x01, 0x01, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
            });
            describe('toggleFanDirection()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        fan.toggleFanDirection('0x1');
                    }).toThrow("Device does not support toggleFanDirection()");
                });
            });
            describe('setFanDirection()', function () {
                it('should send the correct bytes to the serialport for natural flow', function (done) {
                    let sentCommandId = NaN;
                    fan.setFanDirection('0x1', 'Natural', function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x08, 0x17, 0x05, 0x00, 0x00, 0x00, 0x01, 0x06, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
                it('should send the correct bytes to the serialport for reverse flow', function (done) {
                    let sentCommandId = NaN;
                    fan.setFanDirection('0x1', 'Reverse', function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x08, 0x17, 0x05, 0x00, 0x00, 0x00, 0x01, 0x05, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
            });
            describe('toggleLightOnOff()', function () {
                it('should send the correct bytes to the serialport', function (done) {
                    let sentCommandId = NaN;
                    fan.toggleLightOnOff('0x1', function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x08, 0x17, 0x05, 0x00, 0x00, 0x00, 0x01, 0x04, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
            });
            describe('switchLightOn()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        fan.switchLightOn('0x1');
                    }).toThrow("Device does not support switchLightOn()");
                });
            });
            describe('switchLightOff()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        fan.switchLightOff('0x1', 1);
                    }).toThrow("Device does not support switchLightOff()");
                });
            });
            describe('program()', function () {
                it('should send the correct bytes to the serialport', function (done) {
                    let sentCommandId = NaN;
                    fan.program('0x1', function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x08, 0x17, 0x05, 0x00, 0x00, 0x00, 0x01, 0x07, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
            });
            describe('confirm()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        fan.confirm('0x1');
                    }).toThrow("Device does not support confirm()");
                });
            });
            describe('eraseAll', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        fan.eraseAll('0x1');
                    }).toThrow("Device does not support eraseAll()");
                });
            });
            describe('standby', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        fan.standby('0x1');
                    }).toThrow("Device does not support standby()");
                });
            });
            describe('resetFilter', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        fan.resetFilter('0x1');
                    }).toThrow("Device does not support resetFilter()");
                });
            });
        });
        describe('address checking:', function () {
            it('should throw an exception with an invalid deviceId format', function () {
                expect(function () {
                    fan.toggleLightOnOff('0x1/A');
                }).toThrow("Invalid deviceId format");
            });
            it('should accept the highest address value', function (done) {
                let sentCommandId = NaN;
                fan.toggleLightOnOff('0xf', function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x08, 0x17, 0x05, 0x00, 0x00, 0x00, 0x0f, 0x04, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should accept the lowest address value', function (done) {
                let sentCommandId = NaN;
                fan.toggleLightOnOff('0x0', function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x08, 0x17, 0x05, 0x00, 0x00, 0x00, 0x00, 0x04, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should throw an exception with an invalid address 0x10', function () {
                expect(function () {
                    fan.toggleLightOnOff('0x10');
                }).toThrow("Address 0x10 outside valid range");
            });
            it('should throw an exception with an invalid address -1', function () {
                expect(function () {
                    fan.toggleLightOnOff('-1');
                }).toThrow("Address -0x1 outside valid range");
            });
        });
    });
    describe('CASAFAN', function () {
        beforeEach(function () {
            fan = new rfxcom.Fan(device, rfxcom.fan.CASAFAN);
        });
        describe('commands:', function () {
            describe('buttonPress', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        fan.buttonPress('0x1', 'T2');
                    }).toThrow("Device does not support buttonPress()");
                });
            });
            describe('setSpeed', function () {
                it('should throw an exception for speed <0', function () {
                    expect(function () {
                        fan.setSpeed('0x1', -1);
                    }).toThrow("Invalid speed: value must be in range 0-3");
                });
                it('should send the correct bytes to the serialport for speed 0', function (done) {
                    let sentCommandId = NaN;
                    fan.setSpeed('0x1', 0, function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x08, 0x17, 0x06, 0x00, 0x00, 0x00, 0x01, 0x04, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
                it('should send the correct bytes to the serialport for speed 2', function (done) {
                    let sentCommandId = NaN;
                    fan.setSpeed('0x1', 2, function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x08, 0x17, 0x06, 0x00, 0x00, 0x00, 0x01, 0x02, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
                it('should send the correct bytes to the serialport for speed 3', function (done) {
                    let sentCommandId = NaN;
                    fan.setSpeed('0x1', 3, function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x08, 0x17, 0x06, 0x00, 0x00, 0x00, 0x01, 0x01, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
                it('should throw an exception for speed >3', function () {
                    expect(function () {
                        fan.setSpeed('0x1', 4);
                    }).toThrow("Invalid speed: value must be in range 0-3");
                });
            });
            describe('decreaseSpeed()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        fan.decreaseSpeed('0x1');
                    }).toThrow("Device does not support decreaseSpeed()");
                });
            });
            describe('increaseSpeed()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        fan.increaseSpeed('0x1');
                    }).toThrow("Device does not support increaseSpeed()");
                });
            });
            describe('switchOff', function () {
                it('should send the correct bytes to the serialport', function (done) {
                    let sentCommandId = NaN;
                    fan.switchOff('0x1', function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x08, 0x17, 0x06, 0x00, 0x00, 0x00, 0x01, 0x04, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
            });
            describe('startTimer()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        fan.startTimer('0x1');
                    }).toThrow("Device does not support startTimer()");
                });
            });
            describe('toggleOnOff()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        fan.toggleOnOff('0x1');
                    }).toThrow("Device does not support toggleOnOff()");
                });
            });
            describe('toggleFanDirection()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        fan.toggleFanDirection('0x1');
                    }).toThrow("Device does not support toggleFanDirection()");
                });
            });
            describe('setFanDirection()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        fan.setFanDirection('0x1', 1);
                    }).toThrow("Device does not support setFanDirection()");
                });
            });
            describe('toggleLightOnOff()', function () {
                it('should send the correct bytes to the serialport', function (done) {
                    let sentCommandId = NaN;
                    fan.toggleLightOnOff('0x1', function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x08, 0x17, 0x06, 0x00, 0x00, 0x00, 0x01, 0x05, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
            });
            describe('switchLightOn()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        fan.switchLightOn('0x1');
                    }).toThrow("Device does not support switchLightOn()");
                });
            });
            describe('switchLightOff()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        fan.switchLightOff('0x1', 1);
                    }).toThrow("Device does not support switchLightOff()");
                });
            });
            describe('program()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        fan.program('0x1');
                    }).toThrow("Device does not support program()");
                });
            });
            describe('confirm()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        fan.confirm('0x1');
                    }).toThrow("Device does not support confirm()");
                });
            });
            describe('eraseAll', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        fan.eraseAll('0x1');
                    }).toThrow("Device does not support eraseAll()");
                });
            });
            describe('standby', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        fan.standby('0x1');
                    }).toThrow("Device does not support standby()");
                });
            });
            describe('resetFilter', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        fan.resetFilter('0x1');
                    }).toThrow("Device does not support resetFilter()");
                });
            });
        });
        describe('address checking:', function () {
            it('should throw an exception with an invalid deviceId format', function () {
                expect(function () {
                    fan.switchOff('0x1/A');
                }).toThrow("Invalid deviceId format");
            });
            it('should accept the highest address value', function (done) {
                let sentCommandId = NaN;
                fan.switchOff('0xf', function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x08, 0x17, 0x06, 0x00, 0x00, 0x00, 0x0f, 0x04, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should accept the lowest address value', function (done) {
                let sentCommandId = NaN;
                fan.switchOff('0x0', function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x08, 0x17, 0x06, 0x00, 0x00, 0x00, 0x00, 0x04, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should throw an exception with an invalid address 0x10', function () {
                expect(function () {
                    fan.switchOff('0x10');
                }).toThrow("Address 0x10 outside valid range");
            });
            it('should throw an exception with an invalid address -1', function () {
                expect(function () {
                    fan.switchOff('-1');
                }).toThrow("Address -0x1 outside valid range");
            });
        });
    });
    describe('FT1211R', function () {
        beforeEach(function () {
            fan = new rfxcom.Fan(device, rfxcom.fan.FT1211R);
        });
        describe('commands:', function () {
            describe('buttonPress', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        fan.buttonPress('0x1', 'T2');
                    }).toThrow("Device does not support buttonPress()");
                });
            });
            describe('setSpeed', function () {
                it('should throw an exception for speed <1', function () {
                    expect(function () {
                        fan.setSpeed('0x1', 0);
                    }).toThrow("Invalid speed: value must be in range 1-5");
                });
                it('should send the correct bytes to the serialport for speed 1', function (done) {
                    let sentCommandId = NaN;
                    fan.setSpeed('0x1', 1, function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x08, 0x17, 0x07, 0x00, 0x00, 0x00, 0x01, 0x03, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
                it('should send the correct bytes to the serialport for speed 3', function (done) {
                    let sentCommandId = NaN;
                    fan.setSpeed('0x1', 3, function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x08, 0x17, 0x07, 0x00, 0x00, 0x00, 0x01, 0x05, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
                it('should send the correct bytes to the serialport for speed 5', function (done) {
                    let sentCommandId = NaN;
                    fan.setSpeed('0x1', 5, function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x08, 0x17, 0x07, 0x00, 0x00, 0x00, 0x01, 0x07, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
                it('should throw an exception for speed >5', function () {
                    expect(function () {
                        fan.setSpeed('0x1', 6);
                    }).toThrow("Invalid speed: value must be in range 1-5");
                });
            });
            describe('decreaseSpeed()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        fan.decreaseSpeed('0x1');
                    }).toThrow("Device does not support decreaseSpeed()");
                });
            });
            describe('increaseSpeed()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        fan.increaseSpeed('0x1');
                    }).toThrow("Device does not support increaseSpeed()");
                });
            });
            describe('switchOff', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        fan.switchOff('0x1');
                    }).toThrow("Device does not support switchOff()");
                });
            });
            describe('startTimer()', function () {
                it('should send the correct bytes to the serialport for a 1 hour timeout', function (done) {
                    let sentCommandId = NaN;
                    fan.startTimer('0x1', 1, function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x08, 0x17, 0x07, 0x00, 0x00, 0x00, 0x01, 0x09, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
                it('should send the correct bytes to the serialport for a 4 hour timeout', function (done) {
                    let sentCommandId = NaN;
                    fan.startTimer('0x1', 4, function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x08, 0x17, 0x07, 0x00, 0x00, 0x00, 0x01, 0x0A, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
                it('should send the correct bytes to the serialport for an 8 hour timeout', function (done) {
                    let sentCommandId = NaN;
                    fan.startTimer('0x1', 8, function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x08, 0x17, 0x07, 0x00, 0x00, 0x00, 0x01, 0x0B, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
                it('should throw an exception for an invalid timeout', function () {
                    expect(function () {
                        fan.startTimer('0x1', 99);
                    }).toThrow("Invalid timer timeout: value must be 1, 4, or 8");
                });
            });
            describe('toggleOnOff()', function () {
                it('should send the correct bytes to the serialport', function (done) {
                    let sentCommandId = NaN;
                    fan.toggleOnOff('0x1', function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x08, 0x17, 0x07, 0x00, 0x00, 0x00, 0x01, 0x01, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
            });
            describe('toggleFanDirection()', function () {
                it('should send the correct bytes to the serialport', function (done) {
                    let sentCommandId = NaN;
                    fan.toggleFanDirection('0x1', function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x08, 0x17, 0x07, 0x00, 0x00, 0x00, 0x01, 0x08, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
            });
            describe('setFanDirection()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        fan.setFanDirection('0x1', 1);
                    }).toThrow("Device does not support setFanDirection()");
                });
            });
            describe('toggleLightOnOff()', function () {
                it('should send the correct bytes to the serialport', function (done) {
                    let sentCommandId = NaN;
                    fan.toggleLightOnOff('0x1', function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x08, 0x17, 0x07, 0x00, 0x00, 0x00, 0x01, 0x02, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
            });
            describe('switchLightOn()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        fan.switchLightOn('0x1');
                    }).toThrow("Device does not support switchLightOn()");
                });
            });
            describe('switchLightOff()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        fan.switchLightOff('0x1', 1);
                    }).toThrow("Device does not support switchLightOff()");
                });
            });
            describe('program()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        fan.program('0x1');
                    }).toThrow("Device does not support program()");
                });
            });
            describe('confirm()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        fan.confirm('0x1');
                    }).toThrow("Device does not support confirm()");
                });
            });
            describe('eraseAll', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        fan.eraseAll('0x1');
                    }).toThrow("Device does not support eraseAll()");
                });
            });
            describe('standby', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        fan.standby('0x1');
                    }).toThrow("Device does not support standby()");
                });
            });
            describe('resetFilter', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        fan.resetFilter('0x1');
                    }).toThrow("Device does not support resetFilter()");
                });
            });
        });
        describe('address checking:', function () {
            it('should throw an exception with an invalid deviceId format', function () {
                expect(function () {
                    fan.toggleOnOff('0x1/A');
                }).toThrow("Invalid deviceId format");
            });
            it('should accept the highest address value', function (done) {
                let sentCommandId = NaN;
                fan.toggleOnOff('0xffff', function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x08, 0x17, 0x07, 0x00, 0x00, 0xff, 0xff, 0x01, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should accept the lowest address value', function (done) {
                let sentCommandId = NaN;
                fan.toggleOnOff('0x1', function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x08, 0x17, 0x07, 0x00, 0x00, 0x00, 0x01, 0x01, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should throw an exception with an invalid address 0x10000', function () {
                expect(function () {
                    fan.toggleOnOff('0x10000');
                }).toThrow("Address 0x10000 outside valid range");
            });
            it('should throw an exception with an invalid address 0x0', function () {
                expect(function () {
                    fan.toggleOnOff('0x0');
                }).toThrow("Address 0x0 outside valid range");
            });
        });
    });
    describe('FALMEC', function () {
        beforeEach(function () {
            fan = new rfxcom.Fan(device, rfxcom.fan.FALMEC);
        });
        describe('commands:', function () {
            describe('buttonPress', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        fan.buttonPress('0x1', 'T2');
                    }).toThrow("Device does not support buttonPress()");
                });
            });
            describe('setSpeed', function () {
                it('should throw an exception for speed <0', function () {
                    expect(function () {
                        fan.setSpeed('0x1', -1);
                    }).toThrow("Invalid speed: value must be in range 0-4");
                });
                it('should send the correct bytes to the serialport for speed 0', function (done) {
                    let sentCommandId = NaN;
                    fan.setSpeed('0x1', 0, function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x08, 0x17, 0x08, 0x00, 0x00, 0x00, 0x01, 0x01, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
                it('should send the correct bytes to the serialport for speed 2', function (done) {
                    let sentCommandId = NaN;
                    fan.setSpeed('0x1', 2, function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x08, 0x17, 0x08, 0x00, 0x00, 0x00, 0x01, 0x03, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
                it('should send the correct bytes to the serialport for speed 4', function (done) {
                    let sentCommandId = NaN;
                    fan.setSpeed('0x1', 4, function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x08, 0x17, 0x08, 0x00, 0x00, 0x00, 0x01, 0x05, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
                it('should throw an exception for speed >4', function () {
                    expect(function () {
                        fan.setSpeed('0x1', 5);
                    }).toThrow("Invalid speed: value must be in range 0-4");
                });
            });
            describe('decreaseSpeed()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        fan.decreaseSpeed('0x1');
                    }).toThrow("Device does not support decreaseSpeed()");
                });
            });
            describe('increaseSpeed()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        fan.increaseSpeed('0x1');
                    }).toThrow("Device does not support increaseSpeed()");
                });
            });
            describe('switchOff', function () {
                it('should send the correct bytes to the serialport', function (done) {
                    let sentCommandId = NaN;
                    fan.switchOff('0x1', function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x08, 0x17, 0x08, 0x00, 0x00, 0x00, 0x01, 0x01, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
            });
            describe('startTimer()', function () {
                it('should send the correct bytes to the serialport for a 1 unit timeout', function (done) {
                    let sentCommandId = NaN;
                    fan.startTimer('0x1', 1, function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x08, 0x17, 0x08, 0x00, 0x00, 0x00, 0x01, 0x06, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
                it('should send the correct bytes to the serialport for a 2 unit timeout', function (done) {
                    let sentCommandId = NaN;
                    fan.startTimer('0x1', 2, function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x08, 0x17, 0x08, 0x00, 0x00, 0x00, 0x01, 0x07, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
                it('should send the correct bytes to the serialport for a 3 unit timeout', function (done) {
                    let sentCommandId = NaN;
                    fan.startTimer('0x1', 3, function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x08, 0x17, 0x08, 0x00, 0x00, 0x00, 0x01, 0x08, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
                it('should send the correct bytes to the serialport for a 4 unit timeout', function (done) {
                    let sentCommandId = NaN;
                    fan.startTimer('0x1', 4, function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x08, 0x17, 0x08, 0x00, 0x00, 0x00, 0x01, 0x09, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
                it('should throw an exception for an invalid timeout', function () {
                    expect(function () {
                        fan.startTimer('0x1', 99);
                    }).toThrow("Invalid timer timeout: value must be in range 1-4");
                });
            });
            describe('toggleOnOff()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        fan.toggleOnOff('0x1', 1);
                    }).toThrow("Device does not support toggleOnOff()");
                });
            });
            describe('toggleFanDirection()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        fan.toggleFanDirection('0x1', 1);
                    }).toThrow("Device does not support toggleFanDirection()");
                });
            });
            describe('setFanDirection()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        fan.setFanDirection('0x1', 1);
                    }).toThrow("Device does not support setFanDirection()");
                });
            });
            describe('toggleLightOnOff()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        fan.toggleLightOnOff('0x1', 1);
                    }).toThrow("Device does not support toggleLightOnOff()");
                });
            });
            describe('switchLightOn()', function () {
                it('should send the correct bytes to the serialport', function (done) {
                    let sentCommandId = NaN;
                    fan.switchLightOn('0x1', function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x08, 0x17, 0x08, 0x00, 0x00, 0x00, 0x01, 0x0A, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
            });
            describe('switchLightOff()', function () {
                it('should send the correct bytes to the serialport', function (done) {
                    let sentCommandId = NaN;
                    fan.switchLightOff('0x1', function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x08, 0x17, 0x08, 0x00, 0x00, 0x00, 0x01, 0x0B, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
            });
            describe('program()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        fan.program('0x1');
                    }).toThrow("Device does not support program()");
                });
            });
            describe('confirm()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        fan.confirm('0x1');
                    }).toThrow("Device does not support confirm()");
                });
            });
            describe('eraseAll', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        fan.eraseAll('0x1');
                    }).toThrow("Device does not support eraseAll()");
                });
            });
            describe('standby', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        fan.standby('0x1');
                    }).toThrow("Device does not support standby()");
                });
            });
            describe('resetFilter', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        fan.resetFilter('0x1');
                    }).toThrow("Device does not support resetFilter()");
                });
            });
        });
        describe('address checking:', function () {
            it('should throw an exception with an invalid deviceId format', function () {
                expect(function () {
                    fan.switchOff('0x1/A');
                }).toThrow("Invalid deviceId format");
            });
            it('should accept the highest address value', function (done) {
                let sentCommandId = NaN;
                fan.switchOff('0x0f', function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x08, 0x17, 0x08, 0x00, 0x00, 0x00, 0x0f, 0x01, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should accept the lowest address value', function (done) {
                let sentCommandId = NaN;
                fan.switchOff('0x0', function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x08, 0x17, 0x08, 0x00, 0x00, 0x00, 0x00, 0x01, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should throw an exception with an invalid address 0x10', function () {
                expect(function () {
                    fan.switchOff('0x10');
                }).toThrow("Address 0x10 outside valid range");
            });
            it('should throw an exception with an invalid address -1', function () {
                expect(function () {
                    fan.switchOff('-1');
                }).toThrow("Address -0x1 outside valid range");
            });
        });
    });
    describe('LUCCI_AIR_DCII', function () {
        beforeEach(function () {
            fan = new rfxcom.Fan(device, rfxcom.fan.LUCCI_AIR_DCII);
        });
        describe('commands:', function () {
            describe('buttonPress', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        fan.buttonPress('0x1', 'T2');
                    }).toThrow("Device does not support buttonPress()");
                });
            });
            describe('setSpeed', function () {
                it('should throw an exception for speed <0', function () {
                    expect(function () {
                        fan.setSpeed('0x1', -1);
                    }).toThrow("Invalid speed: value must be in range 0-6");
                });
                it('should send the correct bytes to the serialport for speed 0', function (done) {
                    let sentCommandId = NaN;
                    fan.setSpeed('0x1', 0, function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x08, 0x17, 0x09, 0x00, 0x00, 0x00, 0x01, 0x01, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
                it('should send the correct bytes to the serialport for speed 2', function (done) {
                    let sentCommandId = NaN;
                    fan.setSpeed('0x1', 2, function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x08, 0x17, 0x09, 0x00, 0x00, 0x00, 0x01, 0x03, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
                it('should send the correct bytes to the serialport for speed 4', function (done) {
                    let sentCommandId = NaN;
                    fan.setSpeed('0x1', 4, function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x08, 0x17, 0x09, 0x00, 0x00, 0x00, 0x01, 0x05, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
                it('should send the correct bytes to the serialport for speed 6', function (done) {
                    let sentCommandId = NaN;
                    fan.setSpeed('0x1', 6, function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x08, 0x17, 0x09, 0x00, 0x00, 0x00, 0x01, 0x07, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
                it('should throw an exception for speed >6', function () {
                    expect(function () {
                        fan.setSpeed('0x1', 7);
                    }).toThrow("Invalid speed: value must be in range 0-6");
                });
            });
            describe('decreaseSpeed()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        fan.decreaseSpeed('0x1');
                    }).toThrow("Device does not support decreaseSpeed()");
                });
            });
            describe('increaseSpeed()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        fan.increaseSpeed('0x1');
                    }).toThrow("Device does not support increaseSpeed()");
                });
            });
            describe('switchOff', function () {
                it('should send the correct bytes to the serialport', function (done) {
                    let sentCommandId = NaN;
                    fan.switchOff('0x1', function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x08, 0x17, 0x09, 0x00, 0x00, 0x00, 0x01, 0x01, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
            });
            describe('startTimer()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        fan.startTimer('0x1', 1);
                    }).toThrow("Device does not support startTimer()");
                });
            });
            describe('toggleOnOff()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        fan.toggleOnOff('0x1', 1);
                    }).toThrow("Device does not support toggleOnOff()");
                });
            });
            describe('toggleFanDirection()', function () {
                it('should send the correct bytes to the serialport', function (done) {
                    let sentCommandId = NaN;
                    fan.toggleFanDirection('0x1', function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x08, 0x17, 0x09, 0x00, 0x00, 0x00, 0x01, 0x09, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
            });
            describe('setFanDirection()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        fan.setFanDirection('0x1', 1);
                    }).toThrow("Device does not support setFanDirection()");
                });
            });
            describe('toggleLightOnOff()', function () {
                it('should send the correct bytes to the serialport', function (done) {
                    let sentCommandId = NaN;
                    fan.toggleLightOnOff('0x1', function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x08, 0x17, 0x09, 0x00, 0x00, 0x00, 0x01, 0x08, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
            });
            describe('switchLightOn()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        fan.switchLightOn('0x1', 1);
                    }).toThrow("Device does not support switchLightOn()");
                });
            });
            describe('switchLightOff()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        fan.switchLightOff('0x1', 1);
                    }).toThrow("Device does not support switchLightOff()");
                });
            });
            describe('program()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        fan.program('0x1');
                    }).toThrow("Device does not support program()");
                });
            });
            describe('confirm()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        fan.confirm('0x1');
                    }).toThrow("Device does not support confirm()");
                });
            });
            describe('eraseAll', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        fan.eraseAll('0x1');
                    }).toThrow("Device does not support eraseAll()");
                });
            });
            describe('standby', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        fan.standby('0x1');
                    }).toThrow("Device does not support standby()");
                });
            });
            describe('resetFilter', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        fan.resetFilter('0x1');
                    }).toThrow("Device does not support resetFilter()");
                });
            });
        });
        describe('address checking:', function () {
            it('should throw an exception with an invalid deviceId format', function () {
                expect(function () {
                    fan.switchOff('0x1/A');
                }).toThrow("Invalid deviceId format");
            });
            it('should accept the highest address value', function (done) {
                let sentCommandId = NaN;
                fan.switchOff('0x0f', function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x08, 0x17, 0x09, 0x00, 0x00, 0x00, 0x0f, 0x01, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should accept the lowest address value', function (done) {
                let sentCommandId = NaN;
                fan.switchOff('0x0', function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x08, 0x17, 0x09, 0x00, 0x00, 0x00, 0x00, 0x01, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should throw an exception with an invalid address 0x10', function () {
                expect(function () {
                    fan.switchOff('0x10');
                }).toThrow("Address 0x10 outside valid range");
            });
            it('should throw an exception with an invalid address -1', function () {
                expect(function () {
                    fan.switchOff('-1');
                }).toThrow("Address -0x1 outside valid range");
            });
        });
    });
    describe('ITHO_CVE_ECO_RFT', function () {
        beforeEach(function () {
            fan = new rfxcom.Fan(device, rfxcom.fan.ITHO_CVE_ECO_RFT);
        });
        describe('commands:', function () {
            describe('buttonPress', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        fan.buttonPress('0x123456', 'T2');
                    }).toThrow("Device does not support buttonPress()");
                });
            });
            describe('setSpeed', function () {
                it('should throw an exception for speed 0', function () {
                    expect(function () {
                        fan.setSpeed('0x123456', 0);
                    }).toThrow("Invalid speed: value must be in range 1-4");
                });
                it('should send the correct bytes to the serialport for speed 1', function (done) {
                    let sentCommandId = NaN;
                    fan.setSpeed('0x123456', 1, function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x08, 0x17, 0x0a, 0x00, 0x12, 0x34, 0x56, 0x01, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
                it('should send the correct bytes to the serialport for speed 2', function (done) {
                    let sentCommandId = NaN;
                    fan.setSpeed('0x123456', 2, function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x08, 0x17, 0x0a, 0x00, 0x12, 0x34, 0x56, 0x02, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
                it('should send the correct bytes to the serialport for speed 3', function (done) {
                    let sentCommandId = NaN;
                    fan.setSpeed('0x123456', 3, function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x08, 0x17, 0x0a, 0x00, 0x12, 0x34, 0x56, 0x03, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
                it('should send the correct bytes to the serialport for speed 4', function (done) {
                    let sentCommandId = NaN;
                    fan.setSpeed('0x123456', 4, function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x08, 0x17, 0x0a, 0x00, 0x12, 0x34, 0x56, 0x08, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
                it('should throw an exception for speed >4', function () {
                    expect(function () {
                        fan.setSpeed('0x123456', 5);
                    }).toThrow("Invalid speed: value must be in range 1-4");
                });
            });
            describe('decreaseSpeed()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        fan.decreaseSpeed('0x123456');
                    }).toThrow("Device does not support decreaseSpeed()");
                });
            });
            describe('increaseSpeed()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        fan.increaseSpeed('0x123456');
                    }).toThrow("Device does not support increaseSpeed()");
                });
            });
            describe('switchOff', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        fan.switchOff('0x123456');
                    }).toThrow("Device does not support switchOff()");
                });
            });
            describe('startTimer()', function () {
                it('should send the correct bytes to the serialport for timeout 1', function (done) {
                    let sentCommandId = NaN;
                    fan.startTimer('0x123456', 1, function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x08, 0x17, 0x0a, 0x00, 0x12, 0x34, 0x56, 0x04, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
                it('should send the correct bytes to the serialport for timeout 2', function (done) {
                    let sentCommandId = NaN;
                    fan.startTimer('0x123456', 2, function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x08, 0x17, 0x0a, 0x00, 0x12, 0x34, 0x56, 0x05, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
                it('should send the correct bytes to the serialport for timeout 3', function (done) {
                    let sentCommandId = NaN;
                    fan.startTimer('0x123456', 3, function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x08, 0x17, 0x0a, 0x00, 0x12, 0x34, 0x56, 0x06, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
                it('should throw an exception with an invalid timeout', function () {
                    expect(function () {
                        fan.startTimer('0x123456', 4);
                    }).toThrow("Invalid timer timeout: value must be in range 1-3");
                });
            });
            describe('toggleOnOff()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        fan.toggleOnOff('0x123456');
                    }).toThrow("Device does not support toggleOnOff()");
                });
            });
            describe('toggleFanDirection()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        fan.toggleFanDirection('0x123456');
                    }).toThrow("Device does not support toggleFanDirection()");
                });
            });
            describe('setFanDirection()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        fan.setFanDirection('0x123456', 'reverse');
                    }).toThrow("Device does not support setFanDirection()");
                });
            });
            describe('toggleLightOnOff()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        fan.toggleLightOnOff('0x123456');
                    }).toThrow("Device does not support toggleLightOnOff()");
                });
            });
            describe('switchLightOn()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        fan.switchLightOn('0x123456');
                    }).toThrow("Device does not support switchLightOn()");
                });
            });
            describe('switchLightOff()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        fan.switchLightOff('0x123456');
                    }).toThrow("Device does not support switchLightOff()");
                });
            });
            describe('program()', function () {
                it('should send the correct bytes to the serialport', function (done) {
                    let sentCommandId = NaN;
                    fan.program('0x123456', function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x08, 0x17, 0x0a, 0x00, 0x12, 0x34, 0x56, 0x09, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
            });
            describe('confirm()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        fan.confirm('0x123456');
                    }).toThrow("Device does not support confirm()");
                });
            });
            describe('eraseAll', function () {
                it('should send the correct bytes to the serialport', function (done) {
                    let sentCommandId = NaN;
                    fan.eraseAll('0x123456', function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x08, 0x17, 0x0a, 0x00, 0x12, 0x34, 0x56, 0x0a, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
            });
            describe('standby', function () {
                it('should send the correct bytes to the serialport', function (done) {
                    let sentCommandId = NaN;
                    fan.standby('0x123456', function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x08, 0x17, 0x0a, 0x00, 0x12, 0x34, 0x56, 0x07, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
            });
            describe('resetFilter', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        fan.resetFilter('0x1');
                    }).toThrow("Device does not support resetFilter()");
                });
            });
        });
        describe('address checking:', function () {
            it('should throw an exception with an invalid deviceId format', function () {
                expect(function () {
                    fan.startTimer('0x1234/A');
                }).toThrow("Invalid deviceId format");
            });
            it('should accept the highest address value', function (done) {
                let sentCommandId = NaN;
                fan.startTimer('0xffffff', function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x08, 0x17, 0x0a, 0x00, 0xff, 0xff, 0xff, 0x04, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should accept the lowest address value', function (done) {
                let sentCommandId = NaN;
                fan.startTimer('0x1', function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x08, 0x17, 0x0a, 0x00, 0x00, 0x00, 0x01, 0x04, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should throw an exception with an invalid address 0x1000000', function () {
                expect(function () {
                    fan.startTimer('0x1000000');
                }).toThrow("Address 0x1000000 outside valid range");
            });
            it('should throw an exception with an invalid address 0x0', function () {
                expect(function () {
                    fan.startTimer('0x0');
                }).toThrow("Address 0x0 outside valid range");
            });
        });
    });
    describe('NOVY', function () {
        beforeEach(function () {
            fan = new rfxcom.Fan(device, rfxcom.fan.NOVY);
        });
        describe('commands:', function () {
            describe('buttonPress', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        fan.buttonPress('0x1', 'T2');
                    }).toThrow("Device does not support buttonPress()");
                });
            });
            describe('setSpeed', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        fan.setSpeed('0x1', 1);
                    }).toThrow("Device does not support setSpeed()");
                });
            });
            describe('decreaseSpeed()', function () {
                it('should send the correct bytes to the serialport', function (done) {
                    let sentCommandId = NaN;
                    fan.decreaseSpeed('0x1', function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x08, 0x17, 0x0b, 0x00, 0x00, 0x00, 0x01, 0x03, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
            });
            describe('increaseSpeed()', function () {
                it('should send the correct bytes to the serialport', function (done) {
                    let sentCommandId = NaN;
                    fan.increaseSpeed('0x1', function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x08, 0x17, 0x0b, 0x00, 0x00, 0x00, 0x01, 0x02, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
            });
            describe('switchOff', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        fan.switchOff('0x1', 1);
                    }).toThrow("Device does not support switchOff()");
                });
            });
            describe('startTimer()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        fan.startTimer('0x1');
                    }).toThrow("Device does not support startTimer()");
                });
            });
            describe('toggleOnOff()', function () {
                it('should send the correct bytes to the serialport', function (done) {
                    let sentCommandId = NaN;
                    fan.toggleOnOff('0x1', function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x08, 0x17, 0x0b, 0x00, 0x00, 0x00, 0x01, 0x01, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
            });
            describe('toggleFanDirection()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        fan.toggleFanDirection('0x1');
                    }).toThrow("Device does not support toggleFanDirection()");
                });
            });
            describe('setFanDirection()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        fan.setFanDirection('0x1', 0);
                    }).toThrow("Device does not support setFanDirection()");
                });
            });
            describe('toggleLightOnOff()', function () {
                it('should send the correct bytes to the serialport', function (done) {
                    let sentCommandId = NaN;
                    fan.toggleLightOnOff('0x1', function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x08, 0x17, 0x0b, 0x00, 0x00, 0x00, 0x01, 0x04, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
            });
            describe('switchLightOn()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        fan.switchLightOn('0x1');
                    }).toThrow("Device does not support switchLightOn()");
                });
            });
            describe('switchLightOff()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        fan.switchLightOff('0x1', 1);
                    }).toThrow("Device does not support switchLightOff()");
                });
            });
            describe('program()', function () {
                it('should send the correct bytes to the serialport', function (done) {
                    let sentCommandId = NaN;
                    fan.program('0x1', function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x08, 0x17, 0x0b, 0x00, 0x00, 0x00, 0x01, 0x05, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
            });
            describe('confirm()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        fan.confirm('0x1');
                    }).toThrow("Device does not support confirm()");
                });
            });
            describe('eraseAll', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        fan.eraseAll('0x1');
                    }).toThrow("Device does not support eraseAll()");
                });
            });
            describe('standby', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        fan.standby('0x1');
                    }).toThrow("Device does not support standby()");
                });
            });
            describe('resetFilter()', function () {
                it('should send the correct bytes to the serialport', function (done) {
                    let sentCommandId = NaN;
                    fan.resetFilter('0x1', function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x08, 0x17, 0x0b, 0x00, 0x00, 0x00, 0x01, 0x06, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
            });
        });
        describe('address checking:', function () {
            it('should throw an exception with an invalid deviceId format', function () {
                expect(function () {
                    fan.toggleLightOnOff('0x1/A');
                }).toThrow("Invalid deviceId format");
            });
            it('should accept the highest address value', function (done) {
                let sentCommandId = NaN;
                fan.toggleLightOnOff('0x9', function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x08, 0x17, 0x0b, 0x00, 0x00, 0x00, 0x09, 0x04, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should accept the lowest address value', function (done) {
                let sentCommandId = NaN;
                fan.toggleLightOnOff('0x0', function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x08, 0x17, 0x0b, 0x00, 0x00, 0x00, 0x00, 0x04, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should throw an exception with an invalid address 0xa', function () {
                expect(function () {
                    fan.toggleLightOnOff('0xa');
                }).toThrow("Address 0xa outside valid range");
            });
            it('should throw an exception with an invalid address -1', function () {
                expect(function () {
                    fan.toggleLightOnOff('-1');
                }).toThrow("Address -0x1 outside valid range");
            });
        });
    });
});
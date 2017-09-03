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
        device.acknowledge.forEach(acknowledge => {if (typeof acknowledge === "function") {acknowledge()}});    });
    describe('SIEMENS_SF01', function () {
        beforeEach(function () {
            fan = new rfxcom.Fan(device, rfxcom.fan.SIEMENS_SF01);
        });
        describe('commands', function () {
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
            describe('learn()', function () {
                it('should send the correct bytes to the serialport', function (done) {
                    let sentCommandId = NaN;
                    fan.learn('0x1234', function (err, response, cmdId) {
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
        });
        describe('address checking', function () {
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
        describe('commands', function () {
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
            });
            describe('toggleLightOnOff()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        fan.toggleLightOnOff('0x123456');
                    }).toThrow("Device does not support toggleLightOnOff()");
                });
            });
            describe('learn()', function () {
                it('should send the correct bytes to the serialport', function (done) {
                    let sentCommandId = NaN;
                    fan.learn('0x123456', function (err, response, cmdId) {
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
        });
        describe('address checking', function () {
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
        describe('commands', function () {
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
            describe('learn()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        fan.learn('0x1');
                    }).toThrow("Device does not support learn()");
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
        });
        describe('address checking', function () {
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
                fan.switchOff('0x1', function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x08, 0x17, 0x02, 0x00, 0x00, 0x00, 0x01, 0x04, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should throw an exception with an invalid address 0x10', function () {
                expect(function () {
                    fan.switchOff('0x10');
                }).toThrow("Address 0x10 outside valid range");
            });
            it('should throw an exception with an invalid address 0x0', function () {
                expect(function () {
                    fan.switchOff('0x0');
                }).toThrow("Address 0x0 outside valid range");
            });
        });
    });
    describe('SEAV_TXS4', function () {
        beforeEach(function () {
            fan = new rfxcom.Fan(device, rfxcom.fan.SEAV_TXS4);
        });
        describe('commands', function () {
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
            describe('toggleLightOnOff()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        fan.toggleLightOnOff('0/10/0010110101/0x5');
                    }).toThrow("Device does not support toggleLightOnOff()");
                });
            });
            describe('learn()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        fan.learn('0/10/0010110101/0x5');
                    }).toThrow("Device does not support learn()");
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
        });
        describe('address checking', function () {
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
        describe('commands', function () {
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
            describe('learn()', function () {
                it('should throw an unsupported command exception', function () {
                    expect(function () {
                        fan.learn('0x1');
                    }).toThrow("Device does not support learn()");
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
        });
        describe('address checking', function () {
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
                fan.switchOff('0x1', function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x08, 0x17, 0x04, 0x00, 0x00, 0x00, 0x01, 0x04, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should throw an exception with an invalid address 0x10', function () {
                expect(function () {
                    fan.switchOff('0x10');
                }).toThrow("Address 0x10 outside valid range");
            });
            it('should throw an exception with an invalid address 0x0', function () {
                expect(function () {
                    fan.switchOff('0x0');
                }).toThrow("Address 0x0 outside valid range");
            });
        });
    });
});
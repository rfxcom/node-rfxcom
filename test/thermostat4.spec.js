/**
 * Created by max on 13/07/2017.
 */
const rfxcom = require('../lib'),
    matchers = require('./matchers'),
    FakeSerialPort = require('./helper');

describe('Thermostat4 class', function () {
    let thermostat = {},
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
    describe('MCZ_PELLET_STOVE_1_FAN', function () {
        beforeEach(function () {
            thermostat = new rfxcom.Thermostat4(device, rfxcom.thermostat4.MCZ_PELLET_STOVE_1_FAN);
        });
        describe('commands', function () {
            describe('sendMessage()', function () {
                it('should send the correct bytes to the serialport', function (done) {
                    const
                        params = {
                            beep: 0,
                            fanSpeed: 1,
                            flamePower: 1,
                            mode: "Man"
                        };
                    let sentCommandId = NaN;
                    thermostat.sendMessage('0x123456', params, function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x0c, 0x43, 0x00, 0x00, 0x12, 0x34, 0x56, 0x00, 0x01, 0x11, 0x01, 0x01, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
                it('should send the correct default parameters', function (done) {
                    const
                        params = {
                            flamePower: 1,
                            mode: "Man"
                        };
                    let sentCommandId = NaN;
                    thermostat.sendMessage('0x123456', params, function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x0c, 0x43, 0x00, 0x00, 0x12, 0x34, 0x56, 0x01, 0x06, 0x11, 0x01, 0x01, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
                it('should ignore excess fanSpeed values', function (done) {
                    const
                        params = {
                            beep: 99,
                            fanSpeed: [4, 3, 2],
                            flamePower: 4,
                            mode: "Eco"
                        };
                    let sentCommandId = NaN;
                    thermostat.sendMessage('0x123456', params, function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x0c, 0x43, 0x00, 0x00, 0x12, 0x34, 0x56, 0x01, 0x04, 0x11, 0x04, 0x03, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
                it('should accept a numeric mode', function (done) {
                    const
                        params = {
                            beep: null,
                            fanSpeed: [4],
                            flamePower: 4,
                            mode: 2
                        };
                    let sentCommandId = NaN;
                    thermostat.sendMessage('0x123456', params, function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x0c, 0x43, 0x00, 0x00, 0x12, 0x34, 0x56, 0x00, 0x04, 0x11, 0x04, 0x02, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
                it('should throw an exception with a missing params', function () {
                    expect(function() {
                        thermostat.sendMessage('0x123456');
                    }).toThrow("Missing params");
                });
                it('should throw an exception with a missing mode', function () {
                    const
                        params = {
                            beep: null,
                            fanSpeed: [4],
                            flamePower: 1
                        };
                    expect(function() {
                        thermostat.sendMessage('0x123456', params);
                    }).toThrow("mode parameter must be specified");
                });
                it('should throw an exception with an invalid mode', function () {
                    const
                        params = {
                            beep: null,
                            fanSpeed: [4],
                            flamePower: 1,
                            mode: 7
                        };
                    expect(function() {
                        thermostat.sendMessage('0x123456', params);
                    }).toThrow("Invalid parameter mode: must be in range 0-3");
                });
                it('should throw an exception with an invalid mode string', function () {
                    const
                        params = {
                            beep: null,
                            fanSpeed: [4],
                            flamePower: 1,
                            mode: "I am invalid!"
                        };
                    expect(function() {
                        thermostat.sendMessage('0x123456', params);
                    }).toThrow("Invalid parameter mode: 'I am invalid!'");
                });
                it('should throw an exception with a missing flamePower', function () {
                    const
                        params = {
                            beep: null,
                            fanSpeed: [4],
                            mode: 2
                        };
                    expect(function() {
                        thermostat.sendMessage('0x123456', params);
                    }).toThrow("Invalid parameter flamePower: must be in range 1-5");
                });
            });
        });
        describe('address checking', function () {
            const
                params = {
                    beep: 0,
                    fanSpeed: 1,
                    flamePower: 1,
                    mode: "Man"
                };
            it('should throw an exception with an invalid deviceId format', function () {
                expect(function () {
                    thermostat.sendMessage('0x1234/A', params);
                }).toThrow("Invalid deviceId format");
            });
            it('should accept the highest address', function (done) {
                let sentCommandId = NaN;
                thermostat.sendMessage('0xffffff', params, function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0c, 0x43, 0x00, 0x00, 0xff, 0xff, 0xff, 0x00, 0x01, 0x11, 0x01, 0x01, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should accept the lowest address', function (done) {
                let sentCommandId = NaN;
                thermostat.sendMessage('0x1', params, function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0c, 0x43, 0x00, 0x00, 0x00, 0x00, 0x01, 0x00, 0x01, 0x11, 0x01, 0x01, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should throw an exception with an invalid address 0x1000000', function () {
                expect(function () {
                    thermostat.sendMessage('0x1000000', params);
                }).toThrow("Address 0x1000000 outside valid range");
            });
            it('should throw an exception with an invalid address 0x0', function () {
                expect(function () {
                    thermostat.sendMessage('0x0', params);
                }).toThrow("Address 0x0 outside valid range");
            });
        });
    });
    describe('MCZ_PELLET_STOVE_2_FAN', function () {
        beforeEach(function () {
            thermostat = new rfxcom.Thermostat4(device, rfxcom.thermostat4.MCZ_PELLET_STOVE_2_FAN);
        });
        describe('commands', function () {
            describe('sendMessage()', function () {
                it('should send the correct bytes to the serialport', function (done) {
                    const
                        params = {
                            beep: 0,
                            fanSpeed: 1,
                            flamePower: 1,
                            mode: "Man"
                        };
                    let sentCommandId = NaN;
                    thermostat.sendMessage('0x123456', params, function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x0c, 0x43, 0x01, 0x00, 0x12, 0x34, 0x56, 0x00, 0x01, 0x16, 0x01, 0x01, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
                it('should send the correct default parameters', function (done) {
                    const
                        params = {
                            flamePower: 1,
                            mode: "Man"
                        };
                    let sentCommandId = NaN;
                    thermostat.sendMessage('0x123456', params, function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x0c, 0x43, 0x01, 0x00, 0x12, 0x34, 0x56, 0x01, 0x06, 0x16, 0x01, 0x01, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
                it('should ignore excess fanSpeed values', function (done) {
                    const
                        params = {
                            beep: 99,
                            fanSpeed: [4, 3, 2],
                            flamePower: 4,
                            mode: "Eco"
                        };
                    let sentCommandId = NaN;
                    thermostat.sendMessage('0x123456', params, function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x0c, 0x43, 0x01, 0x00, 0x12, 0x34, 0x56, 0x01, 0x04, 0x13, 0x04, 0x03, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
                it('should accept a numeric mode', function (done) {
                    const
                        params = {
                            beep: null,
                            fanSpeed: [4],
                            flamePower: 4,
                            mode: 2
                        };
                    let sentCommandId = NaN;
                    thermostat.sendMessage('0x123456', params, function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x0c, 0x43, 0x01, 0x00, 0x12, 0x34, 0x56, 0x00, 0x04, 0x16, 0x04, 0x02, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
                it('should throw an exception with a missing params', function () {
                    expect(function() {
                        thermostat.sendMessage('0x123456');
                    }).toThrow("Missing params");
                });
                it('should throw an exception with a missing mode', function () {
                    const
                        params = {
                            beep: null,
                            fanSpeed: [4],
                            flamePower: 1
                        };
                    expect(function() {
                        thermostat.sendMessage('0x123456', params);
                    }).toThrow("mode parameter must be specified");
                });
                it('should throw an exception with an invalid mode', function () {
                    const
                        params = {
                            beep: null,
                            fanSpeed: [4],
                            flamePower: 1,
                            mode: 7
                        };
                    expect(function() {
                        thermostat.sendMessage('0x123456', params);
                    }).toThrow("Invalid parameter mode: must be in range 0-3");
                });
                it('should throw an exception with an invalid mode string', function () {
                    const
                        params = {
                            beep: null,
                            fanSpeed: [4],
                            flamePower: 1,
                            mode: "I am invalid!"
                        };
                    expect(function() {
                        thermostat.sendMessage('0x123456', params);
                    }).toThrow("Invalid parameter mode: 'I am invalid!'");
                });
                it('should throw an exception with a missing flamePower', function () {
                    const
                        params = {
                            beep: null,
                            fanSpeed: [4],
                            mode: 2
                        };
                    expect(function() {
                        thermostat.sendMessage('0x123456', params);
                    }).toThrow("Invalid parameter flamePower: must be in range 1-5");
                });
            });
        });
        describe('address checking', function () {
            const
                params = {
                    beep: 0,
                    fanSpeed: 1,
                    flamePower: 1,
                    mode: "Man"
                };
            it('should throw an exception with an invalid deviceId format', function () {
                expect(function () {
                    thermostat.sendMessage('0x1234/A', params);
                }).toThrow("Invalid deviceId format");
            });
            it('should accept the highest address', function (done) {
                let sentCommandId = NaN;
                thermostat.sendMessage('0xffffff', params, function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0c, 0x43, 0x01, 0x00, 0xff, 0xff, 0xff, 0x00, 0x01, 0x16, 0x01, 0x01, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should accept the lowest address', function (done) {
                let sentCommandId = NaN;
                thermostat.sendMessage('0x1', params, function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0c, 0x43, 0x01, 0x00, 0x00, 0x00, 0x01, 0x00, 0x01, 0x16, 0x01, 0x01, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should throw an exception with an invalid address 0x1000000', function () {
                expect(function () {
                    thermostat.sendMessage('0x1000000', params);
                }).toThrow("Address 0x1000000 outside valid range");
            });
            it('should throw an exception with an invalid address 0x0', function () {
                expect(function () {
                    thermostat.sendMessage('0x0', params);
                }).toThrow("Address 0x0 outside valid range");
            });
        });
    });
    describe('MCZ_PELLET_STOVE_3_FAN', function () {
        beforeEach(function () {
            thermostat = new rfxcom.Thermostat4(device, rfxcom.thermostat4.MCZ_PELLET_STOVE_3_FAN);
        });
        describe('commands', function () {
            describe('sendMessage()', function () {
                it('should send the correct bytes to the serialport', function (done) {
                    const
                        params = {
                            beep: 0,
                            fanSpeed: 1,
                            flamePower: 1,
                            mode: "Man"
                        };
                    let sentCommandId = NaN;
                    thermostat.sendMessage('0x123456', params, function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x0c, 0x43, 0x02, 0x00, 0x12, 0x34, 0x56, 0x00, 0x01, 0x66, 0x01, 0x01, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
                it('should send the correct default parameters', function (done) {
                    const
                        params = {
                            flamePower: 1,
                            mode: "Man"
                        };
                    let sentCommandId = NaN;
                    thermostat.sendMessage('0x123456', params, function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x0c, 0x43, 0x02, 0x00, 0x12, 0x34, 0x56, 0x01, 0x06, 0x66, 0x01, 0x01, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
                it('should ignore excess fanSpeed values', function (done) {
                    const
                        params = {
                            beep: 99,
                            fanSpeed: [4, 3, 2],
                            flamePower: 4,
                            mode: "Eco"
                        };
                    let sentCommandId = NaN;
                    thermostat.sendMessage('0x123456', params, function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x0c, 0x43, 0x02, 0x00, 0x12, 0x34, 0x56, 0x01, 0x04, 0x23, 0x04, 0x03, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
                it('should accept a numeric mode', function (done) {
                    const
                        params = {
                            beep: null,
                            fanSpeed: [4],
                            flamePower: 4,
                            mode: 2
                        };
                    let sentCommandId = NaN;
                    thermostat.sendMessage('0x123456', params, function (err, response, cmdId) {
                        sentCommandId = cmdId;
                        done();
                    });
                    expect(fakeSerialPort).toHaveSent([0x0c, 0x43, 0x02, 0x00, 0x12, 0x34, 0x56, 0x00, 0x04, 0x66, 0x04, 0x02, 0x00]);
                    expect(sentCommandId).toEqual(0);
                });
                it('should throw an exception with a missing params', function () {
                    expect(function() {
                        thermostat.sendMessage('0x123456');
                    }).toThrow("Missing params");
                });
                it('should throw an exception with a missing mode', function () {
                    const
                        params = {
                            beep: null,
                            fanSpeed: [4],
                            flamePower: 1
                        };
                    expect(function() {
                        thermostat.sendMessage('0x123456', params);
                    }).toThrow("mode parameter must be specified");
                });
                it('should throw an exception with an invalid mode', function () {
                    const
                        params = {
                            beep: null,
                            fanSpeed: [4],
                            flamePower: 1,
                            mode: 7
                        };
                    expect(function() {
                        thermostat.sendMessage('0x123456', params);
                    }).toThrow("Invalid parameter mode: must be in range 0-3");
                });
                it('should throw an exception with an invalid mode string', function () {
                    const
                        params = {
                            beep: null,
                            fanSpeed: [4],
                            flamePower: 1,
                            mode: "I am invalid!"
                        };
                    expect(function() {
                        thermostat.sendMessage('0x123456', params);
                    }).toThrow("Invalid parameter mode: 'I am invalid!'");
                });
                it('should throw an exception with a missing flamePower', function () {
                    const
                        params = {
                            beep: null,
                            fanSpeed: [4],
                            mode: 2
                        };
                    expect(function() {
                        thermostat.sendMessage('0x123456', params);
                    }).toThrow("Invalid parameter flamePower: must be in range 1-5");
                });
            });
        });
        describe('address checking', function () {
            const
                params = {
                    beep: 0,
                    fanSpeed: 1,
                    flamePower: 1,
                    mode: "Man"
                };
            it('should throw an exception with an invalid deviceId format', function () {
                expect(function () {
                    thermostat.sendMessage('0x1234/A', params);
                }).toThrow("Invalid deviceId format");
            });
            it('should accept the highest address', function (done) {
                let sentCommandId = NaN;
                thermostat.sendMessage('0xffffff', params, function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0c, 0x43, 0x02, 0x00, 0xff, 0xff, 0xff, 0x00, 0x01, 0x66, 0x01, 0x01, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should accept the lowest address', function (done) {
                let sentCommandId = NaN;
                thermostat.sendMessage('0x1', params, function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x0c, 0x43, 0x02, 0x00, 0x00, 0x00, 0x01, 0x00, 0x01, 0x66, 0x01, 0x01, 0x00]);
                expect(sentCommandId).toEqual(0);
            });
            it('should throw an exception with an invalid address 0x1000000', function () {
                expect(function () {
                    thermostat.sendMessage('0x1000000', params);
                }).toThrow("Address 0x1000000 outside valid range");
            });
            it('should throw an exception with an invalid address 0x0', function () {
                expect(function () {
                    thermostat.sendMessage('0x0', params);
                }).toThrow("Address 0x0 outside valid range");
            });
        });
    });
});

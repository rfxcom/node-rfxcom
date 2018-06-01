var rfxcom = require('../lib'),
    util = require('util'),
    matchers = require('./matchers'),
    FakeSerialPort = require('./helper');

describe('Blinds1 class', function () {
    var blinds1,
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
                blinds1 = new rfxcom.Blinds1(device);
            }).toThrow("Must provide a subtype.");
        });
    });

    // BLINDS_T0 test
    describe('.BLINDS_T0', function () {
        beforeEach(function () {
            blinds1 = new rfxcom.Blinds1(device, rfxcom.blinds1.BLINDS_T0);
        });
        it('should send the correct bytes for an open() command to the serialport', function (done) {
            var sentCommandId = NaN;
            blinds1.open('0x1234/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x00, 0x00, 0x00, 0x12, 0x34, 0x05, 0x00, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should accept an array deviceId', function (done) {
            var sentCommandId = NaN;
            blinds1.close(['0x1234', '5'], function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x00, 0x00, 0x00, 0x12, 0x34, 0x05, 0x01, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should log the bytes being sent in debug mode', function (done) {
            var debugDevice = new rfxcom.RfxCom('/dev/ttyUSB0', {
                    port:  fakeSerialPort,
                    debug: true
                }),
                debug = new rfxcom.Blinds1(debugDevice, rfxcom.blinds1.BLINDS_T0);
            debugDevice.connected = true;
            var utilLogSpy = spyOn(util, 'log');
            debug.open('0x1234/5', done);
            expect(utilLogSpy).toHaveBeenCalledWith('[rfxcom] on /dev/ttyUSB0 - Sent    : 09,19,00,00,00,12,34,05,00,00');
            debugDevice.acknowledge[0]();
        });
        it('should send the correct bytes for a close() command to the serialport', function (done) {
            var sentCommandId = NaN;
            blinds1.close('0x1234/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x00, 0x00, 0x00, 0x12, 0x34, 0x05, 0x01, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should send the correct bytes for a stop() command to the serialport', function (done) {
            var sentCommandId = NaN;
            blinds1.stop('0x1234/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x00, 0x00, 0x00, 0x12, 0x34, 0x05, 0x02, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should send the correct bytes for a confirm() command to the serialport', function (done) {
            var sentCommandId = NaN;
            blinds1.confirm('0x1234/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x00, 0x00, 0x00, 0x12, 0x34, 0x05, 0x03, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should send the correct bytes for a setLimit() command to the serialport', function (done) {
            var sentCommandId = NaN;
            blinds1.setLimit('0x1234/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x00, 0x00, 0x00, 0x12, 0x34, 0x05, 0x04, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should throw an error for down() command', function () {
            expect(function () {
                blinds1.down('0x1234/5')
            }).toThrow("Device does not support down()");
        });
        it('should throw an error for up() command', function () {
            expect(function () {
                blinds1.up('0x1234/5')
            }).toThrow("Device does not support up()");
        });
        it('should throw an error for setLowerLimit() command', function () {
            expect(function () {
                blinds1.setLowerLimit('0x1234/5')
            }).toThrow("Device does not support setLowerLimit()");
        });
        it('should throw an error for reverse() command', function () {
            expect(function () {
                blinds1.reverse('0x1234/5')
            }).toThrow("Device does not support reverse()");
        });
        it('should throw an error for address < 1', function () {
            expect(function () {
                blinds1.open('0x0/5')
            }).toThrow("Address 0x0 outside valid range");
        });
        it('should accept address = 0x1', function (done) {
            var sentCommandId = NaN;
            blinds1.open('0x1/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x00, 0x00, 0x00, 0x00, 0x01, 0x05, 0x00, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should accept address = 0xffff', function (done) {
            var sentCommandId = NaN;
            blinds1.open('0xffff/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x00, 0x00, 0x00, 0xff, 0xff, 0x05, 0x00, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should throw an error for address > 0xffff', function () {
            expect(function () {
                blinds1.open('0x10000/5')
            }).toThrow("Address 0x10000 outside valid range");
        });
        it('should accept unitcode = 0x0', function (done) {
            var sentCommandId = NaN;
            blinds1.open('0x1234/0', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x00, 0x00, 0x00, 0x12, 0x34, 0x00, 0x00, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should accept unitcode = 0xf', function (done) {
            var sentCommandId = NaN;
            blinds1.open('0x1234/0xf', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x00, 0x00, 0x00, 0x12, 0x34, 0x0f, 0x00, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should throw an error for unit code > 0xf', function () {
            expect(function () {
                blinds1.open('0x1234/0x10')
            }).toThrow("Invalid unit code 0x10");
        });
    });

    // BLINDS_T1 test
    describe('.BLINDS_T1', function () {
        beforeEach(function () {
            blinds1 = new rfxcom.Blinds1(device, rfxcom.blinds1.BLINDS_T1);
        });
        it('should send the correct bytes for an open() command to the serialport', function (done) {
            var sentCommandId = NaN;
            blinds1.open('0x1234/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x01, 0x00, 0x00, 0x12, 0x34, 0x05, 0x00, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should accept an array deviceId', function (done) {
            var sentCommandId = NaN;
            blinds1.close(['0x1234', '5'], function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x01, 0x00, 0x00, 0x12, 0x34, 0x05, 0x01, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should send the correct bytes for a close() command to the serialport', function (done) {
            var sentCommandId = NaN;
            blinds1.close('0x1234/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x01, 0x00, 0x00, 0x12, 0x34, 0x05, 0x01, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should send the correct bytes for a stop() command to the serialport', function (done) {
            var sentCommandId = NaN;
            blinds1.stop('0x1234/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x01, 0x00, 0x00, 0x12, 0x34, 0x05, 0x02, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should send the correct bytes for a confirm() command to the serialport', function (done) {
            var sentCommandId = NaN;
            blinds1.confirm('0x1234/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x01, 0x00, 0x00, 0x12, 0x34, 0x05, 0x03, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should send the correct bytes for a setLimit() command to the serialport', function (done) {
            var sentCommandId = NaN;
            blinds1.setLimit('0x1234/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x01, 0x00, 0x00, 0x12, 0x34, 0x05, 0x04, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should throw an error for down() command', function () {
            expect(function () {
                blinds1.down('0x1234/5')
            }).toThrow("Device does not support down()");
        });
        it('should throw an error for up() command', function () {
            expect(function () {
                blinds1.up('0x1234/5')
            }).toThrow("Device does not support up()");
        });
        it('should throw an error for setLowerLimit() command', function () {
            expect(function () {
                blinds1.setLowerLimit('0x1234/5')
            }).toThrow("Device does not support setLowerLimit()");
        });
        it('should throw an error for reverse() command', function () {
            expect(function () {
                blinds1.reverse('0x1234/5')
            }).toThrow("Device does not support reverse()");
        });
        it('should throw an error for address < 1', function () {
            expect(function () {
                blinds1.open('0x0/5')
            }).toThrow("Address 0x0 outside valid range");
        });
        it('should accept address = 0x1', function (done) {
            var sentCommandId = NaN;
            blinds1.open('0x1/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x01, 0x00, 0x00, 0x00, 0x01, 0x05, 0x00, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should accept address = 0xffff', function (done) {
            var sentCommandId = NaN;
            blinds1.open('0xffff/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x01, 0x00, 0x00, 0xff, 0xff, 0x05, 0x00, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should throw an error for address > 0xffff', function () {
            expect(function () {
                blinds1.open('0x10000/5')
            }).toThrow("Address 0x10000 outside valid range");
        });
        it('should accept unitcode = 0x0', function (done) {
            var sentCommandId = NaN;
            blinds1.open('0x1234/0', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x01, 0x00, 0x00, 0x12, 0x34, 0x00, 0x00, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should accept unitcode = 0xf', function (done) {
            var sentCommandId = NaN;
            blinds1.open('0x1234/0xf', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x01, 0x00, 0x00, 0x12, 0x34, 0x0f, 0x00, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should throw an error for unit code > 0xf', function () {
            expect(function () {
                blinds1.open('0x1234/0x10')
            }).toThrow("Invalid unit code 0x10");
        });
    });

    // BLINDS_T2 test
    describe('.BLINDS_T2', function () {
        beforeEach(function () {
            blinds1 = new rfxcom.Blinds1(device, rfxcom.blinds1.BLINDS_T2);
        });
        it('should send the correct bytes for an open() command to the serialport', function (done) {
            var sentCommandId = NaN;
            blinds1.open('0x1234/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x02, 0x00, 0x00, 0x12, 0x34, 0x00, 0x00, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should accept an array deviceId', function (done) {
            var sentCommandId = NaN;
            blinds1.close(['0x1234', '5'], function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x02, 0x00, 0x00, 0x12, 0x34, 0x00, 0x01, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should accept a deviceId with no unit code', function (done) {
            var sentCommandId = NaN;
            blinds1.close(['0x1234'], function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x02, 0x00, 0x00, 0x12, 0x34, 0x00, 0x01, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should send the correct bytes for a close() command to the serialport', function (done) {
            var sentCommandId = NaN;
            blinds1.close('0x1234/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x02, 0x00, 0x00, 0x12, 0x34, 0x00, 0x01, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should send the correct bytes for a stop() command to the serialport', function (done) {
            var sentCommandId = NaN;
            blinds1.stop('0x1234/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x02, 0x00, 0x00, 0x12, 0x34, 0x00, 0x02, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should send the correct bytes for a confirm() command to the serialport', function (done) {
            var sentCommandId = NaN;
            blinds1.confirm('0x1234/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x02, 0x00, 0x00, 0x12, 0x34, 0x00, 0x03, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should throw an error for setLimit() command', function () {
            expect(function () {
                blinds1.setLimit('0x1234/5')
            }).toThrow("Device does not support setLimit()");
        });
        it('should throw an error for down() command', function () {
            expect(function () {
                blinds1.down('0x1234/5')
            }).toThrow("Device does not support down()");
        });
        it('should throw an error for up() command', function () {
            expect(function () {
                blinds1.up('0x1234/5')
            }).toThrow("Device does not support up()");
        });
        it('should throw an error for setLowerLimit() command', function () {
            expect(function () {
                blinds1.setLowerLimit('0x1234/5')
            }).toThrow("Device does not support setLowerLimit()");
        });
        it('should throw an error for reverse() command', function () {
            expect(function () {
                blinds1.reverse('0x1234/5')
            }).toThrow("Device does not support reverse()");
        });
        it('should throw an error for address < 1', function () {
            expect(function () {
                blinds1.open('0x0/5')
            }).toThrow("Address 0x0 outside valid range");
        });
        it('should accept address = 0x1', function (done) {
            var sentCommandId = NaN;
            blinds1.open('0x1/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x02, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should accept address = 0xffffff', function (done) {
            var sentCommandId = NaN;
            blinds1.open('0xffffff/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x02, 0x00, 0xff, 0xff, 0xff, 0x00, 0x00, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should throw an error for address > 0xffffffff', function () {
            expect(function () {
                blinds1.open('0x1000000/5')
            }).toThrow("Address 0x1000000 outside valid range");
        });
    });

    // BLINDS_T3 test
    describe('.BLINDS_T3', function () {
        beforeEach(function () {
            blinds1 = new rfxcom.Blinds1(device, rfxcom.blinds1.BLINDS_T3);
        });
        it('should send the correct bytes for an open() command to the serialport', function (done) {
            var sentCommandId = NaN;
            blinds1.open('0x1234/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x03, 0x00, 0x00, 0x12, 0x34, 0x00, 0x00, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should accept an array deviceId', function (done) {
            var sentCommandId = NaN;
            blinds1.close(['0x1234', '5'], function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x03, 0x00, 0x00, 0x12, 0x34, 0x00, 0x01, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should accept a deviceId with no unit code', function (done) {
            var sentCommandId = NaN;
            blinds1.close(['0x1234'], function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x03, 0x00, 0x00, 0x12, 0x34, 0x00, 0x01, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should send the correct bytes for a close() command to the serialport', function (done) {
            var sentCommandId = NaN;
            blinds1.close('0x1234/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x03, 0x00, 0x00, 0x12, 0x34, 0x00, 0x01, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should send the correct bytes for a stop() command to the serialport', function (done) {
            var sentCommandId = NaN;
            blinds1.stop('0x1234/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x03, 0x00, 0x00, 0x12, 0x34, 0x00, 0x02, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should send the correct bytes for a confirm() command to the serialport', function (done) {
            var sentCommandId = NaN;
            blinds1.confirm('0x1234/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x03, 0x00, 0x00, 0x12, 0x34, 0x00, 0x03, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should throw an error for setLimit() command', function () {
            expect(function () {
                blinds1.setLimit('0x1234/5')
            }).toThrow("Device does not support setLimit()");
        });
        it('should throw an error for down() command', function () {
            expect(function () {
                blinds1.down('0x1234/5')
            }).toThrow("Device does not support down()");
        });
        it('should throw an error for up() command', function () {
            expect(function () {
                blinds1.up('0x1234/5')
            }).toThrow("Device does not support up()");
        });
        it('should throw an error for setLowerLimit() command', function () {
            expect(function () {
                blinds1.setLowerLimit('0x1234/5')
            }).toThrow("Device does not support setLowerLimit()");
        });
        it('should throw an error for reverse() command', function () {
            expect(function () {
                blinds1.reverse('0x1234/5')
            }).toThrow("Device does not support reverse()");
        });
        it('should throw an error for address < 1', function () {
            expect(function () {
                blinds1.open('0x0/5')
            }).toThrow("Address 0x0 outside valid range");
        });
        it('should accept address = 0x1', function (done) {
            var sentCommandId = NaN;
            blinds1.open('0x1/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x03, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should accept address = 0xffffff', function (done) {
            var sentCommandId = NaN;
            blinds1.open('0xffffff/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x03, 0x00, 0xff, 0xff, 0xff, 0x00, 0x00, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should throw an error for address > 0xffffffff', function () {
            expect(function () {
                blinds1.open('0x1000000/5')
            }).toThrow("Address 0x1000000 outside valid range");
        });
    });

    // BLINDS_T4 test
    describe('.BLINDS_T4', function () {
        beforeEach(function () {
            blinds1 = new rfxcom.Blinds1(device, rfxcom.blinds1.BLINDS_T4);
        });
        it('should send the correct bytes for an open() command to the serialport', function (done) {
            var sentCommandId = NaN;
            blinds1.open('0x1234/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x04, 0x00, 0x00, 0x12, 0x34, 0x00, 0x00, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should accept an array deviceId', function (done) {
            var sentCommandId = NaN;
            blinds1.close(['0x1234', '5'], function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x04, 0x00, 0x00, 0x12, 0x34, 0x00, 0x01, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should accept a deviceId with no unit code', function (done) {
            var sentCommandId = NaN;
            blinds1.close(['0x1234'], function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x04, 0x00, 0x00, 0x12, 0x34, 0x00, 0x01, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should send the correct bytes for a close() command to the serialport', function (done) {
            var sentCommandId = NaN;
            blinds1.close('0x1234/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x04, 0x00, 0x00, 0x12, 0x34, 0x00, 0x01, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should send the correct bytes for a stop() command to the serialport', function (done) {
            var sentCommandId = NaN;
            blinds1.stop('0x1234/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x04, 0x00, 0x00, 0x12, 0x34, 0x00, 0x02, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should send the correct bytes for a confirm() command to the serialport', function (done) {
            var sentCommandId = NaN;
            blinds1.confirm('0x1234/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x04, 0x00, 0x00, 0x12, 0x34, 0x00, 0x03, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should send the correct bytes for a setLimit() command to the serialport', function (done) {
            var sentCommandId = NaN;
            blinds1.setLimit('0x1234/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x04, 0x00, 0x00, 0x12, 0x34, 0x00, 0x04, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should throw an error for down() command', function () {
            expect(function () {
                blinds1.down('0x1234/5')
            }).toThrow("Device does not support down()");
        });
        it('should throw an error for up() command', function () {
            expect(function () {
                blinds1.up('0x1234/5')
            }).toThrow("Device does not support up()");
        });
        it('should send the correct bytes for a setLowerLimit() command to the serialport', function (done) {
            var sentCommandId = NaN;
            blinds1.setLowerLimit('0x1234/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x04, 0x00, 0x00, 0x12, 0x34, 0x00, 0x05, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should send the correct bytes for a reverse() command to the serialport', function (done) {
            var sentCommandId = NaN;
            blinds1.reverse('0x1234/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x04, 0x00, 0x00, 0x12, 0x34, 0x00, 0x07, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should throw an error for address < 1', function () {
            expect(function () {
                blinds1.open('0x0/5')
            }).toThrow("Address 0x0 outside valid range");
        });
        it('should accept address = 0x1', function (done) {
            var sentCommandId = NaN;
            blinds1.open('0x1/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x04, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should accept address = 0xffffff', function (done) {
            var sentCommandId = NaN;
            blinds1.open('0xffffff/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x04, 0x00, 0xff, 0xff, 0xff, 0x00, 0x00, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should throw an error for address > 0xffffffff', function () {
            expect(function () {
                blinds1.open('0x1000000/5')
            }).toThrow("Address 0x1000000 outside valid range");
        });
    });

    // BLINDS_T5 test
    describe('.BLINDS_T5', function () {
        beforeEach(function () {
            blinds1 = new rfxcom.Blinds1(device, rfxcom.blinds1.BLINDS_T5);
        });
        it('should send the correct bytes for an open() command to the serialport', function (done) {
            var sentCommandId = NaN;
            blinds1.open('0x1234/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x05, 0x00, 0x00, 0x12, 0x34, 0x00, 0x00, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should accept an array deviceId', function (done) {
            var sentCommandId = NaN;
            blinds1.close(['0x1234', '5'], function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x05, 0x00, 0x00, 0x12, 0x34, 0x00, 0x01, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should accept a deviceId with no unit code', function (done) {
            var sentCommandId = NaN;
            blinds1.close(['0x1234'], function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x05, 0x00, 0x00, 0x12, 0x34, 0x00, 0x01, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should send the correct bytes for a close() command to the serialport', function (done) {
            var sentCommandId = NaN;
            blinds1.close('0x1234/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x05, 0x00, 0x00, 0x12, 0x34, 0x00, 0x01, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should send the correct bytes for a stop() command to the serialport', function (done) {
            var sentCommandId = NaN;
            blinds1.stop('0x1234/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x05, 0x00, 0x00, 0x12, 0x34, 0x00, 0x02, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should throw an error for a confirm() command', function () {
            expect(function () {
                blinds1.confirm('0x1234/5')
            }).toThrow("Device does not support confirm()");
        });
        it('should throw an error for setLimit() command', function () {
            expect(function () {
                blinds1.setLimit('0x1234/5')
            }).toThrow("Device does not support setLimit()");
        });
        it('should send the correct bytes for a down() command to the serialport', function (done) {
            var sentCommandId = NaN;
            blinds1.down('0x1234/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x05, 0x00, 0x00, 0x12, 0x34, 0x00, 0x00, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should send the correct bytes for an up() command to the serialport', function (done) {
            var sentCommandId = NaN;
            blinds1.up('0x1234/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x05, 0x00, 0x00, 0x12, 0x34, 0x00, 0x01, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should throw an error for setLowerLimit() command', function () {
            expect(function () {
                blinds1.setLowerLimit('0x1234/5')
            }).toThrow("Device does not support setLowerLimit()");
        });
        it('should throw an error for reverse() command', function () {
            expect(function () {
                blinds1.reverse('0x1234/5')
            }).toThrow("Device does not support reverse()");
        });
        it('should throw an error for address < 1', function () {
            expect(function () {
                blinds1.open('0x0/5')
            }).toThrow("Address 0x0 outside valid range");
        });
        it('should accept address = 0x1', function (done) {
            var sentCommandId = NaN;
            blinds1.open('0x1/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x05, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should accept address = 0xffffff', function (done) {
            var sentCommandId = NaN;
            blinds1.open('0xffffff/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x05, 0x00, 0xff, 0xff, 0xff, 0x00, 0x00, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should throw an error for address > 0xffffffff', function () {
            expect(function () {
                blinds1.open('0x1000000/5')
            }).toThrow("Address 0x1000000 outside valid range");
        });
    });

    // BLINDS_T6 test
    describe('.BLINDS_T6', function () {
        beforeEach(function () {
            blinds1 = new rfxcom.Blinds1(device, rfxcom.blinds1.BLINDS_T6);
        });
        it('should send the correct bytes for an open() command to the serialport', function (done) {
            var sentCommandId = NaN;
            blinds1.open('0x1234/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x06, 0x00, 0x00, 0x01, 0x23, 0x45, 0x00, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should accept an array deviceId', function (done) {
            var sentCommandId = NaN;
            blinds1.close(['0x1234', '5'], function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x06, 0x00, 0x00, 0x01, 0x23, 0x45, 0x01, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should send the correct bytes for a close() command to the serialport', function (done) {
            var sentCommandId = NaN;
            blinds1.close('0x1234/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x06, 0x00, 0x00, 0x01, 0x23, 0x45, 0x01, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should send the correct bytes for a stop() command to the serialport', function (done) {
            var sentCommandId = NaN;
            blinds1.stop('0x1234/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x06, 0x00, 0x00, 0x01, 0x23, 0x45, 0x02, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should send the correct bytes for a confirm() command to the serialport', function (done) {
            var sentCommandId = NaN;
            blinds1.confirm('0x1234/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x06, 0x00, 0x00, 0x01, 0x23, 0x45, 0x03, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should throw an error for setLimit() command', function () {
            expect(function () {
                blinds1.setLimit('0x1234/5')
            }).toThrow("Device does not support setLimit()");
        });
        it('should throw an error for down() command', function () {
            expect(function () {
                blinds1.down('0x1234/5')
            }).toThrow("Device does not support down()");
        });
        it('should throw an error for up() command', function () {
            expect(function () {
                blinds1.up('0x1234/5')
            }).toThrow("Device does not support up()");
        });
        it('should throw an error for setLowerLimit() command', function () {
            expect(function () {
                blinds1.setLowerLimit('0x1234/5')
            }).toThrow("Device does not support setLowerLimit()");
        });
        it('should throw an error for reverse() command', function () {
            expect(function () {
                blinds1.reverse('0x1234/5')
            }).toThrow("Device does not support reverse()");
        });
        it('should throw an error for address < 1', function () {
            expect(function () {
                blinds1.open('0x0/5')
            }).toThrow("Address 0x0 outside valid range");
        });
        it('should accept address = 0x1', function (done) {
            var sentCommandId = NaN;
            blinds1.open('0x1/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x06, 0x00, 0x00, 0x00, 0x00, 0x15, 0x00, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should accept address = 0xfffffff', function (done) {
            var sentCommandId = NaN;
            blinds1.open('0xfffffff/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x06, 0x00, 0xff, 0xff, 0xff, 0xf5, 0x00, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should throw an error for address > 0xfffffff', function () {
            expect(function () {
                blinds1.open('0x10000000/5')
            }).toThrow("Address 0x10000000 outside valid range");
        });
        it('should accept unitcode = 0x0', function (done) {
            var sentCommandId = NaN;
            blinds1.open('0x1234/0', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x06, 0x00, 0x00, 0x01, 0x23, 0x40, 0x00, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should accept unitcode = 0xf', function (done) {
            var sentCommandId = NaN;
            blinds1.open('0x1234/0xf', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x06, 0x00, 0x00, 0x01, 0x23, 0x4f, 0x00, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should throw an error for unit code > 0xf', function () {
            expect(function () {
                blinds1.open('0x1234/0x10')
            }).toThrow("Invalid unit code 0x10");
        });
    });

    // BLINDS_T7 test
    describe('.BLINDS_T7', function () {
        beforeEach(function () {
            blinds1 = new rfxcom.Blinds1(device, rfxcom.blinds1.BLINDS_T7);
        });
        it('should send the correct bytes for an open() command to the serialport', function (done) {
            var sentCommandId = NaN;
            blinds1.open('0x1234/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x07, 0x00, 0x00, 0x01, 0x23, 0x45, 0x00, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should accept an array deviceId', function (done) {
            var sentCommandId = NaN;
            blinds1.close(['0x1234', '5'], function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x07, 0x00, 0x00, 0x01, 0x23, 0x45, 0x01, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should send the correct bytes for a close() command to the serialport', function (done) {
            var sentCommandId = NaN;
            blinds1.close('0x1234/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x07, 0x00, 0x00, 0x01, 0x23, 0x45, 0x01, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should send the correct bytes for a stop() command to the serialport', function (done) {
            var sentCommandId = NaN;
            blinds1.stop('0x1234/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x07, 0x00, 0x00, 0x01, 0x23, 0x45, 0x02, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should send the correct bytes for a confirm() command to the serialport', function (done) {
            var sentCommandId = NaN;
            blinds1.confirm('0x1234/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x07, 0x00, 0x00, 0x01, 0x23, 0x45, 0x03, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should throw an error for setLimit() command', function () {
            expect(function () {
                blinds1.setLimit('0x1234/5')
            }).toThrow("Device does not support setLimit()");
        });
        it('should throw an error for down() command', function () {
            expect(function () {
                blinds1.down('0x1234/5')
            }).toThrow("Device does not support down()");
        });
        it('should throw an error for up() command', function () {
            expect(function () {
                blinds1.up('0x1234/5')
            }).toThrow("Device does not support up()");
        });
        it('should throw an error for setLowerLimit() command', function () {
            expect(function () {
                blinds1.setLowerLimit('0x1234/5')
            }).toThrow("Device does not support setLowerLimit()");
        });
        it('should throw an error for reverse() command', function () {
            expect(function () {
                blinds1.reverse('0x1234/5')
            }).toThrow("Device does not support reverse()");
        });
        it('should throw an error for address < 1', function () {
            expect(function () {
                blinds1.open('0x0/5')
            }).toThrow("Address 0x0 outside valid range");
        });
        it('should accept address = 0x1', function (done) {
            var sentCommandId = NaN;
            blinds1.open('0x1/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x07, 0x00, 0x00, 0x00, 0x00, 0x15, 0x00, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should accept address = 0xfffffff', function (done) {
            var sentCommandId = NaN;
            blinds1.open('0xfffffff/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x07, 0x00, 0xff, 0xff, 0xff, 0xf5, 0x00, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should throw an error for address > 0xfffffff', function () {
            expect(function () {
                blinds1.open('0x10000000/5')
            }).toThrow("Address 0x10000000 outside valid range");
        });
        it('should accept unitcode = 0x0', function (done) {
            var sentCommandId = NaN;
            blinds1.open('0x1234/0', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x07, 0x00, 0x00, 0x01, 0x23, 0x40, 0x00, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should accept unitcode = 0xf', function (done) {
            var sentCommandId = NaN;
            blinds1.open('0x1234/0xf', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x07, 0x00, 0x00, 0x01, 0x23, 0x4f, 0x00, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should throw an error for unit code > 0xf', function () {
            expect(function () {
                blinds1.open('0x1234/0x10')
            }).toThrow("Invalid unit code 0x10");
        });
    });

    // BLINDS_T8 test
    describe('.BLINDS_T8', function () {
        beforeEach(function () {
            blinds1 = new rfxcom.Blinds1(device, rfxcom.blinds1.BLINDS_T8);
        });
        it('should send the correct bytes for an open() command to the serialport', function (done) {
            var sentCommandId = NaN;
            blinds1.open('0x123/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x08, 0x00, 0x00, 0x01, 0x23, 0x04, 0x00, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should accept an array deviceId', function (done) {
            var sentCommandId = NaN;
            blinds1.close(['0x123', '5'], function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x08, 0x00, 0x00, 0x01, 0x23, 0x04, 0x01, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should send the correct bytes for a close() command to the serialport', function (done) {
            var sentCommandId = NaN;
            blinds1.close('0x123/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x08, 0x00, 0x00, 0x01, 0x23, 0x04, 0x01, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should send the correct bytes for a stop() command to the serialport', function (done) {
            var sentCommandId = NaN;
            blinds1.stop('0x123/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x08, 0x00, 0x00, 0x01, 0x23, 0x04, 0x02, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should throw an error for a confirm() command', function () {
            expect(function () {
                blinds1.confirm('0x123/5')
            }).toThrow("Device does not support confirm()");
        });
        it('should throw an error for a setLimit() command', function () {
            expect(function () {
                blinds1.setLimit('0x123/5')
            }).toThrow("Device does not support setLimit()");
        });
        it('should send the correct bytes for a down() command', function (done) {
            var sentCommandId = NaN;
            blinds1.down('0x123/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x08, 0x00, 0x00, 0x01, 0x23, 0x04, 0x00, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should send the correct bytes for an up() command', function (done) {
            var sentCommandId = NaN;
            blinds1.close('0x123/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x08, 0x00, 0x00, 0x01, 0x23, 0x04, 0x01, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should throw an error for setLowerLimit() command', function () {
            expect(function () {
                blinds1.setLowerLimit('0x1234/5')
            }).toThrow("Device does not support setLowerLimit()");
        });
        it('should throw an error for reverse() command', function () {
            expect(function () {
                blinds1.reverse('0x1234/5')
            }).toThrow("Device does not support reverse()");
        });
        it('should throw an error for address < 1', function () {
            expect(function () {
                blinds1.open('0x0/5')
            }).toThrow("Address 0x0 outside valid range");
        });
        it('should accept address = 0x1', function (done) {
            var sentCommandId = NaN;
            blinds1.open('0x1/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x08, 0x00, 0x00, 0x00, 0x01, 0x04, 0x00, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should accept address = 0xfff', function (done) {
            var sentCommandId = NaN;
            blinds1.open('0xfff/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x08, 0x00, 0x00, 0x0f, 0xff, 0x04, 0x00, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should throw an error for address > 0xfff', function () {
            expect(function () {
                blinds1.open('0x1000/5')
            }).toThrow("Address 0x1000 outside valid range");
        });
        it('should throw an error for unitcode 0x0', function () {
            expect(function () {
                blinds1.open('0x123/0')
            }).toThrow("Subtype doesn't support group commands");
        });
        it('should accept unitcode = 0x1', function (done) {
            var sentCommandId = NaN;
            blinds1.open('0x123/1', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x08, 0x00, 0x00, 0x01, 0x23, 0x00, 0x00, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should accept unitcode = 0x6', function (done) {
            var sentCommandId = NaN;
            blinds1.open('0x123/0x6', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x08, 0x00, 0x00, 0x01, 0x23, 0x05, 0x00, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should throw an error for unit code > 0x6', function () {
            expect(function () {
                blinds1.open('0x123/0x7')
            }).toThrow("Invalid unit code 0x7");
        });
    });

    // BLINDS_T9 test
    describe('.BLINDS_T9', function () {
        beforeEach(function () {
            blinds1 = new rfxcom.Blinds1(device, rfxcom.blinds1.BLINDS_T9);
        });
        it('should send the correct bytes for an open() command to the serialport', function (done) {
            var sentCommandId = NaN;
            blinds1.open('0x12345/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x09, 0x00, 0x00, 0x12, 0x34, 0x55, 0x00, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should accept an array deviceId', function (done) {
            var sentCommandId = NaN;
            blinds1.close(['0x12345', '5'], function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x09, 0x00, 0x00, 0x12, 0x34, 0x55, 0x01, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should send the correct bytes for a close() command to the serialport', function (done) {
            var sentCommandId = NaN;
            blinds1.close('0x12345/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x09, 0x00, 0x00, 0x12, 0x34, 0x55, 0x01, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should send the correct bytes for a stop() command to the serialport', function (done) {
            var sentCommandId = NaN;
            blinds1.stop('0x12345/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x09, 0x00, 0x00, 0x12, 0x34, 0x55, 0x02, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should send the correct bytes for a confirm() command to the serialport', function (done) {
            var sentCommandId = NaN;
            blinds1.confirm('0x12345/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x09, 0x00, 0x00, 0x12, 0x34, 0x55, 0x03, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should send the correct bytes for a setLimit() command to the serialport', function (done) {
            var sentCommandId = NaN;
            blinds1.setLimit('0x12345/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x09, 0x00, 0x00, 0x12, 0x34, 0x55, 0x04, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should throw an error for down() command', function () {
            expect(function () {
                blinds1.down('0x12345/5')
            }).toThrow("Device does not support down()");
        });
        it('should throw an error for up() command', function () {
            expect(function () {
                blinds1.up('0x12345/5')
            }).toThrow("Device does not support up()");
        });
        it('should send the correct bytes for a setLowerLimit() command to the serialport', function (done) {
            var sentCommandId = NaN;
            blinds1.setLowerLimit('0x12345/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x09, 0x00, 0x00, 0x12, 0x34, 0x55, 0x05, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should send the correct bytes for a reverse() command to the serialport', function (done) {
            var sentCommandId = NaN;
            blinds1.reverse('0x12345/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x09, 0x00, 0x00, 0x12, 0x34, 0x55, 0x06, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should throw an error for address < 1', function () {
            expect(function () {
                blinds1.open('0x0/5')
            }).toThrow("Address 0x0 outside valid range");
        });
        it('should accept address = 0x1', function (done) {
            var sentCommandId = NaN;
            blinds1.open('0x1/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x09, 0x00, 0x00, 0x00, 0x00, 0x15, 0x00, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should accept address = 0xfffff', function (done) {
            var sentCommandId = NaN;
            blinds1.open('0xfffff/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x09, 0x00, 0x00, 0xff, 0xff, 0xf5, 0x00, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should throw an error for address > 0xfffff', function () {
            expect(function () {
                blinds1.open('0x100000/5')
            }).toThrow("Address 0x100000 outside valid range");
        });
        it('should accept unitcode = 0x0', function (done) {
            var sentCommandId = NaN;
            blinds1.open('0x12345/0', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x09, 0x00, 0x00, 0x12, 0x34, 0x50, 0x00, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should accept unitcode = 0x6', function (done) {
            var sentCommandId = NaN;
            blinds1.open('0x12345/0x6', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x09, 0x00, 0x00, 0x12, 0x34, 0x56, 0x00, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should throw an error for unit code > 0x6', function () {
            expect(function () {
                blinds1.open('0x12345/0x7')
            }).toThrow("Invalid unit code 0x7");
        });
    });

    // BLINDS_T10 test
    describe('.BLINDS_T10', function () {
        beforeEach(function () {
            blinds1 = new rfxcom.Blinds1(device, rfxcom.blinds1.BLINDS_T10);
        });
        it('should send the correct bytes for an open() command to the serialport', function (done) {
            var sentCommandId = NaN;
            blinds1.open('0x1234/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x0a, 0x00, 0x00, 0x12, 0x34, 0x00, 0x00, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should accept an array deviceId', function (done) {
            var sentCommandId = NaN;
            blinds1.close(['0x1234', '5'], function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x0a, 0x00, 0x00, 0x12, 0x34, 0x00, 0x01, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should accept a deviceId with no unit code', function (done) {
            var sentCommandId = NaN;
            blinds1.close(['0x1234'], function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x0a, 0x00, 0x00, 0x12, 0x34, 0x00, 0x01, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should send the correct bytes for a close() command to the serialport', function (done) {
            var sentCommandId = NaN;
            blinds1.close('0x1234/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x0a, 0x00, 0x00, 0x12, 0x34, 0x00, 0x01, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should send the correct bytes for a stop() command to the serialport', function (done) {
            var sentCommandId = NaN;
            blinds1.stop('0x1234/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x0a, 0x00, 0x00, 0x12, 0x34, 0x00, 0x02, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should send the correct bytes for a confirm() command to the serialport', function (done) {
            var sentCommandId = NaN;
            blinds1.confirm('0x1234/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x0a, 0x00, 0x00, 0x12, 0x34, 0x00, 0x03, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should throw an error for setLimit() command', function () {
            expect(function () {
                blinds1.setLimit('0x1234/5')
            }).toThrow("Device does not support setLimit()");
        });
        it('should send the correct bytes for a down() command to the serialport', function (done) {
            var sentCommandId = NaN;
            blinds1.down('0x1234/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x0a, 0x00, 0x00, 0x12, 0x34, 0x00, 0x00, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should send the correct bytes for an up() command to the serialport', function (done) {
            var sentCommandId = NaN;
            blinds1.up('0x1234/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x0a, 0x00, 0x00, 0x12, 0x34, 0x00, 0x01, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should throw an error for setLowerLimit() command', function () {
            expect(function () {
                blinds1.setLowerLimit('0x1234/5')
            }).toThrow("Device does not support setLowerLimit()");
        });
        it('should send the correct bytes for a reverse() command to the serialport', function (done) {
            var sentCommandId = NaN;
            blinds1.reverse('0x1234/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x0a, 0x00, 0x00, 0x12, 0x34, 0x00, 0x06, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should throw an error for address < 1', function () {
            expect(function () {
                blinds1.open('0x0/5')
            }).toThrow("Address 0x0 outside valid range");
        });
        it('should accept address = 0x1', function (done) {
            var sentCommandId = NaN;
            blinds1.open('0x1/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x0a, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should accept address = 0xffffff', function (done) {
            var sentCommandId = NaN;
            blinds1.open('0xffffff/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x0a, 0x00, 0xff, 0xff, 0xff, 0x00, 0x00, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should throw an error for address > 0xffffffff', function () {
            expect(function () {
                blinds1.open('0x1000000/5')
            }).toThrow("Address 0x1000000 outside valid range");
        });
    });

    // BLINDS_T11 test
    describe('.BLINDS_T11', function () {
        beforeEach(function () {
            blinds1 = new rfxcom.Blinds1(device, rfxcom.blinds1.BLINDS_T11);
        });
        it('should send the correct bytes for an open() command to the serialport', function (done) {
            var sentCommandId = NaN;
            blinds1.open('0x1234/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x0b, 0x00, 0x00, 0x12, 0x34, 0x00, 0x00, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should accept an array deviceId', function (done) {
            var sentCommandId = NaN;
            blinds1.close(['0x1234', '5'], function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x0b, 0x00, 0x00, 0x12, 0x34, 0x00, 0x01, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should accept a deviceId with no unit code', function (done) {
            var sentCommandId = NaN;
            blinds1.close(['0x1234'], function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x0b, 0x00, 0x00, 0x12, 0x34, 0x00, 0x01, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should send the correct bytes for a close() command to the serialport', function (done) {
            var sentCommandId = NaN;
            blinds1.close('0x1234/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x0b, 0x00, 0x00, 0x12, 0x34, 0x00, 0x01, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should send the correct bytes for a stop() command to the serialport', function (done) {
            var sentCommandId = NaN;
            blinds1.stop('0x1234/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x0b, 0x00, 0x00, 0x12, 0x34, 0x00, 0x02, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should send the correct bytes for a confirm() command to the serialport', function (done) {
            var sentCommandId = NaN;
            blinds1.confirm('0x1234/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x0b, 0x00, 0x00, 0x12, 0x34, 0x00, 0x03, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should throw an error for setLimit() command', function () {
            expect(function () {
                blinds1.setLimit('0x1234/5')
            }).toThrow("Device does not support setLimit()");
        });
        it('should throw an error for down() command', function () {
            expect(function () {
                blinds1.down('0x1234/5')
            }).toThrow("Device does not support down()");
        });
        it('should throw an error for up() command', function () {
            expect(function () {
                blinds1.up('0x1234/5')
            }).toThrow("Device does not support up()");
        });
        it('should throw an error for address < 1', function () {
            expect(function () {
                blinds1.open('0x0/5')
            }).toThrow("Address 0x0 outside valid range");
        });
        it('should throw an error for setLowerLimit() command', function () {
            expect(function () {
                blinds1.setLowerLimit('0x1234/5')
            }).toThrow("Device does not support setLowerLimit()");
        });
        it('should throw an error for reverse() command', function () {
            expect(function () {
                blinds1.reverse('0x1234/5')
            }).toThrow("Device does not support reverse()");
        });
        it('should accept address = 0x1', function (done) {
            var sentCommandId = NaN;
            blinds1.open('0x1/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x0b, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should accept address = 0xffffff', function (done) {
            var sentCommandId = NaN;
            blinds1.open('0xffffff/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x0b, 0x00, 0xff, 0xff, 0xff, 0x00, 0x00, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should throw an error for address > 0xffffffff', function () {
            expect(function () {
                blinds1.open('0x1000000/5')
            }).toThrow("Address 0x1000000 outside valid range");
        });
    });

    // BLINDS_T12 test
    describe('.BLINDS_T12', function () {
        beforeEach(function () {
            blinds1 = new rfxcom.Blinds1(device, rfxcom.blinds1.BLINDS_T12);
        });
        it('should send the correct bytes for an open() command to the serialport', function (done) {
            var sentCommandId = NaN;
            blinds1.open('0x1234/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x0c, 0x00, 0x00, 0x12, 0x34, 0x04, 0x00, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should accept an array deviceId', function (done) {
            var sentCommandId = NaN;
            blinds1.close(['0x1234', '5'], function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x0c, 0x00, 0x00, 0x12, 0x34, 0x04, 0x01, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should send the correct bytes for a close() command to the serialport', function (done) {
            var sentCommandId = NaN;
            blinds1.close('0x1234/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x0c, 0x00, 0x00, 0x12, 0x34, 0x04, 0x01, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should send the correct bytes for a stop() command to the serialport', function (done) {
            var sentCommandId = NaN;
            blinds1.stop('0x1234/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x0c, 0x00, 0x00, 0x12, 0x34, 0x04, 0x02, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should send the correct bytes for a confirm() command to the serialport', function (done) {
            var sentCommandId = NaN;
            blinds1.confirm('0x1234/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x0c, 0x00, 0x00, 0x12, 0x34, 0x04, 0x03, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should throw an error for a setLimit() command', function () {
            expect(function () {
                blinds1.setLimit('0x1234/5')
            }).toThrow("Device does not support setLimit()");
        });
        it('should throw an error for a down() command', function () {
            expect(function () {
                blinds1.down('0x1234/5')
            }).toThrow("Device does not support down()");
        });
        it('should throw an error for an up() command', function () {
            expect(function () {
                blinds1.up('0x1234/5')
            }).toThrow("Device does not support up()");
        });
        it('should throw an error for setLowerLimit() command', function () {
            expect(function () {
                blinds1.setLowerLimit('0x1234/5')
            }).toThrow("Device does not support setLowerLimit()");
        });
        it('should throw an error for reverse() command', function () {
            expect(function () {
                blinds1.reverse('0x1234/5')
            }).toThrow("Device does not support reverse()");
        });
        it('should throw an error for address < 1', function () {
            expect(function () {
                blinds1.open('0x0/5')
            }).toThrow("Address 0x0 outside valid range");
        });
        it('should accept address = 0x1', function (done) {
            var sentCommandId = NaN;
            blinds1.open('0x1/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x0c, 0x00, 0x00, 0x00, 0x01, 0x04, 0x00, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should accept address = 0xffff', function (done) {
            var sentCommandId = NaN;
            blinds1.open('0xffff/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x0c, 0x00, 0x00, 0xff, 0xff, 0x04, 0x00, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should throw an error for address > 0xffff', function () {
            expect(function () {
                blinds1.open('0x10000/5')
            }).toThrow("Address 0x10000 outside valid range");
        });
        it('should send a group code (0x0f) for unitcode 0', function (done) {
            var sentCommandId = NaN;
            blinds1.open('0x1234/0', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x0c, 0x00, 0x00, 0x12, 0x34, 0x0f, 0x00, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should accept unitcode = 0x1', function (done) {
            var sentCommandId = NaN;
            blinds1.open('0x1234/1', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x0c, 0x00, 0x00, 0x12, 0x34, 0x00, 0x00, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should accept unitcode = 0xf', function (done) {
            var sentCommandId = NaN;
            blinds1.open('0x1234/0xf', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x0c, 0x00, 0x00, 0x12, 0x34, 0x0e, 0x00, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should throw an error for unit code > 0xf', function () {
            expect(function () {
                blinds1.open('0x1234/0x10')
            }).toThrow("Invalid unit code 0x10");
        });
    });

    // BLINDS_T13 test
    describe('.BLINDS_T13', function () {
        beforeEach(function () {
            blinds1 = new rfxcom.Blinds1(device, rfxcom.blinds1.BLINDS_T13);
        });
        it('should send the correct bytes for an open() command to the serialport', function (done) {
            var sentCommandId = NaN;
            blinds1.open('0x1234/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x0d, 0x00, 0x00, 0x12, 0x34, 0x05, 0x00, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should accept an array deviceId', function (done) {
            var sentCommandId = NaN;
            blinds1.close(['0x1234', '5'], function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x0d, 0x00, 0x00, 0x12, 0x34, 0x05, 0x01, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should send the correct bytes for a close() command to the serialport', function (done) {
            var sentCommandId = NaN;
            blinds1.close('0x1234/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x0d, 0x00, 0x00, 0x12, 0x34, 0x05, 0x01, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should throw an error for a stop() command', function () {
            expect(function () {
                blinds1.stop('0x1234/5')
            }).toThrow("Device does not support stop()");
        });
        it('should send the correct bytes for a confirm() command to the serialport', function (done) {
            var sentCommandId = NaN;
            blinds1.confirm('0x1234/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x0d, 0x00, 0x00, 0x12, 0x34, 0x05, 0x02, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should throw an error for a setLimit() command', function () {
            expect(function () {
                blinds1.setLimit('0x1234/5')
            }).toThrow("Device does not support setLimit()");
        });
        it('should throw an error for a down() command', function () {
            expect(function () {
                blinds1.down('0x1234/5')
            }).toThrow("Device does not support down()");
        });
        it('should throw an error for an up() command', function () {
            expect(function () {
                blinds1.up('0x1234/5')
            }).toThrow("Device does not support up()");
        });
        it('should throw an error for address < 1', function () {
            expect(function () {
                blinds1.open('0x0/5')
            }).toThrow("Address 0x0 outside valid range");
        });
        it('should throw an error for setLowerLimit() command', function () {
            expect(function () {
                blinds1.setLowerLimit('0x1234/5')
            }).toThrow("Device does not support setLowerLimit()");
        });
        it('should throw an error for reverse() command', function () {
            expect(function () {
                blinds1.reverse('0x1234/5')
            }).toThrow("Device does not support reverse()");
        });
        it('should send the correct bytes for a venetianIncreaseAngle() command to the serialport', function (done) {
            var sentCommandId = NaN;
            blinds1.venetianIncreaseAngle('0x1234/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x0d, 0x00, 0x00, 0x12, 0x34, 0x05, 0x04, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should send the correct bytes for a venetianDecreaseAngle() command to the serialport', function (done) {
            var sentCommandId = NaN;
            blinds1.venetianDecreaseAngle('0x1234/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x0d, 0x00, 0x00, 0x12, 0x34, 0x05, 0x05, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should accept address = 0x1', function (done) {
            var sentCommandId = NaN;
            blinds1.open('0x1/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x0d, 0x00, 0x00, 0x00, 0x01, 0x05, 0x00, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should accept address = 0xffff', function (done) {
            var sentCommandId = NaN;
            blinds1.open('0xffff/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x0d, 0x00, 0x00, 0xff, 0xff, 0x05, 0x00, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should throw an error for address > 0xffff', function () {
            expect(function () {
                blinds1.open('0x10000/5')
            }).toThrow("Address 0x10000 outside valid range");
        });
        it('should accept unitcode = 0x10', function (done) {
            var sentCommandId = NaN;
            blinds1.open('0x1234/0', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x0d, 0x00, 0x00, 0x12, 0x34, 0x00, 0x00, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should accept unitcode = 0x1', function (done) {
            var sentCommandId = NaN;
            blinds1.open('0x1234/1', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x0d, 0x00, 0x00, 0x12, 0x34, 0x01, 0x00, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should accept unitcode = 99', function (done) {
            var sentCommandId = NaN;
            blinds1.open('0x1234/99', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x0d, 0x00, 0x00, 0x12, 0x34, 0x63, 0x00, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should throw an error for unit code > 99', function () {
            expect(function () {
                blinds1.open('0x1234/100')
            }).toThrow("Invalid unit code 100");
        });
    });
});
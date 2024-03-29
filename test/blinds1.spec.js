const rfxcom = require('../lib'),
    util = require('util'),
    matchers = require('./matchers'),
    FakeSerialPort = require('./helper');

describe('Blinds1 class', function () {
    let blinds1,
        fakeSerialPort,
        device;
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

    describe('instantiation', function () {
        it('should throw an error if no subtype is specified', function () {
            expect(function () {
                blinds1 = new rfxcom.Blinds1(device);
            }).toThrow(new Error("Must provide a subtype."));
        });
    });

    // BLINDS_T0 test
    describe('.BLINDS_T0', function () {
        beforeEach(function () {
            blinds1 = new rfxcom.Blinds1(device, rfxcom.blinds1.BLINDS_T0);
        });
        it('should send the correct bytes for an open() command to the serialport', function (done) {
            let sentCommandId = NaN;
            blinds1.open('0x1234/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x00, 0x00, 0x00, 0x12, 0x34, 0x05, 0x00, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should accept an array deviceId', function (done) {
            let sentCommandId = NaN;
            blinds1.close(['0x1234', '5'], function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x00, 0x00, 0x00, 0x12, 0x34, 0x05, 0x01, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should log the bytes being sent in debug mode', function (done) {
            const debugDevice = new rfxcom.RfxCom('/dev/ttyUSB0', {
                    port:  fakeSerialPort,
                    debug: true
                }),
                debug = new rfxcom.Blinds1(debugDevice, rfxcom.blinds1.BLINDS_T0);
            debugDevice.connected = true;
            const debugLogSpy = spyOn(debugDevice, 'debugLog');
            debug.open('0x1234/5', done);
            expect(debugLogSpy).toHaveBeenCalledWith('Sent    : 09,19,00,00,00,12,34,05,00,00');
            debugDevice.acknowledge[0]();
        });
        it('should send the correct bytes for a close() command to the serialport', function (done) {
            let sentCommandId = NaN;
            blinds1.close('0x1234/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x00, 0x00, 0x00, 0x12, 0x34, 0x05, 0x01, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should send the correct bytes for a stop() command to the serialport', function (done) {
            let sentCommandId = NaN;
            blinds1.stop('0x1234/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x00, 0x00, 0x00, 0x12, 0x34, 0x05, 0x02, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should send the correct bytes for a confirm() command to the serialport', function (done) {
            let sentCommandId = NaN;
            blinds1.confirm('0x1234/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x00, 0x00, 0x00, 0x12, 0x34, 0x05, 0x03, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should throw an error for an intermediatePosition() command', function () {
            expect(function () {
                blinds1.intermediatePosition('0x1234/5', 0)
            }).toThrow(new Error("Device does not support intermediatePosition()"));
        });
        it('should send the correct bytes for a setLimit() command to the serialport', function (done) {
            let sentCommandId = NaN;
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
            }).toThrow(new Error("Device does not support down()"));
        });
        it('should throw an error for up() command', function () {
            expect(function () {
                blinds1.up('0x1234/5')
            }).toThrow(new Error(("Device does not support up()")));
        });
        it('should throw an error for setLowerLimit() command', function () {
            expect(function () {
                blinds1.setLowerLimit('0x1234/5')
            }).toThrow(new Error("Device does not support setLowerLimit()"));
        });
        it('should throw an error for reverse() command', function () {
            expect(function () {
                blinds1.reverse('0x1234/5')
            }).toThrow(new Error("Device does not support reverse()"));
        });
        it('should throw an error for address < 1', function () {
            expect(function () {
                blinds1.open('0x0/5')
            }).toThrow(new Error(("Address 0x0 outside valid range")));
        });
        it('should accept address = 0x1', function (done) {
            let sentCommandId = NaN;
            blinds1.open('0x1/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x00, 0x00, 0x00, 0x00, 0x01, 0x05, 0x00, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should accept address = 0xffff', function (done) {
            let sentCommandId = NaN;
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
            }).toThrow(new Error(("Address 0x10000 outside valid range")));
        });
        it('should accept unitcode = 0x0', function (done) {
            let sentCommandId = NaN;
            blinds1.open('0x1234/0', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x00, 0x00, 0x00, 0x12, 0x34, 0x00, 0x00, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should accept unitcode = 0xf', function (done) {
            let sentCommandId = NaN;
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
            }).toThrow(new Error(("Invalid unit code 0x10")));
        });
    });

    // BLINDS_T1 test
    describe('.BLINDS_T1', function () {
        beforeEach(function () {
            blinds1 = new rfxcom.Blinds1(device, rfxcom.blinds1.BLINDS_T1);
        });
        it('should send the correct bytes for an open() command to the serialport', function (done) {
            let sentCommandId = NaN;
            blinds1.open('0x1234/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x01, 0x00, 0x00, 0x12, 0x34, 0x05, 0x00, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should accept an array deviceId', function (done) {
            let sentCommandId = NaN;
            blinds1.close(['0x1234', '5'], function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x01, 0x00, 0x00, 0x12, 0x34, 0x05, 0x01, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should send the correct bytes for a close() command to the serialport', function (done) {
            let sentCommandId = NaN;
            blinds1.close('0x1234/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x01, 0x00, 0x00, 0x12, 0x34, 0x05, 0x01, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should send the correct bytes for a stop() command to the serialport', function (done) {
            let sentCommandId = NaN;
            blinds1.stop('0x1234/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x01, 0x00, 0x00, 0x12, 0x34, 0x05, 0x02, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should send the correct bytes for a confirm() command to the serialport', function (done) {
            let sentCommandId = NaN;
            blinds1.confirm('0x1234/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x01, 0x00, 0x00, 0x12, 0x34, 0x05, 0x03, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should throw an error for an intermediatePosition() command', function () {
            expect(function () {
                blinds1.intermediatePosition('0x1234/5')
            }).toThrow(new Error(("Device does not support intermediatePosition()")));
        });
        it('should send the correct bytes for a setLimit() command to the serialport', function (done) {
            let sentCommandId = NaN;
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
            }).toThrow(new Error(("Device does not support down()")));
        });
        it('should throw an error for up() command', function () {
            expect(function () {
                blinds1.up('0x1234/5')
            }).toThrow(new Error(("Device does not support up()")));
        });
        it('should throw an error for setLowerLimit() command', function () {
            expect(function () {
                blinds1.setLowerLimit('0x1234/5')
            }).toThrow(new Error(("Device does not support setLowerLimit()")));
        });
        it('should throw an error for reverse() command', function () {
            expect(function () {
                blinds1.reverse('0x1234/5')
            }).toThrow(new Error(("Device does not support reverse()")));
        });
        it('should throw an error for address < 1', function () {
            expect(function () {
                blinds1.open('0x0/5')
            }).toThrow(new Error(("Address 0x0 outside valid range")));
        });
        it('should accept address = 0x1', function (done) {
            let sentCommandId = NaN;
            blinds1.open('0x1/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x01, 0x00, 0x00, 0x00, 0x01, 0x05, 0x00, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should accept address = 0xffff', function (done) {
            let sentCommandId = NaN;
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
            }).toThrow(new Error(("Address 0x10000 outside valid range")));
        });
        it('should accept unitcode = 0x0', function (done) {
            let sentCommandId = NaN;
            blinds1.open('0x1234/0', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x01, 0x00, 0x00, 0x12, 0x34, 0x00, 0x00, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should accept unitcode = 0xf', function (done) {
            let sentCommandId = NaN;
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
            }).toThrow(new Error(("Invalid unit code 0x10")));
        });
    });

    // BLINDS_T2 test
    describe('.BLINDS_T2', function () {
        beforeEach(function () {
            blinds1 = new rfxcom.Blinds1(device, rfxcom.blinds1.BLINDS_T2);
        });
        it('should send the correct bytes for an open() command to the serialport', function (done) {
            let sentCommandId = NaN;
            blinds1.open('0x1234/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x02, 0x00, 0x00, 0x12, 0x34, 0x00, 0x00, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should accept an array deviceId', function (done) {
            let sentCommandId = NaN;
            blinds1.close(['0x1234', '5'], function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x02, 0x00, 0x00, 0x12, 0x34, 0x00, 0x01, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should accept a deviceId with no unit code', function (done) {
            let sentCommandId = NaN;
            blinds1.close(['0x1234'], function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x02, 0x00, 0x00, 0x12, 0x34, 0x00, 0x01, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should send the correct bytes for a close() command to the serialport', function (done) {
            let sentCommandId = NaN;
            blinds1.close('0x1234/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x02, 0x00, 0x00, 0x12, 0x34, 0x00, 0x01, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should send the correct bytes for a stop() command to the serialport', function (done) {
            let sentCommandId = NaN;
            blinds1.stop('0x1234/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x02, 0x00, 0x00, 0x12, 0x34, 0x00, 0x02, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should send the correct bytes for a confirm() command to the serialport', function (done) {
            let sentCommandId = NaN;
            blinds1.confirm('0x1234/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x02, 0x00, 0x00, 0x12, 0x34, 0x00, 0x03, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should throw an error for an intermediatePosition() command', function () {
            expect(function () {
                blinds1.intermediatePosition('0x1234/5')
            }).toThrow(new Error(("Device does not support intermediatePosition()")));
        });
        it('should throw an error for setLimit() command', function () {
            expect(function () {
                blinds1.setLimit('0x1234/5')
            }).toThrow(new Error(("Device does not support setLimit()")));
        });
        it('should throw an error for down() command', function () {
            expect(function () {
                blinds1.down('0x1234/5')
            }).toThrow(new Error(("Device does not support down()")));
        });
        it('should throw an error for up() command', function () {
            expect(function () {
                blinds1.up('0x1234/5')
            }).toThrow(new Error(("Device does not support up()")));
        });
        it('should throw an error for setLowerLimit() command', function () {
            expect(function () {
                blinds1.setLowerLimit('0x1234/5')
            }).toThrow(new Error(("Device does not support setLowerLimit()")));
        });
        it('should throw an error for reverse() command', function () {
            expect(function () {
                blinds1.reverse('0x1234/5')
            }).toThrow(new Error(("Device does not support reverse()")));
        });
        it('should throw an error for address < 1', function () {
            expect(function () {
                blinds1.open('0x0/5')
            }).toThrow(new Error(("Address 0x0 outside valid range")));
        });
        it('should accept address = 0x1', function (done) {
            let sentCommandId = NaN;
            blinds1.open('0x1/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x02, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should accept address = 0xffffff', function (done) {
            let sentCommandId = NaN;
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
            }).toThrow(new Error(("Address 0x1000000 outside valid range")));
        });
    });

    // BLINDS_T3 test
    describe('.BLINDS_T3', function () {
        beforeEach(function () {
            blinds1 = new rfxcom.Blinds1(device, rfxcom.blinds1.BLINDS_T3);
        });
        it('should send the correct bytes for an open() command to the serialport', function (done) {
            let sentCommandId = NaN;
            blinds1.open('0x1234/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x03, 0x00, 0x00, 0x12, 0x34, 0x04, 0x00, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should accept an array deviceId', function (done) {
            let sentCommandId = NaN;
            blinds1.close(['0x1234', '5'], function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x03, 0x00, 0x00, 0x12, 0x34, 0x04, 0x01, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should throw an exception for a deviceId with no unit code', function () {
            expect(function () {
                blinds1.close(['0x1234']);
            }).toThrow(new Error(("Invalid deviceId format")));
        });
        it('should send the correct bytes for a close() command to the serialport', function (done) {
            let sentCommandId = NaN;
            blinds1.close('0x1234/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x03, 0x00, 0x00, 0x12, 0x34, 0x04, 0x01, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should send the correct bytes for a stop() command to the serialport', function (done) {
            let sentCommandId = NaN;
            blinds1.stop('0x1234/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x03, 0x00, 0x00, 0x12, 0x34, 0x04, 0x02, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should send the correct bytes for a confirm() command to the serialport', function (done) {
            let sentCommandId = NaN;
            blinds1.confirm('0x1234/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x03, 0x00, 0x00, 0x12, 0x34, 0x04, 0x03, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should throw an error for an intermediatePosition() command', function () {
            expect(function () {
                blinds1.intermediatePosition('0x1234/5')
            }).toThrow(new Error(("Device does not support intermediatePosition()")));
        });
        it('should throw an error for setLimit() command', function () {
            expect(function () {
                blinds1.setLimit('0x1234/5')
            }).toThrow(new Error(("Device does not support setLimit()")));
        });
        it('should throw an error for down() command', function () {
            expect(function () {
                blinds1.down('0x1234/5')
            }).toThrow(new Error(("Device does not support down()")));
        });
        it('should throw an error for up() command', function () {
            expect(function () {
                blinds1.up('0x1234/5')
            }).toThrow(new Error(("Device does not support up()")));
        });
        it('should throw an error for setLowerLimit() command', function () {
            expect(function () {
                blinds1.setLowerLimit('0x1234/5')
            }).toThrow(new Error(("Device does not support setLowerLimit()")));
        });
        it('should throw an error for reverse() command', function () {
            expect(function () {
                blinds1.reverse('0x1234/5')
            }).toThrow(new Error(("Device does not support reverse()")));
        });
        it('should throw an error for address < 1', function () {
            expect(function () {
                blinds1.open('0x0/5')
            }).toThrow(new Error(("Address 0x0 outside valid range")));
        });
        it('should accept address = 0x1', function (done) {
            let sentCommandId = NaN;
            blinds1.open('0x1/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x03, 0x00, 0x00, 0x00, 0x01, 0x04, 0x00, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should accept address = 0xffffff', function (done) {
            let sentCommandId = NaN;
            blinds1.open('0xffffff/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x03, 0x00, 0xff, 0xff, 0xff, 0x04, 0x00, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should throw an error for address > 0xffffffff', function () {
            expect(function () {
                blinds1.open('0x1000000/5')
            }).toThrow(new Error(("Address 0x1000000 outside valid range")));
        });
        it('should accept unit code 0 (all units)', function (done) {
            let sentCommandId = NaN;
            blinds1.open('0x1/0', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x03, 0x00, 0x00, 0x00, 0x01, 0x10, 0x00, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should accept unit code 1', function (done) {
            let sentCommandId = NaN;
            blinds1.open('0xffffff/1', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x03, 0x00, 0xff, 0xff, 0xff, 0x00, 0x00, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should accept unit code 16', function (done) {
            let sentCommandId = NaN;
            blinds1.open('0xffffff/16', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x03, 0x00, 0xff, 0xff, 0xff, 0x0f, 0x00, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should throw an error for unit code > 16', function () {
            expect(function () {
                blinds1.open('0x1/17')
            }).toThrow(new Error(("Invalid unit code 17")));
        });
    });

    // BLINDS_T4 test
    describe('.BLINDS_T4', function () {
        beforeEach(function () {
            blinds1 = new rfxcom.Blinds1(device, rfxcom.blinds1.BLINDS_T4);
        });
        it('should send the correct bytes for an open() command to the serialport', function (done) {
            let sentCommandId = NaN;
            blinds1.open('0x1234/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x04, 0x00, 0x00, 0x12, 0x34, 0x00, 0x00, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should accept an array deviceId', function (done) {
            let sentCommandId = NaN;
            blinds1.close(['0x1234', '5'], function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x04, 0x00, 0x00, 0x12, 0x34, 0x00, 0x01, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should accept a deviceId with no unit code', function (done) {
            let sentCommandId = NaN;
            blinds1.close(['0x1234'], function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x04, 0x00, 0x00, 0x12, 0x34, 0x00, 0x01, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should send the correct bytes for a close() command to the serialport', function (done) {
            let sentCommandId = NaN;
            blinds1.close('0x1234/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x04, 0x00, 0x00, 0x12, 0x34, 0x00, 0x01, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should send the correct bytes for a stop() command to the serialport', function (done) {
            let sentCommandId = NaN;
            blinds1.stop('0x1234/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x04, 0x00, 0x00, 0x12, 0x34, 0x00, 0x02, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should send the correct bytes for a confirm() command to the serialport', function (done) {
            let sentCommandId = NaN;
            blinds1.confirm('0x1234/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x04, 0x00, 0x00, 0x12, 0x34, 0x00, 0x03, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should throw an error for an intermediatePosition() command', function () {
            expect(function () {
                blinds1.intermediatePosition('0x1234/5')
            }).toThrow(new Error(("Device does not support intermediatePosition()")));
        });
        it('should send the correct bytes for a setLimit() command to the serialport', function (done) {
            let sentCommandId = NaN;
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
            }).toThrow(new Error(("Device does not support down()")));
        });
        it('should throw an error for up() command', function () {
            expect(function () {
                blinds1.up('0x1234/5')
            }).toThrow(new Error(("Device does not support up()")));
        });
        it('should send the correct bytes for a setLowerLimit() command to the serialport', function (done) {
            let sentCommandId = NaN;
            blinds1.setLowerLimit('0x1234/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x04, 0x00, 0x00, 0x12, 0x34, 0x00, 0x05, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should send the correct bytes for a reverse() command to the serialport', function (done) {
            let sentCommandId = NaN;
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
            }).toThrow(new Error(("Address 0x0 outside valid range")));
        });
        it('should accept address = 0x1', function (done) {
            let sentCommandId = NaN;
            blinds1.open('0x1/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x04, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should accept address = 0xffffff', function (done) {
            let sentCommandId = NaN;
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
            }).toThrow(new Error(("Address 0x1000000 outside valid range")));
        });
    });

    // BLINDS_T5 test
    describe('.BLINDS_T5', function () {
        beforeEach(function () {
            blinds1 = new rfxcom.Blinds1(device, rfxcom.blinds1.BLINDS_T5);
        });
        it('should send the correct bytes for an open() command to the serialport', function (done) {
            let sentCommandId = NaN;
            blinds1.open('0x1234/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x05, 0x00, 0x00, 0x12, 0x34, 0x00, 0x00, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should accept an array deviceId', function (done) {
            let sentCommandId = NaN;
            blinds1.close(['0x1234', '5'], function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x05, 0x00, 0x00, 0x12, 0x34, 0x00, 0x01, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should accept a deviceId with no unit code', function (done) {
            let sentCommandId = NaN;
            blinds1.close(['0x1234'], function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x05, 0x00, 0x00, 0x12, 0x34, 0x00, 0x01, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should send the correct bytes for a close() command to the serialport', function (done) {
            let sentCommandId = NaN;
            blinds1.close('0x1234/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x05, 0x00, 0x00, 0x12, 0x34, 0x00, 0x01, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should send the correct bytes for a stop() command to the serialport', function (done) {
            let sentCommandId = NaN;
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
            }).toThrow(new Error(("Device does not support confirm()")));
        });
        it('should throw an error for an intermediatePosition() command', function () {
            expect(function () {
                blinds1.intermediatePosition('0x1234/5')
            }).toThrow(new Error(("Device does not support intermediatePosition()")));
        });
        it('should throw an error for setLimit() command', function () {
            expect(function () {
                blinds1.setLimit('0x1234/5')
            }).toThrow(new Error(("Device does not support setLimit()")));
        });
        it('should send the correct bytes for a down() command to the serialport', function (done) {
            let sentCommandId = NaN;
            blinds1.down('0x1234/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x05, 0x00, 0x00, 0x12, 0x34, 0x00, 0x00, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should send the correct bytes for an up() command to the serialport', function (done) {
            let sentCommandId = NaN;
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
            }).toThrow(new Error(("Device does not support setLowerLimit()")));
        });
        it('should throw an error for reverse() command', function () {
            expect(function () {
                blinds1.reverse('0x1234/5')
            }).toThrow(new Error(("Device does not support reverse()")));
        });
        it('should throw an error for address < 1', function () {
            expect(function () {
                blinds1.open('0x0/5')
            }).toThrow(new Error(("Address 0x0 outside valid range")));
        });
        it('should accept address = 0x1', function (done) {
            let sentCommandId = NaN;
            blinds1.open('0x1/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x05, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should accept address = 0xffffff', function (done) {
            let sentCommandId = NaN;
            blinds1.open('0xffffff/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x05, 0x00, 0xff, 0xff, 0xff, 0x00, 0x00, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should throw an error for address > 0xffffff', function () {
            expect(function () {
                blinds1.open('0x1000000/5')
            }).toThrow(new Error(("Address 0x1000000 outside valid range")));
        });
    });

    // BLINDS_T6 test
    describe('.BLINDS_T6', function () {
        beforeEach(function () {
            blinds1 = new rfxcom.Blinds1(device, rfxcom.blinds1.BLINDS_T6);
        });
        it('should send the correct bytes for an open() command to the serialport', function (done) {
            let sentCommandId = NaN;
            blinds1.open('0x1234/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x06, 0x00, 0x00, 0x01, 0x23, 0x45, 0x00, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should accept an array deviceId', function (done) {
            let sentCommandId = NaN;
            blinds1.close(['0x1234', '5'], function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x06, 0x00, 0x00, 0x01, 0x23, 0x45, 0x01, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should send the correct bytes for a close() command to the serialport', function (done) {
            let sentCommandId = NaN;
            blinds1.close('0x1234/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x06, 0x00, 0x00, 0x01, 0x23, 0x45, 0x01, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should send the correct bytes for a stop() command to the serialport', function (done) {
            let sentCommandId = NaN;
            blinds1.stop('0x1234/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x06, 0x00, 0x00, 0x01, 0x23, 0x45, 0x02, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should send the correct bytes for a confirm() command to the serialport', function (done) {
            let sentCommandId = NaN;
            blinds1.confirm('0x1234/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x06, 0x00, 0x00, 0x01, 0x23, 0x45, 0x03, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should send the correct bytes for an intermediatePosition() command to the serialport', function (done) {
            let sentCommandId = NaN;
            blinds1.intermediatePosition('0x1234/5', 1, function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x06, 0x00, 0x00, 0x01, 0x23, 0x45, 0x04, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should handle an intermediatePosition() command with no position parameter', function (done) {
            let sentCommandId = NaN;
            blinds1.intermediatePosition('0x1234/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x06, 0x00, 0x00, 0x01, 0x23, 0x45, 0x04, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should throw an error for setLimit() command', function () {
            expect(function () {
                blinds1.setLimit('0x1234/5')
            }).toThrow(new Error(("Device does not support setLimit()")));
        });
        it('should throw an error for down() command', function () {
            expect(function () {
                blinds1.down('0x1234/5')
            }).toThrow(new Error(("Device does not support down()")));
        });
        it('should throw an error for up() command', function () {
            expect(function () {
                blinds1.up('0x1234/5')
            }).toThrow(new Error(("Device does not support up()")));
        });
        it('should throw an error for setLowerLimit() command', function () {
            expect(function () {
                blinds1.setLowerLimit('0x1234/5')
            }).toThrow(new Error(("Device does not support setLowerLimit()")));
        });
        it('should throw an error for reverse() command', function () {
            expect(function () {
                blinds1.reverse('0x1234/5')
            }).toThrow(new Error(("Device does not support reverse()")));
        });
        it('should send the correct bytes for a toggleLightOnOff() command to the serialport', function (done) {
            let sentCommandId = NaN;
            blinds1.toggleLightOnOff('0x1234/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x06, 0x00, 0x00, 0x01, 0x23, 0x45, 0x05, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should throw an error for address < 1', function () {
            expect(function () {
                blinds1.open('0x0/5')
            }).toThrow(new Error(("Address 0x0 outside valid range")));
        });
        it('should accept address = 0x1', function (done) {
            let sentCommandId = NaN;
            blinds1.open('0x1/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x06, 0x00, 0x00, 0x00, 0x00, 0x15, 0x00, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should accept address = 0xfffffff', function (done) {
            let sentCommandId = NaN;
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
            }).toThrow(new Error(("Address 0x10000000 outside valid range")));
        });
        it('should accept unitcode = 0x0', function (done) {
            let sentCommandId = NaN;
            blinds1.open('0x1234/0', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x06, 0x00, 0x00, 0x01, 0x23, 0x40, 0x00, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should accept unitcode = 0xf', function (done) {
            let sentCommandId = NaN;
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
            }).toThrow(new Error(("Invalid unit code 0x10")));
        });
    });

    // BLINDS_T7 test
    describe('.BLINDS_T7', function () {
        beforeEach(function () {
            blinds1 = new rfxcom.Blinds1(device, rfxcom.blinds1.BLINDS_T7);
        });
        it('should send the correct bytes for an open() command to the serialport', function (done) {
            let sentCommandId = NaN;
            blinds1.open('0x1234/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x07, 0x00, 0x00, 0x01, 0x23, 0x45, 0x00, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should accept an array deviceId', function (done) {
            let sentCommandId = NaN;
            blinds1.close(['0x1234', '5'], function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x07, 0x00, 0x00, 0x01, 0x23, 0x45, 0x01, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should send the correct bytes for a close() command to the serialport', function (done) {
            let sentCommandId = NaN;
            blinds1.close('0x1234/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x07, 0x00, 0x00, 0x01, 0x23, 0x45, 0x01, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should send the correct bytes for a stop() command to the serialport', function (done) {
            let sentCommandId = NaN;
            blinds1.stop('0x1234/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x07, 0x00, 0x00, 0x01, 0x23, 0x45, 0x02, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should send the correct bytes for a confirm() command to the serialport', function (done) {
            let sentCommandId = NaN;
            blinds1.confirm('0x1234/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x07, 0x00, 0x00, 0x01, 0x23, 0x45, 0x03, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should throw an error for an intermediatePosition() command', function () {
            expect(function () {
                blinds1.intermediatePosition('0x1234/5')
            }).toThrow(new Error(("Device does not support intermediatePosition()")));
        });
        it('should throw an error for setLimit() command', function () {
            expect(function () {
                blinds1.setLimit('0x1234/5')
            }).toThrow(new Error(("Device does not support setLimit()")));
        });
        it('should throw an error for down() command', function () {
            expect(function () {
                blinds1.down('0x1234/5')
            }).toThrow(new Error(("Device does not support down()")));
        });
        it('should throw an error for up() command', function () {
            expect(function () {
                blinds1.up('0x1234/5')
            }).toThrow(new Error(("Device does not support up()")));
        });
        it('should throw an error for setLowerLimit() command', function () {
            expect(function () {
                blinds1.setLowerLimit('0x1234/5')
            }).toThrow(new Error(("Device does not support setLowerLimit()")));
        });
        it('should throw an error for reverse() command', function () {
            expect(function () {
                blinds1.reverse('0x1234/5')
            }).toThrow(new Error(("Device does not support reverse()")));
        });
        it('should throw an error for address < 1', function () {
            expect(function () {
                blinds1.open('0x0/5')
            }).toThrow(new Error(("Address 0x0 outside valid range")));
        });
        it('should accept address = 0x1', function (done) {
            let sentCommandId = NaN;
            blinds1.open('0x1/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x07, 0x00, 0x00, 0x00, 0x00, 0x15, 0x00, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should accept address = 0xfffffff', function (done) {
            let sentCommandId = NaN;
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
            }).toThrow(new Error(("Address 0x10000000 outside valid range")));
        });
        it('should accept unitcode = 0x0', function (done) {
            let sentCommandId = NaN;
            blinds1.open('0x1234/0', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x07, 0x00, 0x00, 0x01, 0x23, 0x40, 0x00, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should accept unitcode = 0xf', function (done) {
            let sentCommandId = NaN;
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
            }).toThrow(new Error(("Invalid unit code 0x10")));
        });
    });

    // BLINDS_T8 test
    describe('.BLINDS_T8', function () {
        beforeEach(function () {
            blinds1 = new rfxcom.Blinds1(device, rfxcom.blinds1.BLINDS_T8);
        });
        it('should send the correct bytes for an open() command to the serialport', function (done) {
            let sentCommandId = NaN;
            blinds1.open('0x123/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x08, 0x00, 0x00, 0x01, 0x23, 0x04, 0x00, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should accept an array deviceId', function (done) {
            let sentCommandId = NaN;
            blinds1.close(['0x123', '5'], function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x08, 0x00, 0x00, 0x01, 0x23, 0x04, 0x01, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should send the correct bytes for a close() command to the serialport', function (done) {
            let sentCommandId = NaN;
            blinds1.close('0x123/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x08, 0x00, 0x00, 0x01, 0x23, 0x04, 0x01, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should send the correct bytes for a stop() command to the serialport', function (done) {
            let sentCommandId = NaN;
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
            }).toThrow(new Error(("Device does not support confirm()")));
        });
        it('should throw an error for an intermediatePosition() command', function () {
            expect(function () {
                blinds1.intermediatePosition('0x123/5')
            }).toThrow(new Error(("Device does not support intermediatePosition()")));
        });
        it('should throw an error for a setLimit() command', function () {
            expect(function () {
                blinds1.setLimit('0x123/5')
            }).toThrow(new Error(("Device does not support setLimit()")));
        });
        it('should send the correct bytes for a down() command', function (done) {
            let sentCommandId = NaN;
            blinds1.down('0x123/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x08, 0x00, 0x00, 0x01, 0x23, 0x04, 0x00, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should send the correct bytes for an up() command', function (done) {
            let sentCommandId = NaN;
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
            }).toThrow(new Error(("Device does not support setLowerLimit()")));
        });
        it('should throw an error for reverse() command', function () {
            expect(function () {
                blinds1.reverse('0x1234/5')
            }).toThrow(new Error(("Device does not support reverse()")));
        });
        it('should throw an error for address < 1', function () {
            expect(function () {
                blinds1.open('0x0/5')
            }).toThrow(new Error(("Address 0x0 outside valid range")));
        });
        it('should accept address = 0x1', function (done) {
            let sentCommandId = NaN;
            blinds1.open('0x1/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x08, 0x00, 0x00, 0x00, 0x01, 0x04, 0x00, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should accept address = 0xfff', function (done) {
            let sentCommandId = NaN;
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
            }).toThrow(new Error(("Address 0x1000 outside valid range")));
        });
        it('should throw an error for unitcode 0x0', function () {
            expect(function () {
                blinds1.open('0x123/0')
            }).toThrow(new Error(("Subtype doesn't support group commands")));
        });
        it('should accept unitcode = 0x1', function (done) {
            let sentCommandId = NaN;
            blinds1.open('0x123/1', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x08, 0x00, 0x00, 0x01, 0x23, 0x00, 0x00, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should accept unitcode = 0x6', function (done) {
            let sentCommandId = NaN;
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
            }).toThrow(new Error(("Invalid unit code 0x7")));
        });
    });

    // BLINDS_T9 test
    describe('.BLINDS_T9', function () {
        beforeEach(function () {
            blinds1 = new rfxcom.Blinds1(device, rfxcom.blinds1.BLINDS_T9);
        });
        it('should send the correct bytes for an open() command to the serialport', function (done) {
            let sentCommandId = NaN;
            blinds1.open('0x12345/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x09, 0x00, 0x00, 0x12, 0x34, 0x55, 0x00, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should accept an array deviceId', function (done) {
            let sentCommandId = NaN;
            blinds1.close(['0x12345', '5'], function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x09, 0x00, 0x00, 0x12, 0x34, 0x55, 0x01, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should send the correct bytes for a close() command to the serialport', function (done) {
            let sentCommandId = NaN;
            blinds1.close('0x12345/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x09, 0x00, 0x00, 0x12, 0x34, 0x55, 0x01, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should send the correct bytes for a stop() command to the serialport', function (done) {
            let sentCommandId = NaN;
            blinds1.stop('0x12345/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x09, 0x00, 0x00, 0x12, 0x34, 0x55, 0x02, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should send the correct bytes for a confirm() command to the serialport', function (done) {
            let sentCommandId = NaN;
            blinds1.confirm('0x12345/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x09, 0x00, 0x00, 0x12, 0x34, 0x55, 0x03, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should send the correct bytes for an intermediatePosition() command to the serialport', function (done) {
            let sentCommandId = NaN;
            blinds1.intermediatePosition('0x12345/5', 1, function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x09, 0x00, 0x00, 0x12, 0x34, 0x55, 0x07, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should handle an intermediatePosition() command with a string position parameter', function (done) {
            let sentCommandId = NaN;
            blinds1.intermediatePosition('0x12345/5', "2", function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x09, 0x00, 0x00, 0x12, 0x34, 0x55, 0x08, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should handle an intermediatePosition() command with a non-integer position parameter', function (done) {
            let sentCommandId = NaN;
            blinds1.intermediatePosition('0x12345/5', 3.1, function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x09, 0x00, 0x00, 0x12, 0x34, 0x55, 0x09, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should handle an intermediatePosition() command with no position parameter', function (done) {
            let sentCommandId = NaN;
            blinds1.intermediatePosition('0x12345/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x09, 0x00, 0x00, 0x12, 0x34, 0x55, 0x08, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should throw an error for an intermediatePosition() command with an invalid position parameter', function () {
            expect(function () {
                blinds1.intermediatePosition('0x12345/5', 0)
            }).toThrow(new Error(("Invalid position: value must be in range 1-3")));
        });
        it('should throw an error for an intermediatePosition() command with an invalid position parameter', function () {
            expect(function () {
                blinds1.intermediatePosition('0x12345/5', "Wombat")
            }).toThrow(new Error(("Invalid position: value must be in range 1-3")));
        });
        it('should send the correct bytes for a setLimit() command to the serialport', function (done) {
            let sentCommandId = NaN;
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
            }).toThrow(new Error(("Device does not support down()")));
        });
        it('should throw an error for up() command', function () {
            expect(function () {
                blinds1.up('0x12345/5')
            }).toThrow(new Error(("Device does not support up()")));
        });
        it('should send the correct bytes for a setLowerLimit() command to the serialport', function (done) {
            let sentCommandId = NaN;
            blinds1.setLowerLimit('0x12345/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x09, 0x00, 0x00, 0x12, 0x34, 0x55, 0x05, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should send the correct bytes for a reverse() command to the serialport', function (done) {
            let sentCommandId = NaN;
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
            }).toThrow(new Error(("Address 0x0 outside valid range")));
        });
        it('should accept address = 0x1', function (done) {
            let sentCommandId = NaN;
            blinds1.open('0x1/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x09, 0x00, 0x00, 0x00, 0x00, 0x15, 0x00, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should accept address = 0xfffff', function (done) {
            let sentCommandId = NaN;
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
            }).toThrow(new Error(("Address 0x100000 outside valid range")));
        });
        it('should accept unitcode = 0x0', function (done) {
            let sentCommandId = NaN;
            blinds1.open('0x12345/0', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x09, 0x00, 0x00, 0x12, 0x34, 0x50, 0x00, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should accept unitcode = 0x6', function (done) {
            let sentCommandId = NaN;
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
            }).toThrow(new Error(("Invalid unit code 0x7")));
        });
    });

    // BLINDS_T10 test
    describe('.BLINDS_T10', function () {
        beforeEach(function () {
            blinds1 = new rfxcom.Blinds1(device, rfxcom.blinds1.BLINDS_T10);
        });
        it('should send the correct bytes for an open() command to the serialport', function (done) {
            let sentCommandId = NaN;
            blinds1.open('0x1234/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x0a, 0x00, 0x00, 0x12, 0x34, 0x00, 0x00, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should accept an array deviceId', function (done) {
            let sentCommandId = NaN;
            blinds1.close(['0x1234', '5'], function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x0a, 0x00, 0x00, 0x12, 0x34, 0x00, 0x01, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should accept a deviceId with no unit code', function (done) {
            let sentCommandId = NaN;
            blinds1.close(['0x1234'], function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x0a, 0x00, 0x00, 0x12, 0x34, 0x00, 0x01, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should send the correct bytes for a close() command to the serialport', function (done) {
            let sentCommandId = NaN;
            blinds1.close('0x1234/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x0a, 0x00, 0x00, 0x12, 0x34, 0x00, 0x01, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should send the correct bytes for a stop() command to the serialport', function (done) {
            let sentCommandId = NaN;
            blinds1.stop('0x1234/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x0a, 0x00, 0x00, 0x12, 0x34, 0x00, 0x02, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should send the correct bytes for a confirm() command to the serialport', function (done) {
            let sentCommandId = NaN;
            blinds1.confirm('0x1234/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x0a, 0x00, 0x00, 0x12, 0x34, 0x00, 0x03, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should throw an error for an intermediatePosition() command', function () {
            expect(function () {
                blinds1.intermediatePosition('0x1234/5')
            }).toThrow(new Error(("Device does not support intermediatePosition()")));
        });
        it('should throw an error for setLimit() command', function () {
            expect(function () {
                blinds1.setLimit('0x1234/5')
            }).toThrow(new Error(("Device does not support setLimit()")));
        });
        it('should send the correct bytes for a down() command to the serialport', function (done) {
            let sentCommandId = NaN;
            blinds1.down('0x1234/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x0a, 0x00, 0x00, 0x12, 0x34, 0x00, 0x00, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should send the correct bytes for an up() command to the serialport', function (done) {
            let sentCommandId = NaN;
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
            }).toThrow(new Error(("Device does not support setLowerLimit()")));
        });
        it('should send the correct bytes for a reverse() command to the serialport', function (done) {
            let sentCommandId = NaN;
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
            }).toThrow(new Error(("Address 0x0 outside valid range")));
        });
        it('should accept address = 0x1', function (done) {
            let sentCommandId = NaN;
            blinds1.open('0x1/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x0a, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should accept address = 0xffffff', function (done) {
            let sentCommandId = NaN;
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
            }).toThrow(new Error(("Address 0x1000000 outside valid range")));
        });
    });

    // BLINDS_T11 test
    describe('.BLINDS_T11', function () {
        beforeEach(function () {
            blinds1 = new rfxcom.Blinds1(device, rfxcom.blinds1.BLINDS_T11);
        });
        it('should send the correct bytes for an open() command to the serialport', function (done) {
            let sentCommandId = NaN;
            blinds1.open('0x1234/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x0b, 0x00, 0x00, 0x12, 0x34, 0x05, 0x00, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should accept an array deviceId', function (done) {
            let sentCommandId = NaN;
            blinds1.close(['0x1234', '5'], function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x0b, 0x00, 0x00, 0x12, 0x34, 0x05, 0x01, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should send the correct bytes for a close() command to the serialport', function (done) {
            let sentCommandId = NaN;
            blinds1.close('0x1234/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x0b, 0x00, 0x00, 0x12, 0x34, 0x05, 0x01, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should send the correct bytes for a stop() command to the serialport', function (done) {
            let sentCommandId = NaN;
            blinds1.stop('0x1234/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x0b, 0x00, 0x00, 0x12, 0x34, 0x05, 0x02, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should send the correct bytes for a confirm() command to the serialport', function (done) {
            let sentCommandId = NaN;
            blinds1.confirm('0x1234/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x0b, 0x00, 0x00, 0x12, 0x34, 0x05, 0x03, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should throw an error for an intermediatePosition() command', function () {
            expect(function () {
                blinds1.intermediatePosition('0x1234/5')
            }).toThrow(new Error(("Device does not support intermediatePosition()")));
        });
        it('should throw an error for setLimit() command', function () {
            expect(function () {
                blinds1.setLimit('0x1234/5')
            }).toThrow(new Error(("Device does not support setLimit()")));
        });
        it('should throw an error for down() command', function () {
            expect(function () {
                blinds1.down('0x1234/5')
            }).toThrow(new Error(("Device does not support down()")));
        });
        it('should throw an error for up() command', function () {
            expect(function () {
                blinds1.up('0x1234/5')
            }).toThrow(new Error(("Device does not support up()")));
        });
        it('should throw an error for a missing unit code', function () {
            expect(function () {
                blinds1.open('0x1')
            }).toThrow(new Error(("Invalid deviceId format")));
        });
        it('should throw an error for address < 1', function () {
            expect(function () {
                blinds1.open('0x0/5')
            }).toThrow(new Error(("Address 0x0 outside valid range")));
        });
        it('should throw an error for setLowerLimit() command', function () {
            expect(function () {
                blinds1.setLowerLimit('0x1234/5')
            }).toThrow(new Error(("Device does not support setLowerLimit()")));
        });
        it('should throw an error for reverse() command', function () {
            expect(function () {
                blinds1.reverse('0x1234/5')
            }).toThrow(new Error(("Device does not support reverse()")));
        });
        it('should accept unit code = 0', function (done) {
            let sentCommandId = NaN;
            blinds1.open('0x1234/0', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x0b, 0x00, 0x00, 0x12, 0x34, 0x00, 0x00, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should accept unit code = 6', function (done) {
            let sentCommandId = NaN;
            blinds1.open('0x1234/6', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x0b, 0x00, 0x00, 0x12, 0x34, 0x06, 0x00, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should throw an error for unit code > 6', function () {
            expect(function () {
                blinds1.open('0x1234/7')
            }).toThrow(new Error(("Invalid unit code 7")));
        });
        it('should accept address = 0x1', function (done) {
            let sentCommandId = NaN;
            blinds1.open('0x1/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x0b, 0x00, 0x00, 0x00, 0x01, 0x05, 0x00, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should accept address = 0xffffff', function (done) {
            let sentCommandId = NaN;
            blinds1.open('0xffffff/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x0b, 0x00, 0xff, 0xff, 0xff, 0x05, 0x00, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should throw an error for address > 0xffffffff', function () {
            expect(function () {
                blinds1.open('0x1000000/5')
            }).toThrow(new Error(("Address 0x1000000 outside valid range")));
        });
    });

    // BLINDS_T12 test
    describe('.BLINDS_T12', function () {
        beforeEach(function () {
            blinds1 = new rfxcom.Blinds1(device, rfxcom.blinds1.BLINDS_T12);
        });
        it('should send the correct bytes for an open() command to the serialport', function (done) {
            let sentCommandId = NaN;
            blinds1.open('0x1234/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x0c, 0x00, 0x00, 0x12, 0x34, 0x04, 0x00, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should accept an array deviceId', function (done) {
            let sentCommandId = NaN;
            blinds1.close(['0x1234', '5'], function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x0c, 0x00, 0x00, 0x12, 0x34, 0x04, 0x01, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should send the correct bytes for a close() command to the serialport', function (done) {
            let sentCommandId = NaN;
            blinds1.close('0x1234/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x0c, 0x00, 0x00, 0x12, 0x34, 0x04, 0x01, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should send the correct bytes for a stop() command to the serialport', function (done) {
            let sentCommandId = NaN;
            blinds1.stop('0x1234/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x0c, 0x00, 0x00, 0x12, 0x34, 0x04, 0x02, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should send the correct bytes for a confirm() command to the serialport', function (done) {
            let sentCommandId = NaN;
            blinds1.confirm('0x1234/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x0c, 0x00, 0x00, 0x12, 0x34, 0x04, 0x03, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should throw an error for an intermediatePosition() command', function () {
            expect(function () {
                blinds1.intermediatePosition('0x1234/5')
            }).toThrow(new Error(("Device does not support intermediatePosition()")));
        });
        it('should throw an error for a setLimit() command', function () {
            expect(function () {
                blinds1.setLimit('0x1234/5')
            }).toThrow(new Error(("Device does not support setLimit()")));
        });
        it('should throw an error for a down() command', function () {
            expect(function () {
                blinds1.down('0x1234/5')
            }).toThrow(new Error(("Device does not support down()")));
        });
        it('should throw an error for an up() command', function () {
            expect(function () {
                blinds1.up('0x1234/5')
            }).toThrow(new Error(("Device does not support up()")));
        });
        it('should throw an error for setLowerLimit() command', function () {
            expect(function () {
                blinds1.setLowerLimit('0x1234/5')
            }).toThrow(new Error(("Device does not support setLowerLimit()")));
        });
        it('should throw an error for reverse() command', function () {
            expect(function () {
                blinds1.reverse('0x1234/5')
            }).toThrow(new Error(("Device does not support reverse()")));
        });
        it('should throw an error for address < 1', function () {
            expect(function () {
                blinds1.open('0x0/5')
            }).toThrow(new Error(("Address 0x0 outside valid range")));
        });
        it('should accept address = 0x1', function (done) {
            let sentCommandId = NaN;
            blinds1.open('0x1/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x0c, 0x00, 0x00, 0x00, 0x01, 0x04, 0x00, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should accept address = 0xffff', function (done) {
            let sentCommandId = NaN;
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
            }).toThrow(new Error(("Address 0x10000 outside valid range")));
        });
        it('should send a group code (0x0f) for unitcode 0', function (done) {
            let sentCommandId = NaN;
            blinds1.open('0x1234/0', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x0c, 0x00, 0x00, 0x12, 0x34, 0x0f, 0x00, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should accept unitcode = 0x1', function (done) {
            let sentCommandId = NaN;
            blinds1.open('0x1234/1', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x0c, 0x00, 0x00, 0x12, 0x34, 0x00, 0x00, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should accept unitcode = 0xf', function (done) {
            let sentCommandId = NaN;
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
            }).toThrow(new Error(("Invalid unit code 0x10")));
        });
    });

    // BLINDS_T13 test
    describe('.BLINDS_T13', function () {
        beforeEach(function () {
            blinds1 = new rfxcom.Blinds1(device, rfxcom.blinds1.BLINDS_T13);
        });
        it('should send the correct bytes for an open() command to the serialport', function (done) {
            let sentCommandId = NaN;
            blinds1.open('0x1234/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x0d, 0x00, 0x00, 0x12, 0x34, 0x05, 0x00, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should accept an array deviceId', function (done) {
            let sentCommandId = NaN;
            blinds1.close(['0x1234', '5'], function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x0d, 0x00, 0x00, 0x12, 0x34, 0x05, 0x01, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should send the correct bytes for a close() command to the serialport', function (done) {
            let sentCommandId = NaN;
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
            }).toThrow(new Error(("Device does not support stop()")));
        });
        it('should send the correct bytes for a confirm() command to the serialport', function (done) {
            let sentCommandId = NaN;
            blinds1.confirm('0x1234/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x0d, 0x00, 0x00, 0x12, 0x34, 0x05, 0x02, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should throw an error for an intermediatePosition() command', function () {
            expect(function () {
                blinds1.intermediatePosition('0x1234/5')
            }).toThrow(new Error(("Device does not support intermediatePosition()")));
        });
        it('should throw an error for a setLimit() command', function () {
            expect(function () {
                blinds1.setLimit('0x1234/5')
            }).toThrow(new Error(("Device does not support setLimit()")));
        });
        it('should throw an error for a down() command', function () {
            expect(function () {
                blinds1.down('0x1234/5')
            }).toThrow(new Error(("Device does not support down()")));
        });
        it('should throw an error for an up() command', function () {
            expect(function () {
                blinds1.up('0x1234/5')
            }).toThrow(new Error(("Device does not support up()")));
        });
        it('should throw an error for address < 1', function () {
            expect(function () {
                blinds1.open('0x0/5')
            }).toThrow(new Error(("Address 0x0 outside valid range")));
        });
        it('should throw an error for setLowerLimit() command', function () {
            expect(function () {
                blinds1.setLowerLimit('0x1234/5')
            }).toThrow(new Error(("Device does not support setLowerLimit()")));
        });
        it('should throw an error for reverse() command', function () {
            expect(function () {
                blinds1.reverse('0x1234/5')
            }).toThrow(new Error(("Device does not support reverse()")));
        });
        it('should send the correct bytes for a venetianIncreaseAngle() command to the serialport', function (done) {
            let sentCommandId = NaN;
            blinds1.venetianIncreaseAngle('0x1234/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x0d, 0x00, 0x00, 0x12, 0x34, 0x05, 0x04, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should send the correct bytes for a venetianDecreaseAngle() command to the serialport', function (done) {
            let sentCommandId = NaN;
            blinds1.venetianDecreaseAngle('0x1234/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x0d, 0x00, 0x00, 0x12, 0x34, 0x05, 0x05, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should accept address = 0x1', function (done) {
            let sentCommandId = NaN;
            blinds1.open('0x1/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x0d, 0x00, 0x00, 0x00, 0x01, 0x05, 0x00, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should accept address = 0xffff', function (done) {
            let sentCommandId = NaN;
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
            }).toThrow(new Error(("Address 0x10000 outside valid range")));
        });
        it('should accept unitcode = 0x10', function (done) {
            let sentCommandId = NaN;
            blinds1.open('0x1234/0', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x0d, 0x00, 0x00, 0x12, 0x34, 0x00, 0x00, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should accept unitcode = 0x1', function (done) {
            let sentCommandId = NaN;
            blinds1.open('0x1234/1', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x0d, 0x00, 0x00, 0x12, 0x34, 0x01, 0x00, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should accept unitcode = 99', function (done) {
            let sentCommandId = NaN;
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
            }).toThrow(new Error(("Invalid unit code 100")));
        });
    });

    // BLINDS_T14 test
    describe('.BLINDS_T14', function () {
        beforeEach(function () {
            blinds1 = new rfxcom.Blinds1(device, rfxcom.blinds1.BLINDS_T14);
        });
        it('should send the correct bytes for an open() command to the serialport', function (done) {
            let sentCommandId = NaN;
            blinds1.open('0x1234/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x0e, 0x00, 0x00, 0x12, 0x34, 0x04, 0x00, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should accept an array deviceId', function (done) {
            let sentCommandId = NaN;
            blinds1.close(['0x1234', '5'], function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x0e, 0x00, 0x00, 0x12, 0x34, 0x04, 0x01, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should throw an exception for a deviceId with no unit code', function () {
            expect(function () {
                blinds1.close(['0x1234']);
            }).toThrow(new Error(("Invalid deviceId format")));
        });
        it('should send the correct bytes for a close() command to the serialport', function (done) {
            let sentCommandId = NaN;
            blinds1.close('0x1234/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x0e, 0x00, 0x00, 0x12, 0x34, 0x04, 0x01, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should send the correct bytes for a stop() command to the serialport', function (done) {
            let sentCommandId = NaN;
            blinds1.stop('0x1234/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x0e, 0x00, 0x00, 0x12, 0x34, 0x04, 0x02, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should send the correct bytes for a confirm() command to the serialport', function (done) {
            let sentCommandId = NaN;
            blinds1.confirm('0x1234/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x0e, 0x00, 0x00, 0x12, 0x34, 0x04, 0x03, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should throw an error for an intermediatePosition() command', function () {
            expect(function () {
                blinds1.intermediatePosition('0x1234/5')
            }).toThrow(new Error(("Device does not support intermediatePosition()")));
        });
        it('should throw an error for setLimit() command', function () {
            expect(function () {
                blinds1.setLimit('0x1234/5')
            }).toThrow(new Error(("Device does not support setLimit()")));
        });
        it('should throw an error for down() command', function () {
            expect(function () {
                blinds1.down('0x1234/5')
            }).toThrow(new Error(("Device does not support down()")));
        });
        it('should throw an error for up() command', function () {
            expect(function () {
                blinds1.up('0x1234/5')
            }).toThrow(new Error(("Device does not support up()")));
        });
        it('should throw an error for setLowerLimit() command', function () {
            expect(function () {
                blinds1.setLowerLimit('0x1234/5')
            }).toThrow(new Error(("Device does not support setLowerLimit()")));
        });
        it('should throw an error for reverse() command', function () {
            expect(function () {
                blinds1.reverse('0x1234/5')
            }).toThrow(new Error(("Device does not support reverse()")));
        });
        it('should throw an error for address < 1', function () {
            expect(function () {
                blinds1.open('0x0/5')
            }).toThrow(new Error(("Address 0x0 outside valid range")));
        });
        it('should accept address = 0x1', function (done) {
            let sentCommandId = NaN;
            blinds1.open('0x1/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x0e, 0x00, 0x00, 0x00, 0x01, 0x04, 0x00, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should accept address = 0xffffff', function (done) {
            let sentCommandId = NaN;
            blinds1.open('0xffffff/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x0e, 0x00, 0xff, 0xff, 0xff, 0x04, 0x00, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should throw an error for address > 0xffffffff', function () {
            expect(function () {
                blinds1.open('0x1000000/5')
            }).toThrow(new Error(("Address 0x1000000 outside valid range")));
        });
        it('should accept unit code 0 (all units)', function (done) {
            let sentCommandId = NaN;
            blinds1.open('0x1/0', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x0e, 0x00, 0x00, 0x00, 0x01, 0x10, 0x00, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should accept unit code 1', function (done) {
            let sentCommandId = NaN;
            blinds1.open('0xffffff/1', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x0e, 0x00, 0xff, 0xff, 0xff, 0x00, 0x00, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should accept unit code 16', function (done) {
            let sentCommandId = NaN;
            blinds1.open('0xffffff/16', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x0e, 0x00, 0xff, 0xff, 0xff, 0x0f, 0x00, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should throw an error for unit code > 16', function () {
            expect(function () {
                blinds1.open('0x1/17')
            }).toThrow(new Error(("Invalid unit code 17")));
        });
    });

    // BLINDS_T15 test
    describe('.BLINDS_T15', function () {
        beforeEach(function () {
            blinds1 = new rfxcom.Blinds1(device, rfxcom.blinds1.BLINDS_T15);
        });
        it('should send the correct bytes for an open() command to the serialport', function (done) {
            let sentCommandId = NaN;
            blinds1.open('0x1234/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x0f, 0x00, 0x00, 0x12, 0x34, 0x04, 0x00, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should accept an array deviceId', function (done) {
            let sentCommandId = NaN;
            blinds1.close(['0x1234', '5'], function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x0f, 0x00, 0x00, 0x12, 0x34, 0x04, 0x01, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should send the correct bytes for a close() command to the serialport', function (done) {
            let sentCommandId = NaN;
            blinds1.close('0x1234/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x0f, 0x00, 0x00, 0x12, 0x34, 0x04, 0x01, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should send the correct bytes for a stop() command to the serialport', function (done) {
            let sentCommandId = NaN;
            blinds1.stop('0x1234/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x0f, 0x00, 0x00, 0x12, 0x34, 0x04, 0x02, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should send the correct bytes for a confirm() command to the serialport', function (done) {
            let sentCommandId = NaN;
            blinds1.confirm('0x1234/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x0f, 0x00, 0x00, 0x12, 0x34, 0x04, 0x03, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should throw an error for an intermediatePosition() command', function () {
            expect(function () {
                blinds1.intermediatePosition('0x1234/5')
            }).toThrow(new Error(("Device does not support intermediatePosition()")));
        });
        it('should throw an error for a setLimit() command', function () {
            expect(function () {
                blinds1.setLimit('0x1234/5')
            }).toThrow(new Error(("Device does not support setLimit()")));
        });
        it('should throw an error for a down() command', function () {
            expect(function () {
                blinds1.down('0x1234/5')
            }).toThrow(new Error(("Device does not support down()")));
        });
        it('should throw an error for an up() command', function () {
            expect(function () {
                blinds1.up('0x1234/5')
            }).toThrow(new Error(("Device does not support up()")));
        });
        it('should throw an error for setLowerLimit() command', function () {
            expect(function () {
                blinds1.setLowerLimit('0x1234/5')
            }).toThrow(new Error(("Device does not support setLowerLimit()")));
        });
        it('should throw an error for reverse() command', function () {
            expect(function () {
                blinds1.reverse('0x1234/5')
            }).toThrow(new Error(("Device does not support reverse()")));
        });
        it('should throw an error for address < 1', function () {
            expect(function () {
                blinds1.open('0x0/5')
            }).toThrow(new Error(("Address 0x0 outside valid range")));
        });
        it('should accept address = 0x1', function (done) {
            let sentCommandId = NaN;
            blinds1.open('0x1/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x0f, 0x00, 0x00, 0x00, 0x01, 0x04, 0x00, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should accept address = 0xffff', function (done) {
            let sentCommandId = NaN;
            blinds1.open('0xffff/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x0f, 0x00, 0x00, 0xff, 0xff, 0x04, 0x00, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should throw an error for address > 0xffff', function () {
            expect(function () {
                blinds1.open('0x10000/5')
            }).toThrow(new Error(("Address 0x10000 outside valid range")));
        });
        it('should send a group code (0x0f) for unitcode 0', function (done) {
            let sentCommandId = NaN;
            blinds1.open('0x1234/0', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x0f, 0x00, 0x00, 0x12, 0x34, 0x0f, 0x00, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should accept unitcode = 0x1', function (done) {
            let sentCommandId = NaN;
            blinds1.open('0x1234/1', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x0f, 0x00, 0x00, 0x12, 0x34, 0x00, 0x00, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should accept unitcode = 0xf', function (done) {
            let sentCommandId = NaN;
            blinds1.open('0x1234/0xf', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x0f, 0x00, 0x00, 0x12, 0x34, 0x0e, 0x00, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should throw an error for unit code > 0xf', function () {
            expect(function () {
                blinds1.open('0x1234/0x10')
            }).toThrow(new Error(("Invalid unit code 0x10")));
        });
    });
    
    // BLINDS_T16 test
    describe('.BLINDS_T16', function () {
        beforeEach(function () {
            blinds1 = new rfxcom.Blinds1(device, rfxcom.blinds1.BLINDS_T16);
        });
        it('should send the correct bytes for an open() command to the serialport', function (done) {
            let sentCommandId = NaN;
            blinds1.open('0x1234/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x10, 0x00, 0x00, 0x12, 0x34, 0x05, 0x00, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should accept an array deviceId', function (done) {
            let sentCommandId = NaN;
            blinds1.close(['0x1234', '5'], function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x10, 0x00, 0x00, 0x12, 0x34, 0x05, 0x01, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should send the correct bytes for a close() command to the serialport', function (done) {
            let sentCommandId = NaN;
            blinds1.close('0x1234/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x10, 0x00, 0x00, 0x12, 0x34, 0x05, 0x01, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should send the correct bytes for a stop() command to the serialport', function (done) {
            let sentCommandId = NaN;
            blinds1.stop('0x1234/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x10, 0x00, 0x00, 0x12, 0x34, 0x05, 0x02, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should send the correct bytes for a confirm() command to the serialport', function (done) {
            let sentCommandId = NaN;
            blinds1.confirm('0x1234/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x10, 0x00, 0x00, 0x12, 0x34, 0x05, 0x03, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should throw an error for an intermediatePosition() command', function () {
            expect(function () {
                blinds1.intermediatePosition('0x1234/5')
            }).toThrow(new Error(("Device does not support intermediatePosition()")));
        });
        it('should throw an error for a setLimit() command', function () {
            expect(function () {
                blinds1.setLimit('0x1234/5')
            }).toThrow(new Error(("Device does not support setLimit()")));
        });
        it('should throw an error for a down() command', function () {
            expect(function () {
                blinds1.down('0x1234/5')
            }).toThrow(new Error(("Device does not support down()")));
        });
        it('should throw an error for an up() command', function () {
            expect(function () {
                blinds1.up('0x1234/5')
            }).toThrow(new Error(("Device does not support up()")));
        });
        it('should throw an error for setLowerLimit() command', function () {
            expect(function () {
                blinds1.setLowerLimit('0x1234/5')
            }).toThrow(new Error(("Device does not support setLowerLimit()")));
        });
        it('should send the correct bytes for a reverse() command to the serialport', function (done) {
            let sentCommandId = NaN;
            blinds1.reverse('0x1234/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x10, 0x00, 0x00, 0x12, 0x34, 0x05, 0x05, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should throw an error for address < 1', function () {
            expect(function () {
                blinds1.open('0x0/5')
            }).toThrow(new Error(("Address 0x0 outside valid range")));
        });
        it('should accept address = 0x1', function (done) {
            let sentCommandId = NaN;
            blinds1.open('0x1/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x10, 0x00, 0x00, 0x00, 0x01, 0x05, 0x00, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should accept address = 0xffff', function (done) {
            let sentCommandId = NaN;
            blinds1.open('0xffff/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x10, 0x00, 0x00, 0xff, 0xff, 0x05, 0x00, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should throw an error for address > 0xffff', function () {
            expect(function () {
                blinds1.open('0x10000/5')
            }).toThrow(new Error(("Address 0x10000 outside valid range")));
        });
    });

    // BLINDS_T17 test
    describe('.BLINDS_T17', function () {
        beforeEach(function () {
            blinds1 = new rfxcom.Blinds1(device, rfxcom.blinds1.BLINDS_T17);
        });
        it('should send the correct bytes for an open() command to the serialport', function (done) {
            let sentCommandId = NaN;
            blinds1.open('0x123456/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x11, 0x00, 0x12, 0x34, 0x56, 0x05, 0x00, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should accept an array deviceId', function (done) {
            let sentCommandId = NaN;
            blinds1.close(['0x123456', '5'], function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x11, 0x00, 0x12, 0x34, 0x56, 0x05, 0x01, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should send the correct bytes for a close() command to the serialport', function (done) {
            let sentCommandId = NaN;
            blinds1.close('0x123456/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x11, 0x00, 0x12, 0x34, 0x56, 0x05, 0x01, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should send the correct bytes for a stop() command to the serialport', function (done) {
            let sentCommandId = NaN;
            blinds1.stop('0x123456/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x11, 0x00, 0x12, 0x34, 0x56, 0x05, 0x02, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should send the correct bytes for a confirm() command to the serialport', function (done) {
            let sentCommandId = NaN;
            blinds1.confirm('0x123456/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x11, 0x00, 0x12, 0x34, 0x56, 0x05, 0x03, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should send the correct bytes for an intermediatePosition() command to the serialport', function (done) {
            let sentCommandId = NaN;
            blinds1.intermediatePosition('0x123456/5', 1, function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x11, 0x00, 0x12, 0x34, 0x56, 0x05, 0x05, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should handle an intermediatePosition() command with no position parameter', function (done) {
            let sentCommandId = NaN;
            blinds1.intermediatePosition('0x123456/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x11, 0x00, 0x12, 0x34, 0x56, 0x05, 0x05, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should throw an error for a setLimit() command', function () {
            expect(function () {
                blinds1.setLimit('0x123456/5')
            }).toThrow(new Error(("Device does not support setLimit()")));
        });
        it('should throw an error for a down() command', function () {
            expect(function () {
                blinds1.down('0x123456/5')
            }).toThrow(new Error(("Device does not support down()")));
        });
        it('should throw an error for an up() command', function () {
            expect(function () {
                blinds1.up('0x123456/5')
            }).toThrow(new Error(("Device does not support up()")));
        });
        it('should throw an error for setLowerLimit() command', function () {
            expect(function () {
                blinds1.setLowerLimit('0x123456/5')
            }).toThrow(new Error(("Device does not support setLowerLimit()")));
        });
        it('should throw an error for reverse() command', function () {
            expect(function () {
                blinds1.reverse('0x123456/5')
            }).toThrow(new Error(("Device does not support reverse()")));
        });
        it('should throw an error for address < 1', function () {
            expect(function () {
                blinds1.open('0x0/5')
            }).toThrow(new Error(("Address 0x0 outside valid range")));
        });
        it('should accept address = 0x1', function (done) {
            let sentCommandId = NaN;
            blinds1.open('0x1/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x11, 0x00, 0x00, 0x00, 0x01, 0x05, 0x00, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should accept address = 0xffffff', function (done) {
            let sentCommandId = NaN;
            blinds1.open('0xffffff/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x11, 0x00, 0xff, 0xff, 0xff, 0x05, 0x00, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should throw an error for address > 0xffffff', function () {
            expect(function () {
                blinds1.open('0x1000000/5')
            }).toThrow(new Error(("Address 0x1000000 outside valid range")));
        });
    });

    // BLINDS_T18 test
    describe('.BLINDS_T18', function () {
        beforeEach(function () {
            blinds1 = new rfxcom.Blinds1(device, rfxcom.blinds1.BLINDS_T18);
        });
        it('should send the correct bytes for an open() command to the serialport', function (done) {
            let sentCommandId = NaN;
            blinds1.open('0x103456', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x12, 0x00, 0x10, 0x34, 0x56, 0x00, 0x00, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should accept an array deviceId', function (done) {
            let sentCommandId = NaN;
            blinds1.close(['0x103456'], function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x12, 0x00, 0x10, 0x34, 0x56, 0x00, 0x01, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should send the correct bytes for a close() command to the serialport', function (done) {
            let sentCommandId = NaN;
            blinds1.close('0x103456', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x12, 0x00, 0x10, 0x34, 0x56, 0x00, 0x01, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should send the correct bytes for a stop() command to the serialport', function (done) {
            let sentCommandId = NaN;
            blinds1.stop('0x103456', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x12, 0x00, 0x10, 0x34, 0x56, 0x00, 0x02, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should send the correct bytes for a confirm() command to the serialport', function (done) {
            let sentCommandId = NaN;
            blinds1.confirm('0x103456', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x12, 0x00, 0x10, 0x34, 0x56, 0x00, 0x03, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should send the correct bytes for an intermediatePosition() command to the serialport', function (done) {
            let sentCommandId = NaN;
            blinds1.intermediatePosition('0x103456', 1, function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x12, 0x00, 0x10, 0x34, 0x56, 0x00, 0x04, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should handle an intermediatePosition() command with no position parameter', function (done) {
            let sentCommandId = NaN;
            blinds1.intermediatePosition('0x103456', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x12, 0x00, 0x10, 0x34, 0x56, 0x00, 0x04, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should throw an error for a setLimit() command', function () {
            expect(function () {
                blinds1.setLimit('0x103456')
            }).toThrow(new Error(("Device does not support setLimit()")));
        });
        it('should throw an error for a down() command', function () {
            expect(function () {
                blinds1.down('0x103456')
            }).toThrow(new Error(("Device does not support down()")));
        });
        it('should throw an error for an up() command', function () {
            expect(function () {
                blinds1.up('0x103456')
            }).toThrow(new Error(("Device does not support up()")));
        });
        it('should throw an error for setLowerLimit() command', function () {
            expect(function () {
                blinds1.setLowerLimit('0x103456')
            }).toThrow(new Error(("Device does not support setLowerLimit()")));
        });
        it('should throw an error for reverse() command', function () {
            expect(function () {
                blinds1.reverse('0x103456')
            }).toThrow(new Error(("Device does not support reverse()")));
        });
        it('should throw an error for address < 0x103000', function () {
            expect(function () {
                blinds1.open('0x102fff')
            }).toThrow(new Error(("Address 0x102fff outside valid range")));
        });
        it('should accept address = 0x103000', function (done) {
            let sentCommandId = NaN;
            blinds1.open('0x103000', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x12, 0x00, 0x10, 0x30, 0x00, 0x00, 0x00, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should accept address = 0x103fff', function (done) {
            let sentCommandId = NaN;
            blinds1.open('0x103fff', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x12, 0x00, 0x10, 0x3f, 0xff, 0x00, 0x00, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should throw an error for address > 0x103fff', function () {
            expect(function () {
                blinds1.open('0x104000')
            }).toThrow(new Error(("Address 0x104000 outside valid range")));
        });
    });

    // BLINDS_T19 test
    describe('.BLINDS_T19', function () {
        beforeEach(function () {
            blinds1 = new rfxcom.Blinds1(device, rfxcom.blinds1.BLINDS_T19);
        });
        it('should send the correct bytes for a close() command to the serialport', function (done) {
            let sentCommandId = NaN;
            blinds1.close('0x1234/5', 'CW', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x13, 0x00, 0x00, 0x12, 0x34, 0x05, 0x00, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should accept an array deviceId', function (done) {
            let sentCommandId = NaN;
            blinds1.close(['0x1234', '5'], 'CW', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x13, 0x00, 0x00, 0x12, 0x34, 0x05, 0x00, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should throw an error for an stop() command', function () {
            expect(function () {
                blinds1.stop('0x1234/5')
            }).toThrow(new Error(("Device does not support stop()")));
        });
        it('should send the correct bytes for a confirm() command to the serialport', function (done) {
            let sentCommandId = NaN;
            blinds1.confirm('0x1234/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x13, 0x00, 0x00, 0x12, 0x34, 0x05, 0x05, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should send the correct bytes for a intermediatePosition("45") command to the serialport', function (done) {
            let sentCommandId = NaN;
            blinds1.intermediatePosition('0x1234/5', '45', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x13, 0x00, 0x00, 0x12, 0x34, 0x05, 0x02, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should send the correct bytes for a intermediatePosition(90) command to the serialport', function (done) {
            let sentCommandId = NaN;
            blinds1.intermediatePosition('0x1234/5', 90, function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x13, 0x00, 0x00, 0x12, 0x34, 0x05, 0x03, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should send the correct bytes for a intermediatePosition(135) command to the serialport', function (done) {
            let sentCommandId = NaN;
            blinds1.intermediatePosition('0x1234/5', 135, function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x13, 0x00, 0x00, 0x12, 0x34, 0x05, 0x04, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should throw an error for an intermediatePosition() command with an invalid position', function () {
            expect(function () {
                blinds1.intermediatePosition('0x1234/5', '-1')
            }).toThrow(new Error(("Invalid position: value must be 45, 90, or 135")));
        });
        it('should throw an error for an setLimit() command', function () {
            expect(function () {
                blinds1.setLimit('0x1234/5')
            }).toThrow(new Error(("Device does not support setLimit()")));
        });
        it('should throw an error for open() command', function () {
            expect(function () {
                blinds1.open('0x1234/5')
            }).toThrow(new Error(("Device does not support open()")));
        });
        it('should throw an error for open() command', function () {
            expect(function () {
                blinds1.down('0x1234/5')
            }).toThrow(new Error(("Device does not support down()")));
        });
        it('should throw an error for up() command', function () {
            expect(function () {
                blinds1.up('0x1234/5')
            }).toThrow(new Error(("Device does not support up()")));
        });
        it('should throw an error for setLowerLimit() command', function () {
            expect(function () {
                blinds1.setLowerLimit('0x1234/5')
            }).toThrow(new Error(("Device does not support setLowerLimit()")));
        });
        it('should throw an error for reverse() command', function () {
            expect(function () {
                blinds1.reverse('0x1234/5')
            }).toThrow(new Error(("Device does not support reverse()")));
        });
        it('should throw an error for address < 1', function () {
            expect(function () {
                blinds1.close('0x0/5', 'CW')
            }).toThrow(new Error(("Address 0x0 outside valid range")));
        });
        it('should accept address = 0x1', function (done) {
            let sentCommandId = NaN;
            blinds1.close('0x1/5', 'CW', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x13, 0x00, 0x00, 0x00, 0x01, 0x05, 0x00, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should accept address = 0xffff', function (done) {
            let sentCommandId = NaN;
            blinds1.close('0xffff/5', 'CW', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x13, 0x00, 0x00, 0xff, 0xff, 0x05, 0x00, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should throw an error for address > 0xffff', function () {
            expect(function () {
                blinds1.close('0x10000/5', 'CW')
            }).toThrow(new Error(("Address 0x10000 outside valid range")));
        });
        it('should accept unitcode = 0x0', function (done) {
            let sentCommandId = NaN;
            blinds1.close('0x1234/0', 'CW', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x13, 0x00, 0x00, 0x12, 0x34, 0x00, 0x00, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should accept unitcode = 0xf', function (done) {
            let sentCommandId = NaN;
            blinds1.close('0x1234/0xf', 'CW', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x13, 0x00, 0x00, 0x12, 0x34, 0x0f, 0x00, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should throw an error for unit code > 0xf', function () {
            expect(function () {
                blinds1.close('0x1234/0x10', 'CW')
            }).toThrow(new Error(("Invalid unit code 0x10")));
        });
    });

    // BLINDS_T20 test
    describe('.BLINDS_T20', function () {
        beforeEach(function () {
            blinds1 = new rfxcom.Blinds1(device, rfxcom.blinds1.BLINDS_T20);
        });
        it('should send the correct bytes for an open() command to the serialport', function (done) {
            let sentCommandId = NaN;
            blinds1.open('0x1234/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x14, 0x00, 0x00, 0x12, 0x34, 0x05, 0x00, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should accept an array deviceId', function (done) {
            let sentCommandId = NaN;
            blinds1.close(['0x1234', '5'], function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x14, 0x00, 0x00, 0x12, 0x34, 0x05, 0x01, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should send the correct bytes for a close() command to the serialport', function (done) {
            let sentCommandId = NaN;
            blinds1.close('0x1234/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x14, 0x00, 0x00, 0x12, 0x34, 0x05, 0x01, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should send the correct bytes for a stop() command to the serialport', function (done) {
            let sentCommandId = NaN;
            blinds1.stop('0x1234/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x14, 0x00, 0x00, 0x12, 0x34, 0x05, 0x02, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should send the correct bytes for a confirm() command to the serialport', function (done) {
            let sentCommandId = NaN;
            blinds1.confirm('0x1234/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x14, 0x00, 0x00, 0x12, 0x34, 0x05, 0x03, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should throw an error for an intermediatePosition() command', function () {
            expect(function () {
                blinds1.intermediatePosition('0x1234/5')
            }).toThrow(new Error(("Device does not support intermediatePosition()")));
        });
        it('should throw an error for setLimit() command', function () {
            expect(function () {
                blinds1.setLimit('0x1234/5')
            }).toThrow(new Error(("Device does not support setLimit()")));
        });
        it('should throw an error for down() command', function () {
            expect(function () {
                blinds1.down('0x1234/5')
            }).toThrow(new Error(("Device does not support down()")));
        });
        it('should throw an error for up() command', function () {
            expect(function () {
                blinds1.up('0x1234/5')
            }).toThrow(new Error(("Device does not support up()")));
        });
        it('should throw an error for setLowerLimit() command', function () {
            expect(function () {
                blinds1.setLowerLimit('0x1234/5')
            }).toThrow(new Error(("Device does not support setLowerLimit()")));
        });
        it('should throw an error for reverse() command', function () {
            expect(function () {
                blinds1.reverse('0x1234/5')
            }).toThrow(new Error(("Device does not support reverse()")));
        });
        it('should throw an error for address < 1', function () {
            expect(function () {
                blinds1.open('0x0/5')
            }).toThrow(new Error(("Address 0x0 outside valid range")));
        });
        it('should accept address = 0x1', function (done) {
            let sentCommandId = NaN;
            blinds1.open('0x1/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x14, 0x00, 0x00, 0x00, 0x01, 0x05, 0x00, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should accept address = 0xffff', function (done) {
            let sentCommandId = NaN;
            blinds1.open('0xffff/5', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x14, 0x00, 0x00, 0xff, 0xff, 0x05, 0x00, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should throw an error for address > 0xffff', function () {
            expect(function () {
                blinds1.open('0x10000/5')
            }).toThrow(new Error(("Address 0x10000 outside valid range")));
        });
        it('should accept unit code = 1', function (done) {
            let sentCommandId = NaN;
            blinds1.open('0x1234/1', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x14, 0x00, 0x00, 0x12, 0x34, 0x01, 0x00, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should accept unit code = 9', function (done) {
            let sentCommandId = NaN;
            blinds1.open('0x1234/9', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x14, 0x00, 0x00, 0x12, 0x34, 0x09, 0x00, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should throw an error for unit code 0', function () {
            expect(function () {
                blinds1.open('0x1234/0')
            }).toThrow(new Error(("Subtype doesn't support group commands")));
        });
        it('should throw an error for unit code > 9', function () {
            expect(function () {
                blinds1.open('0x1234/10')
            }).toThrow(new Error(("Invalid unit code 10")));
        });
        it('should throw an error when no unit codeis supplied', function () {
            expect(function () {
                blinds1.open('0x1234')
            }).toThrow(new Error(("Invalid deviceId format")));
        });
    });
});
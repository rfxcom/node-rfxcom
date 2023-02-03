const rfxcom = require('../lib'),
    util = require('util'),
    matchers = require('./matchers'),
    FakeSerialPort = require('./helper');

describe('RawTx class', function () {
    let rawtx,
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
        beforeEach(function () {
            rawtx = new rfxcom.RawTx(device);
        });
        it("should be initialised correctly when created", function (done) {
            expect(rawtx.subtype).toBe(-1);
            expect(rawtx.isSubtype(-1)).toBe(false);
            done();
        });
        it ("should send the correct bytes to the serialport", function (done) {
            let sentCommandId = NaN;
            const params = {
                repeats: 7,
                pulseTimes: "1 2 3 4 5 6 7 8"
            }
            const expectedPackets = 1;
            let packet = 1;
            rawtx.sendMessage('0x1234567/8', params, function (err, response, cmdId) {
                sentCommandId = cmdId;
                if (packet == expectedPackets) {
                    done();
                }
                packet++;
            });
            expect(fakeSerialPort).toHaveSent([20, 0x7f, 0, 0, 7, 0, 1, 0, 2, 0, 3, 0, 4, 0, 5, 0, 6, 0, 7, 0, 8]);
            expect(sentCommandId).toEqual(expectedPackets - 1);
        });
        it ("should use a default value of 5 repeats if none specified", function (done) {
            let sentCommandId = NaN;
            const params = {
                pulseTimes: "1 2 3 4 5 6 7 8"
            }
            const expectedPackets = 1;
            let packet = 1;
            rawtx.sendMessage('0x1234567/8', params, function (err, response, cmdId) {
                sentCommandId = cmdId;
                if (packet == expectedPackets) {
                    done();
                }
                packet++;
            });
            expect(fakeSerialPort).toHaveSent([20, 0x7f, 0, 0, 5, 0, 1, 0, 2, 0, 3, 0, 4, 0, 5, 0, 6, 0, 7, 0, 8]);
            expect(sentCommandId).toEqual(expectedPackets - 1);
        });
        it ("should handle a missing deviceId", function (done) {
            let sentCommandId = NaN;
            const params = {
                repeats: 7,
                pulseTimes: "1 2 3 4 5 6 7 8"
            }
            const expectedPackets = 1;
            let packet = 1;
            rawtx.sendMessage(params, function (err, response, cmdId) {
                sentCommandId = cmdId;
                if (packet == expectedPackets) {
                    done();
                }
                packet++;
            });
            expect(fakeSerialPort).toHaveSent([20, 0x7f, 0, 0, 7, 0, 1, 0, 2, 0, 3, 0, 4, 0, 5, 0, 6, 0, 7, 0, 8]);
            expect(sentCommandId).toEqual(expectedPackets - 1);
        });
        it ("should accept a numeric array of pulse times", function (done) {
            let sentCommandId = NaN;
            const params = {
                repeats: 7,
                pulseTimes: [1, 2, 3, 4, 5, 6, 7, 8]
            }
            const expectedPackets = 1;
            let packet = 1;
            rawtx.sendMessage('0x1234567/8', params, function (err, response, cmdId) {
                sentCommandId = cmdId;
                if (packet == expectedPackets) {
                    done();
                }
                packet++;
            });
            expect(fakeSerialPort).toHaveSent([20, 0x7f, 0, 0, 7, 0, 1, 0, 2, 0, 3, 0, 4, 0, 5, 0, 6, 0, 7, 0, 8]);
            expect(sentCommandId).toEqual(expectedPackets - 1);
        });
        it ("should send multiple packets if the number of pulses exceeds 124", function (done) {
            let sentCommandId = NaN;
            const params = {
                repeats: 7,
                pulseTimes: [
                    1, 2, 3, 4, 5, 6, 7, 8,
                    1, 2, 3, 4, 5, 6, 7, 8,
                    1, 2, 3, 4, 5, 6, 7, 8,
                    1, 2, 3, 4, 5, 6, 7, 8,
                    1, 2, 3, 4, 5, 6, 7, 8,
                    1, 2, 3, 4, 5, 6, 7, 8,
                    1, 2, 3, 4, 5, 6, 7, 8,
                    1, 2, 3, 4, 5, 6, 7, 8,
                    1, 2, 3, 4, 5, 6, 7, 8,
                    1, 2, 3, 4, 5, 6, 7, 8,
                    1, 2, 3, 4, 5, 6, 7, 8,
                    1, 2, 3, 4, 5, 6, 7, 8,
                    1, 2, 3, 4, 5, 6, 7, 8,
                    1, 2, 3, 4, 5, 6, 7, 8,
                    1, 2, 3, 4, 5, 6, 7, 8,
                    1, 2, 3, 4, 5, 6, 7, 8
                ]
            }
            const expectedPackets = 2;
            let packet = 1;
            rawtx.sendMessage('0x1234567/8', params, function (err, response, cmdId) {
                sentCommandId = cmdId;
                if (packet == expectedPackets) {
                    done();
                }
                packet++;
            });
            expect(fakeSerialPort).toHaveSent([
                252, 0x7f, 0, 0, 0, 
                    0, 1, 0, 2, 0, 3, 0, 4, 0, 5, 0, 6, 0, 7, 0, 8,
                    0, 1, 0, 2, 0, 3, 0, 4, 0, 5, 0, 6, 0, 7, 0, 8,
                    0, 1, 0, 2, 0, 3, 0, 4, 0, 5, 0, 6, 0, 7, 0, 8,
                    0, 1, 0, 2, 0, 3, 0, 4, 0, 5, 0, 6, 0, 7, 0, 8,
                    0, 1, 0, 2, 0, 3, 0, 4, 0, 5, 0, 6, 0, 7, 0, 8,
                    0, 1, 0, 2, 0, 3, 0, 4, 0, 5, 0, 6, 0, 7, 0, 8,
                    0, 1, 0, 2, 0, 3, 0, 4, 0, 5, 0, 6, 0, 7, 0, 8,
                    0, 1, 0, 2, 0, 3, 0, 4, 0, 5, 0, 6, 0, 7, 0, 8,
                    0, 1, 0, 2, 0, 3, 0, 4, 0, 5, 0, 6, 0, 7, 0, 8,
                    0, 1, 0, 2, 0, 3, 0, 4, 0, 5, 0, 6, 0, 7, 0, 8,
                    0, 1, 0, 2, 0, 3, 0, 4, 0, 5, 0, 6, 0, 7, 0, 8,
                    0, 1, 0, 2, 0, 3, 0, 4, 0, 5, 0, 6, 0, 7, 0, 8,
                    0, 1, 0, 2, 0, 3, 0, 4, 0, 5, 0, 6, 0, 7, 0, 8,
                    0, 1, 0, 2, 0, 3, 0, 4, 0, 5, 0, 6, 0, 7, 0, 8,
                    0, 1, 0, 2, 0, 3, 0, 4, 0, 5, 0, 6, 0, 7, 0, 8,
                    0, 1, 0, 2, 0, 3, 0, 4,
                12, 0x7f, 1, 1, 7, 
                    0, 5, 0, 6, 0, 7, 0, 8
            ]);
            expect(sentCommandId).toEqual(expectedPackets - 1);
        });
        it("should convert a valid string to an integer numeric array", function (done) {
            expect(rfxcom.RawTx._stringToArray(" 42,7 9\t\t4\n6\n")).toEqual([42, 7, 9, 4, 6]);
            done();
        });
        it("should convert a valid hexadecimal string to an integer numeric array", function (done) {
            expect(rfxcom.RawTx._stringToArray(" 0x15, 0x01")).toEqual([21, 1]);
            done();
        });
        it("should throw an exception if the string contains floating-point format numbers", function () {
            expect(function () {
                rfxcom.RawTx._stringToArray(" 42.5");
            }).toThrow(new Error("Floating-point pulse times not allowed"));
        });
        it("should reject an array with a -1 element", function (done) {
            expect(rfxcom.RawTx._anyNonValid([-1, 1, 2, 3])).toBe(true);
            done();
        })
        it("should reject an array with a 0 element", function (done) {
            expect(rfxcom.RawTx._anyNonValid([0, 1, 2, 3])).toBe(true);
            done();
        })
        it("should reject an array with a 65536 element", function (done) {
            expect(rfxcom.RawTx._anyNonValid([65536, 1, 2, 3])).toBe(true);
            done();
        })
        it("should accept an array with numeric elements", function (done) {
            expect(rfxcom.RawTx._anyNonNumeric([65536, 1, 2, 3])).toBe(false);
            done();
        })
        it("should reject an array with non-numeric elements", function (done) {
            expect(rfxcom.RawTx._anyNonNumeric(["65536", 1, 2, 3])).toBe(true);
            done();
        })
    });
});
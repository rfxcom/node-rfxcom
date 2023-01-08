const rfxcom = require('../lib'),
    matchers = require('./matchers'),
    FakeSerialPort = require('./helper');

describe('Transmitter class', function () {
    let transmitter = {},
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
//        transmitter = new Transmitter(device, null, {});
    });
    afterEach(function () {
        device.acknowledge.forEach(acknowledge => {if (typeof acknowledge === "function") {acknowledge()}});
    });
    describe('constructor', function () {
        it ('should construct an object if asked nicely', function () {
            "use strict";
            transmitter = new rfxcom.Transmitter(device, 0, {key: 1});
            expect(transmitter.rfxcom).toBe(device);
            expect(transmitter.subtype).toBe(0);
            expect(transmitter.options).toEqual({key: 1});
        });
        it ('should handle null subtype and missing options', function () {
            "use strict";
            transmitter = new rfxcom.Transmitter(device, null);
            expect(transmitter.rfxcom).toBe(device);
            expect(transmitter.subtype).toBe(null);
            expect(transmitter.options).toEqual({});
        });
        it ('should throw an exception if no subtype is supplied', function () {
            expect(function () {new rfxcom.Transmitter(device)}).toThrow("Must provide a subtype.")
        })
    });
    describe('instance methods', function () {
        beforeEach(function () {
            transmitter = new rfxcom.Transmitter(device, null, {});
        });
        describe('_timeoutHandler()', function () {
            it('should return false', function () {
                "use strict";
                expect(transmitter._timeoutHandler(null, null)).toBe(false);
            });
        });
        describe('setOption()', function () {
            it('should set an option without disturbing other options', function () {
                "use strict";
                expect(transmitter.options).toEqual({});
                transmitter.setOption({first: 1});
                expect(transmitter.options).toEqual({first: 1});
                transmitter.setOption({second: 1});
                expect(transmitter.options).toEqual({first: 1, second: 1});
                transmitter.setOption({second: 2});
                expect(transmitter.options).toEqual({first: 1, second: 2});
            });
        });
        describe('sendRaw()', function () {
            it('should send the correct bytes to the serialport', function (done) {
                let sentCommandId = NaN;
                transmitter.sendRaw(0x19, 0x06, [0x12, 0x34, 0x56, 0x73, 0x01, 0x00], function (err, response, cmdId) {
                    sentCommandId = cmdId;
                    done();
                });
                expect(fakeSerialPort).toHaveSent([0x09, 0x19, 0x06, 0x00, 0x12, 0x34, 0x56, 0x73, 0x01, 0x00]);
                expect(sentCommandId).toEqual(0);
            });

        });
    });
    describe('static methods', function () {
        describe('splitAtSlashes', function () {
            it('should return an array unaltered', function () {
                expect(rfxcom.Transmitter.splitAtSlashes(["A", "B", "C"])).toEqual(["A", "B", "C"]);
            });
            it('should turn a string without slashes into a single-elemnt array', function () {
                expect(rfxcom.Transmitter.splitAtSlashes("A")).toEqual(["A"]);
            });
            it('should split a string at slashes', function () {
                expect(rfxcom.Transmitter.splitAtSlashes("A/B/C")).toEqual(["A", "B", "C"]);
            });
            it('should not split a string array at slashes', function () {
                expect(rfxcom.Transmitter.splitAtSlashes(["A/B/C"])).toEqual(["A/B/C"]);
            });
        })
    });
});

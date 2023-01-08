const rfxcom = require('../lib'),
    util = require('util'),
    matchers = require('./matchers'),
    FakeSerialPort = require('./helper');

describe('AsyncConfig class', function () {
    let asyncConfig,
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
        device.acknowledge.forEach(acknowledge => {
            if (typeof acknowledge === "function") {
                acknowledge()
            }
        });
    });

    describe('instantiation', function () {
        it('should throw an error if no subtype is specified', function () {
            expect(function () {
                asyncConfig = new rfxcom.AsyncConfig(device);
            }).toThrow(new Error("Must provide a subtype."));
        });
    });
});
const rfxcom = require('../lib'),
    util = require('util'),
    matchers = require('./matchers'),
    FakeSerialPort = require('./helper');

describe('AsyncData class', function () {
    let asyncData,
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
        device.acknowledge.forEach(acknowledge => {
            if (typeof acknowledge === "function") {
                acknowledge()
            }
        });
    });

    describe('instantiation', function () {
        it('should throw an error if no subtype is specified', function () {
            expect(function () {
                asyncData = new rfxcom.AsyncData(device);
            }).toThrow("Must provide a subtype.");
        });
    });
});
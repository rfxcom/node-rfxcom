/* global require: false, beforeEach: false, describe: false, it: false, expect: false,
spyOn: false, console: false
*/
var rfxcom = require('../lib'),
    matchers = require('./matchers'),
    FakeSerialPort = require('./helper');

describe('Lighting4 class', function () {
    var lighting4,
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
        if (typeof device.acknowledge[0] == "function") {
            device.acknowledge[0]();
        }
    });
    describe('instantiation', function () {
        it('should throw an error if no subtype is specified', function () {
            expect(function () {
                lighting4 = new rfxcom.Lighting4(device);
            }).toThrow(new Error('Must provide a subtype.'));
        });
    });
    describe('.switchOn', function () {
        beforeEach(function () {
            lighting4 = new rfxcom.Lighting4(device, rfxcom.lighting4.PT2262);
        });
        it('should send the correct bytes to the serialport (numeric data, default pulse width)', function (done) {
            var sentCommandId;
            lighting4.sendData(0, null, function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x13, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01, 0x5E, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should log the bytes being sent in debug mode', function (done) {
            var debugDevice = new rfxcom.RfxCom('/dev/ttyUSB0', {
                    port:  fakeSerialPort,
                    debug: true
                }),
                debugLight = new rfxcom.Lighting4(debugDevice, rfxcom.lighting4.PT2262);
            debugDevice.connected = true;
            var consoleSpy = spyOn(console, 'log');
            debugLight.sendData(0, null, function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(consoleSpy).toHaveBeenCalledWith('[rfxcom] on /dev/ttyUSB0 - Sent    : %s', ['09', '13', '00', '00', '00', '00', '00', '01', '5E', '00']);
            debugDevice.acknowledge[0]();
        });
        it('should send the correct bytes to the serialport (numeric data, hex string pulse width)', function (done) {
            var sentCommandId;
            lighting4.sendData(0, "0x0578", function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x13, 0x00, 0x00, 0x00, 0x00, 0x00, 0x05, 0x78, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should send the correct bytes to the serialport (string data, default pulse width)', function (done) {
            var sentCommandId;
            lighting4.sendData("0", null, function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x13, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01, 0x5E, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should send the correct bytes to the serialport (array data, default pulse width)', function (done) {
            var sentCommandId;
            lighting4.sendData([0, 1, 2], null, function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x13, 0x00, 0x00, 0x00, 0x01, 0x02, 0x01, 0x5E, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should send the correct bytes to the serialport (undersize array data, default pulse width)', function (done) {
            var sentCommandId;
            lighting4.sendData([1, 2], null, function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x13, 0x00, 0x00, 0x00, 0x01, 0x02, 0x01, 0x5E, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should send the correct bytes to the serialport (hex string data, default pulse width)', function (done) {
            var sentCommandId;
            lighting4.sendData("0x000102", null, function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x13, 0x00, 0x00, 0x00, 0x01, 0x02, 0x01, 0x5E, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should send the correct bytes to the serialport (hex string data, hex string pulse width)', function (done) {
            var sentCommandId;
            lighting4.sendData("0x000102", "0x0312", function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x13, 0x00, 0x00, 0x00, 0x01, 0x02, 0x03, 0x12, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should send the correct bytes to the serialport (decimal string data, decimal string pulse width)', function (done) {
            var sentCommandId;
            lighting4.sendData("258", "786", function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x13, 0x00, 0x00, 0x00, 0x01, 0x02, 0x03, 0x12, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should send the correct bytes to the serialport (numeric data, numeric pulse width)', function (done) {
            var sentCommandId;
            lighting4.sendData(0x000102, 0x0312, function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x09, 0x13, 0x00, 0x00, 0x00, 0x01, 0x02, 0x03, 0x12, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
    });
});
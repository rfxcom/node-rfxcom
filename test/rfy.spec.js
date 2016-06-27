/* global require: false, beforeEach: false, describe: false, it: false, expect: false,
   spyOn: false, console: false
*/
var rfxcom = require('../lib'),
    matchers = require('./matchers'),
    FakeSerialPort = require('./helper');

describe('Rfy class', function () {
    var rfy,
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
    describe('.stop', function () {
        beforeEach(function () {
            rfy = new rfxcom.Rfy(device, rfxcom.rfy.RFY);
        });
        it('should send the correct bytes to the serialport', function (done) {
            var sentCommandId;
            rfy.stop('01020301', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x0c, 0x1a, 0x00, 0x00, 0x01, 0x02, 0x03, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
        it('should log the bytes being sent in debug mode', function (done) {
            var debugDevice = new rfxcom.RfxCom('/dev/ttyUSB0', {
                    port:  fakeSerialPort,
                    debug: true
                }),
            rfyd = new rfxcom.Rfy(debugDevice, rfxcom.rfy.RFY),
            consoleSpy = spyOn(console, 'log');
            debugDevice.connected = true;
            rfyd.stop('01020301', done);
            expect(consoleSpy).toHaveBeenCalledWith('[rfxcom] on /dev/ttyUSB0 - Sent    : %s', ['0C', '1A', '00', '00', '01', '02', '03', '01', '00', '00', '00', '00', '00']);
            debugDevice.acknowledge[0]();
        });
/*
        //TODO: add some error checking on ids
        it('should throw an exception with an invalid deviceId', function () {
            expect(function () {
                rfy.stop('01020301');
            }).toThrow(new Error('Invalid deviceId format.'));
        });
*/
        it('should handle no callback', function () {
            rfy.stop('01020301');
            expect(fakeSerialPort).toHaveSent([0x0c, 0x1a, 0x00, 0x00, 0x01, 0x02, 0x03, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00]);
        });
    });
    describe('.up', function () {
        beforeEach(function () {
            rfy = new rfxcom.Rfy(device, rfxcom.rfy.RFY);
        });
        it('should send the correct bytes to the serialport', function (done) {
            var sentCommandId;
            rfy.up('01020301', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x0c, 0x1a, 0x00, 0x00, 0x01, 0x02, 0x03, 0x01, 0x01, 0x00, 0x00, 0x00, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
    });
    describe('.down', function () {
        beforeEach(function () {
            rfy = new rfxcom.Rfy(device, rfxcom.rfy.RFY);
        });
        it('should send the correct bytes to the serialport', function (done) {
            var sentCommandId;
            rfy.down('01020301', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x0c, 0x1a, 0x00, 0x00, 0x01, 0x02, 0x03, 0x01, 0x03, 0x00, 0x00, 0x00, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
    });
    describe('.list', function () {
        beforeEach(function () {
            rfy = new rfxcom.Rfy(device, rfxcom.rfy.RFY);
        });
        it('should send the correct bytes to the serialport', function (done) {
            var sentCommandId;
            rfy.list(function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x0c, 0x1a, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x06, 0x00, 0x00, 0x00, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
    });
    describe('.program', function () {
        beforeEach(function () {
            rfy = new rfxcom.Rfy(device, rfxcom.rfy.RFY);
        });
        it('should send the correct bytes to the serialport', function (done) {
            var sentCommandId;
            rfy.program('01020301', function (err, response, cmdId) {
                sentCommandId = cmdId;
                done();
            });
            expect(fakeSerialPort).toHaveSent([0x0c, 0x1a, 0x00, 0x00, 0x01, 0x02, 0x03, 0x01, 0x07, 0x00, 0x00, 0x00, 0x00]);
            expect(sentCommandId).toEqual(0);
        });
    });
});

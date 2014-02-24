/* global require: false, beforeEach: false, describe: false, it: false, expect: false,
   spyOn: false, console: false
*/
var rfxcom = require('../lib'),
    matchers = require('./matchers'),
    FakeSerialPort = require('./helper');

describe('Curtain1 class', function () {
  var curtain1,
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
  });
  describe('.open', function () {
    beforeEach(function () {
      curtain1 = new rfxcom.Curtain1(device);
    });
    it('should send the correct bytes to the serialport', function (done) {
      var sentCommandId;
      curtain1.open('0x41/01', function (err, response, cmdId) {
        sentCommandId = cmdId;
        done();
      });
      expect(fakeSerialPort).toHaveSent([0x07, 0x18, 0x00, 0x00, 0x41, 0x01, 0x00, 0x00]);
      expect(sentCommandId).toEqual(0);
    });
    it('should log the bytes being sent in debug mode', function (done) {
      var debugDevice = new rfxcom.RfxCom('/dev/ttyUSB0', {
            port: fakeSerialPort,
            debug: true
          }),
          curtain = new rfxcom.Curtain1(debugDevice);
          consoleSpy = spyOn(console, 'log');

      curtain.open('0x41/01', done);
      expect(consoleSpy).toHaveBeenCalledWith('Sending %j', ['07', '18', '00', '00', '41', '01', '00', '00']);
    });
    // TODO: Add checking for valid housecodes / unitcodes pg. 28.
    it('should throw an exception with an invalid deviceId', function () {
      expect(function () {
        curtain1.open('0x40');
      }).toThrow(new Error('Invalid deviceId format.'));
    });
    it('should handle no callback', function () {
      curtain1.open('0x41/10');
      expect(fakeSerialPort).toHaveSent([0x07, 0x18, 0x00, 0x00, 0x41, 0x10, 0x00, 0x00]);
    });
  });
  describe('.close', function () {
    beforeEach(function () {
      curtain1 = new rfxcom.Curtain1(device);
    });
    it('should send the correct bytes to the serialport', function (done) {
      var sentCommandId;
      curtain1.close('0xA5/01', function (err, response, cmdId) {
        sentCommandId = cmdId;
        done();
      });
      expect(fakeSerialPort).toHaveSent([0x07, 0x18, 0x00, 0x00, 0xA5, 0x01, 0x01, 0x00]);
      expect(sentCommandId).toEqual(0);
    });
  });
  describe('.stop', function () {
    beforeEach(function () {
      curtain1 = new rfxcom.Curtain1(device);
    });
    it('should send the correct bytes to the serialport', function (done) {
      var sentCommandId;
      curtain1.stop('0x41/01', function (err, response, cmdId) {
        sentCommandId = cmdId;
        done();
      });
      expect(fakeSerialPort).toHaveSent([0x07, 0x18, 0x00, 0x00, 0x41, 0x01, 0x02, 0x00]);
      expect(sentCommandId).toEqual(0);
    });
  });
  describe('.program', function () {
    beforeEach(function () {
      curtain1 = new rfxcom.Curtain1(device);
    });
    it('should send the correct bytes to the serialport', function (done) {
      var sentCommandId;
      curtain1.program('0x41/01', function (err, response, cmdId) {
        sentCommandId = cmdId;
        done();
      });
      expect(fakeSerialPort).toHaveSent([0x07, 0x18, 0x00, 0x00, 0x41, 0x01, 0x03, 0x00]);
      expect(sentCommandId).toEqual(0);
    });
  });
 
});

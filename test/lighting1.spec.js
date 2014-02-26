/* global require: false, beforeEach: false, describe: false, it: false, expect: false,
   spyOn: false, console: false
*/
var rfxcom = require('../lib'),
    matchers = require('./matchers'),
    FakeSerialPort = require('./helper');

describe('Lighting1 class', function () {
  var lighting1,
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
  describe('instantiation', function () {
    it('should throw an error if no subtype is specified', function () {
      expect(function () {
        lighting1 = new rfxcom.Lighting1(device);
      }).toThrow(new Error('Must provide a subtype.'));
    });
  });
  describe('.chime', function () {
    beforeEach(function () {
      lighting1 = new rfxcom.Lighting1(device, rfxcom.lighting1.ARC);
    });
    it('should send the correct bytes to the serialport', function (done) {
      var sentCommandId;
      lighting1.chime('C14', function (err, response, cmdId) {
        sentCommandId = cmdId;
        done();
      });
      expect(fakeSerialPort).toHaveSent([0x07, 0x10, 0x01, 0x00, 0x43, 0x0E, 0x07, 0x00]);
      expect(sentCommandId).toEqual(0);
    });
   it('should log the bytes being sent in debug mode', function (done) {
     var debugDevice = new rfxcom.RfxCom('/dev/ttyUSB0', {
       port: fakeSerialPort,
       debug: true
     }),
     debug = new rfxcom.Lighting1(debugDevice, rfxcom.lighting1.ARC);

     var consoleSpy = spyOn(console, 'log');
     debug.chime('C14', done);
     expect(consoleSpy).toHaveBeenCalledWith('Sending %j', ['07', '10', '01', '00', '43', '0E', '07', '00']);
   });
  });
});

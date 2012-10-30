var rfxcom = require('../lib'),
    matchers = require('./matchers'),
    FakeSerialPort = require('./helper');

describe('Lighting2 class', function () {
  var lighting2,
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
        lighting2 = new rfxcom.Lighting2(device);
      }).toThrow(new Error('Must provide a subtype.'));
    });
  });
  describe('.switchOn', function () {
    beforeEach(function () {
      lighting2 = new rfxcom.Lighting2(device, rfxcom.lighting2.ANSLUT);
    });
    it('should send the correct bytes to the serialport', function (done) {
      var sentCommandId;
      lighting2.switchOn('0x03FFFFFF/1', function (err, response, cmdId) {
        sentCommandId = cmdId;
        done();
      });
      expect(fakeSerialPort).toHaveSent([0x0B, 0x11, 0x02, 0x00, 0x03, 0xFF, 0xFF, 0xFF, 0x01, 0x01, 0x0F, 0x00]);
      expect(sentCommandId).toEqual(0);
    });
    it('should log the bytes being sent in debug mode', function (done) {
      var debugDevice = new rfxcom.RfxCom('/dev/ttyUSB0', {
        port: fakeSerialPort,
        debug: true
      }),
        debugLight = new rfxcom.Lighting2(debugDevice, rfxcom.lighting2.ANSLUT);

      var consoleSpy = spyOn(console, 'log');
      debugLight.switchOn('0x03FFFFFF/1', done);
      expect(consoleSpy).toHaveBeenCalledWith('Sending %j', ['0B', '11', '02', '00', '03', 'FF', 'FF', 'FF', '01', '01', '0F', '00']);
    });
    it('should throw an exception with an invalid deviceId', function () {
      expect(function () {
        lighting2.switchOn('0xF09AC8');
      }).toThrow(new Error('Invalid deviceId format.'));
    });
    it('should throw an exception with an invalid deviceId', function () {
      expect(function () {
        lighting2.switchOn('0xF09AC8/1');
      }).toThrow(new Error('Invalid deviceId format.'));
    });
    it('should handle no callback', function () {
      lighting2.switchOn('0x03FFFFFF/1');
      expect(fakeSerialPort).toHaveSent([0x0b, 0x11, 2, 0, 3, 0xff, 0xff, 0xff, 1, 1, 0xf, 0]);
    });
  });
  describe('.switchOff', function () {
    beforeEach(function () {
      lighting2 = new rfxcom.Lighting2(device, rfxcom.lighting2.ANSLUT);
    });
    it('should send the correct bytes to the serialport', function (done) {
      var sentCommandId;
      lighting2.switchOff('0x03FFFFFF/1', function (err, response, cmdId) {
        sentCommandId = cmdId;
        done();
      });
      expect(fakeSerialPort).toHaveSent([0x0b, 0x11, 2, 0, 3, 0xff, 0xff, 0xff, 1, 0, 0xf, 0]);
      expect(sentCommandId).toEqual(0);
    });
    it('should throw an exception with an invalid deviceId', function () {
      expect(function () {
        lighting2.switchOff('0xF09AC8');
      }).toThrow(new Error('Invalid deviceId format.'));
    });
    it('should handle no callback', function () {
      lighting2.switchOff('0x03FFFFFF/1');
      expect(fakeSerialPort).toHaveSent([0x0b, 0x11, 2, 0, 3, 0xff, 0xff, 0xff, 1, 0, 0xf, 0]);
    });
  });
  describe('.setLevel', function () {
    beforeEach(function () {
      lighting2 = new rfxcom.Lighting2(device, rfxcom.lighting2.ANSLUT);
    });
    it('should send the correct bytes to the serialport', function (done) {
      var sentCommandId;
      lighting2.setLevel('0x03FFFFFF/1', 7, function (err, response, cmdId) {
        sentCommandId = cmdId;
        done();
      });
      expect(fakeSerialPort).toHaveSent([0xb, 0x11, 2, 0, 3, 0xff, 0xff, 0xff, 1, 2, 7, 0]);
      expect(sentCommandId).toEqual(0);
    });
    it('should throw an exception with an invalid level value', function () {
      expect(function () {
        lighting2.setLevel('0x03FFFFFF/1', 0x10);
      }).toThrow(new Error('Invalid level value must be in range 0-15.'));
    });
    it('should throw an exception with an invalid deviceId', function () {
      expect(function () {
        lighting2.setLevel('0xF09AC8', 3);
      }).toThrow(new Error('Invalid deviceId format.'));
    });
    it('should handle no callback', function () {
      lighting2.setLevel('0x03FFFFFF/1', 5);
      expect(fakeSerialPort).toHaveSent([0x0b, 0x11, 2, 0, 3, 0xff, 0xff, 0xff, 1, 2, 5, 0]);
    });
  });
});

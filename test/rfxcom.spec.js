var RfxCom = require("../rfxcom").RfxCom
  , events = require("events")
  , util = require("util");

var FakeSerialPort = function() {
  var self = this;
  events.EventEmitter.call(this);
  self.bytesWritten = [];
}
util.inherits(FakeSerialPort, events.EventEmitter);

FakeSerialPort.prototype.write = function(buffer, callback){
  var self = this;
  self.bytesWritten += buffer;
  callback()
}


describe("RfxCom", function() {
  beforeEach(function() {
    this.addMatchers({
      toHaveSent: function(expected) {
        var actual = this.actual.bytesWritten;
        var notText = this.isNot ? " not" : "";

        this.message = function () {
          return "Expected " + actual + notText + " to equal " + expected;
        }
        return actual.toString() === expected.toString();
      }
    });
  });
  describe(".bytesToUint48", function() {
    it("should convert a sequence of 6 bytes to a longint", function(){
      var rfxcom = new RfxCom("/dev/ttyUSB0");
      expect(rfxcom.bytesToUint48([0x00,0x00,0x00,0x67,0x28,0x97])).toBe(6760488);
    })
  });

  describe(".bytesToUint32", function() {
    it("should convert a sequence of 4 bytes to a longint", function() {
      var rfxcom = new RfxCom("/dev/ttyUSB0");
      expect(rfxcom.bytesToUint32([0x00,0x00,0x01,0x72])).toBe(370);
    })
  });

  describe(".dumpHex", function() {
    it("should convert a sequence of bytes to a string of hex numbers with a prefix if one is supplied", function() {
      var rfxcom = new RfxCom("/dev/ttyUSB0");
      expect(rfxcom.dumpHex([0x00,0x00,0x01,0x72], "0x").toString()).toBe("0x00,0x00,0x01,0x72");
    })
    it("should convert a sequence of bytes to a string of hex numbers with no prefix if none supplied", function() {
      var rfxcom = new RfxCom("/dev/ttyUSB0");
      expect(rfxcom.dumpHex([0x00,0x00,0x01,0x72]).toString()).toBe("00,00,01,72");
    })
  });

  describe(".stringToBytes", function() {
    it("should convert a sequence of characters to an array of bytes", function() {
      var rfxcom = new RfxCom("/dev/ttyUSB0");
      expect(rfxcom.stringToBytes("203052").toString()).toBe([32, 48, 82].toString());
    })
    it("should ignore leading 0x on a string", function() {
      var rfxcom = new RfxCom("/dev/ttyUSB0");
      expect(rfxcom.stringToBytes("0x203052").toString()).toBe([32, 48, 82].toString());
    })
  });

  describe(".messageHandler", function() {
    it("should emit an response message when called", function(done) {
      var rfxcom = new RfxCom("/dev/ttyUSB0");
      rfxcom.on("response", function(message, seqnbr) {
        expect(message).toBe("ACK - transmit OK");
        expect(seqnbr).toBe(3);
        done();
      })
      rfxcom.messageHandler([0x00, 0x03, 0x00]);
    });
  });

  describe(".lightOff", function() {
    it("should send the correct bytes to the serialport", function(done) {
      var fakeSerialPort = new FakeSerialPort()
        , rfxcom = new RfxCom("/dev/ttyUSB0", {port: fakeSerialPort});
      rfxcom.lightOff("0xF09AC6", 1, function(){
        done();
      })
      expect(fakeSerialPort).toHaveSent([10,20,0,0,0xF0,0x9A,0xC6,1,0,0,0]);
    })
  })

  describe(".lightOn", function(){
    it("should send the correct bytes to the serialport", function(done){
      var fakeSerialPort = new FakeSerialPort()
        , rfxcom = new RfxCom("/dev/ttyUSB0", {port: fakeSerialPort});
      rfxcom.lightOn("0xF09AC8", 1, function(){
        done();
      })
      expect(fakeSerialPort).toHaveSent([10,20,0,0,0xF0,0x9A,0xC8,1,1,0,0]);
    })
  })

  describe(".elec2Handler", function() {
    it("should emit an elec2 message when called", function(done){
      var rfxcom = new RfxCom("/dev/ttyUSB0");
      rfxcom.on("elec2", function(subtype, id, current_watts, total_watts){
        expect(subtype).toBe("CM119/160");
        expect(id).toBe("0xA412");
        expect(current_watts).toBe(370);
        expect(total_watts).toBe(30225.82);
        done();
      })
      rfxcom.elec2Handler([0x01, 0x00, 0xA4, 0x12, 0x02, 0x00, 0x00, 0x01, 0x72,
                           0x00, 0x00, 0x00, 0x67, 0x28, 0x97, 0x79]);
    });
  });

  describe(".lighting5Handler", function() {
    beforeEach(function(){
      rfxcom = new RfxCom("/dev/ttyUSB0");
    });
    it("should emit an elec2 message when called", function(done){
      rfxcom.on("lighting5", function(subtype, id, unitcode, command){
        expect(subtype).toBe("LightwaveRF, Siemens");
        expect(id).toBe("0xF09AC7");
        expect(unitcode).toBe(1);
        expect(command).toBe("Off");
        done();
      })
      rfxcom.lighting5Handler([0x00, 0x01, 0xF0, 0x9A, 0xC7, 0x01, 0x00, 0x00, 0x80])
    });

    it("should identify the subtype correctly", function(done){
      rfxcom.on("lighting5", function(subtype, id, unitcode, command){
        expect(subtype).toBe("EMW100 GAO/Everflourish");
        done();
      })
      rfxcom.lighting5Handler([0x01, 0x01, 0xF0, 0x9A, 0xC7, 0x01, 0x00, 0x00, 0x80])
    });

    it("should identify the command correctly", function(done){
      rfxcom.on("lighting5", function(subtype, id, unitcode, command){
        expect(command).toBe("On");
        done();
      })
      rfxcom.lighting5Handler([0x01, 0x01, 0xF0, 0x9A, 0xC7, 0x01, 0x01, 0x00, 0x80])
    });
  });

  describe(".security1Handler", function() {
    beforeEach(function(){
      rfxcom = new RfxCom("/dev/ttyUSB0");
    });
    it("should emit an security1 message when called", function(done){
      rfxcom.on("security1", function(subtype, id, device_status, battery_level){
        expect(subtype).toBe("X10 Security door/window sensor");
        expect(id).toBe("0xFFAA00");
        expect(device_status).toBe(0x04)
        done();
      })
      rfxcom.security1Handler([0x00, 0x00, 0xFF, 0xAA, 0x00, 0x04, 0x89]);
    });
    it("should identify the subtype correctly", function(done){
      rfxcom.on("security1", function(subtype, id, device_status, battery_level){
        expect(subtype).toBe("X10 security motion sensor");
        done();
      })
      rfxcom.security1Handler([0x01, 0x00, 0xFF, 0xAA, 0x00, 0x04, 0x89]);
    });
  });

  describe(".statusHandler", function() {
    beforeEach(function(){
      rfxcom = new RfxCom("/dev/ttyUSB0");
    });
    it("should emit a status message when called", function(done){
      rfxcom.on("status", function(subtype, seqnbr, cmnd, receiver_type, firmware_version){
        expect(subtype).toBe(0);
        expect(seqnbr).toBe(0x01);
        expect(cmnd).toBe(0x20);
        expect(receiver_type).toBe("433.92MHz transceiver");
        expect(firmware_version).toBe(0x30);
        done();
      })
      rfxcom.statusHandler([0x00, 0x01, 0x20, 0x53, 0x30, 0x30, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00])
    });
  });
})
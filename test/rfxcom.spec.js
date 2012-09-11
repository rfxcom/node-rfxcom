'use strict';

var rfxcom = require("../rfxcom"),
    protocols = rfxcom.protocols,
    events = require("events"),
    util = require("util");

var FakeSerialPort = function () {
    var self = this;
    events.EventEmitter.call(this);
    self.bytesWritten = [];
    self.flushed = false;
};
util.inherits(FakeSerialPort, events.EventEmitter);

FakeSerialPort.prototype.write = function (buffer, callback) {
    var self = this;
    self.bytesWritten += buffer;
    callback();
};

FakeSerialPort.prototype.flush = function (callback) {
    var self = this;
    self.flushed = true;
    callback();
};


describe("RfxCom", function(){
  beforeEach(function(){
    this.addMatchers({
      toHaveSent: function(expected){
        var actual = this.actual.bytesWritten;
        var notText = this.isNot ? " not" : "";

        this.message = function (){
          return "Expected " + actual + notText + " to equal " + expected;
        }
        return actual.toString() === expected.toString();
      }
    });
  });

  describe("RfxCom class", function(){
    describe(".bytesToUint48", function(){
      it("should convert a sequence of 6 bytes to a longint", function(){
        var device = new rfxcom.RfxCom("/dev/ttyUSB0");
        expect(device.bytesToUint48([0x00,0x00,0x00,0x67,0x28,0x97])).toBe(6760488);
      })
    });

    describe(".bytesToUint32", function(){
      it("should convert a sequence of 4 bytes to a longint", function(){
        var device = new rfxcom.RfxCom("/dev/ttyUSB0");
        expect(device.bytesToUint32([0x00,0x00,0x01,0x72])).toBe(370);
      })
    });

    describe(".dumpHex", function(){
      it("should convert a sequence of bytes to a string of hex numbers with a prefix if one is supplied", function(){
        var device = new rfxcom.RfxCom("/dev/ttyUSB0");
        expect(device.dumpHex([0x00,0x00,0x01,0x72], "0x").toString()).toBe("0x00,0x00,0x01,0x72");
      })
      it("should convert a sequence of bytes to a string of hex numbers with no prefix if none supplied", function(){
        var device = new rfxcom.RfxCom("/dev/ttyUSB0");
        expect(device.dumpHex([0x00,0x00,0x01,0x72]).toString()).toBe("00,00,01,72");
      })
    });

    describe(".stringToBytes", function(){
      it("should convert a sequence of characters to an array of bytes", function(){
        var device = new rfxcom.RfxCom("/dev/ttyUSB0");
        expect(device.stringToBytes("203052").toString()).toBe([32, 48, 82].toString());
      })
      it("should ignore leading 0x on a string", function(){
        var device = new rfxcom.RfxCom("/dev/ttyUSB0");
        expect(device.stringToBytes("0x203052").toString()).toBe([32, 48, 82].toString());
      })
    });

    describe(".messageHandler", function(){
      it("should emit an response message when called", function(done){
        var device = new rfxcom.RfxCom("/dev/ttyUSB0");
        device.on("response", function(message, seqnbr){
          expect(message).toBe("ACK - transmit OK");
          expect(seqnbr).toBe(3);
          done();
        })
        device.messageHandler([0x00, 0x03, 0x00]);
      });
    });

    describe(".flush", function(){
      it("should flush the underlying serialport", function(done){
        var fakeSerialPort = new FakeSerialPort()
          , device = new rfxcom.RfxCom("/dev/ttyUSB0", {port: fakeSerialPort});
        device.flush(function(){
          expect(fakeSerialPort.flushed).toBeTruthy();
          done();
        });
      });
    });

    describe(".getStatus", function(){
      it("should send the correct bytes to the serialport", function(done){
        var fakeSerialPort = new FakeSerialPort()
          , device = new rfxcom.RfxCom("/dev/ttyUSB0", {port: fakeSerialPort});
        device.getStatus(function(){
          done();
        });
        expect(fakeSerialPort).toHaveSent([13, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
      });
    });

    describe(".enable", function() {
      it("should send the correct bytes to the serialport", function(done) {
        var fakeSerialPort = new FakeSerialPort()
          , device = new rfxcom.RfxCom("/dev/ttyUSB0", {port: fakeSerialPort});
        device.enable([protocols.LACROSSE, protocols.OREGON, protocols.AC, protocols.ARC, protocols.X10], function(){
          done();
        })
        expect(fakeSerialPort).toHaveSent([0x0D, 0x00, 0x00, 0x00, 0x03, 0x53, 0x00, 0x00, 0x08, 0x27, 0x0, 0x0, 0x0, 0x0])
      })
    })

    describe(".lightOff", function(){
      it("should send the correct bytes to the serialport", function(done){
        var fakeSerialPort = new FakeSerialPort()
          , device = new rfxcom.RfxCom("/dev/ttyUSB0", {port: fakeSerialPort});
        device.lightOff("0xF09AC6", 1, function(){
          done();
        })
        expect(fakeSerialPort).toHaveSent([10,20,0,0,0xF0,0x9A,0xC6,1,0,0,0]);
      })
    })

    describe(".lightOn", function(){
      it("should send the correct bytes to the serialport", function(done){
        var fakeSerialPort = new FakeSerialPort()
          , device = new rfxcom.RfxCom("/dev/ttyUSB0", {port: fakeSerialPort});
        device.lightOn("0xF09AC8", 1, function(){
          done();
        })
        expect(fakeSerialPort).toHaveSent([10,20,0,0,0xF0,0x9A,0xC8,1,1,0,0]);
      })
    })

    describe(".elec2Handler", function(){
      it("should emit an elec2 message when called", function(done){
        var device = new rfxcom.RfxCom("/dev/ttyUSB0");
        device.on("elec2", function(evt) {
          expect(evt.subtype).toBe("CM119/160");
          expect(evt.id).toBe("0xA412");
          expect(evt.current_watts).toBe(370);
          expect(evt.total_watts).toBe(30225.82);
          done();
        })
        device.elec2Handler([0x01, 0x00, 0xA4, 0x12, 0x02, 0x00, 0x00, 0x01, 0x72,
                             0x00, 0x00, 0x00, 0x67, 0x28, 0x97, 0x79]);
      });
    });

    describe(".lighting5Handler", function () {
      var device;
      beforeEach(function(){
        device = new rfxcom.RfxCom("/dev/ttyUSB0");
      });
      it("should emit an elec2 message when called", function(done){
        device.on("lighting5", function(subtype, id, unitcode, command){
          expect(subtype).toBe("LightwaveRF, Siemens");
          expect(id).toBe("0xF09AC7");
          expect(unitcode).toBe(1);
          expect(command).toBe("Off");
          done();
        })
        device.lighting5Handler([0x00, 0x01, 0xF0, 0x9A, 0xC7, 0x01, 0x00, 0x00, 0x80])
      });

      it("should identify the subtype correctly", function(done){
        device.on("lighting5", function(subtype, id, unitcode, command){
          expect(subtype).toBe("EMW100 GAO/Everflourish");
          done();
        })
        device.lighting5Handler([0x01, 0x01, 0xF0, 0x9A, 0xC7, 0x01, 0x00, 0x00, 0x80])
      });

      it("should identify the command correctly", function(done){
        device.on("lighting5", function(subtype, id, unitcode, command){
          expect(command).toBe("On");
          done();
        })
        device.lighting5Handler([0x01, 0x01, 0xF0, 0x9A, 0xC7, 0x01, 0x01, 0x00, 0x80])
      });
    });

    describe(".security1Handler", function () {
      var device;
      beforeEach(function(){
        device = new rfxcom.RfxCom("/dev/ttyUSB0");
      });
      it("should emit an security1 message when called", function(done){
        device.on("security1", function(subtype, id, device_status, battery_level){
          expect(subtype).toBe("X10 Security door/window sensor");
          expect(id).toBe("0xFFAA00");
          expect(device_status).toBe(0x04)
          done();
        })
        device.security1Handler([0x00, 0x00, 0xFF, 0xAA, 0x00, 0x04, 0x89]);
      });
      it("should identify the subtype correctly", function(done){
        device.on("security1", function(subtype, id, device_status, battery_level){
          expect(subtype).toBe("X10 security motion sensor");
          done();
        })
        device.security1Handler([0x01, 0x00, 0xFF, 0xAA, 0x00, 0x04, 0x89]);
      });
    });

    describe(".statusHandler", function(){
      var device;
      beforeEach(function(){
        device = new rfxcom.RfxCom("/dev/ttyUSB0");
      });
      it("should emit a status message when called", function(done){
        device.on("status", function(subtype, seqnbr, cmnd, receiver_type, firmware_version){
          expect(subtype).toBe(0);
          expect(seqnbr).toBe(0x01);
          expect(cmnd).toBe(0x20);
          expect(receiver_type).toBe("433.92MHz transceiver");
          expect(firmware_version).toBe(0x30);
          done();
        })
        device.statusHandler([0, 1, 0x20, 0x53, 0x30, 0x30, 0, 0, 0, 0, 0, 0, 0])
      });
    });
  }); // describe Rfxcom Class.

  describe("LightwaveRf class", function(){
    var lightwaverf,
        fakeSerialPort,
        device;
    beforeEach(function(){
      fakeSerialPort = new FakeSerialPort();
      device = new rfxcom.RfxCom("/dev/ttyUSB0", {port: fakeSerialPort});
      lightwaverf = new rfxcom.LightwaveRf(device);
    });
    describe(".switchOn", function(){
      it("should send the correct bytes to the serialport", function(done){
        lightwaverf.switchOn("0xF09AC8", 1, function(){ 
          done();
        })
        expect(fakeSerialPort).toHaveSent([10, 20, 0, 0, 0xF0, 0x9A, 0xC8, 1, 1, 0, 0]);
      });
      it("should handle mood lighting", function(done){
        lightwaverf.switchOn("0xF09AC8", 1, {mood: 0x03}, function(){ 
          done();
        })
        expect(fakeSerialPort).toHaveSent([10, 20, 0, 0, 0xF0, 0x9A, 0xC8, 1, 3, 0, 0]);
      });
      it("should throw an exception with an invalid mood value", function(){
        expect(function(){
          lightwaverf.switchOn("0xF09AC8", 1, {mood: 6})
        }).toThrow(new Error("Invalid mood value must be in range 1-5."));
      });
      it("should send the level if one is specified", function(done){
        lightwaverf.switchOn("0xF09AC8", 1, {level: 80}, function(){ 
          done();
        })
        expect(fakeSerialPort).toHaveSent([10, 20, 0, 0, 0xF0, 0x9A, 0xC8, 1, 1, 80, 0]);
      });
      it("should handle no callback", function(){
        lightwaverf.switchOn("0xF09AC8", 1, {level: 80});
        expect(fakeSerialPort).toHaveSent([10, 20, 0, 0, 0xF0, 0x9A, 0xC8, 1, 1, 80, 0]);
      });
    });
    describe(".switchOff", function(){
      it("should send the correct bytes to the serialport", function(done){
        lightwaverf.switchOff("0xF09AC8", 1, function(){ 
          done();
        })
        expect(fakeSerialPort).toHaveSent([10, 20, 0, 0, 0xF0, 0x9A, 0xC8, 1, 0, 0, 0]);
      });
      it("should handle no callback", function(){
        lightwaverf.switchOff("0xF09AC8", 1);
        expect(fakeSerialPort).toHaveSent([10, 20, 0, 0, 0xF0, 0x9A, 0xC8, 1, 0, 0, 0]);
      });
    });
  });
})

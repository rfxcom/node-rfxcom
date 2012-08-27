(function() {

  var FakeSocket = function() {
  };

  var serialport = require("serialport")
    , RfxCom = require("../rfxcom").RfxCom
    , sinon = require("sinon")
    , assert = require("assert");

  describe("RfxCom", function() {
    describe(".elec2Handler", function() {
      it("should emit an elec2 message when called", function(done) {
        var rfxcom = new RfxCom("/dev/ttyUSB0");
        rfxcom.on("elec2", function(subtype, id, current_watts, total_watts) {
          assert.equal(subtype, "CM119/160");
          assert.equal(id, "0xA412");
          assert.equal(current_watts, 370);
          assert.equal(total_watts, 30225.82);
          done();
        })
      rfxcom.elec2Handler([0x01,0x00,0xA4,0x12,0x02,0x00,0x00,0x01,0x72,0x00,0x00,0x00,0x67,0x28,0x97,0x79]);
      });
    });
    describe(".messageHandler", function() {
      it("should emit an response message when called", function(done) {
        var rfxcom = new RfxCom("/dev/ttyUSB0");
        rfxcom.on("response", function(message, seqnbr) {
          assert.equal(message, "ACK - transmit OK"),
          assert.equal(seqnbr, 3);
          done();
        })
        rfxcom.messageHandler([0x03,0x00]);
      });
    });
    describe(".interfaceHandler", function() {
    });
    describe(".lighting5Handler", function() {
      it("should emit an elec2 message when called", function(done) {
        var rfxcom = new RfxCom("/dev/ttyUSB0");
        rfxcom.on("lighting5", function(subtype, id, unitcode, command) {
          assert.equal(subtype, "LightwaveRF, Siemens");
          assert.equal(id, "0xF09AC7");
          assert.equal(unitcode, 1);
          assert.equal(command, "Off");
          done();
        })
      rfxcom.lighting5Handler([0x00, 0x01, 0xF0, 0x9A, 0xC7, 0x01, 0x00, 0x00, 0x80])
      });
    });
    describe(".getCmdNumber", function() {
      it("should return a different number", function() {
        var rfxcom = new RfxCom("/dev/ttyUSB0")
          , number1 = rfxcom.getCmdNumber()
          , number2 = rfxcom.getCmdNumber()
        assert.notEqual(number1, number2);
      })
      it("should rollover at 255", function() {
        var rfxcom = new RfxCom("/dev/ttyUSB0");
        for (var i=0; i<=257; i++) {
          rfxcom.getCmdNumber();
        }
        assert.equal(rfxcom.getCmdNumber(), 1);
      });
    });
    describe(".reset", function() {
      it("should write the correct bytes to the serialport to reset the device");
    });
    describe(".flush", function() {
      it("should call flush on the underlying serialport instance");
    });
    describe(".getStatus", function() {
    });
    describe(".lightOn", function() {
      it("should write the correct bytes to the serialport to switch on the light");
      it("should raise an error if an unknown light type is specified");
    });

    describe(".lightOff", function() {
      it("should write the correct bytes to the serialport to switch off the light");
      it("should raise an error if an unknown light type is specified");
    });
    describe(".delay", function() {
      it("should delay for the required number of miliseconds", function() {
        // Hmmm...testing this is different.
      });
    });
    describe(".dumpHex", function() {
      it("should convert a sequence of bytes to a string of hex numbers with a prefix if one is supplied", function() {
        var rfxcom = new RfxCom("/dev/ttyUSB0");
        assert.equal(rfxcom.dumpHex([0x00,0x00,0x01,0x72], "0x").toString(), "0x00,0x00,0x01,0x72");
      })
      it("should convert a sequence of bytes to a string of hex numbers with no prefix if none supplied", function() {
        var rfxcom = new RfxCom("/dev/ttyUSB0");
        assert.equal(rfxcom.dumpHex([0x00,0x00,0x01,0x72]).toString(), "00,00,01,72");
      })
    });
    describe(".bytesToUint32", function() {
      it("should convert a sequence of 4 bytes to a longint", function() {
        var rfxcom = new RfxCom("/dev/ttyUSB0");
        assert.equal(rfxcom.bytesToUint32([0x00,0x00,0x01,0x72]), 370);
      })
    });
    describe(".bytesToUint48", function() {
      it("should convert a sequence of 6 bytes to a longint", function() {
        var rfxcom = new RfxCom("/dev/ttyUSB0");
        assert.equal(rfxcom.bytesToUint48([0x00,0x00,0x00,0x67,0x28,0x97]), 6760488);
      })
    });
    describe(".stringToBytes", function() {
      it("should convert a sequence of characters to an array of bytes", function() {
        var rfxcom = new RfxCom("/dev/ttyUSB0");
        assert.equal(rfxcom.stringToBytes("203052").toString(), [32, 48, 82].toString());
      })
      it("should ignore leading 0x on a string", function() {
        var rfxcom = new RfxCom("/dev/ttyUSB0");
        assert.equal(rfxcom.stringToBytes("0x203052").toString(), [32, 48, 82].toString());
      })

    });
  });
}).call(this);

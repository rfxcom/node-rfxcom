(function() {

  var serialport = require("serialport"),
      RfxCom = require("../rfxcom").RfxCom,
      sinon = require("sinon"),
      assert = require("assert");

  describe("RfxCom", function() {
    before(function() {
      this.rfxcom = new RfxCom("/dev/ttyUSB0");
    });
    describe("initialisation", function() {
      it("can be created with a device name", function() {
       assert.equal(this.rfxcom.device, "/dev/ttyUSB0");
      })
    });
    describe("open", function() {
      beforeEach(function() {
        this.mock_serialport = sinon.mock(serialport);
      });
      afterEach(function() {
        this.mock_serialport.restore();
      });
    });
    describe(".elec2Handler", function() {
      it("should emit an elec2 message when called", function(done) {
        this.rfxcom.on("elec2", function(subtype, id, current_watts, total_watts) {
          assert.equal(subtype, "CM119/160");
          assert.equal(id, "0xA412");
          assert.equal(current_watts, 370);
          assert.equal(total_watts, 30225.82);
          done();
        })
      this.rfxcom.elec2Handler([0x01,0x00,0xA4,0x12,0x02,0x00,0x00,0x01,0x72,0x00,0x00,0x00,0x67,0x28,0x97,0x79]);
      });
    });
    describe(".messageHandler", function() {
      it("should emit an response message when called", function(done) {
        this.rfxcom.on("response", function(message, seqnbr) {
          assert.equal(message, "ACK - transmit OK"),
          assert.equal(seqnbr, 3);
          done();
        })
      this.rfxcom.messageHandler([0x03,0x00]);
      });
    });
    describe(".interfaceHandler", function() {
    });
    describe(".lighting5Handler", function() {
    });
    describe(".getCmdNumber", function() {
      it("should return a different number", function() {
        var number1 = this.rfxcom.getCmdNumber();
        var number2 = this.rfxcom.getCmdNumber();
        assert.notEqual(number1, number2);
      })
      it("should rollover at 255", function() {
        for (var i=0; i<=256; i++) {
          this.rfxcom.getCmdNumber();
        }
        assert.equal(this.rfxcom.getCmdNumber(), 2);
      });
    });
    describe(".reset", function() {
    });
    describe(".flush", function() {
    });
    describe(".getStatus", function() {
    });
    describe(".lightOn", function() {
    });
    describe(".lightOff", function() {
    });
    describe(".delay", function() {
      it("should delay for the required number of miliseconds", function() {
        // Hmmm...testing this is different.
      });
    });
    describe(".dumpHex", function() {
      it("should convert a sequence of bytes to a string of hex numbers", function() {
        assert.equal(this.rfxcom.dumpHex([0x00,0x00,0x01,0x72]).toString(), "00,00,01,72");
      })
    });
    describe(".bytesToUint32", function() {
      it("should convert a sequence of 4 bytes to a longint", function() {
        assert.equal(this.rfxcom.bytesToUint32([0x00,0x00,0x01,0x72]), 370);
      })
    });
    describe(".bytesToUint48", function() {
      it("should convert a sequence of 6 bytes to a longint", function() {
        assert.equal(this.rfxcom.bytesToUint48([0x00,0x00,0x00,0x67,0x28,0x97]), 6760488);
      })
    });
    describe(".stringToBytes", function() {
      it("should convert a sequence of characters to an array of bytes", function() {
        assert.equal(this.rfxcom.stringToBytes("203052").toString(), [32, 48, 82].toString());
      })

    });
  });

//       var constructor = this.mock_serialport.expects("SerialPort").
//           withArgs("/dev/ttyUSB0").returns(spyPort);
//
}).call(this);

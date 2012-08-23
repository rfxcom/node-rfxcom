(function() {

  var serialport = require("serialport"),
      RfxCom = require("../rfxcom").RfxCom,
      sinon = require("sinon");

  describe("RfxCom", function() {
    describe("initialisation", function() {
      beforeEach(function() {
        this.mock_serialport = sinon.mock(serialport);
      });
      afterEach(function() {
        this.mock_serialport.restore();
      });
      it("can be created with a serial port", function() {
       var spyPort = sinon.mock();
       spyPort.expects("on").withArgs("data", sinon.match.func);
       spyPort.expects("on").withArgs("error", sinon.match.func);
       spyPort.expects("on").withArgs("end", sinon.match.func);
       spyPort.expects("on").withArgs("drain", sinon.match.func);
       spyPort.expects("on").withArgs("on", sinon.match.func);

       var constructor = this.mock_serialport.expects("SerialPort").
           withArgs("/dev/ttyUSB0").returns(spyPort);
       var rfxcom = new RfxCom("/dev/ttyUSB0");
       constructor.verify();
       spyPort.verify();
      })
    });
  });

}).call(this);

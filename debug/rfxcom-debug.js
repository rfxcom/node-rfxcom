
const rfxcom = require('rfxcom');

//const rfxtrx = new rfxcom.RfxCom("/dev/tty.usbserial-A1XF9SIM", {debug: true});  // Old hardware
const rfxtrx = new rfxcom.RfxCom("/dev/tty.usbserial-A1R1A6A", {debug: true}); // E hardware

rfxtrx.on("status", function (evt) {console.log(evt)});

rfxtrx.initialise(function () {
    console.log("Device initialised");
    setTimeout( function () {
        rfxtrx.enable([rfxcom.protocols.LIGHTING4,
            rfxcom.protocols.OREGON,
            rfxcom.protocols.AC,
            rfxcom.protocols.ARC,
            rfxcom.protocols.X10])
    }, 2000);
});

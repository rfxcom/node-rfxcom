
const rfxcom = require('rfxcom');

//const rfxtrx = new rfxcom.RfxCom("/dev/tty.usbserial-A1XF9SIM", {debug: true});  // Old hardware
const rfxtrx = new rfxcom.RfxCom("/dev/tty.usbserial-A1R1A6A", {debug: true}); // E hardware
const hifi = new rfxcom.Lighting2(rfxtrx, rfxcom.lighting2.AC);

rfxtrx.on("status", function (evt) {console.log(evt)});

rfxtrx.initialise(function () {
    console.log("Device initialised");
    rfxtrx.enable([rfxcom.protocols.LIGHTING4,
            rfxcom.protocols.OREGON,
            rfxcom.protocols.AC,
            rfxcom.protocols.ARC,
            rfxcom.protocols.X10]
        );
//    hifi.switchOn('0x1ef1ce/1');

    setTimeout(function () {
        rfxtrx.enable([rfxcom.protocols.LIGHTING4,
            rfxcom.protocols.OREGON,
            rfxcom.protocols.AC,
            rfxcom.protocols.ARC,
            rfxcom.protocols.X10]
        );
        hifi.switchOn('0x1ef1ce/1');
        rfxtrx.enable([rfxcom.protocols.LIGHTING4,
            rfxcom.protocols.OREGON,
            rfxcom.protocols.AC,
            rfxcom.protocols.ARC,
            rfxcom.protocols.X10]
        );
    }, 10000);
/*
    setTimeout( function () {
        rfxtrx.enable([rfxcom.protocols.LIGHTING4,
            rfxcom.protocols.OREGON,
            rfxcom.protocols.AC,
            rfxcom.protocols.ARC,
            rfxcom.protocols.X10])
    }, 2000);
*/
});

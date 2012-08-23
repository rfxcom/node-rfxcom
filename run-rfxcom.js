var RfxCom = require('./rfxcom').RfxCom;

var rfxcom = new RfxCom("/dev/ttyUSB0", {debug: true});

rfxcom.on("elec2", function(subtype, id, current_watts, total_watts) {
  console.log("Current watts on device %s (%s) = %s, %s", subtype, id, current_watts, total_watts);
});

rfxcom.on("lighting5", function(subtype, id, unitcode, command) {
  console.log("Lighting %s message from %s, %s (%s)", command, id, unitcode, subtype);
});

rfxcom.on("response", function(message, sequence) {
  console.log("Received response to %s, %s", sequence, message);
});

rfxcom.on("status", function(subtype, seqnbr, cmnd, receiver_type, firmware_version) {
  console.log("Received status %s, %s, %s, %s, %s", subtype, seqnbr, cmnd, receiver_type, firmware_version);
});


rfxcom.on("ready", function() {
  console.log("RfxCom ready for further behaviour.");
  rfxcom.reset(function() {
    rfxcom.delay(1000);
    rfxcom.flush();
    rfxcom.delay(2000);
    rfxcom.getStatus();
  });
});

rfxcom.open();

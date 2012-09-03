var HexConverter = {
  hexDigits : "0123456789ABCDEF",
  dec2hex : function(dec){
     return(this.hexDigits[dec >> 4] + this.hexDigits[dec & 15]); 
  },

  hex2dec : function(hex){
     return(parseInt(hex,16)) 
  }
}


var RfxCom = require('./rfxcom').RfxCom;

var rfxcom = new RfxCom("/dev/ttyUSB0", {debug: true});

rfxcom.on("ready", function() {
  console.log("RfxCom ready for further behaviour.");
  rfxcom.reset(function() {
    rfxcom.delay(500);
    rfxcom.flush();
    rfxcom.getStatus(function(){
      console.log("Status completed.");
    });
  });
});

rfxcom.open();

rfxcom.on("elec2", function(subtype, id, current_watts, total_watts) {
  console.log("Current watts on device %s (%s) = %s, %s", subtype, id, current_watts, total_watts);
});

rfxcom.on("lighting5", function(subtype, id, unitcode, command) {
  console.log("Lighting %s message from %s, %s (%s)", command, id, unitcode, subtype);
});

rfxcom.on("response", function(message, sequence) {
  console.log("Received response to %s, %s", sequence, message);
});

rfxcom.on("security1", function(subtype, id, device_status,battery) {
  console.log("Security message from %s, %s: 0x%s, 0x%s",
              subtype, id, HexConverter.dec2hex(device_status), HexConverter.dec2hex(battery));
  if (device_status==0x05) {
    rfxcom.lightOff("0xF09AC7", 1, function(){
      console.log("Light switched off");
    });
  } else if (device_status==0x04) {
    rfxcom.lightOn("0xF09AC7", 1, function(){
      console.log("Light switched on");
    });
  };
});

rfxcom.on("status", function(subtype, seqnbr, cmnd, receiver_type, firmware_version) {
  console.log("Received status %s, %s, %s, %s, %s", subtype, seqnbr, cmnd, receiver_type, firmware_version);
});

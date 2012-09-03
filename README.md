Evented communication with RFXtrx433.
=====================================

How to Use
==========

rfxcom depends on the serialport module.

To install
----------

<pre>
  npm install rfxcom
</pre>

This will pull in the two dependencies, serialport 1.0.6+ and underscore.js.

To Use
------

<pre>
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

/*
 * This reports security updates from X10 security devices.
 */
rfxcom.on("security1", function(subtype, id, deviceStatus, battery) {
  if (deviceStatus==0x04) {
    console.log("Device %s %s detected motion.", subtype, id);
  } else if (deviceStatus==0x05) {
    console.log("Device %s %s reported motion stopped.", subtype, id);
  }
});

rfxcom.open();

</pre>

RfxCom events
=============

The events are named from the message identifiers sent by the RFXtrx device.

"ready"
-------
Emitted when the RFXcom has successfully opened the serial port.

"response"
----------
Emitted when a response message is received from the RFXtrx 433, sends the status
(from the RFXtrx433) and the sequence number of the message the response is for.

"status"
--------
Emitted when a "status" message is received from the RFXtrx 433.

"elec2"
-------
Emitted when data is received from OWL electricity monitoring devices
CM119/CM160.

"security1"
-----------
Emitted when an X10 security device reports a status change.

"lighting5"
-----------
Emitted when a message is received from LightwaveRF type devices.

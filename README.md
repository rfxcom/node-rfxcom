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
var rfxcom = require('./rfxcom'),
    pg = require('pg').native,
    conString = "pg://user:password@localhost/user",
    client = new pg.Client(conString);

var rfxtrx = new rfxcom.RfxCom("/dev/ttyUSB0", {debug: true});

rfxtrx.on("ready", function() {
  console.log("RfxCom ready for further behaviour.");
  rfxtrx.reset(function() {
    rfxtrx.delay(500);
    rfxtrx.flush();
    rfxtrx.getStatus(function(){
      console.log("Status completed.");
    });
  });
});

/*
 * This reports security updates from X10 security devices.
 */
rfxtrx.on("security1", function (evt) {
  if (evt.deviceStatus==rfxcom.security.MOTION) {
    console.log("Device %s %s detected motion.", evt.subtype, evt.id);
  } else if (deviceStatus==rfxcom.security.NOMOTION)
    console.log("Device %s %s reported motion stopped.", evt.subtype, evt.id);
  }
});

rfxtrx.on("elec2", function (evt) {
  // Requires a PostgreSQL table
  // CREATE TABLE energy (recorded_time timestamp DEFAULT NOW(),
  //                      device_id VARCHAR, current_watts FLOAT)
  client.query("INSERT INTO energy(device_id, current_watts) values($1, $2)",
                [evt.id, evt.currentWatts]);
});


rfxtrx.open();

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

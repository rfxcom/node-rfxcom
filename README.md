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

/*
 * This reports security updates from X10 security devices.
 */
rfxtrx.on("security1", function (evt) {
  if (evt.deviceStatus === rfxcom.security.MOTION) {
    console.log("Device %s %s detected motion.", evt.subtype, evt.id);
  } else if (evt.deviceStatus === rfxcom.security.NOMOTION) {
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

rfxtrx.initialise(function () {
    console.log("Device initialised");
});
</pre>

LightwaveRf
-----------
There's a specialised Lighting5 prototype, which uses an RfxCom object.

<pre>
    var rfxtrx = new rfxcom.RfxCom("/dev/ttyUSB0", {debug: true}),
        lightwaverf = new rfxcom.Lighting5(rfxtrx, rfxcom.lighting5.LIGHTWAVERF);

    lightwaverf.switchOn("0xF09AC8/1", {mood: 0x03});
    lightwaverf.switchOn("0xF09AC8/2", {level: 80});
</pre>

I've tested it with both LightwaveRf lights, and the relay switch.

LightwaveRf lights get their identity from the remote used to pair, if you don't
have a remote, or if you want to specify the address manually, you can pair the
device and send lightwaverf.switchOn("<insert address>") to unpair, send
lightwave.switchOff("<insert address>") while the device is awaiting pairing.

Lighting2
---------
There's a specialised Lighting2 prototype, which uses an RfxCom object.

<pre>
    var rfxtrx = new rfxcom.RfxCom("/dev/ttyUSB0", {debug: true}),
        lighting2 = new rfxcom.Lighting2(rfxtrx, rfxcom.lighting2.HOMEEASY_EU);

    lighting2.switchOn("0xF09AC8AA/1");
    lighting2.switchOff("0xF09AC8AA/1");
</pre>

The lighting2 message controls one of three subtypes, you need to specify the
subtype to the constructor, the options are in rfxcom.lighting2.

Google Group
============

I've created  a Google Group for discussion of Node.js based home automation
software.

The group is nodejs-automation @ google's groups.

RfxCom events
=============

The events are named from the message identifiers sent by the RFXtrx device.

"ready"
-------
Emitted when the RFXcom has successfully opened the serial port.

"response"
----------
Emitted when a response message is received from the RFXtrx 433, sends the
status (from the RFXtrx433) and the sequence number of the message the response
is for.

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

"th1-9"
-------
Emitted when a message is received from Oregon Scientific
Temperature/Humidity sensors.

"temp1-9"
---------
Emitted when a message is received from an Oregon Scientific temperature
sensor.

"lighting2"
-----------
Emitted when a message is received from AC/HomeEasy type devices.

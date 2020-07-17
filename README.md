Evented communication with RFXtrx433
====================================

To install
----------

<pre>
  npm install rfxcom
</pre>

Depends on serialport ^9.0.0, date-format ^3.0.0, and queue ^6.0.0

Note
----

Functions `Security1.switchOnLight()` & `Security1.switchOffLight()` are now deprecated; use the replacements
`Security1.switchLightOn()` & `Security1.switchLightOff()` instead. The function parameters are unchanged.

To Use
------

<pre>
var rfxcom = require('rfxcom'),
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

Sending Commands
================

Prototype transmitter objects are provided for almost all packet types (see the RFXCOM manual for details). The only
packet types which can be transmitted but are *not* currently supported are:

* 0x1D, Honeywell ActivLink (868 MHz devices only)
* 0x21, Security2
* 0x61, ASYNC port configuration (RFXtrx433XL only)
* 0x62, ASYNC port data (RFXtrx433XL only)
* 0x72, FS20 (868 MHz devices only)
* 0x7F, Raw transmit

Each transmitter has a constructor, which must be called with an RfxCom object as the first parameter, the subtype as the
second parameter, and an options object as an optional third parameter.
The subtypes are exported from `index.js` and can be accessed as shown in the examples below. Each transmitter has
functions to send the appropriate commands. File `DeviceCommands.md` contains a quick reference to all these transmitter
 objects.

Commands can only be sent when the RFXtrx433 is connected (see below). Commands are held in a queue, and will be sent as
soon as the RFXtrx433 can accept them. No commands are sent (and no messages received) until the initial handshake
with the RFXtrx433 is complete. If the RFXtrx433 is disconnected the queue is cleared, losing any command messages it
may contain.

LightwaveRf
-----------
LightwaveRf devices use the Lighting5 transmitter:

<pre>
var rfxcom = require('rfxcom');

var rfxtrx = new rfxcom.RfxCom("/dev/ttyUSB0", {debug: true}),
    lightwaverf = new rfxcom.Lighting5(rfxtrx, rfxcom.lighting5.LIGHTWAVERF);

rfxtrx.initialise(function () {
  console.log("Device initialised");
  lightwaverf.switchOn("0xF09AC8/1", {mood: 0x03});
  lightwaverf.switchOn("0xF09AC8/2", {level: 0x10});
});
</pre>

It has been tested with both LightwaveRf lights, and the relay switch.

LightwaveRf lights get their identity from the remote used to pair, if you don't
have a remote, or if you want to specify the address manually, you can pair the
device by putting the device into pairing mode and turning on a chosen device id, for example lightwaverf.switchOn("0xFFFFFF/1").

The device ids don't have to be unique, but it's advisable.

HomeEasy (EU)
-------------
HomeEasy devices use the Lighting2 transmitter object. There are two types of
HomeEasy: the ones marketed in UK are of type 'AC', while those in the Netherlands and elsewhere are of type 'HOMEEASY_EU'.

<pre>
    var rfxtrx = new rfxcom.RfxCom("/dev/ttyUSB0", {debug: true}),
        lighting2 = new rfxcom.Lighting2(rfxtrx, rfxcom.lighting2.HOMEEASY_EU);

    lighting2.switchOn("0x19AC8AA/1");
    lighting2.switchOff("0x19AC8AA/1");
</pre>

Rfy (Somfy) Blinds
------------------
There is a specialised Rfy transmitter object. This supports three subtypes: 'RFY', 'RFYEXT'
and 'ASA', one of which must be supplied to the Rfy constructor. RFY support requires an RFXtrx433E or RFXtrx433XL.
The 'RFY' and 'RFYEXT' subtypes can control venetian blinds, but the command modes differ between EU and US
supplied blinds motors. The mode is specified by passing an options parameter to the constructor.
The valid modes are `'EU'` and `'US'`. The default is `'EU'`.
You can change the mode subsequently by calling the setOption() method with a new options parameter.

<pre>
    var rfxtrx = new rfxcom.RfxCom("/dev/ttyUSB0", {debug: true}),
           rfy = new rfxcom.Rfy(rfxtrx, rfxcom.rfy.RFY, {venetianBlindsMode: "US"});

    rfy.venetianOpen("0x10203/1");
    // All commands can take an optional callback
    rfy.down("0x10203/1", function(err, res, sequenceNumber) {
                if (!err) console.log('complete');
            });
    // The ID can be supplied as an array with address & unitcode elements (strings)
    rfy.doCommand(["0x10203", "1"], "down");
    // The eraseAll() and listRemotes() commands DO NOT take an ID parameter, all the others do
    rfy.listRemotes();
    rfy.eraseAll(callback);
</pre>

Supported commands include standard operations such as `up()`, `down()`, and `stop()`, as well
as the programming commands:
`program()`, `erase()`, `eraseAll()`, and `listRemotes()`.
All other commands can be accessed using the `doCommand()` method - see the *Rfy* entry in DeviceCommands.md
 for the complete list of available commands.

To 'pair' the RFX as a new remote control with a Somfy blind motor,
press and hold 'program' *on the existing Somfy remote controller* until the blind responds with a 'jog'
motion. Then send a `program()` command to the RFXtrx433E, with the ID parameter set to an address/unit code
combination of your choice - this needs to be unique within the RFXtrx433E's list, but is otherwise
arbitrary. Limits for the address are 0x1 to 0xFFFFF; limits for the unitcode are 0x0 to 0x4 for RFY
subtype devices, 0x0 to 0xf for RFYEXT devices, and 0x1 to 0x5 for ASA devices.

To list all the remotes (of either RFY or ASA subtype) send a `listRemotes()` command; to erase a single
entry from the list, send `erase(ID)` where ID is the address/unitcode of the entry to erase; or `eraseAll()`
to clear the list.

Transmitter
-----------
The Transmitter class serves as a prototype for all the other transmitters. However, you can also create an instance of
Transmitter and use it to send any arbitrary packet (e.g. one of an unsupported type). The packet will be correctly formatted
as the RFXtrx expects; it will be queued to avoid overruning the RFXtrx; and the response of the RFXtrx to the packet will
be emitted as a "response" event. When creating a Transmitter, use `null` as the subtype.

<pre>
    var rfxtrx = new rfxcom.RfxCom("/dev/ttyUSB0", {debug: true}),
        transmitter = new rfxcom.Transmitter(rfxtrx, null);
    // Send a blinds1 packet (type 0x19) with subtype BLINDS_T6 (0x06) and appropriate data bytes
    transmitter.sendRaw(0x19, 0x06, [0x12, 0x34, 0x56, 0x73, 0x01, 0x00]);
</pre>

RfxCom system events
====================

System events are used to track conection & disconnection of, and communication with, the RFXtrx433 itself,
and to provide low-level access to received data (including unsupported packet types)

"connecting"
------------
Emitted when the RFXcom has successfully opened the serial port.

"connectfailed"
---------------
Emitted if the RFXcom was unable to open the serial port.

"ready"
-------
Emitted when the RFXtrx433 is ready to accept data (after a delay to prevent it from entering the bootloader).

"disconnect"
------------
Emitted if the RFXtrx433 has been disconnected from the USB port

"response"
----------
Emitted when a command response message is received from the RFXtrx 433, or RfxCom times out waiting for a response.
It passes three parameters:
* A textual description of the response, as a string
* The sequence number of the message responded to
* A response code number:
  - 0: ACK - transmit OK
  - 1: ACK - transmit delayed
  - 2: NAK - transmitter did not lock onto frequency
  - 3: NAK - AC address not allowed
  - 4: Command unknown or not supported by this device
  - 5: Unknown RFY remote ID
  - 6: Timed out waiting for response

"rfyremoteslist"
----------------
Emitted in response to the Rfy command `listRemotes()` - this queries the RFXtrx433E for the list of currently stored
simulated RFY remote controls. The list is given as an array, which may be of zero length, of objects describing each
simulated remote control:
* remoteNumber: index number of this entry in the RFXtrx433E's internal list
* remoteType: "RFY" or "ASA",
* deviceId: Address/unitcode as a hexadecimal string, e.g. "0x123/2"
* idBytes: Address as an array of 3 bytes, e.g. [0x00, 0x01, 0x23]
* unitCode: Unit code as a byte, e.g. 0x02

This event is emitted approximately 12s after the `listRemotes()` command is given, as the only way to detect the end of
the list is to wait for the response timeout - the RFXtrx433E does not send an 'end of list' packet.

"status"
--------
Emitted when a "status" message is received from the RFXtrx 433 - usually in reply to a receiver control command (packet type 0x00)

"receiverstarted"
-----------------
Emitted when the RFXtrx responds to a 'start receiver' command (not applicable for old versions of the firmware)

"end"
-----
Emitted when the serial port "ends".

"drain"
-------
Emitted when the serial port emits a "drain" event.

"receive"
---------
Emitted when any packet message is received from the RFXtrx 433, and passes the raw bytes that were received, as an
array of bytes. This event is emitted before the received data event for the packet type (if one is defined). 

RfxCom received data events - sensors
=====================================

The events are mostly named from the message identifiers used in the RFXtrx documentation. Some (but not all) protocols must
be enabled to be received. This can be done using RFXmngr.exe, or the `enable()` function of the rfxcom object.
Each event passes an object whose properties contain the received sensor data, along with signal strength and
battery level (if available).

"security1"
-----------
Emitted when an X10 or similar security device reports a status change.

"thermostat1"
-------------
Emitted when a message is received from a DigiMax thermostat.

"bbq1"
------
Emitted when a message is received from a Maverick ET-732 BBQ temperature sensor.

"temperaturerain1"
------------------
Emitted when a message is received from an Alecto temperature/rainfall weather sensor.

"temperature1"
--------------
Emitted when a message is received from a temperature sensor (inside/outside air temperature;
pool water temperature).

"humidity1"
-----------
Emitted when data arrives from humidity sensing devices

"temperaturehumidity1"
----------------------
Emitted when a message is received from Oregon Scientific and other
temperature/humidity sensors.

"temphumbaro1"
--------------
Emitted when a message is received from an Oregon Scientific
temperature/humidity/barometric pressure sensor.

"rain1"
-------
Emitted when data arrives from rainfall sensing devices. See note below about the DeviceParameter API
when using Davis rain sensors

"wind1"
-------
Emitted when data arrives from wind speed & direction sensors

"uv1"
-----
Emiied when data arrives from ultraviolet radiation sensors

"datetime"
----------
Emitted when a time message arrives from a radio clock

"elec1" - "elec5"
-----------------
Emitted when data is received from OWL or REVOLT electricity monitoring devices.

"weight1"
---------
Emitted when a message is received from a weighing scale device.

"cartelectronic"
----------------
Emitted when data is received from a Cartelectronic smart-meter transmitter.

"rfxsensor"
-----------
Emitted when a message is received from an RFXCOM rfxsensor device.

"rfxmeter"
----------
Emitted whan a message is received from an RFXCOM rfxmeter device.

"weather"
---------
Emitted when a message is received from a remote multi-function weather station

"solar"
-------
Emitted when a message is received from a remote insolation sensor

RfxCom received data events - remote controls
=============================================

These events are emitted when data arrives from a 'remote control' device, which may be a pushbutton
unit or a dedicated remote control device such as a PIR light switch. The events are named from the
message identifiers used in the RFXtrx documentation. Most protocols must be enabled to be received. however not
every protocol that can be transmitted can be received. Each event passes an object whose properties contain
the received command, along with signal strength and battery level (if available).

"lighting1"
-----------
Emitted when a message is received from X10, ARC, Energenie or similar lighting remote control devices.

"lighting2"
-----------
Emitted when a message is received from AC/HomeEasy type remote control devices.

"lighting4"
-----------
Emitted when a message is received from devices using the PT2262 family chipset.

"lighting5"
-----------
Emitted when a message is received from LightwaveRF/Siemens type remote control devices.

"lighting6"
-----------
Emitted when a message is received from Blyss lighting remote control devices.

"chime1"
--------
Emitted when data arrives from Byron or similar doorbell pushbutton

"blinds1"
---------
Emitted when a message arrives from a compatible type 1 blinds remote controller (only a few subtypes can be received)

"fan"
-----
Emitted when a message arrives from a supported type of fan remote control (not Hunter fans - see below)

"hunterfan"
-----------
Emitted when a message arrives from a Hunter fan remote control

"funkbus"
---------
Emitted when a message arrives from a FunkBus 'Gira' or 'Insta' remote control

"edisio"
--------
Emitted when a message arrives from an Edisio system remote control or wall switch

"camera1"
---------
Emitted when a message is received from an X10 Ninja Robocam camera mount remote control.

"remote"
--------
Emitted when a message is received from ATI or X10 universal remote controls (old type RFXtrx433 only).

"thermostat3"
-------------
Emitted when a message is received from a Mertik-Maxitrol thermostat remote control.

Connecting and disconnecting
============================
The function `rfxtrx.initialise()` will attempt to connect to the RFXtrx433 hardware. If this succeeds, a 'connecting' event
is emitted, followed about 5.5 seconds later by a 'ready' event. Finally (for recent device firmware versions) a
'receiverstarted' event is emitted. If the device is not present (wrong device path, or device
not plugged in) a 'connectfailed' event is emitted. If the the hardware is subsequently unplugged, a 'disconnect' event
is emitted (this can also happen before either the 'connecting' or 'ready' events are emitted).

If either the connection fails or the RFXtrx433 is unplugged, a subsequent call to `initialise()` will attempt to reconnect.
Your 'disconnect'/'connectfailed' handler may make repeated attempts to reconnect,
but <em>must</em> allow an interval of at least `rfxcom.initialiseWaitTime` milliseconds between each attempt. While
disconnected, any data sent by a call to a command object is silently discarded, however the various received data event
handlers are preserved.

<em>Note:</em>

Some variants of Linux will create a differently-named device file if the RFtxr433 is disconnected and then reconnected,
even if it is reconnected to the same USB port. For example, `/dev/ttyUSB0` may become `/dev/ttyUSB1`. While a suitably-crafted
UDEV rule can prevent this happening, it may be easier to use the equivalent alias device file in `/dev/serial/by-id/`
when creating the RfxCom object. This should look something like `/dev/serial/by-id/usb_RFXCOM_RFXtrx433_12345678-if00-port0`.

DeviceParameter API
===================

The DeviceParameter API allows one or more arbitrary `{name, value}` parameter pairs to be associated with the messages
received from a specific device, specified by packet type, subtype, and id (or address). These parameters can then be
retrieved by received data packet handlers as required.

To set a parameter on the RfxCom object `rfxtrx`:

    rfxtrx.setDeviceParameter(packetName, subtypeName, id, parameter, value)
    
To retrieve a parameter:

    rfxtrx.getDeviceParameter(packetType, subtype, id, parameter, defaultValue)
    
The setter uses packet & subtype names, but the getter uses numbers, as these are more easily accessed by the packet data
handlers. The `defaultValue` is returned if no matching parameter has been set.

The Davis rainfall sensors (subtype RAIN8) may be fitted with either Metric or US Customary cartridges, which have
different volumes. The message received from the sensor does not indicate which cartridge is fitted. To obtain correctly
calibrated data, the RfxCom object has to be told which is fitted, for each Davis sensor it receives.

To set up for a US Customary cartridge (0.01 inch):

    rfxtrx.setDeviceParameter("rain1", "RAIN8", 0xb600, "cartridgeVolume", 0.01);
    
To set up for a metric cartridge (0.2mm):

    rfxtrx.setDeviceParameter("rain1", "RAIN8", "0xb600", "cartridgeVolume", 0.2);
    
(The default setting for RAIN8 sensors is the metric cartridge)

At the time of writing, no other devices make use of this API.

Utility scripts
===============

There are two scripts to help you get started talking to your RFXtrx433, and to set its configuration:
* *find-rfxcom* - searches all serial ports for RFXCOM devices, and prints information about each device it finds.
* *set-protocols* - changes and optionally saves to non-volatile memory the set of protocols that a device will receive and decode.

These scripts must be run from the directory containing the `package.json` file, normally `node_modules/rfxcom`, unless
the package has been installed globally.

`npm run find-rfxcom` will print status information for each device as shown:

    Scanning for RFXCOM devices...
    Devices found at:
      /dev/tty.usbserial-A1R1A6A
        433.92MHz transceiver hardware version 1.3, firmware version 1017 Ext
        Enabled protocols:  AC,LIGHTING4,OREGON
        Disabled protocols: ARC,ATI,BLINDST0,BLINDST1,BLYSS,BYRONSX,FINEOFFSET,FS20,HIDEKI,HOMECONFORT,HOMEEASY,IMAGINTRONIX,KEELOQ,LACROSSE,LIGHTWAVERF,MEIANTECH,MERTIK,PROGUARD,RSL,RUBICSON,UNDECODED,VISONIC,X10

You will need to pass the device port - in this case `/dev/tty.usbserial-A1R1A6A` - to `rfxcom` to control the device.
*set-protocols* also uses the device port to locate the RFXCOM device to program.

`npm run set-protocols -- --list device_port` will print the same information as *find-rfxcom*, for the specified device.

`npm run set-protocols -- --save device_port` will save the current set of enabled protocols to non-volatile memory (use with
caution, as the number of write cycles is limited)

`npm run set-protocols -- [--enable protocol_list] [--disable protocol_list] [--save] device_port` will enable the protocols
in the list of protocols to enable, and disable the the protocols in the list of protocols to disable. If the `--save`
switch is present, the new protocol settings will be saved to non-volatile memory immediately.

A protocol list is a comma-separated list of protocol names, in the format returned by *find-rfxcom* shown above.
Protocols which are currently enabled, and which do not appear in the list of protocols to disable, will remain enabled.
If a protocol appears in both the `--enable` and `--disable` lists, its current status will remain unchanged.
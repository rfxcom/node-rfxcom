Version 2.4.0
-------------
Add Blinds1.intermediatePosition() function
Silence warnings about missing AsyncConfig & AsyncData classes from NodeJS

Version 2.3.1
-------------
Now use call-throughs rather than synonyms to implement switchOnLight() & switchOffLight(),
as a work-around for a NodeJS v10 compiler bug.
Revert to serialport ^8.0.8

Version 2.3.0
-------------
Add functions switchLightOn() & switchLightOff() to security1, to replace the
now deprecated switchOnLight() & switchOffLight()

Version 2.2.0
-------------
Support for RFX firmware 1043

- Add support BLINDS_T17 (Gaposa) & BLINDS_T18 (Cherubini)
- Add Lucci Air DC speed control command (speed 1 to 6)
- Add Mertik G6R-H4TD (DRU) run-up and run-down commands

Fix various bugs in handling BLINDS addresses (ID & unitCode)

Version 2.1.0
-------------
Support for RFX firmware 1040

- Add support for newly added subtypes in multiple packet types
- Add support for Edisio & HunterFan packet types
- Add support for Weather & Solar packet types
- Add fan receive handler

Update to latest Serialport (>8.0.0) and Queue (>6.0.0)
Debug log timestamps now include milliseconds
Correct the errors in the code samples in Readme.MD

Bug fixes:

- Correct the handling of RSSI in weight packet receive handler
- Correct the allowable address ranges in several places
- Fix handling of device type number in FunkBus receive handler

Version 2.0.2
-------------
Change the way security1 device addreses are processed in the receive handler, to ensure they are compatible with the 
transmitter.

Version 2.0.1
-------------

Workarounds for newly-introduced serialport bugs

Version 2.0.0
-------------

Full support for Pro 1 & Pro 2 firmware

- Add support for many additional packet subtypes
- Add support for Funkbus packet type (TX & RX)
- Enable changing receiver frequency, if supported by the firmware
- Add definitions for new hardware types & versions
- Status event includes received noise level, where available
- Support new LIVOLO_APPLIANCE packet format if firmware version > 1025 (room number is ignored when using the new format)
- Add DeviceParameter API, to support Davis rain gauges (subtype RAIN8)

Change to use Serialport 7.1.1 & Queue 5.0.0

Breaking change:
- The cartelectronic packet type event data format has been totally changed, based on information from the manufacturer.

Version 1.4.1
-------------

Add initial support for Pro 1 & Pro 2 firmware

Version 1.4.0
-------------

Change to use Serialport version 6 (changes to underlying API)

Version 1.3.0
-------------

* Add timestamp to debug messages.
* Thermostat1 receive events now provide both numeric & string representations of mode and
status. Thermostat1 transmitter now accepts both numbers & strings.

Version 1.2.0
-------------

Added deviceNames object & additional _type_ parmeter to received packet events - enables
access to the device name (as found in the SDK) for every subtype of every received
packet.

Version 1.1.0
-------------

Added support for an optional room number to increaseLevel() & decreaseLevel() for all lighting transmitters supporting
these functions. Only the LIVOLO_APPLIANCE Lighting5 subtype makes any use of it, and will throw an error if it is missing.

Version 1.0.0
-------------

First production release

Added (almost) complete transmit & receive support for **all** packet types supported by 433 MHz hardware and firmware
version 1020, with the exception of:
* 0x1C, Edisio (868 MHz)
* 0x21, Security2
* 0x53, Barometric sensors (currently unused)
* 0x5E, Gas sensors (currently unused)
* 0x5F, Water sensors (currently unused)
* 0x72, FS20 (868 MHz)
* 0x7F, Raw transmit

Other enhancements:
- Added extra subtypes and commands to lighting5 (though there are still one or two missing)
- Added a sendRaw() method to Transmitter to allow *any* packet type to be sent (including the 0x7F raw packet, if required)
- Improved unit tests (unit tests are no longer installed by npm)
- For firmware versions that support it, the RF transmitter power is reported in the `status` event
- Transmitters for all packet types now accept an (optional) options parameter. Currently only Lighting4 and Rfy make use of it
- Added a "receiverstarted" event
- Added scripts to find all RFXCOM devices attached to a computer (`find-rfxcom`), and to manage the enabled receive protocols (`set-protocols`)

Breaking changes:
- Curtain1 constructor now requires a subtype
- Lighting5 `switchOn()` method no longer accepts a parameter to set moods & levels - use `setMood()` & `setLevel()` instead
- Rfy venetian blinds commands are no longer duplicated in EU & US variants, e.g. `venetianOpenEU()` & `venetianOpenUS`
are relaced by `venetianOpen()`. An options parameter to the Rfy constructor sets which variant is used, e.g. `{venetianBlindsMode: "EU"}`
- Receive data events now correspond strictly one-to-one with received packet types. Previously, some of the 'sensor' 
events corresponded with subtypes. For example, the `thb1` and `thb2` events from the two different subtypes of the
temperature, humidity and barometric pressure sensing devices (packet type 0x54) are replaced by a single `temphumbaro` event.
- Adopted the use of camelCase for all event properties, so that `unitcode` is now `unitCode`, and housecode is now `houseCode`

Version 0.16.0
--------------

- Added support for AOKE relay (lighting5)

Version 0.15.0
--------------

- Added support for Maverick ET-732 BBQ thermometer

Version 0.14.0
--------------

- Added support for Rfy devices (Somfy blinds)

Version 0.13.0
--------------

- Added support for Blinds1 devices. Tested only for T0/Rollertrol.

Version 0.12.0
--------------

- Added a command message transmit queue to avoid buffer overruns in the RFXtrx433

Version 0.11.1
--------------

- Improve decoding of status packets from firmware versions 1001 and above
- Send 'start receiver' command when connecting, and check the response

Version 0.11.0
--------------

- Added transmission of chime1 type packets

Version 0.10.1
--------------

- Fixed a bug in the received message parsing which could cause messages to be lost, and/or throw
  an unhandled exception.

Version 0.10.0
--------------

- Added support for additional weather sensors and energy monitoring devices
- Added support for Byron SX doorbells (receive-only)
BREAKING CHANGES:
- In elec2 and elec3 events, property name "currentWatts" is replaced by "power" (the value is unchanged)
- In elec2 and elec3 events, property name "totalWatts" is replaced by "energy" and the value is no longer rounded

Version 0.9.0
-------------

- Added support for Lighting3, Lighting4, and Lighting6 device packet types
- Added error-checking for supported commands, address codes, and parameter values

Version 0.8.0
-------------

- Handle dynamic removal/replacement of the RFXtrx. Added new events 'connecting', 'disconnected',
  and 'connectfailed'. Added new properties .connected, .initialising and .initialiseWaitTime
- Bump to serialport 2.x

Version 0.7.9
-------------

- Emit end event when serial port 'ends' (device is removed from USB port)
  contributed by @freakent.
- Bump to serialport ~1.4.

Version 0.7.7
-------------

- Change tbX messages to tbhX messages and fix typo in battery level
  determination.

Version 0.7.6
-------------

- Handle the rfxmeter and tempbaro messages.

Version 0.7.5
-------------

- Implement support for rfxmeter and tempbaro sensors from bwired-nl.

Version 0.7.4
-------------

- Support for serialport 1.3.0 which requires a callback for flush this fixes
  bigkevmcd/node-rfxcom#26.

Version 0.7.3
-------------

- Fix bug in emitting "received" events.

Version 0.7.2
-------------

- Added additional event "received" with the raw data that was received from the
  device contributed by @iangregory.
- Added save() method to the rfxcom object, allowing saving the configured
  protocols to the NVRAM of the rfxtrx433, the SDK cautions against using this
  too often as there is a limited number of writes (10K).

Version 0.7.1
-------------

- Add additional protocol defines for use when configuring the device,
  contributed by @njh.

Version 0.7.0
-------------

- Changes the format of the lighting2 event, the subtype will correspond to the
  values in rfxcom.lighting2.

Version 0.6.1
-------------

- Send a "level" command when we are trying to set the level.

Version 0.6.0
-------------

- Bumped serialport version to be compatible with Node 0.10.x.

Version 0.5.1
-------------

- Removed dependency on underscore.js.

Version 0.5.0
-------------

- Split the various classes out into separate files.
- Split the tests appropriately.
- Rename the LightwaveRf prototype to Lighting5. *backwards incompatible*
- Made the new Lighting5 prototype accept different types.
- Removed RfxCom.lightOn and RfxCom.lightOff because these were LightwaveRf
  specific.

Version 0.4.4
-------------

- Added support for lighting1 received messages contributed by stianeikeland.

Version 0.4.3
-------------

- Added Lighting2 class, which can control devices controlled by the lighting2
  message.

Version 0.4.2
-------------

- Fix the tamper detection for security1 devices to report status and tamper
  separately.

Version 0.4.1
-------------

- Added support for lighting2 received messages.
- Renamed signalStrength to rssi in keeping with the RFX TRX SDK document.

Version 0.4.0
-------------

- Fixed initialise to also run .open() which means you can bootstrap the device
  with one line.

Version 0.3.1
-------------

- Added .initialise to the RfxCom prototype, which handles bootstrapping the
  device.

Version 0.3.0
-------------

- Change the LightwaveRf device identifier format to 0x010203/1 which means that
  it is possible to define device as strings e.g. FRONT_LIGHT = "0x010203/1".

Version 0.2.3
-------------

- Add support for TH1-9 temperature and humidity sensors.

Version 0.2.2
-------------

- Add support for TEMP1-9 type sensors.

Version 0.2.1
-------------

- Fix bug in handler lookup and improve testing of data handler.

Version 0.2.0
-------------

- Update security1Handler event to make the types constants, and better split
  the battery-level and signal strength elements.

Version 0.1.1
-------------

- Updated the Readme.md to illustrate more use.
- Renamed the current_watts and total_watts to currentWatts and totalWatts.

Version 0.1.0
-------------
- *API CHANGE* emitted events are now a JavaScript object.
- New constants for security status messages e.g. security.MOTION.
- Refactored sending messages to the serialport through a sendMessage - still
  need to update the LightwaveRf prototype.
- Improved the test coverage.

Version 0.0.3
-------------
- Added LightwaveRf prototype for specialisation of LightwaveRf control.
  - This adds support for dimming and moodlighting control with LightwaveRF.
- Tidied up JavaScript formatting.
- Added start of rfxcom.security constants.
- Support for configuring the interface protocols.

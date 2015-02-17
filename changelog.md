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

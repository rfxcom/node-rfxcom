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

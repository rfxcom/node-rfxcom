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

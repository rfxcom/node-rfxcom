/*jshint -W104 */
'use strict';
const
    Transmitter = require('./transmitter'),
    RfxCom = require('./rfxcom');

/*
 * This is a class for controlling FunkBus devices.
 */
class FunkBus extends Transmitter {
    constructor(rfxcom, subtype, options) {
        super(rfxcom, subtype, options);
        this.packetType = "funkbus";
        this.packetNumber = 0x1e;
    }
}
